import { Bot, GitBranch, ListOrdered, Settings2, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TaskEdge, TaskNode, TaskNodeUpdateInput } from "../types";
import { NextStepModePicker, PanelInlineInput, PanelInlineSelect, PanelSection } from "./common";
import { MemoryAwareTextArea } from "./MemoryAwareTextArea";
import {
  buildNodeConfig,
  collectMemoryVariableOptions,
  formatNodePrefix,
  getNodeEditorSectionTitle,
  getNodePrimaryPlaceholder,
  getNodeSecondaryLabel,
  getNodeSecondaryPlaceholder,
  getTaskNodeDefinition,
  isFallbackTaskEdge,
  needsSecondaryNodeValue,
  type NextStepMode,
  normalizeNodeKey,
  normalizeTaskNodeType,
  readConfigString,
  readNextStepMode,
  readNodeConfigValues,
} from "./nodeHelpers";

export function TaskNodeInspector({
  node,
  nodes,
  edges,
  isMutating,
  onClose,
  onUpdate,
  onDelete,
  onUpsertEdge,
  onClearEdges,
  registerSave,
}: {
  node: TaskNode;
  nodes: TaskNode[];
  edges: TaskEdge[];
  isMutating: boolean;
  onClose: () => void;
  onUpdate: (nodeId: string, input: TaskNodeUpdateInput) => Promise<void>;
  onDelete: (nodeId: string) => Promise<void>;
  onUpsertEdge: (
    flowId: string,
    sourceNodeKey: string,
    targetNodeKey: string,
    options?: { isFailureEdge?: boolean; conditionConfig?: Record<string, unknown>; clearFailureEdges?: boolean },
  ) => Promise<void>;
  onClearEdges: (
    flowId: string,
    sourceNodeKey: string,
    options?: { failureOnly?: boolean; primaryOnly?: boolean },
  ) => Promise<void>;
  registerSave: (save: (() => Promise<boolean>) | null) => void;
}) {
  const [label, setLabel] = useState(node.label);
  const [nodeKey, setNodeKey] = useState(node.nodeKey);
  const [primaryValue, setPrimaryValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [nextStepMode, setNextStepMode] = useState(readNextStepMode(node.config.next_step_mode));
  const [nextNodeKey, setNextNodeKey] = useState(readConfigString(node.config.next_node_key) ?? "");
  const [branchCondition, setBranchCondition] = useState(readConfigString(node.config.branch_condition) ?? "");
  const [branchNodeKey, setBranchNodeKey] = useState(readConfigString(node.config.branch_node_key) ?? "");
  const [fallbackNodeKey, setFallbackNodeKey] = useState(readConfigString(node.config.fallback_node_key) ?? "");
  const [timeoutSeconds, setTimeoutSeconds] = useState(String(node.timeoutSeconds));
  const [retryLimit, setRetryLimit] = useState(String(node.retryLimit));
  const [error, setError] = useState<string | null>(null);
  const lastDraftSignatureRef = useRef("");
  const nodeType = normalizeTaskNodeType(node.nodeType);
  const definition = getTaskNodeDefinition(nodeType);
  const Icon = definition.icon;
  const nodePrefix = formatNodePrefix(nodes.findIndex((item) => item.id === node.id));
  const outgoingEdges = edges.filter((edge) => edge.sourceNodeKey === node.nodeKey);
  const primaryOutgoingEdge = outgoingEdges.find((edge) => !isFallbackTaskEdge(edge)) ?? outgoingEdges[0];
  const failureOutgoingEdge = outgoingEdges.find((edge) => isFallbackTaskEdge(edge));
  const memoryOptions = collectMemoryVariableOptions(
    nodes,
    secondaryValue.trim()
      ? { key: normalizeNodeKey(secondaryValue), label: normalizeNodeKey(secondaryValue), source: `${label || definition.label} 저장값` }
      : null,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const values = readNodeConfigValues(node);
      setLabel(node.label);
      setNodeKey(node.nodeKey);
      setPrimaryValue(values.primary);
      setSecondaryValue(values.secondary);
      const configuredNextStepMode = readNextStepMode(node.config.next_step_mode);
      setNextStepMode(configuredNextStepMode === "single" && outgoingEdges.length > 1 ? "branch" : configuredNextStepMode);
      setNextNodeKey(primaryOutgoingEdge?.targetNodeKey ?? readConfigString(node.config.next_node_key) ?? "");
      setBranchCondition(readConfigString(node.config.branch_condition) ?? "");
      setBranchNodeKey(primaryOutgoingEdge?.targetNodeKey ?? readConfigString(node.config.branch_node_key) ?? "");
      setFallbackNodeKey(failureOutgoingEdge?.targetNodeKey ?? readConfigString(node.config.fallback_node_key) ?? "");
      setTimeoutSeconds(String(node.timeoutSeconds));
      setRetryLimit(String(node.retryLimit));
      setError(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [node.id]);

  const buildNodeUpdateInput = ({
    mode = nextStepMode,
    nextKey = nextNodeKey,
    branchKey = branchNodeKey,
    fallbackKey = fallbackNodeKey,
    condition = branchCondition,
  }: {
    mode?: NextStepMode;
    nextKey?: string;
    branchKey?: string;
    fallbackKey?: string;
    condition?: string;
  } = {}): TaskNodeUpdateInput | null => {
    const normalizedKey = normalizeNodeKey(nodeKey || label || nodeType);
    if (!label.trim()) {
      setError("노드 이름을 입력해 주세요.");
      return null;
    }

    const config = buildNodeConfig({ nodeType, message: primaryValue, variableName: secondaryValue });
    if (!config) {
      setError("노드 설정 값을 입력해 주세요.");
      return null;
    }

    return {
      node_key: normalizedKey,
      node_type: nodeType,
      label: label.trim(),
      config: {
        ...config,
        next_step_mode: mode,
        ...(mode === "single" && nextKey ? { next_node_key: nextKey } : {}),
        ...(mode === "branch"
          ? {
              branch_condition: condition.trim(),
              ...(branchKey ? { branch_node_key: branchKey } : {}),
              ...(fallbackKey ? { fallback_node_key: fallbackKey } : {}),
            }
          : {}),
      },
      timeout_seconds: Math.max(1, Number(timeoutSeconds) || node.timeoutSeconds || 10),
      retry_limit: Math.max(0, Number(retryLimit) || 0),
    };
  };

  const persistNodeState = async (overrides?: Parameters<typeof buildNodeUpdateInput>[0]) => {
    const input = buildNodeUpdateInput(overrides);
    if (!input) return false;
    setError(null);
    await onUpdate(node.id, input);
    return true;
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const input = buildNodeUpdateInput();
      if (!input) return;
      const signature = JSON.stringify(input);
      if (signature === lastDraftSignatureRef.current) return;
      lastDraftSignatureRef.current = signature;
      void onUpdate(node.id, input);
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [
    label,
    nodeKey,
    primaryValue,
    secondaryValue,
    nextStepMode,
    nextNodeKey,
    branchCondition,
    branchNodeKey,
    fallbackNodeKey,
    timeoutSeconds,
    retryLimit,
  ]);

  const handleSingleNextNodeChange = async (targetNodeKey: string) => {
    setNextNodeKey(targetNodeKey);
    try {
      if (targetNodeKey) {
        await onUpsertEdge(node.flowId, node.nodeKey, targetNodeKey, { clearFailureEdges: true });
      } else {
        await onClearEdges(node.flowId, node.nodeKey);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "다음 단계 연결 실패");
    }
  };

  const handleNextStepModeChange = async (mode: NextStepMode) => {
    setNextStepMode(mode);
    try {
      if (mode === "end") {
        setNextNodeKey("");
        setBranchNodeKey("");
        setFallbackNodeKey("");
        await onClearEdges(node.flowId, node.nodeKey);
      }
      if (mode === "single") {
        setBranchNodeKey("");
        setFallbackNodeKey("");
        await onClearEdges(node.flowId, node.nodeKey, { failureOnly: true });
      }
      if (mode === "branch") {
        setNextNodeKey("");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "연결 정리 실패");
    }
  };

  const handleBranchNodeChange = async (targetNodeKey: string) => {
    setBranchNodeKey(targetNodeKey);
    try {
      if (targetNodeKey) {
        await onUpsertEdge(node.flowId, node.nodeKey, targetNodeKey, {
          conditionConfig: branchCondition ? { expression: branchCondition } : {},
        });
      } else {
        await onClearEdges(node.flowId, node.nodeKey, { primaryOnly: true });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "분기 연결 실패");
    }
  };

  const handleFallbackNodeChange = async (targetNodeKey: string) => {
    setFallbackNodeKey(targetNodeKey);
    try {
      if (targetNodeKey) {
        await onUpsertEdge(node.flowId, node.nodeKey, targetNodeKey, {
          isFailureEdge: true,
          conditionConfig: branchCondition ? { expression: branchCondition, fallback: true } : { fallback: true },
        });
      } else {
        await onClearEdges(node.flowId, node.nodeKey, { failureOnly: true });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Fallback 연결 실패");
    }
  };

  const handleSave = async () => {
    setError(null);
    if (nextStepMode === "branch") {
      if (branchNodeKey) {
        await onUpsertEdge(node.flowId, node.nodeKey, branchNodeKey, {
          conditionConfig: branchCondition ? { expression: branchCondition } : {},
        });
      }
      if (fallbackNodeKey) {
        await onUpsertEdge(node.flowId, node.nodeKey, fallbackNodeKey, {
          isFailureEdge: true,
          conditionConfig: branchCondition ? { expression: branchCondition, fallback: true } : { fallback: true },
        });
      }
    }
    return persistNodeState();
  };

  useEffect(() => {
    registerSave(handleSave);
    return () => registerSave(null);
  });

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-[430px] flex-col border-l border-gray-200 bg-white shadow-[-18px_0_44px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[22px] font-extrabold text-gray-900">{nodePrefix}</span>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="min-w-0 flex-1 truncate bg-transparent text-[22px] font-extrabold text-gray-900 outline-none"
                placeholder="노드 이름"
              />
            </div>
            <div className="mt-1 flex items-center gap-2 text-[12px] font-bold text-gray-400">
              <span>{definition.label}</span>
              <span>·</span>
              <input
                value={nodeKey}
                onChange={(event) => setNodeKey(event.target.value)}
                className="min-w-0 flex-1 bg-transparent outline-none"
                placeholder="node_key"
              />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-gray-400">
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            disabled={isMutating}
            className="rounded-full p-1.5 hover:bg-gray-100 disabled:opacity-40"
            aria-label="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PanelSection
          icon={nodeType === "instruction" ? <ListOrdered className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
          title={getNodeEditorSectionTitle(nodeType)}
          defaultOpen
        >
          <MemoryAwareTextArea
            value={primaryValue}
            onChange={setPrimaryValue}
            placeholder={getNodePrimaryPlaceholder(nodeType)}
            rows={nodeType === "message" ? 7 : 8}
            memoryOptions={memoryOptions}
            toolSearchMode={nodeType === "instruction"}
          />
          {needsSecondaryNodeValue(nodeType) && (
            <div className="mt-4">
              <PanelInlineInput
                label={getNodeSecondaryLabel(nodeType)}
                value={secondaryValue}
                onChange={setSecondaryValue}
                placeholder={getNodeSecondaryPlaceholder(nodeType)}
              />
            </div>
          )}
        </PanelSection>

        <PanelSection icon={<Settings2 className="h-4 w-4" />} title="고급 설정">
          <div className="grid grid-cols-2 gap-3">
            <PanelInlineInput label="Timeout 초" value={timeoutSeconds} onChange={setTimeoutSeconds} />
            <PanelInlineInput label="Retry" value={retryLimit} onChange={setRetryLimit} />
          </div>
          <details className="mt-4 rounded-[14px] bg-[#f7f7f7] p-3">
            <summary className="cursor-pointer text-[12px] font-extrabold text-gray-500">Raw Config</summary>
            <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-[11px] font-semibold leading-relaxed text-gray-500">
              {JSON.stringify(node.config, null, 2)}
            </pre>
          </details>
        </PanelSection>

        <PanelSection icon={<Bot className="h-4 w-4" />} title="동작할 서비스">
          <div className="space-y-2">
            {["채팅", "통화"].map((service) => (
              <label key={service} className="flex items-center justify-between rounded-[16px] bg-[#f7f7f7] px-4 py-3">
                <span className="text-[13px] font-bold text-gray-700">{service}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">ON</span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection icon={<GitBranch className="h-4 w-4" />} title="다음 단계로 이동">
          <NextStepModePicker value={nextStepMode} onChange={(value) => void handleNextStepModeChange(value)} />
          {nextStepMode === "single" && (
            <div className="mt-3">
              <PanelInlineSelect
                label="이동할 노드"
                value={nextNodeKey}
                onChange={(value) => void handleSingleNextNodeChange(value)}
                placeholder="노드 선택"
                options={nodes
                  .filter((item) => item.id !== node.id)
                  .map((item) => ({ value: item.nodeKey, label: item.label || item.nodeKey }))}
              />
            </div>
          )}
          {nextStepMode === "branch" && (
            <div className="mt-3 space-y-3">
              <div className="rounded-[16px] border border-blue-100 bg-blue-50/50 p-3">
                <div className="mb-2 text-[12px] font-extrabold text-blue-600">IF 조건</div>
                <PanelInlineInput
                  label="조건"
                  value={branchCondition}
                  onChange={setBranchCondition}
                  placeholder='예: memory.is_available == true'
                />
              </div>
              <PanelInlineSelect
                label="조건이 맞으면 이동"
                value={branchNodeKey}
                onChange={(value) => void handleBranchNodeChange(value)}
                placeholder="노드 선택"
                options={nodes
                  .filter((item) => item.id !== node.id)
                  .map((item) => ({ value: item.nodeKey, label: item.label || item.nodeKey }))}
              />
              <PanelInlineSelect
                label="일치하지 않으면 이동"
                value={fallbackNodeKey}
                onChange={(value) => void handleFallbackNodeChange(value)}
                placeholder="노드 선택"
                options={nodes
                  .filter((item) => item.id !== node.id)
                  .map((item) => ({ value: item.nodeKey, label: item.label || item.nodeKey }))}
              />
            </div>
          )}
        </PanelSection>
        {error && <p className="text-[12px] font-bold text-red-500">{error}</p>}
      </div>

    </aside>
  );
}
