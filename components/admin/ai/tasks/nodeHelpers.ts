import { MessageCircle, Sparkles, Zap } from "lucide-react";
import type { TaskEdge, TaskNode, TaskNodeCreateInput, TaskNodeUpdateInput } from "../types";

export const taskNodeDefinitions = [
  { type: "message", label: "안내 메시지", description: "고객에게 안내 메시지 전송", icon: MessageCircle, category: "customer" },
  { type: "instruction", label: "AI 에이전트", description: "AI가 대화/판단/추출/응답 생성", icon: Sparkles, category: "background" },
  { type: "function", label: "함수 실행", description: "서버 함수/API 실행", icon: Zap, category: "background" },
] as const;

export const taskNodeCategories = [
  { value: "customer", label: "고객 대상" },
  { value: "background", label: "백그라운드" },
] as const;

export type TaskNodeType = (typeof taskNodeDefinitions)[number]["type"];

export const defaultTriggerDescription = `[역할]
당신은 고객 요청을 분류하는 태스크 트리거입니다.

[트리거 조건]
- 고객이 예약을 만들고 싶다고 말할 때
- 날짜/시간/인원 정보를 제공할 때`;

export const nodeTypeIconColor: Record<string, string> = {
  message: "text-blue-600",
  instruction: "text-blue-600",
  function: "text-emerald-600",
  condition: "text-orange-600",
};

export const nodeTypeIconBackground: Record<string, string> = {
  message: "bg-blue-50",
  instruction: "bg-blue-50",
  function: "bg-emerald-50",
  condition: "bg-orange-50",
};

export const nodeIconByType: Record<string, (typeof taskNodeDefinitions)[number]["icon"]> =
  Object.fromEntries(taskNodeDefinitions.map((definition) => [definition.type, definition.icon]));

export const DIAGRAM_NODE_W = 280;
export const DIAGRAM_NODE_H = 150;
export const DIAGRAM_BRANCH_NODE_H = 240;
export const BRANCH_MATCH_PORT_OFFSET = 176;
export const BRANCH_FALLBACK_PORT_OFFSET = 210;
export const DIAGRAM_H_GAP = 150;
export const DIAGRAM_PAD = 80;
export const DIAGRAM_TRIGGER_Y = 280;
export const DIAGRAM_GRID = 40;
export const PORT_SLOT_COUNT = 5;
export const PORT_SLOT_ORDER = [2, 1, 3, 0, 4];

export function describeTaskNode(node: TaskNode) {
  const message = readConfigString(node.config.message) ?? readConfigString(node.config.question);
  if (message) return message;
  const functionName = readConfigString(node.config.function_name);
  if (functionName) return functionName;
  return "";
}

export function readConfigString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function formatNodePrefix(index: number) {
  const safeIndex = Math.max(0, index);
  const alphabetIndex = safeIndex % 26;
  const repeat = Math.floor(safeIndex / 26);
  return `${String.fromCharCode(65 + alphabetIndex)}${repeat > 0 ? repeat + 1 : ""}.`;
}

export function buildUpdateInputFromTaskNode(node: TaskNode): TaskNodeUpdateInput {
  const nodeType = normalizeTaskNodeType(node.nodeType);
  return {
    node_key: node.nodeKey,
    node_type: nodeType,
    label: node.label,
    config: nodeType === "message" && node.nodeType === "end"
      ? normalizeLegacyEndNodeConfig(node)
      : node.config,
    code: node.code,
    position_x: node.positionX,
    position_y: node.positionY,
    timeout_seconds: node.timeoutSeconds,
    retry_limit: node.retryLimit,
  };
}

export function buildCreateInputFromTaskNode(node: TaskNode): TaskNodeCreateInput {
  const nodeType = normalizeTaskNodeType(node.nodeType);
  return {
    node_key: node.nodeKey,
    node_type: nodeType,
    label: node.label,
    config: nodeType === "message" && node.nodeType === "end"
      ? normalizeLegacyEndNodeConfig(node)
      : node.config,
    position_x: node.positionX,
    position_y: node.positionY,
  };
}

export function normalizeLegacyEndNodeConfig(node: TaskNode) {
  return {
    message: readConfigString(node.config.message) ?? node.label ?? "태스크를 종료합니다.",
    next_step_mode: "end",
  };
}

