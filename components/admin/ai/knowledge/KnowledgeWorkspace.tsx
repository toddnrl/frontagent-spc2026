"use client";

import React from "react";
import type { User } from "@supabase/supabase-js";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  FileType2,
  Table2,
  FolderOpen,
  FolderPlus,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { TabRow } from "@/components/ui/TabRow";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { AiCosDetailPanel } from "../AiCosDetailPanel";
import { KnowledgePeekPane } from "./KnowledgePeekPane";
import { UNFILED_FOLDER_ID, useKnowledgeWorkspace } from "./useKnowledgeWorkspace";
import type { KnowledgeChunk, KnowledgeFolder, KnowledgeSource } from "../types";

type SortKey = "title" | "type" | "referenceCount" | "resolutionRate" | "updatedAt";
type SortDir = "asc" | "desc";

export function KnowledgeWorkspace({ organizationId, user }: { organizationId: string; user?: User | null }) {
  const [pendingNotice, setPendingNotice] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string | null>>(new Set([null]));
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filter, setFilter] = useState<"전체" | "참조중" | "미참조">("전체");
  const [modal, setModal] = useState<"add" | "edit" | "create-folder" | "edit-folder" | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderParentId, setFolderParentId] = useState<string | null>(null);
  const [folderFormError, setFolderFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workspace = useKnowledgeWorkspace(organizationId, (count) => {
    setPendingNotice(count);
  });

  const folderById = useMemo(
    () => new Map(workspace.knowledgeFolders.map((f) => [f.id, f])),
    [workspace.knowledgeFolders],
  );

  const sourcesByFolder = useMemo(() => {
    const map = new Map<string, KnowledgeSource[]>();
    for (const source of workspace.knowledge) {
      const key = source.folderId ?? UNFILED_FOLDER_ID;
      map.set(key, [...(map.get(key) ?? []), source]);
    }
    return map;
  }, [workspace.knowledge]);

  // 하위 폴더 트리 구조
  const childFoldersByParentId = useMemo(() => {
    const map = new Map<string, typeof workspace.knowledgeFolders>();
    for (const folder of workspace.knowledgeFolders) {
      const key = folder.parentId ?? "root";
      map.set(key, [...(map.get(key) ?? []), folder]);
    }
    return map;
  }, [workspace.knowledgeFolders]);

  // parentId가 없는 최상위 폴더만 루트에 표시
  const rootFolderIds: string[] = [
    ...(workspace.knowledge.some((s) => !s.folderId) ? [UNFILED_FOLDER_ID] : []),
    ...workspace.knowledgeFolders.filter((f) => !f.parentId).map((f) => f.id),
  ];

  const toggleFolder = (id: string | null) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filteredSources = (sources: KnowledgeSource[]) => {
    return [...sources]
      .filter((s) => {
        const isOn = s.status !== "미참조";
        const matchesFilter = filter === "전체" ? true : filter === "참조중" ? isOn : !isOn;
        const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "title") cmp = a.title.localeCompare(b.title, "ko");
        else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
        else if (sortKey === "referenceCount") cmp = a.referenceCount - b.referenceCount;
        else if (sortKey === "resolutionRate") cmp = a.resolutionRate.localeCompare(b.resolutionRate);
        else if (sortKey === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt);
        return sortDir === "asc" ? cmp : -cmp;
      });
  };

  const [pendingSourceIds, setPendingSourceIds] = useState<Set<string>>(new Set());
  const runSourceMutation = async (sourceId: string, mutation: () => Promise<void>) => {
    setPendingSourceIds((c) => new Set(c).add(sourceId));
    try { await mutation(); }
    finally {
      setPendingSourceIds((c) => { const n = new Set(c); n.delete(sourceId); return n; });
    }
  };

  const selectedSource = workspace.knowledge.find((s) => s.id === workspace.selectedKnowledgeId) ?? workspace.knowledge[0];
  const indexing = workspace.knowledge.find((s) => s.status === "인덱싱중");
  const referencedCount = workspace.knowledge.filter((s) => s.status !== "미참조").length;

  const openFolderEditModal = (folderId: string) => {
    const folder = folderById.get(folderId);
    if (!folder) return;
    setEditingFolderId(folderId);
    setFolderName(folder.name);
    setFolderDescription(folder.description ?? "");
    setFolderFormError(null);
    setModal("edit-folder");
  };

  const submitFolder = async () => {
    const name = folderName.trim();
    if (!name) { setFolderFormError("폴더명을 입력해 주세요."); return; }
    setIsSubmitting(true);
    setFolderFormError(null);
    try {
      const input = { name, description: folderDescription.trim() || null, parentId: folderParentId };
      if (modal === "create-folder") await workspace.handleCreateFolder(input);
      else if (editingFolderId) await workspace.handleRenameFolder(editingFolderId, input);
      setModal(null);
    } catch (e) {
      setFolderFormError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFolder = async (folderId: string) => {
    const name = folderById.get(folderId)?.name ?? "폴더";
    if (!window.confirm(`"${name}" 폴더를 삭제할까요?`)) return;
    await workspace.handleDeleteFolder(folderId);
  };

  return (
    <>
      <div className="flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-8">
          <div>
            <h1 className="text-[30px] font-bold">지식</h1>
            <p className="mt-2 text-[15px] font-medium text-gray-500">
              전체 {workspace.knowledge.length}개 · 참조중 {referencedCount}개
              {indexing ? " · 인덱싱중 1개" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[210px]">
              <TabRow
                tabs={["전체", "참조중", "미참조"]}
                active={filter}
                onChange={(tab) => setFilter(tab as typeof filter)}
                className="gap-0 bg-gray-100 p-1 text-sm"
                buttonClassName="px-3 py-1.5"
                inset="0.25rem"
                gap="0rem"
              />
            </div>
            <button
              onClick={() => { setIsSearchOpen((o) => !o); setSearch(""); }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <Button variant="ghost" size="md" onClick={() => { setFolderName(""); setFolderDescription(""); setFolderParentId(null); setModal("create-folder"); }}>
              <FolderPlus className="h-4 w-4" />
              폴더
            </Button>
            <Button variant="primary" size="md" onClick={() => setModal("add")}>
              <Plus className="h-4 w-4" />
              지식 추가
            </Button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-b border-gray-100 px-6 py-3">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="지식 검색"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
        )}

        {pendingNotice !== null && (
          <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              지식 분석 결과 서비스로 추가할 항목 {pendingNotice}개가 발견됐습니다. 서비스 탭에서 확인하세요.
            </div>
            <button onClick={() => setPendingNotice(null)} className="ml-4 text-xs font-bold text-blue-400 hover:text-blue-600">
              닫기
            </button>
          </div>
        )}

        {indexing && (
          <div className="flex items-center gap-3 border-b border-purple-100 bg-purple-50 px-6 py-3">
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-purple-500" />
            <p className="text-sm font-bold text-purple-700">
              &quot;{indexing.title}&quot; 인덱싱 중입니다.
            </p>
          </div>
        )}

        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-[minmax(0,1fr)_70px_90px_100px_48px_20px] gap-x-4 border-b border-gray-100 px-5 py-3 text-xs font-semibold text-gray-800">
          <SortHeader label="이름" sortKey="title" current={sortKey} dir={sortDir} onSort={handleSort} />
          <SortHeader label="형식" sortKey="type" current={sortKey} dir={sortDir} onSort={handleSort} />
          <SortHeader label="참조" sortKey="referenceCount" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
          <SortHeader label="업데이트" sortKey="updatedAt" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
          <span className="flex justify-center">상태</span>
          <span />
        </div>

        {/* 폴더 아코디언 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {workspace.isKnowledgeLoading ? (
            <div className="flex items-center justify-center py-16 text-sm font-semibold text-gray-400">불러오는 중...</div>
          ) : (
            <>
              {rootFolderIds.map((folderId) => {
                const isUnfiled = folderId === UNFILED_FOLDER_ID;
                const folder = folderId ? folderById.get(folderId) : null;
                const name = isUnfiled ? "기본 폴더" : folder?.name ?? "알 수 없는 폴더";
                const sources = sourcesByFolder.get(folderId ?? "") ?? [];
                const filtered = filteredSources(sources);
                const isExpanded = expandedFolders.has(folderId);

                if (search && filtered.length === 0) return null;

                return (
                  <div key={folderId} className="border-b border-gray-100 last:border-b-0">
                    {/* 폴더 헤더 — 테이블 컬럼과 동일한 그리드 */}
                    <div className="group grid grid-cols-[minmax(0,1fr)_70px_90px_100px_48px_20px] gap-x-4 px-5 py-4 hover:bg-gray-50">
                      <button
                        onClick={() => toggleFolder(folderId)}
                        className="flex min-w-0 items-center gap-2 text-left"
                      >
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                          : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                        }
                        <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
                        <span className="text-sm font-semibold text-gray-800">{name}</span>
                        <span className="text-xs font-medium text-gray-400">{sources.length}개</span>
                      </button>
                      {/* 형식 — 비움 */}
                      <div />
                      {/* 참조 횟수 합계 */}
                      <div className="flex items-center justify-end text-xs font-semibold text-gray-500">
                        {sources.reduce((sum, s) => sum + s.referenceCount, 0).toLocaleString()}
                      </div>
                      {/* 업데이트 — 비움 */}
                      <div />
                      {/* 상태 */}
                      <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {sources.some((s) => s.status === "인덱싱중") ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                        ) : (
                          <Toggle
                            enabled={!isUnfiled ? (folder?.isActive ?? true) : sources.some((s) => s.status !== "미참조")}
                            onChange={() => {
                              if (!isUnfiled && folder) {
                                void workspace.handleToggleFolderActive(folder.id, !(folder.isActive ?? true));
                              }
                            }}
                            disabled={isUnfiled}
                            size="sm"
                          />
                        )}
                      </div>
                      {/* 액션 */}
                      <div className="relative flex items-center justify-end">
                        {!isUnfiled && folder && (
                          <FolderMenuButton
                            onEdit={() => openFolderEditModal(folderId!)}
                            onDelete={() => void deleteFolder(folderId!)}
                          />
                        )}
                      </div>
                    </div>

                    {/* 지식 목록 */}
                    {isExpanded && (
                      <div>
                        {filtered.length === 0 && (childFoldersByParentId.get(folderId) ?? []).length === 0 ? (
                          <div className="py-6 text-center text-sm font-semibold text-gray-400">
                            {search ? "검색 결과 없음" : "지식이 없습니다"}
                          </div>
                        ) : (
                          <>
                            {/* 하위 폴더 먼저 */}
                            {(childFoldersByParentId.get(folderId) ?? []).map((childFolder) => {
                              const childSources = sourcesByFolder.get(childFolder.id) ?? [];
                              const childFiltered = filteredSources(childSources);
                              const isChildExpanded = expandedFolders.has(childFolder.id);
                              if (search && childFiltered.length === 0) return null;
                              return (
                                <div key={childFolder.id}>
                                  <div className="group grid grid-cols-[minmax(0,1fr)_70px_90px_100px_48px_20px] gap-x-4 px-5 py-4 hover:bg-gray-50">
                                    <button onClick={() => toggleFolder(childFolder.id)} className="flex min-w-0 items-center gap-2 text-left pl-4">
                                      {isChildExpanded
                                        ? <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                                        : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                                      }
                                      <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
                                      <span className="text-sm font-semibold text-gray-800">{childFolder.name}</span>
                                      <span className="text-xs font-medium text-gray-400">{childSources.length}개</span>
                                    </button>
                                    <div />
                                    <div className="flex items-center justify-end text-xs font-semibold text-gray-500">
                                      {childSources.reduce((sum, s) => sum + s.referenceCount, 0).toLocaleString()}
                                    </div>
                                    <div />
                                    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                      {childSources.some((s) => s.status === "인덱싱중") ? (
                                        <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                                      ) : (
                                        <Toggle
                                          enabled={childFolder.isActive ?? true}
                                          onChange={() => void workspace.handleToggleFolderActive(childFolder.id, !(childFolder.isActive ?? true))}
                                          size="sm"
                                        />
                                      )}
                                    </div>
                                    <div className="relative flex items-center justify-end">
                                      <FolderMenuButton
                                        onEdit={() => openFolderEditModal(childFolder.id)}
                                        onDelete={() => void deleteFolder(childFolder.id)}
                                      />
                                    </div>
                                  </div>
                                  {isChildExpanded && (
                                    <div>
                                      {childFiltered.map((source) => (
                                        <KnowledgeRow
                                          key={source.id}
                                          source={source}
                                          isSelected={source.id === workspace.selectedKnowledgeId}
                                          isMutating={pendingSourceIds.has(source.id)}
                                          onSelect={() => { workspace.setSelectedKnowledgeId(source.id); workspace.setPeekSource(source); }}
                                          onToggle={() => runSourceMutation(source.id, () => workspace.handleUpdateKnowledge(source.id, { is_referenced: source.status === "미참조" }))}
                                          onEdit={() => { workspace.setSelectedKnowledgeId(source.id); setModal("edit"); }}
                                          onDelete={() => runSourceMutation(source.id, () => workspace.handleDeleteKnowledge(source.id))}
                                          onReindex={() => runSourceMutation(source.id, () => workspace.handleReindexKnowledge(source.id))}
                                          indentLevel={1}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {/* 지식 목록 */}
                            {filtered.map((source) => (
                              <KnowledgeRow
                                key={source.id}
                                source={source}
                                isSelected={source.id === workspace.selectedKnowledgeId}
                                isMutating={pendingSourceIds.has(source.id)}
                                onSelect={() => { workspace.setSelectedKnowledgeId(source.id); workspace.setPeekSource(source); }}
                                onToggle={() => runSourceMutation(source.id, () => workspace.handleUpdateKnowledge(source.id, { is_referenced: source.status === "미참조" }))}
                                onEdit={() => { workspace.setSelectedKnowledgeId(source.id); setModal("edit"); }}
                                onDelete={() => runSourceMutation(source.id, () => workspace.handleDeleteKnowledge(source.id))}
                                onReindex={() => runSourceMutation(source.id, () => workspace.handleReindexKnowledge(source.id))}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 미분류 없으면 빈 상태 */}
              {workspace.knowledge.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <BookOpen className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-gray-400">아직 지식이 없습니다</p>
                  <p className="mt-1 text-xs font-semibold text-gray-300">지식 추가 버튼을 눌러 첫 번째 지식을 추가하세요</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AiCosDetailPanel activeSection="knowledge" organizationId={organizationId} user={user} />

      {workspace.peekSource && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => workspace.setPeekSource(null)} />
          <KnowledgePeekPane
            key={workspace.peekSource.id}
            source={workspace.peekSource}
            chunks={workspace.knowledgeChunks}
            isLoading={workspace.isKnowledgeChunksLoading}
            onClose={() => workspace.setPeekSource(null)}
            onUpdateChunk={workspace.handleUpdateChunk}
            onDeleteChunk={workspace.handleDeleteChunk}
            onUpdateContent={workspace.handleUpdateKnowledgeContent}
            onReindex={workspace.handleReindexKnowledge}
          />
        </>
      )}

      {/* 폴더 모달 */}
      {(modal === "create-folder" || modal === "edit-folder") && (
        <Modal title={modal === "create-folder" ? "폴더 추가" : "폴더 수정"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold text-gray-500">폴더명</span>
              <input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="예: 환불 정책"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-gray-400"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-gray-500">설명</span>
              <textarea
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder="예: 환불, 반품, 교환 기준에 사용하는 지식"
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-gray-400"
              />
            </label>
            {modal === "create-folder" && workspace.knowledgeFolders.length > 0 && (
              <label className="block">
                <span className="text-xs font-bold text-gray-500">상위 폴더 (선택)</span>
                <select
                  value={folderParentId ?? ""}
                  onChange={(e) => setFolderParentId(e.target.value || null)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-gray-400"
                >
                  <option value="">없음 (최상위)</option>
                  {workspace.knowledgeFolders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </label>
            )}
            {folderFormError && <p className="text-xs font-semibold text-red-500">{folderFormError}</p>}
            <ModalActions
              isSubmitting={isSubmitting}
              submitLabel={modal === "create-folder" ? "추가" : "저장"}
              onClose={() => setModal(null)}
              onSubmit={() => void submitFolder()}
            />
          </div>
        </Modal>
      )}

      {/* 지식 추가 모달 */}
      {modal === "add" && (
        <KnowledgeAddModal
          isMutating={workspace.isKnowledgeMutating}
          onClose={() => setModal(null)}
          onSubmitText={async (input) => { await workspace.handleCreateKnowledge(input); setModal(null); }}
          onSubmitFile={async (file) => { setModal(null); await workspace.handleUploadKnowledge(file); }}
        />
      )}

      {/* 지식 수정 모달 */}
      {modal === "edit" && selectedSource && (
        <KnowledgeEditModal
          source={selectedSource}
          isMutating={workspace.isKnowledgeMutating}
          onClose={() => setModal(null)}
          onSubmit={async (input) => { await workspace.handleUpdateKnowledge(selectedSource.id, input); setModal(null); }}
        />
      )}
    </>
  );
}

function FolderMenuButton({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <Dropdown
      trigger={
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex h-6 w-3.5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >⋮</button>
      }
      items={[
        { label: "수정", onClick: onEdit, icon: "edit" },
        { label: "삭제", onClick: onDelete, icon: "delete", variant: "danger" as const, separator: true },
      ]}
    />
  );
}

function KnowledgeRow({
  source, isSelected, isMutating, onSelect, onToggle, onEdit, onDelete, onReindex, indentLevel = 0,
}: {
  source: KnowledgeSource;
  isSelected: boolean;
  isMutating: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onReindex?: () => Promise<void>;
  indentLevel?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOn = source.status !== "미참조";
  const isIndexing = source.status === "인덱싱중";
  const typeColor: Record<KnowledgeSource["type"], string> = {
    PDF: "text-red-400", Excel: "text-emerald-500", CSV: "text-teal-500",
    Document: "text-blue-400", Website: "text-purple-400",
  };
  const typeIcon: Record<KnowledgeSource["type"], React.ReactNode> = {
    PDF: <FileType2 className="h-4 w-4 text-red-400" />,
    Excel: <Table2 className="h-4 w-4 text-emerald-500" />,
    CSV: <Table2 className="h-4 w-4 text-teal-500" />,
    Document: <FileText className="h-4 w-4 text-blue-400" />,
    Website: <Globe className="h-4 w-4 text-purple-400" />,
  };

  return (
    <div
      onClick={onSelect}
      className={`grid grid-cols-[minmax(0,1fr)_70px_90px_100px_48px_20px] items-center gap-x-4 border-b border-gray-100 px-5 py-4 transition-colors last:border-b-0 ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className={`flex min-w-0 items-center gap-3 ${indentLevel > 0 ? "pl-14" : "pl-10"}`}>
        <span className="shrink-0">{typeIcon[source.type]}</span>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{source.title}</span>
          {isIndexing && (
            <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-600">
              {source.rawStatus === "chunking" ? "청크 분할중"
                : source.rawStatus === "embedding" ? "임베딩중"
                : source.rawStatus === "processing" ? "처리중" : "인덱싱중"}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-start">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeColor[source.type]} bg-gray-100`}>{source.type}</span>
      </div>
      <div className="flex justify-end text-right text-xs font-semibold text-gray-700">
        {isIndexing ? <span className="text-gray-300">-</span> : source.referenceCount.toLocaleString()}
      </div>
      <div className="flex justify-end text-right text-xs font-medium text-gray-400">{source.updatedAt}</div>
      <div className="flex justify-center">
        {isIndexing ? (
          <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
        ) : (
          <span onClick={(e) => e.stopPropagation()}>
            <Toggle enabled={isOn} onChange={onToggle} disabled={isMutating} size="sm" />
          </span>
        )}
      </div>
      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
        <Dropdown
          trigger={
            <button className="flex h-6 w-3.5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">⋮</button>
          }
          items={[
            { label: "수정", onClick: onEdit, icon: "edit" },
            ...(onReindex ? [{ label: "재인덱싱", onClick: onReindex, disabled: isIndexing, icon: <RefreshCw className="h-4 w-4" /> }] : []),
            { label: "삭제", onClick: () => { if (window.confirm(`"${source.title}" 지식을 삭제할까요?`)) void onDelete(); }, icon: "delete", variant: "danger" as const, separator: true },
          ]}
        />
      </div>
    </div>
  );
}

function KnowledgeAddModal({ isMutating, onClose, onSubmitText, onSubmitFile }: {
  isMutating: boolean; onClose: () => void;
  onSubmitText: (input: { title: string; content: string }) => Promise<void>;
  onSubmitFile: (file: File) => Promise<void>;
}) {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (mode === "text") {
      if (!title.trim() || !content.trim()) { setError("제목과 내용을 입력해 주세요."); return; }
      await onSubmitText({ title: title.trim(), content: content.trim() });
    } else {
      if (!file) { setError("파일을 선택해 주세요."); return; }
      await onSubmitFile(file);
    }
  };

  return (
    <Modal title="지식 추가" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-gray-100 p-1">
          <button type="button" onClick={() => { setMode("text"); setError(null); }}
            className={`rounded-lg px-3 py-2 text-sm font-extrabold transition-colors ${mode === "text" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}>
            텍스트 입력
          </button>
          <button type="button" onClick={() => { setMode("file"); setError(null); }}
            className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-extrabold transition-colors ${mode === "file" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}>
            <Upload className="h-3.5 w-3.5" /> 파일 업로드
          </button>
        </div>
        {mode === "text" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-gray-500">제목</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 환불 정책"
                className="w-full rounded-xl bg-[#f7f7f7] px-4 py-3 text-sm font-semibold outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-gray-500">내용</span>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
                className="w-full resize-none rounded-xl bg-[#f7f7f7] px-4 py-3 text-sm font-semibold leading-relaxed outline-none"
                placeholder="AI가 참조할 문서 내용을 입력하세요." />
            </label>
          </>
        ) : (
          <label className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${
            file ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-[#fafafa] hover:border-gray-400"}`}>
            {file ? (
              <>
                <FileText className="h-6 w-6 text-blue-500" />
                <span className="mt-2 text-sm font-extrabold text-gray-900">{file.name}</span>
                <span className="mt-1 text-xs font-bold text-gray-400">클릭해서 다시 선택</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-sm font-extrabold text-gray-700">PDF, TXT, MD, Excel</span>
                <span className="mt-1 text-xs font-bold text-gray-400">클릭하거나 드래그하세요</span>
              </>
            )}
            <input type="file" className="hidden" accept=".pdf,.txt,.md,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        )}
        {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        <ModalActions isSubmitting={isMutating} submitLabel={mode === "text" ? "추가" : "업로드"} onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

function KnowledgeEditModal({ source, isMutating, onClose, onSubmit }: {
  source: KnowledgeSource; isMutating: boolean; onClose: () => void;
  onSubmit: (input: { title?: string; is_referenced?: boolean; status?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(source.title);
  const [isReferenced, setIsReferenced] = useState(source.status !== "미참조");
  const [status, setStatus] = useState(source.rawStatus ?? "indexed");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) { setError("제목을 입력해 주세요."); return; }
    await onSubmit({ title: title.trim(), is_referenced: isReferenced, status });
  };

  return (
    <Modal title="지식 수정" onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-500">제목</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-[#f7f7f7] px-4 py-3 text-sm font-semibold outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-gray-500">상태</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl bg-[#f7f7f7] px-4 py-3 text-sm font-semibold outline-none">
            <option value="indexed">indexed</option>
            <option value="indexing">indexing</option>
            <option value="processing">processing</option>
            <option value="failed">failed</option>
          </select>
        </label>
        <label className="flex items-center justify-between rounded-xl bg-[#f7f7f7] px-4 py-3">
          <span className="text-sm font-bold text-gray-700">AI 응답에 참조</span>
          <Toggle enabled={isReferenced} onChange={() => setIsReferenced((c) => !c)} />
        </label>
        {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        <ModalActions isSubmitting={isMutating} submitLabel="저장" onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

function SortHeader({ label, sortKey, current, dir, onSort, align = "left" }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (key: SortKey) => void; align?: "left" | "center" | "right";
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ArrowUpDown;
  const alignClass = { left: "justify-start", center: "justify-center", right: "justify-end text-right" }[align];
  return (
    <button onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold transition-colors hover:text-gray-900 ${alignClass} ${active ? "text-gray-900" : "text-gray-700"}`}>
      {label}<Icon className="h-3 w-3 shrink-0" />
    </button>
  );
}
