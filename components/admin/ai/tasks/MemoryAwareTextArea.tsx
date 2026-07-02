import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MemoryVariableOption } from "./nodeHelpers";
import { buildPromptdataTag, normalizeNodeKey } from "./nodeHelpers";

function getTextareaCaretPosition(textarea: HTMLTextAreaElement, position: number) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  const marker = document.createElement("span");
  const lineHeight = Number.parseFloat(style.lineHeight) || 24;

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.boxSizing = style.boxSizing;
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.font = style.font;
  mirror.style.fontSize = style.fontSize;
  mirror.style.fontWeight = style.fontWeight;
  mirror.style.fontFamily = style.fontFamily;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.padding = style.padding;
  mirror.style.border = style.border;

  mirror.textContent = textarea.value.slice(0, position);
  marker.textContent = textarea.value.slice(position, position + 1) || " ";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const left = textarea.offsetLeft + marker.offsetLeft - textarea.scrollLeft;
  const top = textarea.offsetTop + marker.offsetTop - textarea.scrollTop + lineHeight;

  document.body.removeChild(mirror);
  return { left, top };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type MemoryTokenKind = "read" | "update";

const PROMPTDATA_TOKEN_PATTERN =
  /<promptdata\s+[^>]*type="([^"]+)"[^>]*subtype="([^"]+)"[^>]*identifier="([^"]+)"[^>]*><\/promptdata>/g;

function createMemoryBadgeHtml(key: string, kind: MemoryTokenKind, subtype = "text") {
  const safeKey = escapeHtml(key);
  const safeSubtype = escapeHtml(subtype);
  const icon = kind === "update" ? "✏" : "👁";
  const colorClass = kind === "update" ? "bg-amber-50 text-amber-600 ring-amber-100" : "bg-blue-50 text-blue-600 ring-blue-100";
  return `<span contenteditable="false" data-memory-token="${safeKey}" data-memory-kind="${kind}" data-memory-subtype="${safeSubtype}" class="inline-flex cursor-pointer items-center gap-1 rounded-full ${colorClass} px-2 py-0.5 align-middle text-[12px] font-extrabold ring-1">${icon} ${safeKey}</span>`;
}

function renderTokenEditorHtml(value: string) {
  const withPromptdataBadges = value.replace(
    PROMPTDATA_TOKEN_PATTERN,
    (_match, type: string, subtype: string, identifier: string) => {
      return createMemoryBadgeHtml(identifier, type === "update-variable" ? "update" : "read", subtype);
    },
  );

  const segments = withPromptdataBadges.split(/(<span[^>]*data-memory-token[^>]*>[^<]*<\/span>)/g);

  return segments
    .map((segment) => {
      if (segment.startsWith("<span") && segment.includes("data-memory-token")) return segment;
      return escapeHtml(segment).replace(/\n/g, "<br>");
    })
    .join("");
}

function serializeTokenEditor(element: HTMLElement) {
  const readNode = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";
    const token = node.dataset.memoryToken;
    if (token) {
      const kind = node.dataset.memoryKind === "update" ? "update-variable" : "read-variable";
      const subtype = node.dataset.memorySubtype || "text";
      return buildPromptdataTag(kind, token, subtype);
    }
    if (node.tagName === "BR") return "\n";
    return Array.from(node.childNodes).map(readNode).join("");
  };

  return Array.from(element.childNodes).map(readNode).join("");
}

function createMemoryBadgeElement(key: string, kind: MemoryTokenKind, subtype = "text") {
  const badge = document.createElement("span");
  badge.contentEditable = "false";
  badge.dataset.memoryToken = key;
  badge.dataset.memoryKind = kind;
  badge.dataset.memorySubtype = subtype;
  const colorClass =
    kind === "update"
      ? "bg-amber-50 text-amber-600 ring-amber-100"
      : "bg-blue-50 text-blue-600 ring-blue-100";
  badge.className = `inline-flex cursor-pointer items-center gap-1 rounded-full ${colorClass} px-2 py-0.5 align-middle text-[12px] font-extrabold ring-1`;
  badge.textContent = `${kind === "update" ? "✏" : "👁"} ${key}`;

  return badge;
}

