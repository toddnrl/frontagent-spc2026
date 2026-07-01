export type OrganizationAiSettings = {
  llm_provider: string;
  llm_model: string;
  decision_model: string | null;
  voice_enabled: boolean;
  voice_mode: string;
  voice_stt_provider: string;
  voice_stt_model: string;
  voice_tts_provider: string;
  voice_tts_model: string;
  voice_tts_voice: string;
  elevenlabs_model: string | null;
  elevenlabs_voice_id: string | null;
  elevenlabs_agent_id: string | null;
  realtime_model: string;
  realtime_voice: string;
  voice_response_style: string;
  monthly_budget_limit_cents: number | null;
  monthly_token_limit: number | null;
};

export type OrganizationAiSettingsOptions = {
  voice_modes?: string[];
  voice_response_styles?: string[];
  stt_providers?: string[];
  stt_models_by_provider?: Record<string, string[]>;
  tts_providers?: string[];
  tts_models_by_provider?: Record<string, string[]>;
  tts_voices_by_model?: Record<string, string[]>;
  elevenlabs_models?: string[];
  elevenlabs_voices_endpoint?: string;
  elevenlabs_realtime_session_endpoint?: string;
  realtime_transport_providers?: string[];
  realtime_voice_providers?: string[];
  realtime_models?: string[];
  realtime_voices?: string[];
  recommended_templates?: Array<Partial<OrganizationAiSettings> & { name: string }>;
};

export type OrganizationAiSettingsResponse = {
  settings: OrganizationAiSettings;
  options?: OrganizationAiSettingsOptions;
};

export type OrganizationAiSettingsForm = Omit<
  OrganizationAiSettings,
  | "decision_model"
  | "elevenlabs_model"
  | "elevenlabs_voice_id"
  | "elevenlabs_agent_id"
  | "monthly_budget_limit_cents"
  | "monthly_token_limit"
> & {
  decision_model: string;
  elevenlabs_model: string;
  elevenlabs_voice_id: string;
  elevenlabs_agent_id: string;
  monthly_budget_limit_cents: string;
  monthly_token_limit: string;
};

export const defaultOrganizationAiSettingsForm: OrganizationAiSettingsForm = {
  llm_provider: "openai",
  llm_model: "gpt-4.1-mini",
  decision_model: "",
  voice_enabled: true,
  voice_mode: "pipeline",
  voice_stt_provider: "openai",
  voice_stt_model: "gpt-4o-mini-transcribe",
  voice_tts_provider: "openai",
  voice_tts_model: "gpt-4o-mini-tts",
  voice_tts_voice: "marin",
  elevenlabs_model: "eleven_flash_v2_5",
  elevenlabs_voice_id: "",
  elevenlabs_agent_id: "",
  realtime_model: "gpt-realtime-2",
  realtime_voice: "marin",
  voice_response_style: "friendly_short",
  monthly_budget_limit_cents: "",
  monthly_token_limit: "",
};

export const providerOptions = ["openai"];
export const llmModelOptions = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini", "gpt-4o"];
