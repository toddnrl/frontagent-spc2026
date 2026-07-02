import { getAgentApiBaseUrl, readAgentApiError, readAgentApiJson } from "../../../../lib/agentApiBase";
import type {
  OrganizationAiSettings,
  OrganizationAiSettingsForm,
  OrganizationAiSettingsResponse,
} from "./types";

export function toAiSettingsForm(settings: OrganizationAiSettings): OrganizationAiSettingsForm {
  return {
    llm_provider: settings.llm_provider ?? "openai",
    llm_model: settings.llm_model ?? "gpt-4.1-mini",
    decision_model: settings.decision_model ?? "",
    voice_enabled: settings.voice_enabled ?? true,
    voice_mode: settings.voice_mode ?? "pipeline",
    voice_stt_provider: settings.voice_stt_provider ?? "openai",
    voice_stt_model: settings.voice_stt_model ?? "gpt-4o-mini-transcribe",
    voice_tts_provider: settings.voice_tts_provider ?? "openai",
    voice_tts_model: settings.voice_tts_model ?? "gpt-4o-mini-tts",
    voice_tts_voice: settings.voice_tts_voice ?? "marin",
    elevenlabs_model: settings.elevenlabs_model ?? "eleven_flash_v2_5",
    elevenlabs_voice_id: settings.elevenlabs_voice_id ?? "",
    realtime_model: settings.realtime_model ?? "gpt-realtime-2",
    realtime_voice: settings.realtime_voice ?? "marin",
    voice_response_style: settings.voice_response_style ?? "friendly_short",
    monthly_budget_limit_cents:
      settings.monthly_budget_limit_cents == null ? "" : String(settings.monthly_budget_limit_cents),
    monthly_token_limit: settings.monthly_token_limit == null ? "" : String(settings.monthly_token_limit),
  };
}

export function buildAiSettingsPayload(form: OrganizationAiSettingsForm) {
  return {
    llm_provider: form.llm_provider.trim(),
    llm_model: form.llm_model.trim(),
    ...(form.decision_model.trim() ? { decision_model: form.decision_model.trim() } : {}),
    voice_enabled: form.voice_enabled,
    voice_mode: form.voice_mode,
    voice_stt_provider: form.voice_stt_provider.trim(),
    voice_stt_model: form.voice_stt_model.trim(),
    voice_tts_provider: form.voice_tts_provider.trim(),
    voice_tts_model: form.voice_tts_model.trim(),
    voice_tts_voice: form.voice_tts_voice.trim(),
    elevenlabs_model: form.elevenlabs_model.trim(),
    ...(form.elevenlabs_voice_id.trim() ? { elevenlabs_voice_id: form.elevenlabs_voice_id.trim() } : {}),
    realtime_model: form.realtime_model.trim(),
    realtime_voice: form.realtime_voice.trim(),
    voice_response_style: form.voice_response_style,
    ...(form.monthly_budget_limit_cents.trim()
      ? { monthly_budget_limit_cents: Number(form.monthly_budget_limit_cents) }
      : {}),
    ...(form.monthly_token_limit.trim() ? { monthly_token_limit: Number(form.monthly_token_limit) } : {}),
  };
}

export async function fetchOrganizationAiSettings(organizationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/organization-ai-settings?organization_id=${encodeURIComponent(organizationId)}`,
  );
  if (!response.ok) throw new Error(await readAgentApiError(response));
  return readAgentApiJson<OrganizationAiSettingsResponse>(response);
}

export async function updateOrganizationAiSettings(
  organizationId: string,
  form: OrganizationAiSettingsForm,
) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/organization-ai-settings?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildAiSettingsPayload(form)),
    },
  );
  if (!response.ok) throw new Error(await readAgentApiError(response));
  return readAgentApiJson<OrganizationAiSettings>(response);
}