export function normalizeLegacyEndTaskNodes(nodes: TaskNode[]) {
  return nodes.map((node) => {
    if (node.nodeType !== "end") return node;
    return {
      ...node,
      nodeType: "message",
      label: node.label && node.label.toLowerCase() !== "end" ? node.label : "완료 메시지",
      config: normalizeLegacyEndNodeConfig(node),
    };
  });
}

export function getTaskStartNode(nodes: TaskNode[]) {
  return (
    nodes.find((node) => node.nodeKey === "start") ??
    [...nodes].sort((left, right) => {
      if (left.positionX !== right.positionX) return left.positionX - right.positionX;
      return left.positionY - right.positionY;
    })[0] ??
    null
  );
}

export function buildVisualTaskEdges(nodes: TaskNode[], edges: TaskEdge[], flowId: string) {
  const nodeKeys = new Set(nodes.map((node) => node.nodeKey));
  const terminalNodeKeys = new Set(
    nodes
      .filter((node) => readNextStepMode(node.config.next_step_mode) === "end")
      .map((node) => node.nodeKey),
  );
  const result: TaskEdge[] = [];
  const seen = new Set<string>();

  const pushEdge = (edge: TaskEdge) => {
    if (!nodeKeys.has(edge.sourceNodeKey) || !nodeKeys.has(edge.targetNodeKey)) return;
    if (terminalNodeKeys.has(edge.sourceNodeKey)) return;
    const key = `${edge.sourceNodeKey}:${edge.targetNodeKey}:${isFallbackTaskEdge(edge) ? "fallback" : "primary"}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(edge);
  };

  edges.forEach(pushEdge);

  nodes.forEach((node) => {
    const mode = readNextStepMode(node.config.next_step_mode);
    const nextNodeKey = readConfigString(node.config.next_node_key);
    const branchNodeKey = readConfigString(node.config.branch_node_key);
    const fallbackNodeKey = readConfigString(node.config.fallback_node_key);
    const branchCondition = readConfigString(node.config.branch_condition);

    if (mode === "single" && nextNodeKey) {
      pushEdge({
        id: `config-edge-${node.nodeKey}-single-${nextNodeKey}`,
        flowId,
        sourceNodeKey: node.nodeKey,
        targetNodeKey: nextNodeKey,
        edgeType: "single",
        conditionType: "always",
        conditionConfig: {},
        isFailureEdge: false,
        priority: 100,
      });
    }

    if (mode === "branch") {
      if (branchNodeKey) {
        pushEdge({
          id: `config-edge-${node.nodeKey}-branch-${branchNodeKey}`,
          flowId,
          sourceNodeKey: node.nodeKey,
          targetNodeKey: branchNodeKey,
          edgeType: "branch",
          conditionType: "if",
          conditionConfig: branchCondition ? { expression: branchCondition } : {},
          isFailureEdge: false,
          priority: 100,
        });
      }
      if (fallbackNodeKey) {
        pushEdge({
          id: `config-edge-${node.nodeKey}-fallback-${fallbackNodeKey}`,
          flowId,
          sourceNodeKey: node.nodeKey,
          targetNodeKey: fallbackNodeKey,
          edgeType: "fallback",
          conditionType: "fallback",
          conditionConfig: branchCondition ? { expression: branchCondition, fallback: true } : { fallback: true },
          isFailureEdge: true,
          priority: 200,
        });
      }
    }
  });

  return result;
}

export function buildTaskNodeFromCreateInput(flowId: string, input: TaskNodeCreateInput): TaskNode {
  return {
    id: `draft-node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    flowId,
    nodeKey: input.node_key,
    nodeType: input.node_type,
    label: input.label,
    config: input.config,
    positionX: input.position_x ?? DIAGRAM_PAD,
    positionY: input.position_y ?? DIAGRAM_PAD,
    timeoutSeconds: 10,
    retryLimit: 0,
  };
}

export function isDraftTaskNode(node: TaskNode) {
  return node.id.startsWith("draft-node-");
}

