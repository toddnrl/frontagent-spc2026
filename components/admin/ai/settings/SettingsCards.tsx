import { CheckCircle2, FileText, Zap } from "lucide-react";
import { Card, SectionTitle, Toggle } from "../../ui";
import { SettingsInput, SettingsSelect } from "./SettingsFields";
import { llmModelOptions, providerOptions, type OrganizationAiSettings } from "./types";
import type { SettingsWorkspaceState } from "./useSettingsWorkspace";

type SettingsForm = SettingsWorkspaceState["form"];

export function LlmSettingsCard({
  form,
  disabled,
  setField,
}: {
  form: SettingsForm;
  disabled: boolean;
  setField: SettingsWorkspaceState["setField"];
}) {
  return (
    <Card>
      <SectionTitle icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />} title="LLM 설정" />
      <div className="mt-5 space-y-4">
        <SettingsSelect
          label="Provider"
          value={form.llm_provider}
          options={providerOptions}
          onChange={(value) => setField("llm_provider", value)}
          disabled={disabled}
        />
        <SettingsSelect
          label="응답 모델"
          value={form.llm_model}
          options={llmModelOptions}
          onChange={(value) => setField("llm_model", value)}
          disabled={disabled}
        />
        <SettingsSelect
          label="판단 모델"
          value={form.decision_model}
          options={[
            { value: "", label: "응답 모델과 동일" },
            ...llmModelOptions.map((model) => ({ value: model, label: model })),
          ]}
          onChange={(value) => setField("decision_model", value)}
          disabled={disabled}
        />
        <div className="flex items-center justify-between rounded-[18px] bg-[#f7f7f7] p-4">
          <div>
            <div className="text-[12px] font-bold text-gray-400">음성 기능</div>
            <div className="mt-1 text-[14px] font-bold">{form.voice_enabled ? "활성" : "비활성"}</div>
          </div>
          <Toggle
            enabled={form.voice_enabled}
            onChange={() => setField("voice_enabled", !form.voice_enabled)}
            disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
}

export function VoiceSettingsCard({
  workspace,
  disabled,
}: {
  workspace: SettingsWorkspaceState;
  disabled: boolean;
}) {
  const { form, options, isRealtimeMode, setField } = workspace;

  return (
    <Card>
      <SectionTitle
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        title={isRealtimeMode ? "Realtime 음성 모델" : "Pipeline 음성 모델"}
      />
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SettingsSelect
          label="음성 처리 방식"
          value={form.voice_mode}
          options={options.voice_modes ?? ["pipeline", "realtime"]}
          onChange={workspace.setVoiceMode}
          disabled={disabled}
        />
        <SettingsSelect
          label="응답 스타일"
          value={form.voice_response_style}
          options={options.voice_response_styles ?? ["friendly_short", "professional_short", "casual_short"]}
          onChange={(value) => setField("voice_response_style", value)}
          disabled={disabled}
        />

        {isRealtimeMode ? (
          <RealtimeSettings
            workspace={workspace}
            disabled={disabled}
          />
        ) : (
          <PipelineSettings workspace={workspace} disabled={disabled} />
        )}

        <SettingsInput
          label="월 예산 제한 cents"
          value={form.monthly_budget_limit_cents}
          onChange={(value) => setField("monthly_budget_limit_cents", value)}
          type="number"
          placeholder="제한 없음"
          disabled={disabled}
        />
        <SettingsInput
          label="월 토큰 제한"
          value={form.monthly_token_limit}
          onChange={(value) => setField("monthly_token_limit", value)}
          type="number"
          placeholder="제한 없음"
          disabled={disabled}
        />
      </div>
    </Card>
  );
}

