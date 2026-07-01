import { RefreshCw, Save } from "lucide-react";
import { PageHeader } from "../../ui";
import {
  LlmSettingsCard,
  RecommendedTemplatesCard,
  VoiceSettingsCard,
} from "./SettingsCards";
import type { SettingsWorkspaceState } from "./useSettingsWorkspace";

export function SettingsSection({ workspace }: { workspace: SettingsWorkspaceState }) {
  const {
    form,
    options,
    error,
    message,
    hasLoaded,
    isInitialLoading,
    isLoading,
    isSaving,
    setField,
    applyTemplate,
    reload,
    save,
  } = workspace;
  const isBusy = isLoading || isSaving;
  const isInitialError = !hasLoaded && !!error && !isInitialLoading;

  return (
    <>
      <PageHeader
        title="Agent 설정"
        description="조직별 LLM, 음성 모드, Realtime/Pipeline 모델, 월 사용 제한을 설정합니다."
        action={isInitialError ? "다시 불러오기" : isSaving ? "저장중" : "저장"}
        onAction={isInitialError ? reload : save}
        actionVariant="primary"
        actionDisabled={isBusy}
        actionIcon={isInitialError ? <RefreshCw className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      />

      {isInitialLoading && <SettingsLoadingState />}

      {isInitialError && <SettingsInitialError error={error} onRetry={reload} />}

      {hasLoaded && isLoading && (
        <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[12px] font-bold text-blue-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          최신 설정을 불러오는 중
        </div>
      )}

      {hasLoaded && (error || message) && (
        <div
          className={`mb-5 rounded-[18px] px-5 py-4 text-[13px] font-bold ${
            error ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {hasLoaded && (
        <>
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <LlmSettingsCard form={form} disabled={isBusy} setField={setField} />
            <VoiceSettingsCard workspace={workspace} disabled={isBusy} />
          </div>

          <RecommendedTemplatesCard
            templates={options.recommended_templates ?? []}
            disabled={isBusy}
            onApply={applyTemplate}
          />
        </>
      )}
    </>
  );
}

function SettingsInitialError({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50 p-6">
      <div className="text-[15px] font-extrabold text-red-600">설정을 불러오지 못했습니다.</div>
      <p className="mt-2 text-[13px] font-bold leading-relaxed text-red-500">
        {error ?? "잠시 후 다시 시도해 주세요."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-extrabold text-red-600 shadow-sm transition-colors hover:bg-red-100"
      >
        <RefreshCw className="h-4 w-4" />
        다시 불러오기
      </button>
    </div>
  );
}

function SettingsLoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Agent 설정 불러오는 중">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SettingsSkeletonCard rows={4} />
        <SettingsSkeletonCard rows={6} />
      </div>
      <div className="rounded-[28px] border border-gray-200 bg-white p-6">
        <div className="h-5 w-28 animate-pulse rounded-full bg-gray-100" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="h-20 animate-pulse rounded-[18px] bg-gray-100" />
          <div className="h-20 animate-pulse rounded-[18px] bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

function SettingsSkeletonCard({ rows }: { rows: number }) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded-full bg-gray-100" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
      </div>
      <div className="mt-5 space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-[76px] animate-pulse rounded-[18px] bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