export function applyTaskNodeUpdateInputToNode(node: TaskNode, input: TaskNodeUpdateInput): TaskNode {
  return {
    ...node,
    nodeKey: input.node_key ?? node.nodeKey,
    nodeType: input.node_type ?? node.nodeType,
    label: input.label ?? node.label,
    config: input.config ?? node.config,
    code: input.code ?? node.code,
    positionX: input.position_x ?? node.positionX,
    positionY: input.position_y ?? node.positionY,
    timeoutSeconds: input.timeout_seconds ?? node.timeoutSeconds,
    retryLimit: input.retry_limit ?? node.retryLimit,
  };
}

export function buildDefaultNodeInput({
  nodeType,
  index,
  anchorNode,
}: {
  nodeType: TaskNodeType;
  index: number;
  anchorNode: TaskNode | null;
}): TaskNodeCreateInput {
  const definition = getTaskNodeDefinition(nodeType);
  const baseKey = normalizeNodeKey(`${nodeType}_${index + 1}`);

  return {
    node_key: baseKey,
    node_type: nodeType,
    label: definition.label,
    config: getDefaultNodeConfig(nodeType),
    position_x: anchorNode
      ? anchorNode.positionX + DIAGRAM_NODE_W + DIAGRAM_H_GAP
      : DIAGRAM_PAD + DIAGRAM_NODE_W + DIAGRAM_H_GAP,
    position_y: anchorNode ? anchorNode.positionY : DIAGRAM_TRIGGER_Y,
  };
}

export function getDefaultNodeConfig(nodeType: TaskNodeType): Record<string, unknown> {
  if (nodeType === "instruction") {
    return {
      instruction: "AI가 수행할 지시문을 입력하세요.",
      save_to_memory: true,
      next_step_mode: "single",
    };
  }

  if (nodeType === "function") {
    return {
      function_name: "function_name",
      params: {},
      save_as: "function_result",
      next_step_mode: "single",
    };
  }

  return {
    message: "고객에게 전달할 메시지를 입력하세요.",
    next_step_mode: "single",
  };
}

export type NextStepMode = "single" | "branch" | "end";

export function readNextStepMode(value: unknown): NextStepMode {
  return value === "branch" || value === "end" || value === "single" ? value : "single";
}

export function isFallbackTaskEdge(edge: TaskEdge) {
  return (
    edge.isFailureEdge ||
    edge.edgeType === "fallback" ||
    edge.conditionType === "fallback" ||
    edge.conditionConfig?.fallback === true
  );
}

export function normalizeTaskNodeType(value: string): TaskNodeType {
  if (value === "end") return "message";
  if (value === "ask") return "instruction";
  return taskNodeDefinitions.some((definition) => definition.type === value)
    ? (value as TaskNodeType)
    : "message";
}

export function getTaskNodeDefinition(nodeType: TaskNodeType) {
  return taskNodeDefinitions.find((definition) => definition.type === nodeType) ?? taskNodeDefinitions[0];
}

export function getNodeEditorSectionTitle(nodeType: TaskNodeType) {
  if (nodeType === "instruction") return "에이전트 지시문";
  if (nodeType === "function") return "함수 실행";
  return "안내 메시지";
}

export function getNodePrimaryPlaceholder(nodeType: TaskNodeType) {
  if (nodeType === "instruction") {
    return (
      "[역할]\n" +
      "[대화 흐름]\n" +
      "[종료 조건]\n" +
      "[예외 사항]\n\n" +
      "@를 입력해 읽거나 업데이트할 변수를 추가하세요."
    );
  }
  if (nodeType === "function") return "실행할 함수명을 입력하세요.\n예: check_reservation_availability";
  return "고객에게 전달할 안내 메시지를 작성해 주세요.";
}

export function needsSecondaryNodeValue(nodeType: TaskNodeType) {
  return nodeType === "function";
}

export function getNodeSecondaryLabel(nodeType: TaskNodeType) {
  if (nodeType === "function") return "결과 업데이트 변수";
  return "보조 값";
}

export function getNodeSecondaryPlaceholder(nodeType: TaskNodeType) {
  if (nodeType === "function") return "availability_result";
  return "";
}

export function toDisplayMemoryMentions(value: string) {
  return value.replace(/{{\s*memory\.([a-zA-Z0-9_.]+)\s*}}/g, "@$1");
}

