import { getAgentApiBaseUrl, readAgentApiError } from "../../../../lib/agentApiBase";
import type {
  TaskEdge,
  TaskEdgeUpdateInput,
  TaskFlow,
  TaskFlowCreateInput,
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
  edgeType = "single",
  conditionType = "always",
  conditionConfig = {},
  isFailureEdge = false,
  priority = 100,
}: {
  flowId: string;
  sourceNodeKey: string;
  targetNodeKey: string;
  edgeType?: string;
  conditionType?: string;
  conditionConfig?: Record<string, unknown>;
  isFailureEdge?: boolean;
  priority?: number;
}) {
  const response = await fetch(`${getAgentApiBaseUrl()}/task-flows/${encodeURIComponent(flowId)}/edges`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      source_node_key: sourceNodeKey,
      target_node_key: targetNodeKey,
      edge_type: edgeType,
      condition_type: conditionType,
      condition_config: conditionConfig,
      is_failure_edge: isFailureEdge,
      priority,
    }),
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
