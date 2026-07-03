export type PreviewTaskResult = {
  status?: string | null;
  current_node_key?: string | null;
  message?: string | null;
  variables?: Record<string, unknown>;
  trace?: Array<Record<string, unknown>>;
  flow_id?: string | null;
  task_session_id?: string | null;
};

export type PreviewChatResult = {
  intent: string;
  message: string | null;
  next_action?: string | null;
  task_type?: string | null;
  task_status?: string | null;
  use_knowledge?: boolean;
  decision_reason?: string | null;
  conversation_id?: string | null;
  end_session?: boolean;
  elapsed_ms?: number | null;
  follow_up_message?: string | null;
  task_result?: PreviewTaskResult | null;
  applied_rules: RuleTraceItem[];
  used_knowledge: Array<Record<string, unknown>>;
  knowledge_context: Array<Record<string, unknown>>;
};

export type RuleTraceItem = string | Record<string, unknown>;

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNullableString(value: unknown): string | null {
  const text = readString(value).trim();
  return text || null;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readNumber(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function readObjectArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

function readRuleArray(value: unknown): RuleTraceItem[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is RuleTraceItem =>
          typeof item === "string" || (typeof item === "object" && item !== null),
      )
    : [];
}

function readTaskResult(value: unknown): PreviewTaskResult | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const variables =
    typeof obj.variables === "object" && obj.variables !== null
      ? (obj.variables as Record<string, unknown>)
      : undefined;

  return {
    status: readNullableString(obj.status),
    current_node_key: readNullableString(obj.current_node_key),
    message: readNullableString(obj.message),
    variables,
    trace: readObjectArray(obj.trace),
    flow_id: readNullableString(obj.flow_id),
    task_session_id: readNullableString(obj.task_session_id),
  };
}

export function parsePreviewChatResult(
  data: Record<string, unknown>,
  fallbackMessage = "",
): PreviewChatResult {
  return {
    intent: readString(data.intent) || "unknown",
    message: readNullableString(data.message) ?? (fallbackMessage || null),
    next_action: readNullableString(data.next_action),
    task_type: readNullableString(data.task_type),
    task_status: readNullableString(data.task_status),
    use_knowledge: readBoolean(data.use_knowledge),
    decision_reason: readNullableString(data.decision_reason),
    conversation_id: readNullableString(data.conversation_id),
    end_session: readBoolean(data.end_session) || readBoolean(data.should_end_session),
    elapsed_ms: readNumber(data.elapsed_ms),
    follow_up_message: readNullableString(data.follow_up_message),
    task_result: readTaskResult(data.task_result),
    applied_rules: readRuleArray(data.applied_rules),
    used_knowledge: readObjectArray(data.used_knowledge),
    knowledge_context: readObjectArray(data.knowledge_context),
  };
}

const TASK_VARIABLE_LABELS: Record<string, string> = {
  service_item_name: "서비스",
  service_item_text: "서비스(원문)",
  customer_name: "성함",
  reservation_date: "날짜",
  reservation_time: "시간",
  phone: "연락처",
  address: "주소",
};

export type TaskVariableRow = { key: string; label: string; value: string };

export function summarizeTaskVariables(variables: Record<string, unknown> | undefined): TaskVariableRow[] {
  if (!variables) return [];

  const rows: TaskVariableRow[] = [];
  for (const [key, value] of Object.entries(variables)) {
    if (key === "available_services") {
      const services = (value as { services?: Array<{ name?: string }> })?.services;
      if (Array.isArray(services) && services.length > 0) {
        rows.push({
          key,
          label: "서비스 목록",
          value: services.map((service) => service.name).filter(Boolean).join(", "),
        });
      }
      continue;
    }
    if (key.endsWith("_resolve_result") || key === "service_item_id") continue;
    if (value === null || value === undefined || value === "") continue;

    rows.push({
      key,
      label: TASK_VARIABLE_LABELS[key] ?? key,
      value: formatPreviewValue(value),
    });
  }
  return rows;
}

export function formatPreviewValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const json = JSON.stringify(value);
  return json.length > 180 ? `${json.slice(0, 180)}…` : json;
}

export function buildTurnResultTraceStep(result: PreviewChatResult, elapsedMs?: number) {
  const taskLabel = result.task_result?.current_node_key ? ` · node=${result.task_result.current_node_key}` : "";
  const memoryCount = summarizeTaskVariables(result.task_result?.variables).length;

  return {
    id: "turn_result",
    title: "턴 결과 (/chat result)",
    status: "done" as const,
    detail: [
      `${result.intent} / ${result.next_action ?? "-"}`,
      result.task_status ? `task=${result.task_status}${taskLabel}` : null,
      memoryCount > 0 ? `memory ${memoryCount}개` : null,
      result.used_knowledge.length > 0 ? `knowledge ${result.used_knowledge.length}개` : null,
      result.applied_rules.length > 0 ? `rules ${result.applied_rules.length}개` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    items: [result],
    elapsedMs: elapsedMs ?? result.elapsed_ms ?? undefined,
  };
}
