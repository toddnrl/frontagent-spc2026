import type { OrganizationAiSettingsForm, OrganizationAiSettingsOptions } from "./types";
import { llmModelOptions, providerOptions } from "./types";

export function validateAiSettingsForm(
  form: OrganizationAiSettingsForm,
  options: OrganizationAiSettingsOptions,
) {
  const voiceModeOptions = options.voice_modes ?? ["pipeline", "realtime"];
  const responseStyleOptions = options.voice_response_styles ?? [
    "friendly_short",
    "professional_short",
    "casual_short",
  ];
  const sttProviderOptions = options.stt_providers ?? [];
  const sttModelOptions = options.stt_models_by_provider?.[form.voice_stt_provider] ?? [];
  const ttsProviderOptions = options.tts_providers ?? [];
  const ttsModelOptions = options.tts_models_by_provider?.[form.voice_tts_provider] ?? [];
  const ttsVoiceOptions = options.tts_voices_by_model?.[form.voice_tts_model] ?? [];
  const elevenLabsModelOptions = options.elevenlabs_models ?? options.tts_models_by_provider?.elevenlabs ?? [];
  const realtimeModelOptions = options.realtime_models ?? [];
  const realtimeVoiceOptions = options.realtime_voices ?? [];
  const isPipelineMode = form.voice_mode === "pipeline";
  const isRealtimeMode = form.voice_mode === "realtime";
  const isElevenLabsTts = form.voice_tts_provider === "elevenlabs";

  const checks = [
    [providerOptions.includes(form.llm_provider), "Provider를 목록에서 선택하세요."],
    [llmModelOptions.includes(form.llm_model), "응답 모델을 목록에서 선택하세요."],
    [!form.decision_model || llmModelOptions.includes(form.decision_model), "판단 모델을 목록에서 선택하세요."],
    [voiceModeOptions.includes(form.voice_mode), "음성 처리 방식을 목록에서 선택하세요."],
    [responseStyleOptions.includes(form.voice_response_style), "응답 스타일을 목록에서 선택하세요."],
    [
      !isPipelineMode || sttProviderOptions.includes(form.voice_stt_provider),
      "STT Provider를 목록에서 선택하세요.",
    ],
    [
      !isPipelineMode || sttModelOptions.includes(form.voice_stt_model),
      "STT 모델을 목록에서 선택하세요.",
    ],
    [
      !isPipelineMode || ttsProviderOptions.includes(form.voice_tts_provider),
      "TTS Provider를 목록에서 선택하세요.",
    ],
    [
      !isPipelineMode || isElevenLabsTts || ttsModelOptions.includes(form.voice_tts_model),
      "TTS 모델을 목록에서 선택하세요.",
    ],
    [
      !isPipelineMode || isElevenLabsTts || ttsVoiceOptions.includes(form.voice_tts_voice),
      "TTS Voice를 목록에서 선택하세요.",
    ],
    [
      !isPipelineMode || !isElevenLabsTts || elevenLabsModelOptions.includes(form.elevenlabs_model),
      "ElevenLabs 모델을 목록에서 선택하세요.",
    ],
    [
      !isPipelineMode || !isElevenLabsTts || Boolean(form.elevenlabs_voice_id.trim()),
      "ElevenLabs Voice ID를 입력하세요.",
    ],
    [
      !isRealtimeMode || isElevenLabsTts || realtimeModelOptions.includes(form.realtime_model),
      "Realtime 모델을 목록에서 선택하세요.",
    ],
    [
      !isRealtimeMode || isElevenLabsTts || realtimeVoiceOptions.includes(form.realtime_voice),
      "Realtime Voice를 목록에서 선택하세요.",
    ],
  ] as const;

  const failed = checks.find(([ok]) => !ok);
  return failed?.[1] ?? null;
}
