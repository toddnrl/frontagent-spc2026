"use client";

import { useCallback, useEffect, useState } from "react";
import type { KnowledgeChunk, KnowledgeFolder, KnowledgeSource } from "../types";
import {
  createKnowledgeFolder,
  createKnowledgeSource,
  deleteKnowledgeChunk,
  deleteKnowledgeFolder,
  deleteKnowledgeSource,
  fetchKnowledgeChunks,
  fetchKnowledgeFolders,
  fetchKnowledgeSources,
  mapKnowledgeStatus,
  updateKnowledgeChunk,
  updateKnowledgeFolder,
  updateKnowledgeSource,
  uploadKnowledgeSource,
} from "./knowledgeApi";

export const UNFILED_FOLDER_ID = "__unfiled__";

const INDEXING_STATUSES = ["processing", "chunking", "embedding", "indexing"];

export function useKnowledgeWorkspace(organizationId: string) {
  const [knowledge, setKnowledge] = useState<KnowledgeSource[]>([]);
  const [knowledgeFolders, setKnowledgeFolders] = useState<KnowledgeFolder[]>([]);
  const [knowledgeChunks, setKnowledgeChunks] = useState<KnowledgeChunk[]>([]);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);
  const [isKnowledgeChunksLoading, setIsKnowledgeChunksLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState("");
  const [isKnowledgeMutating, setIsKnowledgeMutating] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [peekSource, setPeekSource] = useState<KnowledgeSource | null>(null);

  const reloadKnowledge = useCallback(async () => {
    setIsKnowledgeLoading(true);
    setKnowledgeError(null);

    try {
      const nextFolders = await fetchKnowledgeFolders(organizationId);
      const rawKnowledge = await fetchKnowledgeSources(organizationId);
      const nextKnowledge = rawKnowledge.map((source) => ({
        ...source,
        folder:
          nextFolders.find((folder) => folder.id === source.folderId)?.name ??
          (source.folderId ? "알 수 없는 폴더" : "기본 폴더"),
      }));
      setKnowledgeFolders(nextFolders);
      setKnowledge(nextKnowledge);
      setSelectedKnowledgeId((current) => {
        if (nextKnowledge.length === 0) return "";
        return nextKnowledge.some((source) => source.id === current) ? current : nextKnowledge[0].id;
      });
      setSelectedFolder((current) => {
        const folderIds = [
          ...nextFolders.map((folder) => folder.id),
          ...(nextKnowledge.some((source) => !source.folderId) ? [UNFILED_FOLDER_ID] : []),
        ];
        return current && folderIds.includes(current) ? current : null;
      });
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : "Knowledge API 조회 실패");
    } finally {
      setIsKnowledgeLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadKnowledge() {
      if (isMounted) await reloadKnowledge();
    }

    loadKnowledge();

    return () => {
      isMounted = false;
    };
  }, [reloadKnowledge]);

  // processing/chunking/embedding 상태인 항목이 있으면 3초마다 상태 갱신
  useEffect(() => {
    const hasIndexing = knowledge.some((source) => INDEXING_STATUSES.includes(source.rawStatus ?? ""));
    if (!hasIndexing) return;

    const timer = setInterval(() => {
      reloadKnowledge();
    }, 3000);

    return () => clearInterval(timer);
  }, [knowledge, reloadKnowledge]);

  useEffect(() => {
    let isMounted = true;

    async function loadChunks() {
      if (!selectedKnowledgeId) return;
      setIsKnowledgeChunksLoading(true);

      try {
        const chunks = await fetchKnowledgeChunks(organizationId, selectedKnowledgeId);
        if (isMounted) setKnowledgeChunks(chunks);
      } catch {
        if (isMounted) setKnowledgeChunks([]);
      } finally {
        if (isMounted) setIsKnowledgeChunksLoading(false);
      }
    }

    loadChunks();

    return () => {
      isMounted = false;
    };
  }, [organizationId, selectedKnowledgeId]);

  const handleCreateKnowledge = async (input: { title: string; content: string }) => {
    setIsKnowledgeMutating(true);
    setKnowledgeError(null);
    try {
      await createKnowledgeSource({
        organizationId,
        title: input.title,
        content: input.content,
        folderId: selectedFolder === UNFILED_FOLDER_ID ? null : selectedFolder,
      });
      await reloadKnowledge();
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : "지식 추가 실패");
      throw error;
    } finally {
      setIsKnowledgeMutating(false);
    }
  };

  const handleUploadKnowledge = async (file: File) => {
    setIsKnowledgeMutating(true);
    setKnowledgeError(null);
    try {
      const result = await uploadKnowledgeSource({
        organizationId,
        file,
        folderId: selectedFolder === UNFILED_FOLDER_ID ? null : selectedFolder,
      });
      if (result.source_id) {
        setSelectedKnowledgeId(result.source_id);
      }
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : "지식 업로드 실패");
    } finally {
      setIsKnowledgeMutating(false);
      await reloadKnowledge();
    }
  };

  const handleUpdateKnowledge = async (
    sourceId: string,
    data: { title?: string; is_referenced?: boolean; status?: string },
  ) => {
    const previousKnowledge = knowledge;
    setIsKnowledgeMutating(true);
    setKnowledgeError(null);
    setKnowledge((current) =>
      current.map((source) => {
        if (source.id !== sourceId) return source;

        const nextStatus =
          typeof data.is_referenced === "boolean"
            ? data.is_referenced
              ? "참조중"
              : "미참조"
            : data.status
              ? mapKnowledgeStatus(data.status, source.status !== "미참조")
              : source.status;

        return {
          ...source,
          title: data.title ?? source.title,
          status: nextStatus,
          rawStatus: data.status ?? source.rawStatus,
        };
      }),
    );

    try {
      await updateKnowledgeSource({ organizationId, sourceId, data });
      await reloadKnowledge();
    } catch (error) {
      setKnowledge(previousKnowledge);
      setKnowledgeError(error instanceof Error ? error.message : "지식 수정 실패");
      throw error;
    } finally {
      setIsKnowledgeMutating(false);
    }
  };

  const handleDeleteKnowledge = async (sourceId: string) => {
    setIsKnowledgeMutating(true);
    setKnowledgeError(null);
    try {
      await deleteKnowledgeSource({ organizationId, sourceId });
      setSelectedKnowledgeId((current) => (current === sourceId ? "" : current));
      await reloadKnowledge();
    } catch (error) {
      setKnowledgeError(error instanceof Error ? error.message : "지식 삭제 실패");
      throw error;
    } finally {
      setIsKnowledgeMutating(false);
    }
  };

  const handleUpdateChunk = async (chunkId: string, content: string) => {
    await updateKnowledgeChunk({ organizationId, chunkId, content });
    setKnowledgeChunks((current) => current.map((chunk) => (chunk.id === chunkId ? { ...chunk, content } : chunk)));
  };

  const handleDeleteChunk = async (chunkId: string) => {
    await deleteKnowledgeChunk({ organizationId, chunkId });
    setKnowledgeChunks((current) => current.filter((chunk) => chunk.id !== chunkId));
  };

  // TODO: 백엔드 PATCH /knowledge/{id}가 content를 아직 지원하지 않음 — 지원되면 실제 저장 + 재인덱싱 호출로 교체
  const handleUpdateKnowledgeContent = async () => {
    throw new Error("본문 내용 수정은 아직 지원되지 않습니다.");
  };

  const handleCreateFolder = async (input: { name: string; description?: string | null }) => {
    setKnowledgeError(null);
    const created = await createKnowledgeFolder({
      organizationId,
      name: input.name,
      description: input.description,
    });
    setKnowledgeFolders((current) => [...current, created]);
    setSelectedFolder(created.id);
    await reloadKnowledge();
  };

  const handleRenameFolder = async (folderId: string, input: { name: string; description?: string | null }) => {
    if (folderId === UNFILED_FOLDER_ID) return;
    setKnowledgeError(null);
    const updated = await updateKnowledgeFolder({
      organizationId,
      folderId,
      data: { name: input.name, description: input.description },
    });
    setKnowledgeFolders((current) => current.map((folder) => (folder.id === folderId ? updated : folder)));
    setKnowledge((current) =>
      current.map((source) => (source.folderId === folderId ? { ...source, folder: updated.name } : source)),
    );
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (folderId === UNFILED_FOLDER_ID) return;
    setKnowledgeError(null);
    await deleteKnowledgeFolder({ organizationId, folderId });
    setKnowledgeFolders((current) => current.filter((folder) => folder.id !== folderId));
    setKnowledge((current) =>
      current.map((source) =>
        source.folderId === folderId ? { ...source, folderId: undefined, folder: "기본 폴더" } : source,
      ),
    );
    setSelectedFolder((current) => (current === folderId ? UNFILED_FOLDER_ID : current));
    await reloadKnowledge();
  };

  return {
    knowledge,
    knowledgeFolders,
    knowledgeChunks,
    isKnowledgeLoading,
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
    handleDeleteKnowledge,
    handleUpdateChunk,
    handleDeleteChunk,
    handleUpdateKnowledgeContent,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
  };
}
