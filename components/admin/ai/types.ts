export type AiCosSection =
  | "overview"
  | "knowledge"
  | "rules"
  | "tasks"
  | "test"
  | "logs"
  | "monitoring"
  | "status"
  | "docs"
  | "settings";

export type KnowledgeSource = {
  id: string;
  title: string;
  type: "PDF" | "Excel" | "CSV" | "Document" | "Website";
  folder: string;
  folderId?: string;
  status: "참조중" | "인덱싱중" | "미참조";
  resolutionRate: string;
  referenceCount: number;
  updatedAt: string;
  description?: string;
  fileName?: string;
  mimeType?: string;
  isReferenced?: boolean;
  sourceType?: string;
  createdAt?: string;
  rawStatus?: string;
};

export type KnowledgeFolder = {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type KnowledgeChunk = {
  id: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
};

export type RuleItem = {
  id: string;
  name: string;
  active: boolean;
  instruction: string;
  isBuiltin: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RuleCreateInput = {
  name: string;
  instruction: string;
  is_active: boolean;
};

export type RuleUpdateInput = Partial<RuleCreateInput>;

export type TaskFlow = {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  triggerIntent?: string;
  triggerDescription?: string;
  triggerExamples: string[];
  allowedChannels: string[];
  filters: Record<string, unknown>;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskNode = {
  id: string;
  flowId: string;
  nodeKey: string;
  nodeType: string;
  label: string;
  config: Record<string, unknown>;
  code?: string;
  positionX: number;
  positionY: number;
  timeoutSeconds: number;
  retryLimit: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskEdge = {
  id: string;
  flowId: string;
  sourceNodeKey: string;
  targetNodeKey: string;
  edgeType: string;
  conditionType: string;
  conditionConfig: Record<string, unknown>;
  isFailureEdge: boolean;
  priority: number;
  createdAt?: string;
};

export type TaskEdgeUpdateInput = {
  source_node_key?: string;
  target_node_key?: string;
  edge_type?: string;
  condition_type?: string;
  condition_config?: Record<string, unknown>;
  is_failure_edge?: boolean;
  priority?: number;
};

export type TaskFlowTestResult = {
  status?: string;
  response_messages?: string[];
  current_node_key?: string | null;
  task_session_id?: string | null;
  variables?: Record<string, unknown>;
  error?: Record<string, unknown> | string | null;
};

export type TaskFlowCreateInput = {
  name: string;
  description?: string | null;
  trigger_intent?: string | null;
  trigger_description?: string | null;
  trigger_examples?: string[];
  allowed_channels?: string[];
  is_enabled: boolean;
};

export type TaskFlowUpdateInput = Partial<TaskFlowCreateInput>;

export type TaskNodeCreateInput = {
  node_key: string;
  node_type: string;
  label: string;
  config: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
};

export type TaskNodeUpdateInput = Partial<TaskNodeCreateInput> & {
  code?: string | null;
  timeout_seconds?: number;
  retry_limit?: number;
};

export type AgentRun = {
  id: string;
  sessionId: string;
  channel: string | null;
  userMessage: string;
  intent: string | null;
  status: "success" | "error";
  errorMessage: string | null;
  appliedRules: string[];
  usedKnowledge: string[];
  finalResponse: string | null;
  createdAt: string | null;
};
