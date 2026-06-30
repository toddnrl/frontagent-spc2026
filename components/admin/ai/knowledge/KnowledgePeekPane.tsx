"use client";

import { Activity, BookOpen, Check, Info, Layers, Trash2, X } from "lucide-react";
import { useState } from "react";
import { PanelSection } from "../../ui";
import type { KnowledgeChunk, KnowledgeSource } from "../types";

// source가 바뀔 때 선택된 청크를 초기화해야 하므로, 호출부(KnowledgeWorkspace)에서
// key={source.id}로 마운트해 컴포넌트를 새로 시작한다(같은 source 내 chunks 변경에는
// 영향받지 않음).
export function KnowledgePeekPane({
  source,
  chunks,
  isLoading,
  onClose,
  onUpdateChunk,
  onDeleteChunk,
  onUpdateContent,
}: {
  source: KnowledgeSource;
  chunks: KnowledgeChunk[];
  isLoading: boolean;
  onClose: () => void;
  onUpdateChunk?: (chunkId: string, content: string) => Promise<void>;
  onDeleteChunk?: (chunkId: string) => Promise<void>;
  onUpdateContent?: (sourceId: string, content: string) => Promise<void>;
}) {
  const maxHits = Math.max(...chunks.map((c) => (c.metadata?.hit_count as number | undefined) ?? 0), 1);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(chunks[0]?.id ?? null);

  const selectedChunk = chunks.find((chunk) => chunk.id === selectedChunkId) ?? chunks[0] ?? null;
  const isTextSource = source.sourceType === "text";

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-[560px] flex-col border-l border-gray-200 bg-white shadow-[-18px_0_44px_rgba(15,23,42,0.12)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[18px] font-extrabold text-gray-900">{source.title}</div>
            <div className="mt-1 flex items-center gap-2 text-[12px] font-bold text-gray-400">
              <span>{source.type}</span>
              <span>·</span>
              <span className="truncate">{source.folder}</span>
            </div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100" aria-label="닫기">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 px-5 py-3">
        {source.status === "참조중" && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">참조중</span>
        )}
        {source.status === "인덱싱중" && (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">인덱싱중</span>
        )}
        {source.status === "미참조" && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">미참조</span>
        )}
        <span className="text-[11px] font-semibold text-gray-400">참조 {source.referenceCount}회</span>
        <span className="text-[11px] font-semibold text-gray-400">해결률 {source.resolutionRate}</span>
      </div>

      {/* 본문 — 태스크빌더 인스펙터와 동일한 접이식 섹션 구조 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection icon={<Info className="h-4 w-4" />} title="정보" defaultOpen>
          <div className="space-y-2">
            <PeekInfoRow label="파일명" value={source.fileName ?? "-"} />
            <PeekInfoRow label="형식" value={source.type} />
            <PeekInfoRow label="폴더" value={source.folder} />
            <PeekInfoRow label="상태" value={source.rawStatus ?? source.status} />
            <PeekInfoRow label="참조" value={`${source.referenceCount}회`} />
            <PeekInfoRow label="해결률" value={source.resolutionRate} />
            <PeekInfoRow label="업데이트" value={source.updatedAt} />
            {source.createdAt && <PeekInfoRow label="생성일" value={source.createdAt} />}
          </div>
        </PanelSection>

        {isTextSource && onUpdateContent && (
          <TextContentSection source={source} chunks={chunks} onUpdateContent={onUpdateContent} />
        )}

        <PanelSection
          icon={<Layers className="h-4 w-4" />}
          title={`참조 청크${chunks.length > 0 ? ` (${chunks.length})` : ""}`}
          defaultOpen
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          ) : chunks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[12px] font-semibold text-gray-400">청크 없음</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* 청크 선택 — 한 줄 가로 스크롤, 번호만 */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {chunks.map((chunk) => {
                  const isSelected = chunk.id === selectedChunkId;
                  return (
                    <button
                      key={chunk.id}
                      onClick={() => setSelectedChunkId(chunk.id)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                        isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      #{chunk.chunkIndex + 1}
                    </button>
                  );
                })}
              </div>

              {/* 선택된 청크 본문 */}
              {selectedChunk && (
                <ChunkDetail
                  key={selectedChunk.id}
                  chunk={selectedChunk}
                  maxHits={maxHits}
                  onUpdate={onUpdateChunk}
                  onDelete={onDeleteChunk}
                />
              )}
            </div>
          )}
        </PanelSection>
      </div>
    </aside>
  );
}

