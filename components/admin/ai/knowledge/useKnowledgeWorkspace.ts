"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR, { type KeyedMutator } from "swr";
import type { KnowledgeChunk, KnowledgeFolder, KnowledgeSource } from "../types";
import {
  createKnowledgeFolder,
  createKnowledgeSource,
  deleteKnowledgeChunk,
  deleteKnowledgeFolder,
  deleteKnowledgeSource,
  fetchKnowledgeChunks,
  fetchKnowledgeSource,
  fetchKnowledgeWorkspaceData,
  getKnowledgeChunksKey,
  getKnowledgeWorkspaceKey,
  mapKnowledgeStatus,
  reindexKnowledgeSource,
  type KnowledgeWorkspaceData,
  updateKnowledgeChunk,
  updateKnowledgeFolder,
  updateKnowledgeSource,
  uploadKnowledgeSource,
} from "./knowledgeApi";
import { fetchPendingServices } from "../../inbox/reservationsApi";

export const UNFILED_FOLDER_ID = "__unfiled__";

const INDEXING_STATUSES = ["processing", "chunking", "embedding", "indexing"];

function patchKnowledgeCache(
  mutate: KeyedMutator<KnowledgeWorkspaceData>,
  patch: (current: KnowledgeWorkspaceData) => KnowledgeWorkspaceData,
) {
  return mutate((current) => (current ? patch(current) : current), { revalidate: false });
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function syncSelectionFromData(
  data: KnowledgeWorkspaceData,
  setSelectedKnowledgeId: (value: string | ((current: string) => string)) => void,
  setSelectedFolder: (value: string | null | ((current: string | null) => string | null)) => void,
) {
  setSelectedKnowledgeId((current) => {
    if (data.knowledge.length === 0) return "";
    return data.knowledge.some((source) => source.id === current) ? current : data.knowledge[0].id;
  });
  setSelectedFolder((current) => {
    const folderIds = [
      ...data.knowledgeFolders.map((folder) => folder.id),
      ...(data.knowledge.some((source) => !source.folderId) ? [UNFILED_FOLDER_ID] : []),
    ];
    return current && folderIds.includes(current) ? current : null;
  });
}

export function useKnowledgeWorkspace(
  organizationId: string,
  onNewPendingServices?: (count: number) => void,
) {
  const swrKey = organizationId ? getKnowledgeWorkspaceKey(organizationId) : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, () => fetchKnowledgeWorkspaceData(organizationId));

  const knowledge = data?.knowledge ?? [];
  const knowledgeFolders = data?.knowledgeFolders ?? [];

  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState("");
  const [isKnowledgeMutating, setIsKnowledgeMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [peekSource, setPeekSource] = useState<KnowledgeSource | null>(null);

  const chunksKey =
    organizationId && selectedKnowledgeId
      ? getKnowledgeChunksKey(organizationId, selectedKnowledgeId)
      : null;
  const {
    data: knowledgeChunks = [],
    isLoading: isKnowledgeChunksLoading,
    mutate: mutateChunks,
  } = useSWR(chunksKey, () => fetchKnowledgeChunks(organizationId, selectedKnowledgeId));

  const knowledgeError =
    mutationError ??
    (error instanceof Error ? error.message : error ? "Knowledge API 조회 실패" : null);

  useEffect(() => {
    if (!data) return;
    syncSelectionFromData(data, setSelectedKnowledgeId, setSelectedFolder);
  }, [data]);

  const checkNewPendingServices = useCallback(async () => {
    if (!onNewPendingServices) return;
    try {
      const pending = await fetchPendingServices(organizationId);
      if (pending.length > 0) onNewPendingServices(pending.length);
    } catch {
      // 확인 실패 시 무시
    }
  }, [organizationId, onNewPendingServices]);

  useEffect(() => {
    const indexingIds = knowledge
      .filter((source) => INDEXING_STATUSES.includes(source.rawStatus ?? ""))
      .map((source) => source.id);

    if (indexingIds.length === 0) return;

    const timer = setInterval(async () => {
      const updated = await Promise.all(
        indexingIds.map((id) => fetchKnowledgeSource(organizationId, id)),
      );
      await patchKnowledgeCache(mutate, (current) => ({
        ...current,
        knowledge: current.knowledge.map((source) => {
          const fresh = updated.find((item) => item?.id === source.id);
          if (!fresh) return source;
          return {
            ...source,
            ...fresh,
            folder: source.folder,
          };
        }),
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, [knowledge, mutate, organizationId]);

  const handleCreateKnowledge = async (input: { title: string; content: string }) => {
    setIsKnowledgeMutating(true);
    setMutationError(null);
    try {
      await createKnowledgeSource({
        organizationId,
        title: input.title,
        content: input.content,
        folderId: selectedFolder === UNFILED_FOLDER_ID ? null : selectedFolder,
      });
      await mutate();
      void checkNewPendingServices();
    } catch (error) {
      setMutationError(toErrorMessage(error, "지식 추가 실패"));
      throw error;
    } finally {
      setIsKnowledgeMutating(false);
    }
  };

  const handleUploadKnowledge = async (file: File) => {
    setIsKnowledgeMutating(true);
    setMutationError(null);
    try {
      const result = await uploadKnowledgeSource({
        organizationId,
        file,
        folderId: selectedFolder === UNFILED_FOLDER_ID ? null : selectedFolder,
      });
      if (result.source_id) {
        setSelectedKnowledgeId(result.source_id);
        await mutate();
      }
    } catch (error) {
      setMutationError(toErrorMessage(error, "지식 업로드 실패"));
    } finally {
      setIsKnowledgeMutating(false);
      void checkNewPendingServices();
    }
  };

  const handleUpdateKnowledge = async (
    sourceId: string,
    payload: { title?: string; is_referenced?: boolean; status?: string },
  ) => {
    const previousData = data;
    setIsKnowledgeMutating(true);
    setMutationError(null);

    await patchKnowledgeCache(mutate, (current) => ({
      ...current,
      knowledge: current.knowledge.map((source) => {
        if (source.id !== sourceId) return source;

        const nextStatus =
          typeof payload.is_referenced === "boolean"
            ? payload.is_referenced
              ? "참조중"
              : "미참조"
            : payload.status
              ? mapKnowledgeStatus(payload.status, source.status !== "미참조")
              : source.status;

        return {
          ...source,
          title: payload.title ?? source.title,
          status: nextStatus,
          rawStatus: payload.status ?? source.rawStatus,
        };
      }),
    }));

    try {
      await updateKnowledgeSource({ organizationId, sourceId, data: payload });
      await mutate();
    } catch (error) {
      if (previousData) {
        await mutate(previousData, { revalidate: false });
      } else {
        await mutate();
      }
      setMutationError(toErrorMessage(error, "지식 수정 실패"));
      throw error;
    } finally {
      setIsKnowledgeMutating(false);
    }
  };

  const handleDeleteKnowledge = async (sourceId: string) => {
    setIsKnowledgeMutating(true);
    setMutationError(null);
    try {
      await deleteKnowledgeSource({ organizationId, sourceId });
      setSelectedKnowledgeId((current) => (current === sourceId ? "" : current));
      await mutate();
    } catch (error) {
      setMutationError(toErrorMessage(error, "지식 삭제 실패"));
      throw error;
    } finally {
      setIsKnowledgeMutating(false);
    }
  };

  const handleUpdateChunk = async (chunkId: string, content: string) => {
    await updateKnowledgeChunk({ organizationId, chunkId, content });
    await mutateChunks(
      (current) => current?.map((chunk) => (chunk.id === chunkId ? { ...chunk, content } : chunk)),
      { revalidate: false },
    );
  };

  const handleDeleteChunk = async (chunkId: string) => {
    await deleteKnowledgeChunk({ organizationId, chunkId });
    await mutateChunks((current) => current?.filter((chunk) => chunk.id !== chunkId), { revalidate: false });
  };

  const handleToggleFolderActive = async (folderId: string, isActive: boolean) => {
    await patchKnowledgeCache(mutate, (current) => ({
      ...current,
      knowledgeFolders: current.knowledgeFolders.map((folder) =>
        folder.id === folderId ? { ...folder, isActive } : folder,
      ),
    }));

    try {
      await updateKnowledgeFolder({ organizationId, folderId, data: { isActive } });
    } catch (error) {
      await patchKnowledgeCache(mutate, (current) => ({
        ...current,
        knowledgeFolders: current.knowledgeFolders.map((folder) =>
          folder.id === folderId ? { ...folder, isActive: !isActive } : folder,
        ),
      }));
      setMutationError(toErrorMessage(error, "폴더 상태 변경 실패"));
    }
  };

  const handleUpdateKnowledgeContent = async () => {
    throw new Error("본문 내용 수정은 아직 지원되지 않습니다.");
  };

  const handleReindexKnowledge = async (sourceId: string) => {
    await patchKnowledgeCache(mutate, (current) => ({
      ...current,
      knowledge: current.knowledge.map((source) =>
        source.id === sourceId ? { ...source, status: "인덱싱중", rawStatus: "indexing" } : source,
      ),
    }));

    try {
      await reindexKnowledgeSource({ organizationId, sourceId });
      await mutate();
      if (selectedKnowledgeId === sourceId) {
        await mutateChunks();
      }
    } catch (error) {
      setMutationError(toErrorMessage(error, "재인덱싱에 실패했습니다."));
      await mutate();
    }
  };

  const handleCreateFolder = async (input: { name: string; description?: string | null; parentId?: string | null }) => {
    setMutationError(null);
    const created = await createKnowledgeFolder({
      organizationId,
      name: input.name,
      description: input.description,
      parentId: input.parentId,
    });
    await patchKnowledgeCache(mutate, (current) => ({
      ...current,
      knowledgeFolders: [created, ...current.knowledgeFolders],
    }));
    setSelectedFolder(created.id);
    await mutate();
  };

  const handleRenameFolder = async (
    folderId: string,
    input: { name: string; description?: string | null; parentId?: string | null },
  ) => {
    if (folderId === UNFILED_FOLDER_ID) return;
    setMutationError(null);
    const updated = await updateKnowledgeFolder({
      organizationId,
      folderId,
      data: { name: input.name, description: input.description, parentId: input.parentId },
    });
    await patchKnowledgeCache(mutate, (current) => ({
      ...current,
      knowledgeFolders: current.knowledgeFolders.map((folder) => (folder.id === folderId ? updated : folder)),
      knowledge: current.knowledge.map((source) =>
        source.folderId === folderId ? { ...source, folder: updated.name } : source,
      ),
    }));
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (folderId === UNFILED_FOLDER_ID) return;
    setMutationError(null);
    await deleteKnowledgeFolder({ organizationId, folderId });
    await patchKnowledgeCache(mutate, (current) => ({
      ...current,
      knowledgeFolders: current.knowledgeFolders.filter((folder) => folder.id !== folderId),
      knowledge: current.knowledge.map((source) =>
        source.folderId === folderId ? { ...source, folderId: undefined, folder: "기본 폴더" } : source,
      ),
    }));
    setSelectedFolder((current) => (current === folderId ? UNFILED_FOLDER_ID : current));
    await mutate();
  };

  return {
    knowledge,
    knowledgeFolders,
    knowledgeChunks,
    isKnowledgeLoading: isLoading,
    isKnowledgeChunksLoading,
    knowledgeError,
    selectedKnowledgeId,
    setSelectedKnowledgeId,
    isKnowledgeMutating,
    selectedFolder,
    setSelectedFolder,
    knowledgeSearch,
    setKnowledgeSearch,
    peekSource,
    setPeekSource,
    handleCreateKnowledge,
    handleUploadKnowledge,
    handleUpdateKnowledge,
    handleToggleFolderActive,
    handleDeleteKnowledge,
    handleUpdateChunk,
    handleDeleteChunk,
    handleUpdateKnowledgeContent,
    handleReindexKnowledge,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
  };
}
