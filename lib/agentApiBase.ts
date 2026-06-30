const DEFAULT_AGENT_API_URL = "https://api.light-code.dev";
const LOCAL_DEV_API_PROXY = "/agent-api";

export function getAgentApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_AGENT_API_URL?.trim();

  if (!configured) {
    return process.env.NODE_ENV === "development" ? LOCAL_DEV_API_PROXY : DEFAULT_AGENT_API_URL;
  }

  return configured.replace(/\/$/, "");
}

export async function readAgentApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `API가 JSON 대신 HTML을 반환했습니다 (${response.url}). 로컬은 NEXT_PUBLIC_AGENT_API_URL=/agent-api, 배포는 https://api.light-code.dev 로 맞춰 주세요.`,
    );
  }

  return (await response.json()) as T;
}

export async function readAgentApiError(response: Response) {
  const fallback = `HTTP ${response.status}`;

  try {
    const payload = (await response.json()) as { detail?: unknown; message?: unknown };
    const detail = payload.detail ?? payload.message;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item) => JSON.stringify(item)).join(", ");
    if (detail) return JSON.stringify(detail);
  } catch {
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
