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