function MemoryToolPopover({
  left,
  top,
  filteredOptions,
  updateOptions,
  isReadSectionOpen,
  isUpdateSectionOpen,
  onToggleRead,
  onToggleUpdate,
  onRead,
  onUpdate,
}: {
  left: number;
  top: number;
  filteredOptions: MemoryVariableOption[];
  updateOptions: MemoryVariableOption[];
  isReadSectionOpen: boolean;
  isUpdateSectionOpen: boolean;
  onToggleRead: () => void;
  onToggleUpdate: () => void;
  onRead: (option: MemoryVariableOption) => void;
  onUpdate: (option: MemoryVariableOption) => void;
}) {
  return (
    <div
      className="absolute z-40 mt-2 w-[360px] overflow-hidden rounded-[16px] border border-gray-200 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.14)]"
      style={{ left, top }}
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="text-[13px] font-extrabold text-gray-900">@ 도구 검색</div>
        <div className="mt-0.5 text-[11px] font-bold text-gray-400">
          변수 읽기 또는 이 에이전트의 결과 업데이트 변수를 선택하세요.
        </div>
      </div>
      <div className="max-h-[320px] overflow-y-auto py-2">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggleRead}
          className="flex w-full items-center justify-between px-4 pb-1 pt-2 text-left text-[11px] font-extrabold text-gray-400 hover:text-gray-600"
        >
          <span>변수 읽기</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isReadSectionOpen ? "rotate-180" : ""}`} />
        </button>
        {isReadSectionOpen &&
          (filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={`read-${option.key}`}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onRead(option);
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-blue-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-extrabold text-gray-900">@{option.label}</span>
                  <span className="block truncate text-[11px] font-bold text-gray-400">{option.source}</span>
                </span>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">
                  읽기
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-[12px] font-bold text-gray-400">읽을 수 있는 변수가 없습니다.</div>
          ))}

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onToggleUpdate}
          className="mt-2 flex w-full items-center justify-between border-t border-gray-100 px-4 pb-1 pt-3 text-left text-[11px] font-extrabold text-gray-400 hover:text-gray-600"
        >
          <span>변수 업데이트</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isUpdateSectionOpen ? "rotate-180" : ""}`} />
        </button>
        {isUpdateSectionOpen &&
          (updateOptions.length > 0 ? (
            updateOptions.map((option) => (
              <button
                key={`update-${option.key}`}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onUpdate(option);
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-blue-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-extrabold text-gray-900">{option.label}</span>
                  <span className="block truncate text-[11px] font-bold text-gray-400">{option.source}</span>
                </span>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-600">
                  업데이트
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-[12px] font-bold text-gray-400">업데이트할 변수명을 입력하세요.</div>
          ))}
      </div>
    </div>
  );
}

