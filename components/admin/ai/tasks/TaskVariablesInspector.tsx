import { Database, Eye, Pencil, X } from "lucide-react";
import type { TaskNode } from "../types";
import { PanelSection } from "./common";
import {
  collectMemoryVariableOptions,
  extractPromptdataVariables,
  getTaskNodeDefinition,
  normalizeTaskNodeType,
  readConfigString,
} from "./nodeHelpers";

type VariableUsage = {
  key: string;
  mode: "read" | "update";
  nodeLabel: string;
};

const MEMORY_PATTERN = /{{\s*memory\.([a-zA-Z0-9_.-]+)\s*}}/g;

function collectVariableUsages(nodes: TaskNode[]) {
  const usages: VariableUsage[] = [];
  const seen = new Set<string>();

  const pushUsage = (usage: VariableUsage) => {
    const key = `${usage.key}:${usage.mode}:${usage.nodeLabel}`;
    if (seen.has(key)) return;
    seen.add(key);
    usages.push(usage);
  };

  nodes.forEach((node) => {
    const nodeType = normalizeTaskNodeType(node.nodeType);
    const nodeLabel = node.label || getTaskNodeDefinition(nodeType).label;

    if (nodeType === "instruction") {
      const instruction = readConfigString(node.config.instruction) ?? "";
      const variables = extractPromptdataVariables(instruction);
      variables.read.forEach((key) => pushUsage({ key, mode: "read", nodeLabel }));
      variables.update.forEach((key) => pushUsage({ key, mode: "update", nodeLabel }));
      return;
    }

    const configText = JSON.stringify(node.config ?? {});
    for (const match of configText.matchAll(MEMORY_PATTERN)) {
      pushUsage({ key: match[1], mode: "read", nodeLabel });
    }

    if (nodeType === "function") {
      const key = readConfigString(node.config.save_as);
      if (key) pushUsage({ key, mode: "update", nodeLabel });
    }
  });

  return usages;
}

export function TaskVariablesInspector({
  nodes,
  onClose,
}: {
  nodes: TaskNode[];
  onClose: () => void;
}) {
  const variables = collectMemoryVariableOptions(nodes);
  const usages = collectVariableUsages(nodes);
  const usageByKey = usages.reduce<Record<string, VariableUsage[]>>((acc, usage) => {
    acc[usage.key] = [...(acc[usage.key] ?? []), usage];
    return acc;
  }, {});

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-[430px] flex-col border-l border-gray-200 bg-white shadow-[-18px_0_44px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600">
            <Database className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[22px] font-extrabold text-gray-900">변수</div>
            <div className="mt-1 text-[12px] font-bold text-gray-400">태스크 메모리에서 읽고 저장하는 값</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100" aria-label="닫기">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection icon={<Database className="h-4 w-4" />} title="저장되는 변수" defaultOpen>
          {variables.length === 0 ? (
            <div className="rounded-[16px] bg-[#f7f7f7] px-4 py-5 text-center text-[13px] font-bold text-gray-400">
              아직 저장되는 변수가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {variables.map((variable) => (
                <div key={variable.key} className="rounded-[16px] border border-gray-100 bg-[#f7f7f7] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-extrabold text-gray-900">{variable.label}</div>
                      <div className="mt-0.5 truncate text-[11px] font-bold text-gray-400">{variable.source}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">
                      memory
                    </span>
                  </div>

                  {(usageByKey[variable.key] ?? []).length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {(usageByKey[variable.key] ?? []).map((usage) => (
                        <div
                          key={`${usage.mode}-${usage.nodeLabel}`}
                          className="flex items-center gap-2 text-[12px] font-bold text-gray-500"
                        >
                          {usage.mode === "update" ? (
                            <Pencil className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-gray-400" />
                          )}
                          <span>{usage.mode === "update" ? "업데이트" : "읽기"}</span>
                          <span className="text-gray-300">·</span>
                          <span className="truncate">{usage.nodeLabel}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </PanelSection>

        <PanelSection icon={<Eye className="h-4 w-4" />} title="사용 중인 변수">
          {usages.length === 0 ? (
            <div className="rounded-[16px] bg-[#f7f7f7] px-4 py-5 text-center text-[13px] font-bold text-gray-400">
              아직 읽거나 업데이트하는 변수가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {usages.map((usage) => (
                <div
                  key={`${usage.key}-${usage.mode}-${usage.nodeLabel}`}
                  className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f7f7f7] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-extrabold text-gray-900">{usage.key}</div>
                    <div className="mt-0.5 truncate text-[11px] font-bold text-gray-400">{usage.nodeLabel}</div>
                  </div>
                  <span
                    className={
                      usage.mode === "update"
                        ? "shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600"
                        : "shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-extrabold text-gray-500"
                    }
                  >
                    {usage.mode === "update" ? "업데이트" : "읽기"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelSection>
      </div>
    </aside>
  );
}
