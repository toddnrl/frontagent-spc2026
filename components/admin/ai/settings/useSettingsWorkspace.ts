"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchOrganizationAiSettings,
  toAiSettingsForm,
  updateOrganizationAiSettings,
} from "./settingsApi";
import { validateAiSettingsForm } from "./settingsValidation";
import type {
  OrganizationAiSettings,
  OrganizationAiSettingsForm,
  OrganizationAiSettingsOptions,
} from "./types";
import { defaultOrganizationAiSettingsForm } from "./types";

export function useSettingsWorkspace(organizationId: string) {
  const [form, setForm] = useState<OrganizationAiSettingsForm>(defaultOrganizationAiSettingsForm);
  const [options, setOptions] = useState<OrganizationAiSettingsOptions>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const derivedOptions = useMemo(
    () => ({
      sttModelOptions: options.stt_models_by_provider?.[form.voice_stt_provider] ?? [],
      ttsModelOptions: options.tts_models_by_provider?.[form.voice_tts_provider] ?? [],
      ttsVoiceOptions: options.tts_voices_by_model?.[form.voice_tts_model] ?? [],
    }),
    [form.voice_stt_provider, form.voice_tts_model, form.voice_tts_provider, options],
  );

  const setField = useCallback(
    <K extends keyof OrganizationAiSettingsForm>(key: K, value: OrganizationAiSettingsForm[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const setVoiceMode = useCallback(
    (mode: string) => {
      setForm((current) => {
        if (mode !== "pipeline") {
          return { ...current, voice_mode: mode };
        }

        const openAiModels = options.tts_models_by_provider?.openai ?? [];
        const openAiModel = openAiModels.includes(current.voice_tts_model)
          ? current.voice_tts_model
          : openAiModels[0] ?? current.voice_tts_model;
        const openAiVoices = options.tts_voices_by_model?.[openAiModel] ?? [];

        if (current.voice_tts_provider !== "elevenlabs" || current.elevenlabs_voice_id.trim()) {
          return { ...current, voice_mode: mode };
        }

        return {
          ...current,
          voice_mode: mode,
          voice_tts_provider: "openai",
          voice_tts_model: openAiModel,
          voice_tts_voice: openAiVoices.includes(current.voice_tts_voice)
            ? current.voice_tts_voice
            : openAiVoices[0] ?? current.voice_tts_voice,
        };
      });
    },
    [options.tts_models_by_provider, options.tts_voices_by_model],
  );

  const setSttProvider = useCallback(
    (provider: string) => {
      setForm((current) => {
        const nextModels = options.stt_models_by_provider?.[provider] ?? [];
        return {
          ...current,
          voice_stt_provider: provider,
          voice_stt_model: nextModels.includes(current.voice_stt_model)
            ? current.voice_stt_model
            : nextModels[0] ?? "",
        };
      });
    },
    [options.stt_models_by_provider],
  );

  const setTtsProvider = useCallback(
    (provider: string) => {
      setForm((current) => {
        const nextModels = options.tts_models_by_provider?.[provider] ?? [];
        const nextModel = nextModels.includes(current.voice_tts_model) ? current.voice_tts_model : nextModels[0] ?? "";
        const nextVoices = options.tts_voices_by_model?.[nextModel] ?? [];
        const nextElevenLabsModels = options.elevenlabs_models ?? options.tts_models_by_provider?.elevenlabs ?? [];
        const nextElevenLabsModel = nextElevenLabsModels.includes(current.elevenlabs_model)
          ? current.elevenlabs_model
          : nextElevenLabsModels[0] ?? "";

        return {
          ...current,
          voice_tts_provider: provider,
          voice_tts_model: nextModel,
          elevenlabs_model: provider === "elevenlabs" ? nextElevenLabsModel : current.elevenlabs_model,
          voice_tts_voice: nextVoices.includes(current.voice_tts_voice) ? current.voice_tts_voice : nextVoices[0] ?? "",
        };
      });
    },
    [options.elevenlabs_models, options.tts_models_by_provider, options.tts_voices_by_model],
  );

  const setTtsModel = useCallback(
    (model: string) => {
      setForm((current) => {
        const nextVoices = options.tts_voices_by_model?.[model] ?? [];

        return {
          ...current,
          voice_tts_model: model,
          voice_tts_voice: nextVoices.includes(current.voice_tts_voice) ? current.voice_tts_voice : nextVoices[0] ?? "",
        };
      });
    },
    [options.tts_voices_by_model],
  );

  const applyTemplate = useCallback((template: Partial<OrganizationAiSettings> & { name: string }) => {
    setForm((current) => ({
      ...current,
      ...toAiSettingsForm({ ...current, ...template } as OrganizationAiSettings),
    }));
  }, []);

  const reload = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await fetchOrganizationAiSettings(organizationId);
      if (requestIdRef.current !== requestId) return;

      setForm(toAiSettingsForm(data.settings));
      setOptions(data.options ?? {});
      setHasLoaded(true);
    } catch (err) {
      if (requestIdRef.current === requestId) {
        setError(err instanceof Error ? err.message : "AI 설정을 불러오지 못했습니다.");
      }
    } finally {
      if (requestIdRef.current === requestId) setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
      requestIdRef.current += 1;
    };
  }, [reload]);

  const save = useCallback(async () => {
    const validationError = validateAiSettingsForm(form, options);
    if (validationError) {
      setError(validationError);
      setMessage(null);
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await updateOrganizationAiSettings(organizationId, form);
      setForm(toAiSettingsForm(updated));
      setHasLoaded(true);
      setMessage("AI 설정이 저장됐습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 설정 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [form, options, organizationId]);

  return {
    form,
    options,
    ...derivedOptions,
    error,
    message,
    hasLoaded,
    isLoading,
    isSaving,
    isInitialLoading: isLoading && !hasLoaded,
    isRealtimeMode: form.voice_mode === "realtime",
    setField,
    setVoiceMode,
    setSttProvider,
    setTtsProvider,
    setTtsModel,
    applyTemplate,
    reload,
    save,
  };
}

export type SettingsWorkspaceState = ReturnType<typeof useSettingsWorkspace>;