export function RecommendedTemplatesCard({
  templates,
  disabled,
  onApply,
}: {
  templates: Array<Partial<OrganizationAiSettings> & { name: string }>;
  disabled: boolean;
  onApply: SettingsWorkspaceState["applyTemplate"];
}) {
  if (templates.length === 0) return null;

  return (
    <Card className="mt-5">
      <SectionTitle icon={<Zap className="h-5 w-5 text-blue-500" />} title="추천 템플릿" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {templates.map((template) => (
          <button
            key={template.name}
            type="button"
            onClick={() => onApply(template)}
            disabled={disabled}
            className="rounded-[18px] bg-[#f7f7f7] p-4 text-left transition-colors hover:bg-blue-50 disabled:opacity-50"
          >
            <div className="text-[14px] font-extrabold">{template.name}</div>
            <div className="mt-1 text-[12px] font-bold text-gray-400">
              {template.voice_mode === "realtime" ? "Realtime 통화" : "저비용 Pipeline 통화"}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function RealtimeSettings({
  workspace,
  disabled,
}: {
  workspace: SettingsWorkspaceState;
  disabled: boolean;
}) {
  const { form, options, setField } = workspace;
  // Realtime 모드는 OpenAI Realtime API만 지원한다. ElevenLabs Realtime(Conversational
  // AI agent)은 우리 LLM/규칙과 무관하게 별도 에이전트가 통화를 전부 처리해 운영
  // 기준과 맞지 않아 선택지에서 제외했다 — 기존에 저장된 값이 elevenlabs였다면
  // 폼이 깨지지 않도록 OpenAI로 전환하는 안내만 남긴다.
  const isElevenLabsRealtime = form.voice_tts_provider === "elevenlabs";

  return (
    <>
      {isElevenLabsRealtime && (
        <div className="rounded-[18px] bg-amber-50 p-4 md:col-span-2">
          <div className="text-[12px] font-bold text-amber-600">ElevenLabs Realtime은 더 이상 지원하지 않습니다</div>
          <p className="mt-1 text-[13px] font-bold leading-relaxed text-amber-700">
            기존에 ElevenLabs Conversational AI 에이전트로 저장된 설정입니다. 저장하면
            OpenAI Realtime으로 전환됩니다.
          </p>
        </div>
      )}
      <SettingsSelect
        label="Realtime 모델"
        value={form.realtime_model}
        options={options.realtime_models ?? []}
        onChange={(value) => {
          setField("voice_tts_provider", "openai");
          setField("realtime_model", value);
        }}
        disabled={disabled}
      />
      <SettingsSelect
        label="Realtime Voice"
        value={form.realtime_voice}
        options={options.realtime_voices ?? []}
        onChange={(value) => {
          setField("voice_tts_provider", "openai");
          setField("realtime_voice", value);
        }}
        disabled={disabled}
      />
      <div className="rounded-[18px] bg-blue-50 p-4 md:col-span-2">
        <div className="text-[12px] font-bold text-blue-500">Realtime 모드</div>
        <div className="mt-1 text-[13px] font-bold leading-relaxed text-blue-900">
          통화 세션에서 OpenAI Realtime API 모델과 voice를 사용합니다. STT/TTS 모델 설정은
          Pipeline 모드에서만 사용됩니다.
        </div>
      </div>
    </>
  );
}

function PipelineSettings({
  workspace,
  disabled,
}: {
  workspace: SettingsWorkspaceState;
  disabled: boolean;
}) {
  const {
    form,
    sttModelOptions,
    ttsModelOptions,
    ttsVoiceOptions,
    options,
    setField,
    setSttProvider,
    setTtsProvider,
    setTtsModel,
  } = workspace;
  const isElevenLabsTts = form.voice_tts_provider === "elevenlabs";

  return (
    <>
      <SettingsSelect
        label="STT Provider"
        value={form.voice_stt_provider}
        options={options.stt_providers ?? []}
        onChange={setSttProvider}
        disabled={disabled}
      />
      <SettingsSelect
        label="STT 모델"
        value={form.voice_stt_model}
        options={sttModelOptions}
        onChange={(value) => setField("voice_stt_model", value)}
        disabled={disabled}
      />
      <SettingsSelect
        label="TTS Provider"
        value={form.voice_tts_provider}
        options={options.tts_providers ?? []}
        onChange={setTtsProvider}
        disabled={disabled}
      />
      {isElevenLabsTts ? (
        <>
          <SettingsSelect
            label="ElevenLabs 모델"
            value={form.elevenlabs_model}
            options={options.elevenlabs_models ?? ttsModelOptions}
            onChange={(value) => {
              setField("elevenlabs_model", value);
              setField("voice_tts_model", value);
            }}
            disabled={disabled}
          />
          <div className="md:col-span-2">
            <SettingsInput
              label="ElevenLabs Voice ID"
              value={form.elevenlabs_voice_id}
              onChange={(value) => setField("elevenlabs_voice_id", value)}
              placeholder="voice_id"
              disabled={disabled}
            />
            <p className="mt-2 px-1 text-[11px] font-bold leading-relaxed text-gray-400">
              ElevenLabs 사이트(elevenlabs.io) → Voice Library에서 사용할 목소리를 고르면
              voice_id가 표시됩니다. Pipeline 모드는 이 목소리로 우리 LLM의 답변을 읽어줄
              뿐이라 별도 에이전트를 만들 필요는 없습니다.
            </p>
          </div>
        </>
      ) : (
        <>
          <SettingsSelect
            label="TTS 모델"
            value={form.voice_tts_model}
            options={ttsModelOptions}
            onChange={setTtsModel}
            disabled={disabled}
          />
          <SettingsSelect
            label="TTS Voice"
            value={form.voice_tts_voice}
            options={ttsVoiceOptions}
            onChange={(value) => setField("voice_tts_voice", value)}
            disabled={disabled}
          />
        </>
      )}
      <div className="rounded-[18px] bg-blue-50 p-4">
        <div className="text-[12px] font-bold text-blue-500">Pipeline 모드</div>
        <div className="mt-1 text-[13px] font-bold leading-relaxed text-blue-900">
          STT로 음성을 텍스트화하고, AI 응답 후 TTS로 음성을 생성합니다.
        </div>
      </div>
    </>
  );
}
