"use client";

import { GitBranch, Settings2, X, Zap } from "lucide-react";
import type { TaskNode } from "../types";
import { PanelInlineSelect, PanelLargeTextArea, PanelSection } from "./common";
import { defaultTriggerDescription, getTaskStartNode } from "./nodeHelpers";

export function TaskFlowInspector({
  nodes,
  name,
  triggerDescription,
  onNameChange,
  onTriggerDescriptionChange,
  onClose,
}: {
  nodes: TaskNode[];
  name: string;
  triggerDescription: string;
  onNameChange: (value: string) => void;
  onTriggerDescriptionChange: (value: string) => void;
  onClose?: () => void;
}) {
  const firstNode = getTaskStartNode(nodes);

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-[430px] flex-col border-l border-gray-200 bg-white shadow-[-18px_0_44px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600">
            <Zap className="h-5 w-5 fill-current" />
          </span>
          <div className="min-w-0">
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="w-full truncate bg-transparent text-[22px] font-extrabold text-gray-900 outline-none"
              placeholder="태스크 이름"
            />
          </div>
        </div>
        {onClose && (
          <div className="flex shrink-0 items-center gap-2 text-gray-400">
            <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100" aria-label="닫기">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection icon={<Zap className="h-4 w-4 fill-current" />} title="트리거" defaultOpen>
          <PanelLargeTextArea
            value={triggerDescription}
            onChange={onTriggerDescriptionChange}
            placeholder={defaultTriggerDescription}
            rows={9}
          />
        </PanelSection>

        <PanelSection icon={<Settings2 className="h-4 w-4" />} title="필터링">
          <div className="space-y-3">
            <div>
              <div className="mb-2 text-[11px] font-extrabold text-gray-400">동작할 서비스</div>
              <div className="space-y-2">
            {["채팅", "통화"].map((service) => (
              <label key={service} className="flex items-center justify-between rounded-[16px] bg-[#f7f7f7] px-4 py-3">
                <span className="text-[13px] font-bold text-gray-700">{service}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">ON</span>
              </label>
            ))}
              </div>
            </div>
          </div>
        </PanelSection>

        <PanelSection icon={<GitBranch className="h-4 w-4" />} title="다음 단계로 이동">
          <PanelInlineSelect
            label="이동할 노드"
            value={firstNode?.nodeKey ?? ""}
            onChange={() => {}}
            placeholder="첫 노드 없음"
            options={firstNode ? [{ value: firstNode.nodeKey, label: firstNode.label || firstNode.nodeKey }] : []}
          />
        </PanelSection>
      </div>
    </aside>
  );
}
