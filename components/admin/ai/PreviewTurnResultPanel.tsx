"use client";

import { useState } from "react";
import type { PreviewChatResult } from "./previewChatTypes";
import { formatPreviewValue, summarizeTaskVariables } from "./previewChatTypes";

function MetaRow({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-2 rounded-[7px] bg-white/80 px-2 py-1">
      <span className="shrink-0 text-[9px] font-bold text-gray-400">{label}</span>
      <span className="min-w-0 break-words text-right text-[10px] font-semibold leading-relaxed text-gray-600">
        {formatPreviewValue(value)}
      </span>
    </div>
  );
}

export function TurnResultDetails({
  result,
  showRawDefault = false,
}: {
  result: PreviewChatResult;
  showRawDefault?: boolean;
}) {
  const [showRaw, setShowRaw] = useState(showRawDefault);
  const taskRows = summarizeTaskVariables(result.task_result?.variables);
  const knowledgeCount = result.used_knowledge.length;
  const contextCount = result.knowledge_context.length;

  return (
    <div className="space-y-2">
      <section>
        <p className="mb-1 text-[10px] font-extrabold text-gray-700">라우팅</p>
        <div className="space-y-1">
          <MetaRow label="intent" value={result.intent} />
          <MetaRow label="next_action" value={result.next_action} />
          <MetaRow label="task_type" value={result.task_type} />
          <MetaRow label="use_knowledge" value={result.use_knowledge} />
          <MetaRow label="end_session" value={result.end_session} />
          <MetaRow label="conversation_id" value={result.conversation_id} />
          <MetaRow label="decision_reason" value={result.decision_reason} />
        </div>
      </section>

      {(result.task_status || result.task_result) && (
        <section>
          <p className="mb-1 text-[10px] font-extrabold text-gray-700">태스크</p>
          <div className="space-y-1">
            <MetaRow label="task_status" value={result.task_status} />
            <MetaRow label="current_node" value={result.task_result?.current_node_key} />
            <MetaRow label="pending_prompt" value={result.task_result?.message} />
          </div>
        </section>
      )}

      {taskRows.length > 0 && (
        <section>
          <p className="mb-1 text-[10px] font-extrabold text-gray-700">Task Memory</p>
          <div className="space-y-1">
            {taskRows.map((row) => (
              <MetaRow key={row.key} label={row.label} value={row.value} />
            ))}
          </div>
        </section>
      )}

      {(knowledgeCount > 0 || contextCount > 0) && (
        <section>
          <p className="mb-1 text-[10px] font-extrabold text-gray-700">
            지식 · used {knowledgeCount} / context {contextCount}
          </p>
          <div className="space-y-1">
            {result.used_knowledge.slice(0, 5).map((item, index) => (
              <MetaRow
                key={`used-${index}`}
                label={String(item.source_title ?? item.chunk_id ?? `chunk-${index + 1}`)}
                value={item.similarity !== undefined ? `${(Number(item.similarity) * 100).toFixed(1)}%` : "-"}
              />
            ))}
          </div>
        </section>
      )}

      {result.applied_rules.length > 0 && (
        <section>
          <p className="mb-1 text-[10px] font-extrabold text-gray-700">규칙 {result.applied_rules.length}개</p>
          <div className="space-y-1">
            {result.applied_rules.slice(0, 8).map((rule, index) => (
              <MetaRow key={`rule-${index}`} label={`rule-${index + 1}`} value={rule} />
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setShowRaw((value) => !value)}
        className="text-[10px] font-bold text-gray-400 underline-offset-2 hover:underline"
      >
        {showRaw ? "원본 JSON 숨기기" : "원본 JSON 보기"}
      </button>
      {showRaw && (
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-[8px] bg-white px-2 py-1.5 text-[10px] font-semibold leading-relaxed text-gray-500">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
