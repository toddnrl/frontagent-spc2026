import { Sparkles } from "lucide-react";
import type { AgentRun } from "../types";
import { formatLogTimestamp, logsChannelLabel } from "./logsUtils";

export function LogsRunDetail({ selectedRun }: { selectedRun: AgentRun | null }) {
  return (
    <aside className="min-h-0 min-w-0 overflow-y-auto rounded-[20px] bg-white px-5 py-6">
      <div className="mb-7">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f2f2f2]">
          <Sparkles className="h-5 w-5 text-blue-500" />
        </div>
        <h2 className="text-[24px] font-bold">Agent Runs</h2>
        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-500">
          선택한 실행 기록에서 사용한 지식, 규칙, 응답을 확인합니다.
        </p>
      </div>
      {!selectedRun ? (
        <div className="rounded-[14px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold text-gray-400">
          왼쪽에서 실행 기록을 선택하세요.
        </div>
      ) : (
        <div className="space-y-3 text-[13px] font-semibold">
          <div>
            <div className="mb-1 text-[12px] font-bold text-gray-400">사용자 메시지</div>
            <p className="rounded-[12px] bg-[#f7f7f7] p-3 text-gray-700">{selectedRun.userMessage}</p>
          </div>
          <div>
            <div className="mb-1 text-[12px] font-bold text-gray-400">최종 응답</div>
            <p className="rounded-[12px] bg-[#f7f7f7] p-3 text-gray-700">{selectedRun.finalResponse ?? "응답 없음"}</p>
          </div>
          {selectedRun.status === "error" && selectedRun.errorMessage && (
            <div>
              <div className="mb-1 text-[12px] font-bold text-red-500">오류</div>
              <p className="rounded-[12px] bg-red-50 p-3 text-red-600">{selectedRun.errorMessage}</p>
            </div>
          )}
          <div>
            <div className="mb-1 text-[12px] font-bold text-gray-400">적용된 규칙</div>
            {selectedRun.appliedRules.length === 0 ? (
              <p className="text-gray-400">없음</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedRun.appliedRules.map((rule) => (
                  <span key={rule} className="rounded-full bg-[#f7f7f7] px-3 py-1 text-[12px] text-gray-600">
                    {rule}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="mb-1 text-[12px] font-bold text-gray-400">참조한 지식</div>
            {selectedRun.usedKnowledge.length === 0 ? (
              <p className="text-gray-400">없음</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedRun.usedKnowledge.map((item) => (
                  <span key={item} className="rounded-full bg-purple-50 px-3 py-1 text-[12px] text-purple-700">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-[12px] font-bold text-gray-400">
            {logsChannelLabel[selectedRun.channel ?? ""] ?? selectedRun.channel ?? "채널 미확인"} ·{" "}
            {formatLogTimestamp(selectedRun.createdAt)}
          </div>
        </div>
      )}
    </aside>
  );
}