export function toStorageMemoryMentions(value: string) {
  return value.replace(/(^|[\s([{])@([a-zA-Z0-9_.]+)/g, (_match, prefix: string, key: string) => {
    return `${prefix}{{memory.${key}}}`;
  });
}

const PROMPTDATA_PATTERN = /<promptdata\s+[^>]*type="([^"]+)"[^>]*subtype="([^"]+)"[^>]*identifier="([^"]+)"[^>]*>[\s\S]*?<\/promptdata>/g;

export type PromptdataType = "read-variable" | "update-variable";

export function buildPromptdataTag(type: PromptdataType, identifier: string, subtype = "text") {
  return `<promptdata type="${type}" subtype="${subtype}" identifier="${identifier}"></promptdata>`;
}

export function toDisplayPromptdataMentions(value: string) {
  return value.replace(PROMPTDATA_PATTERN, (_match, type: string, _subtype: string, identifier: string) => {
    return type === "update-variable" ? `✏${identifier}` : `@${identifier}`;
  });
}

export function extractPromptdataVariables(instruction: string) {
  const read: string[] = [];
  const update: string[] = [];

  for (const match of instruction.matchAll(PROMPTDATA_PATTERN)) {
    const [, type, , identifier] = match;
    if (type === "update-variable") update.push(identifier);
    else if (type === "read-variable") read.push(identifier);
  }

  return { read: [...new Set(read)], update: [...new Set(update)] };
}

export function readNodeConfigValues(node: TaskNode) {
  if (node.nodeType === "instruction") {
    return {
      primary: readConfigString(node.config.instruction) ?? "",
      secondary: "",
    };
  }

  if (node.nodeType === "function") {
    return {
      primary: toDisplayMemoryMentions(readConfigString(node.config.function_name) ?? ""),
      secondary: readConfigString(node.config.save_as) ?? "",
    };
  }

  if (node.nodeType === "condition") {
    return {
      primary: toDisplayMemoryMentions(readConfigString(node.config.memory_path) ?? ""),
      secondary: readConfigString(node.config.equals) ?? "",
    };
  }

  return {
    primary: toDisplayMemoryMentions(readConfigString(node.config.message) ?? ""),
    secondary: "",
  };
}

export type MemoryVariableOption = {
  key: string;
  label: string;
  source: string;
};

export function collectMemoryVariableOptions(nodes: TaskNode[], draftOption?: MemoryVariableOption | null) {
  const options: MemoryVariableOption[] = [];
  const seen = new Set<string>();

  const pushOption = (option: MemoryVariableOption | null) => {
    if (!option?.key || seen.has(option.key)) return;
    seen.add(option.key);
    options.push(option);
  };

  nodes.forEach((node) => {
    const nodeType = normalizeTaskNodeType(node.nodeType);

    if (nodeType === "instruction") {
      const instruction = readConfigString(node.config.instruction) ?? "";
      const { update } = extractPromptdataVariables(instruction);
      update.forEach((key) =>
        pushOption({ key, label: key, source: node.label || getTaskNodeDefinition(nodeType).label }),
      );
      return;
    }

    if (nodeType === "function") {
      const key = readConfigString(node.config.save_as);
      pushOption(key ? { key, label: key, source: node.label || getTaskNodeDefinition(nodeType).label } : null);
    }
  });

  pushOption(draftOption ?? null);
  return options;
}

export function buildNodeConfig({
  nodeType,
  message,
  variableName,
}: {
  nodeType: string;
  message: string;
  variableName: string;
}) {
  if (nodeType === "instruction") {
    if (!message.trim()) return null;
    return {
      instruction: message.trim(),
      save_to_memory: true,
    };
  }

  const storageMessage = toStorageMemoryMentions(message.trim());

  if (nodeType === "function") {
    if (!message.trim()) return null;
    return {
      function_name: storageMessage,
      params: {},
      save_as: normalizeNodeKey(variableName || "function_result"),
    };
  }

  if (nodeType === "condition") {
    if (!message.trim() || !variableName.trim()) return null;
    return {
      variable: storageMessage,
      operator: "equals",
      value: parseConfigScalar(variableName.trim()),
    };
  }

  if (nodeType === "message") {
    if (!message.trim()) return null;
    return { message: storageMessage };
  }

  return {};
}

export function parseConfigScalar(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

export function normalizeNodeKey(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || `node_${Date.now()}`;
}
