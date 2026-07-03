import { getAgentApiBaseUrl, readAgentApiError } from "../../../../lib/agentApiBase";
import type {
  TaskEdge,
  TaskEdgeUpdateInput,
  TaskFlow,
  TaskFlowCreateInput,
  TaskFlowGenerateFromBriefResponse,
  TaskFlowGenerateItemResult,
  TaskFlowGenerateResponse,
  TaskFlowTemplate,
  TaskFlowTestResult,
  TaskFlowUpdateInput,
  TaskNode,
  TaskNodeCreateInput,
  TaskNodeUpdateInput,
} from "../types";

type TaskFlowRecord = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  trigger_intent: string | null;
  trigger_description: string | null;
  trigger_examples: string[] | null;
  allowed_channels: string[] | null;
  filters: Record<string, unknown> | null;
  is_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type TaskNodeRecord = {
  id: string;
  flow_id: string;
  node_key: string;
  node_type: string;
  label: string;
  config: Record<string, unknown> | null;
  code: string | null;
  position_x: number | null;
  position_y: number | null;
  timeout_seconds: number | null;
  retry_limit: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type TaskEdgeRecord = {
  id: string;
  flow_id: string;
  source_node_key: string;
  target_node_key: string;
  edge_type: string | null;
  condition_type: string | null;
  condition_config: Record<string, unknown> | null;
  is_failure_edge: boolean | null;
  priority: number | null;
  created_at: string | null;
};

function mapTaskFlowRecord(record: TaskFlowRecord): TaskFlow {
  return {
    id: record.id,
    organizationId: record.organization_id,
    name: record.name,
    description: record.description ?? undefined,
    triggerIntent: record.trigger_intent ?? undefined,
    triggerDescription: record.trigger_description ?? undefined,
    triggerExamples: record.trigger_examples ?? [],
    allowedChannels: record.allowed_channels ?? [],
    filters: record.filters ?? {},
    isEnabled: record.is_enabled ?? true,
    createdAt: record.created_at ?? undefined,
    updatedAt: record.updated_at ?? undefined,
  };
}

function mapTaskNodeRecord(record: TaskNodeRecord): TaskNode {
  return {
    id: record.id,
    flowId: record.flow_id,
    nodeKey: record.node_key,
    nodeType: record.node_type,
    label: record.label,
    config: record.config ?? {},
    code: record.code ?? undefined,
    positionX: record.position_x ?? 0,
    positionY: record.position_y ?? 0,
    timeoutSeconds: record.timeout_seconds ?? 10,
    retryLimit: record.retry_limit ?? 0,
    createdAt: record.created_at ?? undefined,
    updatedAt: record.updated_at ?? undefined,
  };
}

function mapTaskEdgeRecord(record: TaskEdgeRecord): TaskEdge {
  return {
    id: record.id,
    flowId: record.flow_id,
    sourceNodeKey: record.source_node_key,
    targetNodeKey: record.target_node_key,
    edgeType: record.edge_type ?? "single",
    conditionType: record.condition_type ?? "always",
    conditionConfig: record.condition_config ?? {},
    isFailureEdge: record.is_failure_edge ?? false,
    priority: record.priority ?? 100,
    createdAt: record.created_at ?? undefined,
  };
}

export function isFallbackTaskEdge(edge: TaskEdge) {
  return (
    edge.isFailureEdge ||
    edge.edgeType === "fallback" ||
    edge.conditionType === "fallback" ||
    edge.conditionConfig?.fallback === true
  );
}

export function normalizeTaskEdgeCreatePayload({
  sourceNodeKey,
  targetNodeKey,
  conditionConfig = {},
  isFailureEdge = false,
  priority,
  edgeType,
  conditionType,
}: {
  sourceNodeKey: string;
  targetNodeKey: string;
  conditionConfig?: Record<string, unknown>;
  isFailureEdge?: boolean;
  priority?: number;
  edgeType?: string | null;
  conditionType?: string | null;
}) {
  const failure = isFailureEdge;
  if (failure) {
    return {
      source_node_key: sourceNodeKey,
      target_node_key: targetNodeKey,
      edge_type: "fallback",
      condition_type: "fallback",
      condition_config: conditionConfig,
      is_failure_edge: true,
      priority: priority ?? 200,
    };
  }

  const hasEqualsCondition = typeof conditionConfig.variable === "string";
  const resolvedEdgeType =
    edgeType === "condition" || edgeType === "failure"
      ? edgeType
      : hasEqualsCondition
        ? "condition"
        : "single";
  const resolvedConditionType =
    resolvedEdgeType === "condition"
      ? conditionType === "equals" || conditionType === "if" || !conditionType
        ? "equals"
        : conditionType
      : "always";

  return {
    source_node_key: sourceNodeKey,
    target_node_key: targetNodeKey,
    edge_type: resolvedEdgeType,
    condition_type: resolvedConditionType,
    condition_config: conditionConfig,
    is_failure_edge: false,
    priority: priority ?? 100,
  };
}

export function dedupeTaskEdgesByIdentity(edges: TaskEdge[]) {
  const byKey = new Map<string, TaskEdge>();
  edges.forEach((edge) => {
    const key = `${edge.sourceNodeKey}:${edge.targetNodeKey}:${isFallbackTaskEdge(edge) ? "fallback" : "primary"}`;
    byKey.set(key, edge);
  });
  return Array.from(byKey.values());
}

export function mapTaskFlowInput(input: TaskFlowUpdateInput): Partial<TaskFlow> {
  const mapped = {
    name: input.name,
    description: input.description ?? undefined,
    triggerIntent: input.trigger_intent ?? undefined,
    triggerDescription: input.trigger_description ?? undefined,
    triggerExamples: input.trigger_examples,
    allowedChannels: input.allowed_channels,
    isEnabled: input.is_enabled,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => value !== undefined)) as Partial<TaskFlow>;
}