function TextContentSection({
  source,
  chunks,
  onUpdateContent,
}: {
  source: KnowledgeSource;
  chunks: KnowledgeChunk[];
  onUpdateContent: (sourceId: string, content: string) => Promise<void>;
}) {
  const originalContent = chunks.map((chunk) => chunk.content).join("\n\n");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(originalContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (draft.trim() === originalContent.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onUpdateContent(source.id, draft.trim());
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelSection icon={<BookOpen className="h-4 w-4" />} title="본문 내용" defaultOpen>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={10}
            className="w-full resize-none rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold leading-relaxed text-gray-700 outline-none focus:ring-1 focus:ring-blue-200"
            autoFocus
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setDraft(originalContent);
                setEditing(false);
              }}
              className="rounded-[8px] px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="flex items-center gap-1 rounded-[8px] bg-blue-500 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-blue-600 disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              {saving ? "저장중" : "저장"}
            </button>
          </div>
          <p className="text-[11px] font-semibold text-amber-600">
            저장하면 임베딩이 다시 생성됩니다. 반영까지 시간이 걸릴 수 있어요.
          </p>
          {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="whitespace-pre-line rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold leading-relaxed text-gray-700">
            {originalContent || "본문 내용이 없습니다."}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setDraft(originalContent);
                setEditing(true);
              }}
              className="rounded-[8px] px-3 py-1.5 text-[12px] font-bold text-blue-500 hover:bg-blue-50"
            >
              수정
            </button>
          </div>
        </div>
      )}
    </PanelSection>
  );
}

function ChunkDetail({
  chunk,
  maxHits,
  onUpdate,
  onDelete,
}: {
  chunk: KnowledgeChunk;
  maxHits: number;
  onUpdate?: (chunkId: string, content: string) => Promise<void>;
  onDelete?: (chunkId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chunk.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hitCount = (chunk.metadata?.hit_count as number | undefined) ?? 0;
  const hitPct = maxHits > 0 ? Math.round((hitCount / maxHits) * 100) : 0;

  const handleSave = async () => {
    if (!onUpdate || draft.trim() === chunk.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(chunk.id, draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm(`청크 #${chunk.chunkIndex + 1}을 삭제할까요?`)) return;
    setDeleting(true);
    try {
      await onDelete(chunk.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
          #{chunk.chunkIndex + 1}
        </span>
        <div className="flex items-center gap-1">
          {onUpdate && !editing && (
            <button
              onClick={() => {
                setDraft(chunk.content);
                setEditing(true);
              }}
              className="rounded-[8px] px-2 py-1 text-[11px] font-bold text-gray-500 hover:bg-gray-100"
            >
              수정
            </button>
          )}
          {onDelete && !editing && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              aria-label="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {hitCount > 0 && (
        <div className="mb-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400">검색 히트</span>
            <span className="text-[10px] font-bold text-blue-500">{hitCount}회</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{ width: `${hitPct}%` }}
            />
          </div>
        </div>
      )}

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-[8px] bg-gray-50 px-3 py-2 text-[12px] font-semibold leading-relaxed text-gray-700 outline-none focus:ring-1 focus:ring-blue-200"
            autoFocus
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setEditing(false)}
              className="rounded-[6px] px-3 py-1.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="flex items-center gap-1 rounded-[6px] bg-blue-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-600 disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              {saving ? "저장중" : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[12px] font-semibold leading-relaxed text-gray-700">{chunk.content}</p>
      )}
    </div>
  );
}

function PeekInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-14 shrink-0 text-[11px] font-bold text-gray-400">{label}</span>
      <span className="text-[12px] font-semibold text-gray-700">{value}</span>
    </div>
  );
}
