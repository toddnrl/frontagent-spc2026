import { getAgentApiBaseUrl, readAgentApiJson } from "../../../../lib/agentApiBase";
import type { KnowledgeChunk, KnowledgeFolder, KnowledgeSource } from "../types";

type KnowledgeRecord = {
  id: string;
  title: string;
  source_type: string | null;
  folder_id: string | null;
  file_name: string | null;
  mime_type: string | null;
  status: string | null;
  is_referenced: boolean | null;
  resolution_rate: number | null;
  reference_count: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type KnowledgeFolderRecord = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type KnowledgeChunkRecord = {
  id: string;
  source_id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export type KnowledgeUploadResult = {
  source_id?: string;
  chunks?: number;
  status?: string;
  file_name?: string;
  text_length?: number;
};

function mapKnowledgeType(sourceType?: string | null, mimeType?: string | null): KnowledgeSource["type"] {
  const value = `${sourceType ?? ""} ${mimeType ?? ""}`.toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.includes("csv")) return "CSV";
  if (value.includes("xls") || value.includes("sheet")) return "Excel";
  if (value.includes("web") || value.includes("html") || value.includes("url")) return "Website";
  return "Document";
}

export function mapKnowledgeStatus(status?: string | null, isReferenced?: boolean | null): KnowledgeSource["status"] {
  if (status === "processing" || status === "chunking" || status === "embedding" || status === "indexing") return "인덱싱중";
  if (status === "failed") return "미참조";
  if (isReferenced === false) return "미참조";
  return "참조중";
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "-";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "-";
  const diffMinutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

function mapKnowledgeFolderRecord(record: KnowledgeFolderRecord): KnowledgeFolder {
  return {
    id: record.id,
    organizationId: record.organization_id,
    name: record.name,
    description: record.description ?? undefined,
    createdAt: record.created_at ?? undefined,
    updatedAt: record.updated_at ?? undefined,
  };
}

function mapKnowledgeRecord(record: KnowledgeRecord, folders: KnowledgeFolder[] = []): KnowledgeSource {
  const type = mapKnowledgeType(record.source_type, record.mime_type);
  const folder = folders.find((item) => item.id === record.folder_id);

  return {
    id: record.id,
    title: record.title,
    type,
    folder: folder?.name ?? (record.folder_id ? "알 수 없는 폴더" : "기본 폴더"),
    folderId: record.folder_id ?? undefined,
    status: mapKnowledgeStatus(record.status, record.is_referenced),
    resolutionRate: typeof record.resolution_rate === "number" ? `${Math.round(record.resolution_rate)}%` : "-",
    referenceCount: record.reference_count ?? 0,
    updatedAt: formatRelativeDate(record.updated_at ?? record.created_at),
    fileName: record.file_name ?? undefined,
    mimeType: record.mime_type ?? undefined,
    isReferenced: record.is_referenced ?? true,
    sourceType: record.source_type ?? "text",
    createdAt: record.created_at ?? undefined,
    rawStatus: record.status ?? undefined,
  };
}

function mapKnowledgeChunkRecord(record: KnowledgeChunkRecord): KnowledgeChunk {
  return {
    id: record.id,
    sourceId: record.source_id,
    chunkIndex: record.chunk_index,
    content: record.content,
    metadata: record.metadata ?? {},
    createdAt: record.created_at ?? undefined,
  };
}

async function readApiError(response: Response) {
  const fallback = `HTTP ${response.status}`;

  try {
    const payload = (await response.json()) as { detail?: unknown; message?: unknown };
    const detail = payload.detail ?? payload.message;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item) => JSON.stringify(item)).join(", ");
    if (detail) return JSON.stringify(detail);
  } catch {
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export async function fetchKnowledgeSources(organizationId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/knowledge?organization_id=${encodeURIComponent(organizationId)}`);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const payload = await readAgentApiJson<{ items?: KnowledgeRecord[] }>(response);
  return (payload.items ?? []).map((record) => mapKnowledgeRecord(record));
}

export async function fetchKnowledgeFolders(organizationId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/knowledge/folders?organization_id=${encodeURIComponent(organizationId)}`);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const payload = await readAgentApiJson<{ items?: KnowledgeFolderRecord[] }>(response);
  return (payload.items ?? []).map(mapKnowledgeFolderRecord);
}

export async function fetchKnowledgeChunks(organizationId: string, sourceId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/${encodeURIComponent(sourceId)}/chunks?organization_id=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { items?: KnowledgeChunkRecord[] };
  return (payload.items ?? []).map(mapKnowledgeChunkRecord);
}

export async function createKnowledgeSource({
  organizationId,
  title,
  content,
  folderId,
}: {
  organizationId: string;
  title: string;
  content: string;
  folderId?: string | null;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/knowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      title,
      content,
      folder_id: folderId || null,
    }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
}

export async function uploadKnowledgeSource({
  organizationId,
  file,
  folderId,
}: {
  organizationId: string;
  file: File;
  folderId?: string | null;
}) {
  const formData = new FormData();
  formData.append("organization_id", organizationId);
  if (folderId) formData.append("folder_id", folderId);
  formData.append("file", file);

  const response = await fetch(`${getAgentApiBaseUrl()}/knowledge/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as KnowledgeUploadResult;
}

export async function createKnowledgeFolder({
  organizationId,
  name,
  description,
}: {
  organizationId: string;
  name: string;
  description?: string | null;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/knowledge/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      name,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return mapKnowledgeFolderRecord((await response.json()) as KnowledgeFolderRecord);
}

export async function updateKnowledgeFolder({
  organizationId,
  folderId,
  data,
}: {
  organizationId: string;
  folderId: string;
  data: { name?: string; description?: string | null };
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/folders/${encodeURIComponent(folderId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return mapKnowledgeFolderRecord((await response.json()) as KnowledgeFolderRecord);
}

export async function deleteKnowledgeFolder({
  organizationId,
  folderId,
}: {
  organizationId: string;
  folderId: string;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/folders/${encodeURIComponent(folderId)}?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "DELETE", headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
}

export async function updateKnowledgeSource({
  organizationId,
  sourceId,
  data,
}: {
  organizationId: string;
  sourceId: string;
  data: {
    title?: string;
    is_referenced?: boolean;
    status?: string;
  };
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/${encodeURIComponent(sourceId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
}

export async function deleteKnowledgeSource({
  organizationId,
  sourceId,
}: {
  organizationId: string;
  sourceId: string;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/${encodeURIComponent(sourceId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "DELETE",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
}

export async function updateKnowledgeChunk({
  organizationId,
  chunkId,
  content,
}: {
  organizationId: string;
  chunkId: string;
  content: string;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/chunks/${encodeURIComponent(chunkId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  if (!response.ok) throw new Error(await readApiError(response));
}

export async function deleteKnowledgeChunk({
  organizationId,
  chunkId,
}: {
  organizationId: string;
  chunkId: string;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/knowledge/chunks/${encodeURIComponent(chunkId)}?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "DELETE", headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error(await readApiError(response));
}