type TaskFlowTemplateRecord = {
  template_key: string;
  name: string;
  description: string;
  trigger_intent: string;
  trigger_description: string;
  trigger_examples: string[];
  node_count: number;
  edge_count: number;
};

type TaskFlowGenerateItemRecord = {
  template_key: string;
  flow_id: string;
  name: string;
  trigger_intent: string;
  node_count: number;
  edge_count: number;
  created: boolean;
  skipped: boolean;
  skip_reason: string | null;
};

function mapTaskFlowTemplateRecord(record: TaskFlowTemplateRecord): TaskFlowTemplate {
  return {
    templateKey: record.template_key,
    name: record.name,
    description: record.description,
    triggerIntent: record.trigger_intent,
    triggerDescription: record.trigger_description,
    triggerExamples: record.trigger_examples ?? [],
    nodeCount: record.node_count,
    edgeCount: record.edge_count,
  };
}

function mapTaskFlowGenerateItemRecord(record: TaskFlowGenerateItemRecord): TaskFlowGenerateItemResult {
  return {
    templateKey: record.template_key,
    flowId: record.flow_id,
    name: record.name,
    triggerIntent: record.trigger_intent,
    nodeCount: record.node_count,
    edgeCount: record.edge_count,
    created: record.created,
    skipped: record.skipped,
    skipReason: record.skip_reason,
  };
}

export async function fetchTaskFlowTemplates() {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/templates`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: TaskFlowTemplateRecord[] };
  return (payload.items ?? []).map(mapTaskFlowTemplateRecord);
}

export async function generateTaskFlows({
  organizationId,
  template,
  overwrite = false,
  isEnabled = true,
  triggerDescription,
  triggerExamples,
}: {
  organizationId: string;
  template: string;
  overwrite?: boolean;
  isEnabled?: boolean;
  triggerDescription?: string | null;
  triggerExamples?: string[] | null;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      template,
      overwrite,
      is_enabled: isEnabled,
      trigger_description: triggerDescription ?? null,
      trigger_examples: triggerExamples ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as {
    organization_id: string;
    template: string;
    created_count: number;
    skipped_count: number;
    items?: TaskFlowGenerateItemRecord[];
  };

  return {
    organizationId: payload.organization_id,
    template: payload.template,
    createdCount: payload.created_count,
    skippedCount: payload.skipped_count,
    items: (payload.items ?? []).map(mapTaskFlowGenerateItemRecord),
  } satisfies TaskFlowGenerateResponse;
}

export async function generateTaskFlowFromBrief({
  organizationId,
  brief,
  overwrite = false,
  isEnabled = true,
}: {
  organizationId: string;
  brief: string;
  overwrite?: boolean;
  isEnabled?: boolean;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/generate-from-brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      brief,
      overwrite,
      is_enabled: isEnabled,
    }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as {
    organization_id: string;
    plan: {
      template_key: string;
      name: string;
      description: string;
      trigger_description: string;
      trigger_examples: string[];
      allowed_channels: string[];
      required_slots: string[];
      assistant_tone_hint?: string;
      reasoning?: string;
    };
    result: TaskFlowGenerateItemRecord;
  };

  return {
    organizationId: payload.organization_id,
    plan: {
      templateKey: payload.plan.template_key,
      name: payload.plan.name,
      description: payload.plan.description,
      triggerDescription: payload.plan.trigger_description,
      triggerExamples: payload.plan.trigger_examples ?? [],
      allowedChannels: payload.plan.allowed_channels ?? [],
      requiredSlots: payload.plan.required_slots ?? [],
      assistantToneHint: payload.plan.assistant_tone_hint,
      reasoning: payload.plan.reasoning,
    },
    result: mapTaskFlowGenerateItemRecord(payload.result),
  } satisfies TaskFlowGenerateFromBriefResponse;
}

export async function fetchTaskFlows(organizationId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows?organization_id=${encodeURIComponent(organizationId)}`);

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: TaskFlowRecord[] };
  return (payload.items ?? []).map(mapTaskFlowRecord);
}

