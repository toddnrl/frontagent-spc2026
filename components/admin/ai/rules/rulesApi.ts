import { getAgentApiBaseUrl, readAgentApiError } from "../../../../lib/agentApiBase";
import type { RuleItem, RuleUpdateInput } from "../types";

type RuleRecord = {
  id: string;
  name: string;
  instruction: string;
  is_active: boolean | null;
  is_builtin?: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type RuleCreateInput = {
  name: string;
  instruction: string;
  is_active: boolean;
};

function mapRuleRecord(record: RuleRecord): RuleItem {
  return {
    id: record.id,
    name: record.name,
    active: record.is_active ?? true,
    instruction: record.instruction,
    isBuiltin: record.is_builtin ?? false,
    createdAt: record.created_at ?? undefined,
    updatedAt: record.updated_at ?? undefined,
  };
}

export async function fetchRules(organizationId: string) {
  const response = await fetch(`${getAgentApiBaseUrl()}/rules?organization_id=${encodeURIComponent(organizationId)}`);

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: RuleRecord[] };
  return (payload.items ?? []).map(mapRuleRecord);
}

export async function createRule({ organizationId, data }: { organizationId: string; data: RuleCreateInput }) {
  const response = await fetch(`${getAgentApiBaseUrl()}/rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      organization_id: organizationId,
      ...data,
    }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapRuleRecord((await response.json()) as RuleRecord);
}

export async function updateRule({
  organizationId,
  ruleId,
  data,
}: {
  organizationId: string;
  ruleId: string;
  data: RuleUpdateInput;
}) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/rules/${encodeURIComponent(ruleId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapRuleRecord((await response.json()) as RuleRecord);
}

export async function deleteRule({ organizationId, ruleId }: { organizationId: string; ruleId: string }) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/rules/${encodeURIComponent(ruleId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }
}

export async function resetBuiltinRule({ organizationId, ruleId }: { organizationId: string; ruleId: string }) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/rules/${encodeURIComponent(ruleId)}/reset?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapRuleRecord((await response.json()) as RuleRecord);
}