export function MemoryAwareTextArea({
  value,
  onChange,
  onBlur,
  placeholder,
  rows,
  memoryOptions,
  toolSearchMode = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows: number;
  memoryOptions: MemoryVariableOption[];
  toolSearchMode?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const mentionRangeRef = useRef<Range | null>(null);
  const replaceTokenRef = useRef<HTMLElement | null>(null);
  const lastEditorValueRef = useRef(value);
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0 });
  const [isReadSectionOpen, setIsReadSectionOpen] = useState(true);
  const [isUpdateSectionOpen, setIsUpdateSectionOpen] = useState(true);
  const filteredOptions = mention
    ? memoryOptions.filter((option) => option.key.toLowerCase().includes(mention.query.toLowerCase())).slice(0, 6)
    : [];
  const normalizedMentionKey = normalizeNodeKey(mention?.query ?? "");
  const updateOptions = [
    ...filteredOptions,
    ...(normalizedMentionKey && !filteredOptions.some((option) => option.key === normalizedMentionKey)
      ? [{ key: normalizedMentionKey, label: normalizedMentionKey, source: "새 업데이트 변수" }]
      : []),
  ].slice(0, 6);

  const updateMention = (nextValue: string, cursor: number) => {
    if (!toolSearchMode) {
      setMention(null);
      return;
    }

    const beforeCursor = nextValue.slice(0, cursor);
    const match = beforeCursor.match(/@([a-zA-Z0-9_.]*)$/);
    if (!match) {
      setMention(null);
      return;
    }

    const start = cursor - match[0].length;
    setMention({ start, query: match[1] });
    const textarea = textareaRef.current;
    if (textarea) {
      setPopoverPosition(getTextareaCaretPosition(textarea, start));
    }
  };

  const updateEditorMention = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      setMention(null);
      mentionRangeRef.current = null;
      replaceTokenRef.current = null;
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE || !editor.contains(container)) {
      setMention(null);
      mentionRangeRef.current = null;
      replaceTokenRef.current = null;
      return;
    }

    const text = container.textContent ?? "";
    const beforeCursor = text.slice(0, range.startOffset);
    const match = beforeCursor.match(/@([a-zA-Z0-9_.]*)$/);
    if (!match) {
      setMention(null);
      mentionRangeRef.current = null;
      replaceTokenRef.current = null;
      return;
    }

    const mentionRange = document.createRange();
    mentionRange.setStart(container, range.startOffset - match[0].length);
    mentionRange.setEnd(container, range.startOffset);
    mentionRangeRef.current = mentionRange;
    replaceTokenRef.current = null;
    setMention({ start: 0, query: match[1] });

    const rect = mentionRange.getBoundingClientRect();
    const wrapperRect = editor.parentElement?.getBoundingClientRect();
    setPopoverPosition({
      left: wrapperRect ? rect.left - wrapperRect.left : 0,
      top: wrapperRect ? rect.bottom - wrapperRect.top : 0,
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!toolSearchMode || !editor) return;
    if (document.activeElement === editor && value === lastEditorValueRef.current) return;

    editor.innerHTML = renderTokenEditorHtml(value);
    lastEditorValueRef.current = value;
  }, [toolSearchMode, value]);

  const insertMemoryToken = (option: MemoryVariableOption, kind: MemoryTokenKind) => {
    if (!mention) return;
    if (toolSearchMode && editorRef.current) {
      if (replaceTokenRef.current?.isConnected) {
        const badge = createMemoryBadgeElement(option.key, kind);
        const spacer = document.createTextNode(" ");
        replaceTokenRef.current.replaceWith(badge, spacer);

        const selection = window.getSelection();
        const nextRange = document.createRange();
        nextRange.setStartAfter(spacer);
        nextRange.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(nextRange);

        const nextValue = serializeTokenEditor(editorRef.current);
        lastEditorValueRef.current = nextValue;
        onChange(nextValue);
        setMention(null);
        mentionRangeRef.current = null;
        replaceTokenRef.current = null;
        requestAnimationFrame(() => editorRef.current?.focus());
        return;
      }

      if (!mentionRangeRef.current) return;
      const range = mentionRangeRef.current;
      const badge = createMemoryBadgeElement(option.key, kind);
      const spacer = document.createTextNode(" ");
      range.deleteContents();
      range.insertNode(spacer);
      range.insertNode(badge);

      const selection = window.getSelection();
      const nextRange = document.createRange();
      nextRange.setStartAfter(spacer);
      nextRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(nextRange);

      const nextValue = serializeTokenEditor(editorRef.current);
      lastEditorValueRef.current = nextValue;
      onChange(nextValue);
      setMention(null);
      mentionRangeRef.current = null;
      replaceTokenRef.current = null;
      requestAnimationFrame(() => editorRef.current?.focus());
      return;
    }

    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? value.length;
    const token = `@${option.key}`;
    const nextValue = `${value.slice(0, mention.start)}${token}${value.slice(cursor)}`;
    onChange(nextValue);
    setMention(null);
    requestAnimationFrame(() => {
      const nextCursor = mention.start + token.length;
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const insertMemoryVariable = (option: MemoryVariableOption) => insertMemoryToken(option, "read");
  const selectUpdateVariable = (option: MemoryVariableOption) => insertMemoryToken(option, "update");

  if (toolSearchMode) {
    return (
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => {
            const nextValue = serializeTokenEditor(event.currentTarget);
            lastEditorValueRef.current = nextValue;
            onChange(nextValue);
            updateEditorMention();
          }}
          onKeyUp={updateEditorMention}
          onMouseUp={updateEditorMention}
          onBlur={onBlur}
          onClick={(event) => {
            const token = (event.target as HTMLElement).closest("[data-memory-token]") as HTMLElement | null;
            if (!token || !editorRef.current) {
              replaceTokenRef.current = null;
              updateEditorMention();
              return;
            }

            const range = document.createRange();
            range.selectNode(token);
            mentionRangeRef.current = range;
            replaceTokenRef.current = token;
            setMention({ start: 0, query: "" });
            const rect = token.getBoundingClientRect();
            const wrapperRect = editorRef.current.parentElement?.getBoundingClientRect();
            setPopoverPosition({
              left: wrapperRect ? rect.left - wrapperRect.left : 0,
              top: wrapperRect ? rect.bottom - wrapperRect.top : 0,
            });
          }}
          className="min-h-[220px] w-full whitespace-pre-wrap break-words rounded-[16px] bg-transparent text-[15px] font-semibold leading-[1.65] text-gray-800 outline-none empty:before:text-gray-300 empty:before:content-[attr(data-placeholder)]"
          data-placeholder={placeholder}
        />
        {mention && (
          <MemoryToolPopover
            left={popoverPosition.left}
            top={popoverPosition.top}
            filteredOptions={filteredOptions}
            updateOptions={updateOptions}
            isReadSectionOpen={isReadSectionOpen}
            isUpdateSectionOpen={isUpdateSectionOpen}
            onToggleRead={() => setIsReadSectionOpen((current) => !current)}
            onToggleUpdate={() => setIsUpdateSectionOpen((current) => !current)}
            onRead={insertMemoryVariable}
            onUpdate={selectUpdateVariable}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          updateMention(event.target.value, event.target.selectionStart);
        }}
        onKeyUp={(event) => updateMention(event.currentTarget.value, event.currentTarget.selectionStart)}
        onClick={(event) => updateMention(event.currentTarget.value, event.currentTarget.selectionStart)}
        onBlur={onBlur}
        rows={rows}
        className="w-full resize-none bg-transparent text-[15px] font-semibold leading-[1.65] text-gray-800 outline-none placeholder:text-gray-300"
        placeholder={placeholder}
      />
      {mention && (
        <div
          className="absolute z-40 mt-2 w-[360px] overflow-hidden rounded-[16px] border border-gray-200 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.14)]"
          style={{
            left: popoverPosition.left,
            top: popoverPosition.top,
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  insertMemoryVariable(option);
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-blue-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-extrabold text-gray-900">@{option.label}</span>
                  <span className="block truncate text-[11px] font-bold text-gray-400">{option.source}</span>
                </span>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">
                  memory
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-[12px] font-bold text-gray-400">사용 가능한 memory 변수가 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}
