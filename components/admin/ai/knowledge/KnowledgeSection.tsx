"use client";

import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";
import type { Key } from "react";
import { useMemo, useState } from "react";
import { Button, Modal, ModalActions, TabRow, Toggle } from "../../ui";
import type { KnowledgeChunk, KnowledgeSource } from "../types";

type SortKey = "title" | "type" | "referenceCount" | "resolutionRate" | "updatedAt";
type SortDir = "asc" | "desc";

export function KnowledgeSection({
  sources,
  selectedSourceId,
  selectedFolder,
  search,
  isMutating,
  error,
  onSelectSource,
  onPeekSource,
  onCreate,
  onUpload,
  onUpdate,
  onDelete,
}: {
  sources: KnowledgeSource[];
  selectedSourceId: string;
  selectedFolder: string | null;
  search: string;
  chunks: KnowledgeChunk[];
  isChunksLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onSelectSource: (id: string) => void;
  onPeekSource: (source: KnowledgeSource) => void;
  onCreate: (input: { title: string; content: string }) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  onUpdate: (
    sourceId: string,
    data: { title?: string; is_referenced?: boolean; status?: string },
  ) => Promise<void>;
  onDelete: (sourceId: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<"전체" | "참조중" | "미참조">("전체");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [pendingSourceIds, setPendingSourceIds] = useState<Set<string>>(() => new Set());
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources[0];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const runSourceMutation = async (sourceId: string, mutation: () => Promise<void>) => {
    setPendingSourceIds((current) => new Set(current).add(sourceId));
    try {
      await mutation();
    } finally {
      setPendingSourceIds((current) => {
        const next = new Set(current);
        next.delete(sourceId);
        return next;
      });
    }
  };

  const filtered = useMemo(() => {
    const list = sources.filter((source) => {
      const isOn = source.status !== "미참조";
      const matchesFolder = selectedFolder
        ? (source.folderId ?? "__unfiled__") === selectedFolder
        : true;
      const matchesFilter = filter === "전체" ? true : filter === "참조중" ? isOn : !isOn;
      const matchesSearch = source.title.toLowerCase().includes(search.toLowerCase());
      return matchesFolder && matchesFilter && matchesSearch;
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title, "ko");
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "referenceCount") cmp = a.referenceCount - b.referenceCount;
      else if (sortKey === "resolutionRate") cmp = a.resolutionRate.localeCompare(b.resolutionRate);
      else if (sortKey === "updatedAt") cmp = a.updatedAt.localeCompare(b.updatedAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filter, search, sources, selectedFolder, sortKey, sortDir]);

  const referencedCount = sources.filter((source) => source.status !== "미참조").length;
  const indexing = sources.find((source) => source.status === "인덱싱중");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[13px] font-bold text-blue-500">지식</div>
            <h1 className="mt-0.5 text-[22px] font-extrabold">참조할 지식을 관리합니다</h1>
            <p className="mt-1 text-[13px] font-semibold text-gray-400">
              전체 {sources.length}개 · 참조중 {referencedCount}개
              {indexing ? " · 인덱싱중 1개" : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="primary" onClick={() => setModal("add")} className="rounded-[10px]">
              <Plus className="h-4 w-4" />
              지식 추가
            </Button>
          </div>
        </div>

        {indexing && (
          <div className="flex items-center gap-3 rounded-[14px] bg-purple-50 px-4 py-3">
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-purple-500" />
            <p className="text-[13px] font-bold text-purple-700">
              &quot;{indexing.title}&quot; 인덱싱 중입니다. 완료 후 검색에 반영됩니다.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-[14px] bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-700">
            Knowledge API 오류: {error}
          </div>
        )}

        <div className="flex items-center justify-end">
          <div className="w-[220px] shrink-0">
            <TabRow
              tabs={["전체", "참조중", "미참조"]}
              active={filter}
              onChange={(tab) => setFilter(tab as "전체" | "참조중" | "미참조")}
              className="gap-0 bg-gray-100 p-0.5 text-[11px]"
              buttonClassName="px-2 py-1.5"
              inset="0.125rem"
              gap="0rem"
            />
          </div>
        </div>
      </div>

      {/* 파일 목록 — 헤더+행 동일 grid로 컬럼 공유, main의 p-8 좌우 패딩을 상쇄해 꽉 차게 표시 */}
      <div className="-mx-8 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-7 w-7 text-gray-400" />
            </div>
            <p className="mt-3 text-[14px] font-bold text-gray-400">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(180px,1fr)_80px_80px_64px_88px_52px_14px] gap-x-3 px-8">
            {/* 헤더 */}
            <div className="sticky top-0 col-span-full grid grid-cols-subgrid border-b border-gray-200 bg-white px-2 pb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
              <SortHeader label="이름" sortKey="title" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="형식" sortKey="type" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHeader label="참조 횟수" sortKey="referenceCount" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortHeader label="해결률" sortKey="resolutionRate" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <SortHeader label="업데이트" sortKey="updatedAt" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
              <span className="flex justify-center">상태</span>
              <span />
            </div>
            {/* 행 */}
            {filtered.map((source) => (
              <KnowledgeRow
                key={source.id}
                source={source}
                isSelected={source.id === selectedSourceId}
                isMutating={pendingSourceIds.has(source.id)}
                onSelect={() => {
                  onSelectSource(source.id);
                  onPeekSource(source);
                }}
                onToggle={() =>
                  runSourceMutation(source.id, () =>
                    onUpdate(source.id, { is_referenced: source.status === "미참조" }),
                  )
                }
                onEdit={() => {
                  onSelectSource(source.id);
                  setModal("edit");
                }}
                onDelete={() => runSourceMutation(source.id, () => onDelete(source.id))}
              />
            ))}
          </div>
        )}
      </div>

      {modal === "add" && (
        <KnowledgeAddModal
          isMutating={isMutating}
          onClose={() => setModal(null)}
          onSubmitText={async (input) => {
            await onCreate(input);
            setModal(null);
          }}
          onSubmitFile={async (file) => {
            setModal(null);
            await onUpload(file);
          }}
        />
      )}
      {modal === "edit" && selectedSource && (
        <KnowledgeEditModal
          source={selectedSource}
          isMutating={isMutating}
          onClose={() => setModal(null)}
          onSubmit={async (input) => {
            await onUpdate(selectedSource.id, input);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function KnowledgeRow({
  source,
  isSelected,
  isMutating,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
}: {
  key?: Key;
  source: KnowledgeSource;
  isSelected: boolean;
  isMutating: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOn = source.status !== "미참조";
  const isIndexing = source.status === "인덱싱중";

  const typeColor: Record<KnowledgeSource["type"], string> = {
    PDF: "text-red-400",
    Excel: "text-emerald-500",
    CSV: "text-teal-500",
    Document: "text-blue-400",
    Website: "text-purple-400",
  };

  return (
    <div
      onClick={onSelect}
      className={`col-span-full grid grid-cols-subgrid items-center border-b border-gray-100 px-2 py-3 transition-colors last:border-b-0 ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-bold text-gray-900">{source.title}</span>
          {isIndexing && (
            <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
              {source.rawStatus === "chunking"
                ? "청크 분할중"
                : source.rawStatus === "embedding"
                  ? "임베딩중"
                  : source.rawStatus === "processing"
                    ? "처리중"
                    : "인덱싱중"}
            </span>
          )}
        </div>
      </div>
      {/* 형식 */}
      <div className="flex justify-start">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColor[source.type]} bg-gray-100`}>
          {source.type}
        </span>
      </div>
      {/* 참조 횟수 */}
      <div className="flex justify-end text-right text-[13px] font-bold text-gray-700">
        {isIndexing ? <span className="text-gray-300">-</span> : source.referenceCount.toLocaleString()}
      </div>
      {/* 해결률 */}
      <div className="flex justify-end text-right text-[12px] font-semibold text-gray-500">
        {isIndexing ? <span className="text-gray-300">-</span> : source.resolutionRate}
      </div>
      {/* 업데이트 */}
      <div className="flex justify-end text-right text-[12px] font-semibold text-gray-400">{source.updatedAt}</div>
      {/* 상태 (토글) */}
      <div className="flex justify-center">
        {isIndexing ? (
          <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
        ) : (
          <span onClick={(e) => e.stopPropagation()}>
            <Toggle enabled={isOn} onChange={onToggle} disabled={isMutating} size="sm" />
          </span>
        )}
      </div>
      <div className="relative flex justify-end">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((current) => !current);
          }}
          className="flex h-6 w-3.5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-[12px] border border-gray-100 bg-white py-1 shadow-lg">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                onEdit();
              }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50"
            >
              수정
            </button>
            <button
              onClick={async (event) => {
                event.stopPropagation();
                setMenuOpen(false);
                if (window.confirm(`"${source.title}" 지식을 삭제할까요?`)) {
                  await onDelete();
                }
              }}
              className="w-full px-4 py-2 text-left text-[13px] font-bold text-red-500 hover:bg-gray-50"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function KnowledgeAddModal({
  isMutating,
  onClose,
  onSubmitText,
  onSubmitFile,
}: {
  isMutating: boolean;
  onClose: () => void;
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
      if (!title.trim() || !content.trim()) {
        setError("제목과 내용을 입력해 주세요.");
        return;
      }
      setError(null);
      await onSubmitText({ title: title.trim(), content: content.trim() });
      return;
    }

    if (!file) {
      setError("업로드할 파일을 선택해 주세요.");
      return;
    }
    setError(null);
    await onSubmitFile(file);
  };

  return (
    <Modal title="지식 추가" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-1 rounded-[12px] border border-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("text");
              setError(null);
            }}
            className={`rounded-[9px] px-3 py-2 text-[13px] font-extrabold transition-colors ${
              mode === "text" ? "bg-blue-50 text-blue-600" : "text-gray-400"
            }`}
          >
            텍스트 입력
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("file");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1 rounded-[9px] px-3 py-2 text-[13px] font-extrabold transition-colors ${
              mode === "file" ? "bg-blue-50 text-blue-600" : "text-gray-400"
            }`}
          >
            <Upload className="h-3.5 w-3.5" /> 파일 업로드
          </button>
        </div>

        {mode === "text" ? (
          <>
            <TextInput label="제목" value={title} onChange={setTitle} placeholder="예: 환불 정책" />
            <label className="block">
              <span className="mb-1 block text-[12px] font-bold text-gray-500">내용</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={8}
                className="w-full resize-none rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold leading-relaxed outline-none"
                placeholder="AI가 참조할 문서 내용을 입력하세요."
              />
            </label>
          </>
        ) : (
          <label
            className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-4 py-6 text-center transition-colors ${
              file ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-[#fafafa] hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {file ? (
              <>
                <FileText className="h-6 w-6 text-blue-500" />
                <span className="mt-2 text-[14px] font-extrabold text-gray-900">{file.name}</span>
                <span className="mt-1 text-[12px] font-bold text-gray-400">{formatFileSize(file.size)} · 클릭해서 다시 선택</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="mt-2 text-[14px] font-extrabold text-gray-700">PDF, TXT, MD, CSV, Excel 파일 선택</span>
                <span className="mt-1 text-[12px] font-bold text-gray-400">클릭하거나 파일을 여기로 드래그하세요</span>
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,.csv,.xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        )}

        {error && <p className="text-[12px] font-bold text-red-500">{error}</p>}
        <ModalActions
          isSubmitting={isMutating}
          submitLabel={mode === "text" ? "추가" : "업로드"}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}

function KnowledgeEditModal({
  source,
  isMutating,
  onClose,
  onSubmit,
}: {
  source: KnowledgeSource;
  isMutating: boolean;
  onClose: () => void;
  onSubmit: (input: { title?: string; is_referenced?: boolean; status?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(source.title);
  const [isReferenced, setIsReferenced] = useState(source.status !== "미참조");
  const [status, setStatus] = useState(source.rawStatus ?? "indexed");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setError(null);
    await onSubmit({ title: title.trim(), is_referenced: isReferenced, status });
  };

  return (
    <Modal title="지식 수정" onClose={onClose}>
      <div className="space-y-3">
        <TextInput label="제목" value={title} onChange={setTitle} />
        <label className="block">
          <span className="mb-1 block text-[12px] font-bold text-gray-500">상태</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold outline-none"
          >
            <option value="indexed">indexed</option>
            <option value="indexing">indexing</option>
            <option value="processing">processing</option>
            <option value="failed">failed</option>
          </select>
        </label>
        <label className="flex items-center justify-between rounded-[12px] bg-[#f7f7f7] px-4 py-3">
          <span className="text-[13px] font-bold text-gray-700">AI 응답에 참조</span>
          <Toggle enabled={isReferenced} onChange={() => setIsReferenced((current) => !current)} />
        </label>
        {error && <p className="text-[12px] font-bold text-red-500">{error}</p>}
        <ModalActions isSubmitting={isMutating} submitLabel="저장" onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold outline-none"
        placeholder={placeholder}
      />
    </label>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "center" | "right";
}) {
  const active = current === sortKey;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ArrowUpDown;
  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end text-right",
  }[align];

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide transition-colors hover:text-gray-600 ${alignClass} ${
        active ? "text-gray-700" : "text-gray-400"
      }`}
    >
      {label}
      <Icon className="h-3 w-3 shrink-0" />
    </button>
  );
}