export async function fetchTaskNodes(flowId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/nodes`);

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: TaskNodeRecord[] };
  return (payload.items ?? []).map(mapTaskNodeRecord);
}

export async function fetchTaskEdges(flowId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/edges`);

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: TaskEdgeRecord[] };
  return (payload.items ?? []).map(mapTaskEdgeRecord);
}

export type TasksWorkspaceData = {
  taskFlows: TaskFlow[];
  taskNodesByFlowId: Record<string, TaskNode[]>;
  taskEdgesByFlowId: Record<string, TaskEdge[]>;
};

export function getTasksWorkspaceKey(organizationId: string) {
  return ["tasks-workspace", organizationId] as const;
}

export async function fetchTasksWorkspaceData(organizationId: string): Promise<TasksWorkspaceData> {
  const taskFlows = await fetchTaskFlows(organizationId);

  const nodeEntries = await Promise.all(
    taskFlows.map(async (flow) => {
      try {
        return [flow.id, await fetchTaskNodes(flow.id)] as const;
      } catch {
        return [flow.id, []] as const;
      }
    }),
  );
  const edgeEntries = await Promise.all(
    taskFlows.map(async (flow) => {
      try {
        return [flow.id, await fetchTaskEdges(flow.id)] as const;
      } catch {
        return [flow.id, []] as const;
      }
    }),
  );

  return {
    taskFlows,
    taskNodesByFlowId: Object.fromEntries(nodeEntries),
    taskEdgesByFlowId: Object.fromEntries(edgeEntries),
  };
}

export async function createTaskFlow({ organizationId, data }: { organizationId: string; data: TaskFlowCreateInput }) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      ...data,
    }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapTaskFlowRecord((await response.json()) as TaskFlowRecord);
}

export async function updateTaskFlow({ flowId, data }: { flowId: string; data: TaskFlowUpdateInput }) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapTaskFlowRecord((await response.json()) as TaskFlowRecord);
}

export async function deleteTaskFlow(flowId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }
}

export async function testTaskFlow({
  organizationId,
  flowId,
  message,
}: {
  organizationId: string;
  flowId: string;
  message: string;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      session_id: `task_test_${Date.now()}`,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return (await response.json()) as TaskFlowTestResult;
}

export async function createTaskNode({ flowId, data }: { flowId: string; data: TaskNodeCreateInput }) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/nodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapTaskNodeRecord((await response.json()) as TaskNodeRecord);
}

export async function updateTaskNode({
  flowId,
  nodeId,
  data,
}: {
  flowId: string;
  nodeId: string;
  data: TaskNodeUpdateInput;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/nodes/${encodeURIComponent(nodeId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapTaskNodeRecord((await response.json()) as TaskNodeRecord);
}

export async function deleteTaskNode({ flowId, nodeId }: { flowId: string; nodeId: string }) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/nodes/${encodeURIComponent(nodeId)}`,
    {
      method: "DELETE",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }
}

export async function createTaskEdge({
  flowId,
  sourceNodeKey,
  targetNodeKey,
  conditionConfig = {},
  isFailureEdge = false,
  priority,
  edgeType,
  conditionType,
}: {
  flowId: string;
  sourceNodeKey: string;
  targetNodeKey: string;
  edgeType?: string | null;
  conditionType?: string | null;
  conditionConfig?: Record<string, unknown>;
  isFailureEdge?: boolean;
  priority?: number;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/edges`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(
      normalizeTaskEdgeCreatePayload({
        sourceNodeKey,
        targetNodeKey,
        conditionConfig,
        isFailureEdge,
        priority,
        edgeType,
        conditionType,
      }),
    ),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapTaskEdgeRecord((await response.json()) as TaskEdgeRecord);
}

export async function updateTaskEdge({
  flowId,
  edgeId,
  data,
}: {
  flowId: string;
  edgeId: string;
  data: TaskEdgeUpdateInput;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/edges/${encodeURIComponent(edgeId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapTaskEdgeRecord((await response.json()) as TaskEdgeRecord);
}

export async function deleteTaskEdge({ flowId, edgeId }: { flowId: string; edgeId: string }) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/edges/${encodeURIComponent(edgeId)}`,
    {
      method: "DELETE",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }
}
