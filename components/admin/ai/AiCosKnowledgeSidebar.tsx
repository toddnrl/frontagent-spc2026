"use client";

import { FolderOpen, FolderPlus, Pencil, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button, Modal, ModalActions } from "../ui";
import type { KnowledgeFolder, KnowledgeSource } from "./types";

type FolderInput = {
  name: string;
  description?: string | null;
};

function groupByFolderId(sources: KnowledgeSource[], unfiledFolderId: string) {
  const map = new Map<string, KnowledgeSource[]>();
  for (const source of sources) {
    const key = source.folderId ?? unfiledFolderId;
    const group = map.get(key) ?? [];
    group.push(source);
    map.set(key, group);
  }
  return map;
}

function getReferenceTotal(sources: KnowledgeSource[]) {
  return sources.reduce((total, source) => total + source.referenceCount, 0);
}

function formatStats(sources: KnowledgeSource[]) {
  return `${sources.length.toLocaleString()}개 지식 · ${getReferenceTotal(sources).toLocaleString()}회 참조`;
}

export function AiCosKnowledgeSidebar({
  sources,
  folders,
  unfiledFolderId,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  isLoading,
  search,
  onSearchChange,
}: {
  sources: KnowledgeSource[];
  folders: KnowledgeFolder[];
  unfiledFolderId: string;
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder?: (input: FolderInput) => Promise<void>;
  onRenameFolder?: (folderId: string, input: FolderInput) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const folderMap = groupByFolderId(sources, unfiledFolderId);
  const folderIds = [
    ...folders.map((folder) => folder.id),
    ...(sources.some((source) => !source.folderId) ? [unfiledFolderId] : []),
  ];
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const visibleFolderIds = folderIds.filter((folderId) => {
    if (!search.trim()) return true;
    const folder = folderById.get(folderId);
    const name = folderId === unfiledFolderId ? "기본 폴더" : folder?.name ?? "알 수 없는 폴더";
    const matchesFolderName = name.toLowerCase().includes(search.toLowerCase());
    const matchesSourceTitle = (folderMap.get(folderId) ?? []).some((source) =>
      source.title.toLowerCase().includes(search.toLowerCase()),
    );
    return matchesFolderName || matchesSourceTitle;
  });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderFormError, setFolderFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);

  const closeModal = () => {
    if (isSubmitting) return;
    setModalMode(null);
    setEditingFolderId(null);
    setFolderName("");
    setFolderDescription("");
    setFolderFormError(null);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingFolderId(null);
    setFolderName("");
    setFolderDescription("");
    setFolderFormError(null);
  };

  const openEditModal = (folderId: string) => {
    const folder = folderById.get(folderId);
    if (!folder) return;
    setModalMode("edit");
    setEditingFolderId(folderId);
    setFolderName(folder.name);
    setFolderDescription(folder.description ?? "");
    setFolderFormError(null);
  };

  const submitFolder = async () => {
    const name = folderName.trim();
    const description = folderDescription.trim();
    if (!name) {
      setFolderFormError("폴더명을 입력해 주세요.");
      return;
    }
    if (modalMode === "create" && !onCreateFolder) return;
    if (modalMode === "edit" && (!editingFolderId || !onRenameFolder)) return;

    setIsSubmitting(true);
    setFolderFormError(null);
    try {
      const input = { name, description: description || null };
      if (modalMode === "create") {
        await onCreateFolder?.(input);
      } else if (editingFolderId) {
        await onRenameFolder?.(editingFolderId, input);
      }
      closeModal();
    } catch (error) {
      setFolderFormError(error instanceof Error ? error.message : "폴더 저장 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!onDeleteFolder || folderId === unfiledFolderId) return;
    const name = folderById.get(folderId)?.name ?? "폴더";
    if (!window.confirm(`"${name}" 폴더를 삭제할까요? 폴더 안의 지식은 기본 폴더로 이동됩니다.`)) return;
    setDeletingFolder(folderId);
    try {
      await onDeleteFolder(folderId);
    } finally {
      setDeletingFolder(null);
    }
  };

  const renderFolderRow = ({
    id,
    name,
    description,
    items,
    isSystemFolder = false,
    isAllFolder = false,
  }: {
    id: string | null;
    name: string;
    description?: string;
    items: KnowledgeSource[];
    isSystemFolder?: boolean;
    isAllFolder?: boolean;
  }) => {
    const isSelected = id === selectedFolder;
    const canEdit = !isSystemFolder && !isAllFolder && id && onRenameFolder;
    const canDelete = !isSystemFolder && !isAllFolder && id && onDeleteFolder;

    return (
      <div
        key={id ?? "all"}
        className={`group flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 transition-colors last:border-b-0 ${
          isSelected ? "bg-[#f2f6ff]" : "hover:bg-gray-50"
        }`}
      >
        <button onClick={() => onSelectFolder(id)} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <FolderOpen className={`mt-0.5 h-4 w-4 shrink-0 ${isAllFolder ? "text-blue-500" : "text-amber-400"}`} />
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[13px] font-bold ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
              {name}
            </p>
            <p className="truncate text-[11px] font-medium text-gray-400">
              {description?.trim() || (isSystemFolder ? "폴더 정보 없음" : "설명 없음")}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">{formatStats(items)}</p>
          </div>
        </button>

        {canEdit && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              openEditModal(id);
            }}
            className="shrink-0 rounded-full p-1 text-gray-300 opacity-0 hover:bg-gray-100 hover:text-gray-500 group-hover:opacity-100"
            aria-label="폴더 수정"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              void deleteFolder(id);
            }}
            disabled={deletingFolder === id}
            className="shrink-0 rounded-full p-1 text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 group-hover:opacity-100"
            aria-label="폴더 삭제"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-white px-4 py-7">
      <div className="mb-5 flex items-center justify-between px-1">
        <h2 className="text-[22px] font-bold">지식</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsSearchOpen((open) => !open);
              onSearchChange("");
            }}
            className="text-gray-500"
            aria-label="지식 검색"
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Button variant="primary" size="sm" onClick={openCreateModal} disabled={!onCreateFolder}>
            <FolderPlus className="h-3.5 w-3.5" />
            추가
          </Button>
        </div>
      </div>

      {isSearchOpen && (
        <input
          autoFocus
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="지식 또는 폴더 검색"
          className="mb-4 w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold outline-none placeholder:text-gray-400 focus:border-gray-400"
        />
      )}

      {isLoading ? (
        <p className="text-xs font-semibold text-gray-400">불러오는 중...</p>
      ) : (
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto">
          {!search.trim() &&
            renderFolderRow({
              id: null,
              name: "전체 지식",
              description: "모든 폴더의 지식을 한 번에 봅니다.",
              items: sources,
              isAllFolder: true,
            })}

          {visibleFolderIds.length === 0 ? (
            <p className="px-4 py-3 text-xs font-semibold text-gray-400">
              {search.trim() ? "검색 결과가 없습니다" : "폴더 없음"}
            </p>
          ) : (
            visibleFolderIds.map((folderId) => {
              const folder = folderById.get(folderId);
              const isSystemFolder = folderId === unfiledFolderId;
              return renderFolderRow({
                id: folderId,
                name: isSystemFolder ? "기본 폴더" : folder?.name ?? "알 수 없는 폴더",
                description: isSystemFolder ? "폴더 정보 없는 지식" : folder?.description,
                items: folderMap.get(folderId) ?? [],
                isSystemFolder,
              });
            })
          )}
        </div>
      )}

      {modalMode && (
        <Modal title={modalMode === "create" ? "폴더 추가" : "폴더 수정"} onClose={closeModal}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-[12px] font-bold text-gray-500">폴더명</span>
              <input
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="예: 환불 정책"
                className="mt-1 w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2 text-[14px] font-semibold outline-none focus:border-gray-400"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-bold text-gray-500">설명</span>
              <textarea
                value={folderDescription}
                onChange={(event) => setFolderDescription(event.target.value)}
                placeholder="예: 환불, 반품, 교환 기준에 사용하는 지식"
                rows={3}
                className="mt-1 w-full resize-none rounded-[12px] border border-gray-200 bg-white px-3 py-2 text-[14px] font-medium outline-none focus:border-gray-400"
              />
            </label>
            {folderFormError && <p className="text-[12px] font-semibold text-red-500">{folderFormError}</p>}
            <ModalActions
              isSubmitting={isSubmitting}
              submitLabel={modalMode === "create" ? "추가" : "저장"}
              onClose={closeModal}
              onSubmit={() => void submitFolder()}
            />
          </div>
        </Modal>
      )}
    </aside>
  );
}
