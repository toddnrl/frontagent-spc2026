import type { UIEvent } from "react";
import { StatusBadge } from "../../ui";
import type { AgentRun } from "../types";
import { formatLogTimestamp, logsChannelLabel, logsStatusLabel } from "./logsUtils";

export function LogsRunList({
  runs,
  visibleCount,
  isLoading,
  statusFilter,
  selectedRunId,
  totalCount,
  successCount,
  errorCount,
  onSelectRun,
  onStatusFilterChange,
  onLoadMore,
}: {
  runs: AgentRun[];
  visibleCount: number;
  isLoading: boolean;
  statusFilter: AgentRun["status"] | "전체";
  selectedRunId: string | null;
  totalCount: number;
  successCount: number;
  errorCount: number;
  onSelectRun: (id: string) => void;
  onStatusFilterChange: (status: AgentRun["status"] | "전체") => void;
  onLoadMore: () => void;
}) {
  const visibleRuns = runs.slice(0, visibleCount);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 120) {
      onLoadMore();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="grid flex-1 grid-cols-3 gap-1 rounded-full bg-[#f4f4f4] p-1 text-[12px] font-bold">
          {(["전체", "success", "error"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`rounded-full px-3 py-1.5 ${
                statusFilter === status ? "bg-white text-gray-950 shadow-sm" : "text-gray-400"
              }`}
            >
              {status === "전체" ? `전체 ${totalCount}` : status === "success" ? `성공 ${successCount}` : `실패 ${errorCount}`}
            </button>
          ))}
        </div>
        <span className="ml-3 shrink-0 text-[12px] font-bold text-gray-400">
          {visibleRuns.length}/{runs.length}건
        </span>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="h-16 animate-pulse rounded-[14px] bg-[#f7f7f7]" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-[14px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold text-gray-400">
          표시할 실행 기록이 없습니다.
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" onScroll={handleScroll}>
          {visibleRuns.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className={`w-full rounded-[14px] p-3 text-left transition-colors ${
                run.id === selectedRunId ? "bg-[#eef3ff]" : "bg-[#f7f7f7] hover:bg-[#f0f0f0]"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[14px] font-bold">{run.intent ?? "분류 없음"}</span>
                <StatusBadge status={logsStatusLabel[run.status]} />
              </div>
              <p className="truncate text-[13px] font-semibold text-gray-500">{run.userMessage}</p>
              <div className="mt-1.5 text-[11px] font-bold text-gray-400">
                {logsChannelLabel[run.channel ?? ""] ?? run.channel ?? "채널 미확인"} · {formatLogTimestamp(run.createdAt)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
