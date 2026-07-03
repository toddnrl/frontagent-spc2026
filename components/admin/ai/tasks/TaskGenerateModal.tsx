"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { TabRow } from "@/components/ui/TabRow";
import { Checkbox } from "@/components/ui/Checkbox";
import type {
  TaskFlowGenerateFromBriefResponse,
  TaskFlowGenerateResponse,
  TaskFlowTemplate,
} from "../types";
import { fetchTaskFlowTemplates, generateTaskFlowFromBrief, generateTaskFlows } from "./tasksApi";

type GenerateMode = "brief" | "template";

const MODE_TABS = [
  { id: "brief", label: "설명으로 생성" },
  { id: "template", label: "템플릿 복제" },
] as const;

const ALL_TEMPLATE_OPTION = {
  templateKey: "all",
  name: "표준 예약 태스크 전체",
  description: "예약 생성, 조회, 취소 플로우를 한 번에 만듭니다.",
  nodeCount: 0,
  edgeCount: 0,
} as const;

function describeGenerateOutcome(
  response: TaskFlowGenerateResponse | TaskFlowGenerateFromBriefResponse,
) {
  const items = "items" in response ? response.items : [response.result];
  const created = items.filter((item) => item.created);
  const skipped = items.filter((item) => item.skipped);

  if (created.length === 0 && skipped.length > 0) {
    return "같은 intent의 태스크가 이미 있어 생성하지 않았습니다. 덮어쓰기를 켜면 다시 만들 수 있습니다.";
  }

  if (created.length === 1) {
    return `${created[0].name} 태스크를 생성했습니다. (${created[0].nodeCount}단계 · ${created[0].edgeCount}연결)`;
  }

  if (created.length > 1) {
    return `${created.length}개 태스크를 생성했습니다.`;
  }

  return "태스크 생성을 완료했습니다.";
}

function firstCreatedFlowId(response: TaskFlowGenerateResponse | TaskFlowGenerateFromBriefResponse) {
  const items = "items" in response ? response.items : [response.result];
  return items.find((item) => item.created)?.flowId ?? null;
}

function TemplateOptionCard({
  selected,
  title,
  description,
  meta,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  meta?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[16px] border p-4 text-left transition-colors ${
        selected
          ? "border-blue-200 bg-blue-50 ring-1 ring-blue-100"
          : "border-transparent bg-[#f7f7f7] hover:bg-[#f2f2f2]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white text-transparent"
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold text-gray-900">{title}</span>
          <span className="mt-1 block text-[12px] font-semibold leading-relaxed text-gray-500">{description}</span>
          {meta ? <span className="mt-2 block text-[11px] font-bold text-gray-400">{meta}</span> : null}
        </span>
      </div>
    </button>
  );
}

export function TaskGenerateModal({
  organizationId,
  isMutating,
  onClose,
  onComplete,
}: {
  organizationId: string;
  isMutating: boolean;
  onClose: () => void;
  onComplete: (result: {
    message: string;
    openFlowId: string | null;
    response: TaskFlowGenerateResponse | TaskFlowGenerateFromBriefResponse;
  }) => void;
}) {
  const [mode, setMode] = useState<GenerateMode>("brief");
  const [brief, setBrief] = useState("");
  const [templates, setTemplates] = useState<TaskFlowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("reservation_create");
  const [overwrite, setOverwrite] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTemplates() {
      setIsLoadingTemplates(true);
      setError(null);
      try {
        const nextTemplates = await fetchTaskFlowTemplates();
        if (!isMounted) return;
        setTemplates(nextTemplates);
        if (nextTemplates.length > 0) {
          setSelectedTemplate(nextTemplates[0].templateKey);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "템플릿 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) setIsLoadingTemplates(false);
      }
    }

    void loadTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "brief") {
        if (!brief.trim()) {
          setError("생성할 태스크를 설명해 주세요.");
          return;
        }

        const response = await generateTaskFlowFromBrief({
          organizationId,
          brief: brief.trim(),
          overwrite,
        });
        onComplete({
          message: describeGenerateOutcome(response),
          openFlowId: firstCreatedFlowId(response),
          response,
        });
        return;
      }

      const response = await generateTaskFlows({
        organizationId,
        template: selectedTemplate,
        overwrite,
      });
      onComplete({
        message: describeGenerateOutcome(response),
        openFlowId: firstCreatedFlowId(response),
        response,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "태스크 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isMutating || isSubmitting;

  return (
    <Modal
      title="AI로 태스크 생성"
      description="설명을 입력하거나 표준 템플릿을 골라 플로우를 자동 구성합니다."
      size="lg"
      onClose={onClose}
    >
      <div className="space-y-5">
        <TabRow
          tabs={[...MODE_TABS]}
          active={mode}
          onChange={(tabId) => {
            setMode(tabId as GenerateMode);
            setError(null);
          }}
          className="text-[13px]"
        />

        {mode === "brief" ? (
          <div className="space-y-2">
            <label className="block">
              <span className="mb-2 block text-[12px] font-extrabold text-gray-400">태스크 설명</span>
              <textarea
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                rows={6}
                className="w-full resize-none rounded-[16px] bg-[#f7f7f7] px-4 py-3.5 text-[14px] font-semibold leading-relaxed text-gray-800 outline-none placeholder:text-gray-300"
                placeholder="예: 고객이 청소 예약을 원하면 서비스, 날짜, 시간, 연락처, 성함을 받아서 예약 접수해줘."
              />
            </label>
            <div className="flex items-start gap-2 rounded-[14px] bg-blue-50 px-3.5 py-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-[12px] font-semibold leading-relaxed text-blue-700">
                AI가 설명을 분석해 적합한 템플릿과 트리거, 노드 연결을 자동으로 구성합니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {isLoadingTemplates ? (
              <div className="flex items-center gap-2 rounded-[16px] bg-[#f7f7f7] px-4 py-4 text-[13px] font-bold text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                템플릿 불러오는 중…
              </div>
            ) : (
              <>
                {templates.map((template) => (
                  <TemplateOptionCard
                    key={template.templateKey}
                    selected={selectedTemplate === template.templateKey}
                    title={template.name}
                    description={template.description}
                    meta={`${template.nodeCount}단계 · ${template.edgeCount}연결`}
                    onSelect={() => setSelectedTemplate(template.templateKey)}
                  />
                ))}
                <TemplateOptionCard
                  selected={selectedTemplate === ALL_TEMPLATE_OPTION.templateKey}
                  title={ALL_TEMPLATE_OPTION.name}
                  description={ALL_TEMPLATE_OPTION.description}
                  meta="생성 · 조회 · 취소"
                  onSelect={() => setSelectedTemplate(ALL_TEMPLATE_OPTION.templateKey)}
                />
              </>
            )}
          </div>
        )}

        <Checkbox
          boxed
          checked={overwrite}
          onChange={setOverwrite}
          label="기존 태스크 덮어쓰기"
          description="같은 trigger intent가 있으면 삭제 후 다시 생성합니다."
        />

        {error ? (
          <div className="rounded-[14px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">{error}</div>
        ) : null}

        <ModalActions
          isSubmitting={busy}
          submitLabel="태스크 생성"
          submitVariant="primary"
          onClose={onClose}
          onSubmit={() => {
            void handleSubmit();
          }}
        />
      </div>
    </Modal>
  );
}
