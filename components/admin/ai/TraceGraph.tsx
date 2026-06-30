"use client";

import { ChevronDown, CheckCircle2, Clock, GitBranch } from "lucide-react";
import { useState } from "react";

export type TraceStep = {
  id: string;
  title: string;
  status: "done" | "active" | "warning";
  detail: string;
  items?: unknown[];
  startedAt?: number;
  elapsedMs?: number;
};

function formatStepDuration(milliseconds: number) {
  const ms = Math.round(milliseconds);
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatPercent(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `${(number * 100).toFixed(1)}%`;
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(3);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function DetailKeyValue({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-[7px] bg-white/70 px-2 py-1">
      <span className="shrink-0 text-[9px] font-bold text-gray-400">{label}</span>
      <span className="min-w-0 break-words text-right text-[10px] font-semibold leading-relaxed text-gray-600">
        {renderValue(value)}
      </span>
    </div>
  );
}

function TraceItemRow({ item, stepId }: { item: unknown; stepId: string }) {
  if (typeof item === "string") {
    return (
      <p className="rounded-[8px] bg-gray-50 px-2 py-1 text-[10px] font-semibold leading-relaxed text-gray-500">
        {item}
      </p>
    );
  }

  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;

    if (stepId === "connected") {
      return (
        <div className="space-y-1 rounded-[8px] bg-gray-50 px-2 py-1.5">
          <DetailKeyValue label="organization" value={obj.organization_id} />
          <DetailKeyValue label="session" value={obj.session_id} />
        </div>
      );
    }

    if (stepId === "received") {
      return (
        <div className="rounded-[8px] bg-gray-50 px-2 py-1.5">
          <p className="text-[10px] font-semibold leading-relaxed text-gray-600">
            {String(obj.message ?? "")}
          </p>
        </div>
      );
    }

    // knowledge: { query, chunks: [{source_title, similarity, ...}] }
    if (stepId === "knowledge" && "query" in obj) {
      const chunks = Array.isArray(obj.chunks) ? obj.chunks as Record<string, unknown>[] : [];
      return (
        <div className="rounded-[8px] bg-gray-50 px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[10px] font-bold text-gray-700">검색어: {String(obj.query ?? "")}</p>
            <span className="shrink-0 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-gray-400">
              {chunks.length} chunks
            </span>
          </div>
          {chunks.length === 0 ? (
            <p className="mt-1 text-[10px] font-semibold text-amber-500">검색된 지식 chunk가 없습니다.</p>
          ) : (
            <div className="mt-1 space-y-1">
              {chunks.map((chunk, i) => {
                const similarity = formatPercent(chunk.similarity);
                return (
                  <div key={i} className="rounded-[8px] bg-white/80 px-2 py-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 break-words text-[10px] font-extrabold text-gray-700">
                        {String(chunk.source_title ?? chunk.title ?? "제목 없음")}
                      </p>
                      {similarity && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-500">
                          {similarity}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {"source_id" in chunk && <DetailKeyValue label="source" value={chunk.source_id} />}
                      {"chunk_id" in chunk && <DetailKeyValue label="chunk" value={chunk.chunk_id} />}
                      {"id" in chunk && <DetailKeyValue label="id" value={chunk.id} />}
                      {"chunk_index" in chunk && <DetailKeyValue label="index" value={chunk.chunk_index} />}
                    </div>
                    {"content" in chunk && (
                      <p className="mt-1 line-clamp-4 whitespace-pre-line rounded-[7px] bg-gray-50 px-2 py-1 text-[10px] font-semibold leading-relaxed text-gray-500">
                        {String(chunk.content ?? "")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (stepId === "final") {
      const appliedRules = Array.isArray(obj.applied_rules) ? obj.applied_rules : [];
      const usedKnowledge = Array.isArray(obj.used_knowledge) ? obj.used_knowledge as Record<string, unknown>[] : [];
      return (
        <div className="space-y-1 rounded-[8px] bg-gray-50 px-2 py-1.5">
          <div className="grid grid-cols-2 gap-1">
            <DetailKeyValue label="intent" value={obj.intent} />
            <DetailKeyValue label="next" value={obj.next_action} />
            <DetailKeyValue label="task" value={obj.task_type} />
            <DetailKeyValue label="knowledge" value={obj.use_knowledge} />
            <DetailKeyValue label="conversation" value={obj.conversation_id} />
            <DetailKeyValue label="response" value={`${renderValue(obj.response_length)}자`} />
          </div>
          {Boolean(obj.decision_reason) && (
            <p className="rounded-[8px] bg-white/80 px-2 py-1 text-[10px] font-semibold leading-relaxed text-gray-600">
              판단 근거: {String(obj.decision_reason)}
            </p>
          )}
          <div className="rounded-[8px] bg-white/80 px-2 py-1.5">
            <p className="text-[10px] font-extrabold text-gray-700">사용 지식 {usedKnowledge.length}개</p>
            {usedKnowledge.length === 0 ? (
              <p className="mt-0.5 text-[10px] font-semibold text-gray-400">최종 응답에서 참조된 지식이 없습니다.</p>
            ) : (
              usedKnowledge.map((knowledge, index) => (
                <div key={index} className="mt-1 rounded-[7px] bg-gray-50 px-2 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[10px] font-bold text-gray-600">
                      {String(knowledge.source_title ?? knowledge.source_id ?? "지식")}
                    </span>
                    {knowledge.similarity !== undefined && (
                      <span className="shrink-0 text-[9px] font-bold text-blue-500">
                        {formatPercent(knowledge.similarity)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    <DetailKeyValue label="source" value={knowledge.source_id} />
                    <DetailKeyValue label="chunk" value={knowledge.chunk_id} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="rounded-[8px] bg-white/80 px-2 py-1.5">
            <p className="text-[10px] font-extrabold text-gray-700">적용 규칙 {appliedRules.length}개</p>
            {appliedRules.length === 0 ? (
              <p className="mt-0.5 text-[10px] font-semibold text-gray-400">최종 응답에서 적용된 규칙이 없습니다.</p>
            ) : (
              <div className="mt-1 space-y-1">
                {appliedRules.map((rule, index) => (
                  <p key={index} className="rounded-[7px] bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-500">
                    {renderValue(rule)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if ("used_knowledge" in obj && Array.isArray(obj.used_knowledge)) {
      return (
        <div className="rounded-[8px] bg-gray-50 px-2 py-1.5">
          <p className="text-[10px] font-bold text-gray-700">사용 지식</p>
          {(obj.used_knowledge as unknown[]).map((knowledge, index) => (
            <div key={index}>
              <TraceItemRow item={knowledge} stepId="final" />
            </div>
          ))}
        </div>
      );
    }

    if ("source_title" in obj || "source_id" in obj || "chunk_id" in obj) {
      const similarity = formatPercent(obj.similarity);
      return (
        <div className="rounded-[8px] bg-gray-50 px-2 py-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 break-words text-[10px] font-bold text-gray-700">
              {String(obj.source_title ?? obj.source_id ?? "지식")}
            </p>
            {similarity && <span className="shrink-0 text-[9px] font-bold text-blue-500">{similarity}</span>}
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            <DetailKeyValue label="source" value={obj.source_id} />
            <DetailKeyValue label="chunk" value={obj.chunk_id ?? obj.id} />
          </div>
        </div>
      );
    }

    if ((stepId === "rule" || stepId === "rules") && "name" in obj) {
      return (
        <div className="rounded-[8px] bg-gray-50 px-2 py-1.5">
          <p className="text-[10px] font-bold text-gray-700">{String(obj.name ?? "")}</p>
          {Boolean(obj.instruction) && (
            <p className="mt-0.5 text-[10px] font-semibold text-gray-400">
              {String(obj.instruction)}
            </p>
          )}
        </div>
      );
    }

    if (Object.keys(obj).length <= 8) {
      return (
        <div className="space-y-1 rounded-[8px] bg-gray-50 px-2 py-1.5">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key}>
              <DetailKeyValue label={key} value={value} />
            </div>
          ))}
        </div>
      );
    }

    // fallback: readable JSON
    return (
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-[8px] bg-gray-50 px-2 py-1.5 text-[10px] font-semibold leading-relaxed text-gray-500">
        {JSON.stringify(item, null, 2)}
      </pre>
    );
  }

  return null;
}

export function TraceGraph({
  steps,
  intent,
  defaultOpen = true,
}: {
  steps: TraceStep[];
  intent?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (steps.length === 0) return null;

  const completedCount = steps.filter((s) => s.status === "done").length;
  const warningCount = steps.filter((s) => s.status === "warning").length;
  const activeStep = steps.find((s) => s.status === "active");

  const allDone = steps.length > 0 && steps.every((s) => s.status === "done" || s.status === "warning");
  const turnElapsedMs = steps.find(
    (step) => (step.id === "voice_answer" || step.id === "voice_turn") && step.elapsedMs,
  )?.elapsedMs;
  const summedElapsedMs = steps.reduce((sum, step) => sum + Math.round(step.elapsedMs ?? 0), 0);
  const totalMs = allDone
    ? Math.round(turnElapsedMs ?? (summedElapsedMs > 0 ? summedElapsedMs : 0)) || undefined
    : undefined;
  const totalLabel = totalMs !== undefined ? formatStepDuration(totalMs) : undefined;

  return (
    <div className="my-2 flex flex-col items-center">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex max-w-[92%] items-center gap-2 rounded-full bg-gray-200/70 px-3 py-1.5 text-[11px] font-extrabold text-gray-500 transition-colors hover:bg-gray-200"
      >
        <GitBranch className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {activeStep
            ? `AI 처리중 · ${activeStep.title}`
            : `AI 처리 로그 · ${completedCount}단계${warningCount ? ` · 확인 ${warningCount}` : ""}`}
        </span>
        {totalLabel && <span className="shrink-0 text-gray-400">총 {totalLabel}</span>}
        {intent && <span className="shrink-0 text-blue-500">{intent}</span>}
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mx-auto mt-2 w-[92%] rounded-[16px] bg-gray-100/80 px-3 py-2.5">
          <div className="relative">
            {steps.map((step, index) => {
              const isExpanded = expandedIds.has(step.id);
              const isLast = index === steps.length - 1;
              return (
                <div key={step.id} className="relative flex gap-2 pb-2.5 last:pb-0">
                  <div className="relative flex w-4 shrink-0 justify-center">
                    {!isLast && (
                      <div className={`absolute left-1/2 top-4 h-[calc(100%-8px)] w-px -translate-x-1/2 ${
                        step.status === "warning" ? "bg-amber-200"
                        : step.status === "active" ? "bg-purple-200"
                        : "bg-emerald-200"
                      }`} />
                    )}
                    <div className={`relative z-10 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ${
                      step.status === "warning" ? "text-amber-500"
                      : step.status === "active" ? "text-purple-500"
                      : "text-emerald-500"
                    }`}>
                      {step.status === "active"
                        ? <Clock className="h-2.5 w-2.5" />
                        : <CheckCircle2 className="h-2.5 w-2.5" />}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggle(step.id)}
                      className="flex w-full items-start justify-between gap-2 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[11px] font-extrabold text-gray-700">{step.title}</span>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            step.status === "active" ? "bg-purple-50 text-purple-600"
                            : step.status === "warning" ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {step.status === "active" ? "진행중" : step.status === "warning" ? "확인 필요" : "완료"}
                          </span>
                          {step.elapsedMs !== undefined && (
                            <span className="shrink-0 text-[9px] font-semibold text-gray-400">
                              {formatStepDuration(step.elapsedMs)}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] font-semibold text-gray-400">{step.detail}</p>
                      </div>
                      <ChevronDown className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className="mt-1.5 rounded-[10px] bg-white/70 px-2 py-1.5">
                        <p className="text-[10px] font-semibold leading-relaxed text-gray-500">{step.detail}</p>
                        {step.items && step.items.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {step.items.map((item, i) => (
                              <div key={i}><TraceItemRow item={item} stepId={step.id} /></div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
