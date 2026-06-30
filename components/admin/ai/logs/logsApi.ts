import { getAgentApiBaseUrl } from "../../../../lib/agentApiBase";
import type { AgentRunRecord } from "./logsUtils";

export function fetchAgentRuns(organizationId: string, limit = 2000) {
  return fetch(
    `${getAgentApiBaseUrl()}/agent-runs?organization_id=${encodeURIComponent(organizationId)}&limit=${encodeURIComponent(String(limit))}`,
  ).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<{ items?: AgentRunRecord[] }>;
  });
}
