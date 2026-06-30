"use client";

import { AlertTriangle, ChevronDown, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button, Card, Modal, ModalActions, PageHeader, SectionTitle, Toggle } from "../../ui";
import type { RuleCreateInput, RuleItem, RuleUpdateInput } from "../types";

// 규칙은 응답 생성 시 매번 전체가 LLM 프롬프트에 그대로 주입된다.
// 너무 많으면 지시가 희석되고 토큰 비용도 늘어나므로 개수를 제한한다.
const MAX_RULES = 10;

// 빌트인 규칙은 지시문에 "- " 항목별 줄바꿈이 들어있어, 카드 미리보기에서
// 줄바꿈이 그대로 렌더링되며 카드가 길어진다. 한 줄로 압축해 truncate가 먹히게 한다.
function toSingleLine(text: string) {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

export function RulesSection({
  rules,
  isLoading,
  isMutating,
  error,
  onCreate,
  onUpdate,
  onResetBuiltin,
  onDelete,
}: {
  rules: RuleItem[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onCreate: (input: RuleCreateInput) => Promise<RuleItem>;
  onUpdate: (ruleId: string, data: RuleUpdateInput) => Promise<void>;
  onResetBuiltin: (ruleId: string) => Promise<void>;
  onDelete: (ruleId: string) => Promise<void>;
}) {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const isAtRuleLimit = rules.length >= MAX_RULES;

  const handleDelete = async (rule: RuleItem) => {
    if (rule.isBuiltin) return;
    if (!window.confirm(`"${rule.name}" 규칙을 삭제할까요?`)) return;
    await onDelete(rule.id);
    setExpandedRuleId((current) => (current === rule.id ? null : current));
  };

  return (
    <>
      <PageHeader
        title="규칙"
        description="AI가 항상 따라야 할 지시문을 관리합니다."
        action="규칙 추가"
        onAction={() => setIsCreateOpen(true)}
        actionVariant="primary"
        actionDisabled={isAtRuleLimit}
      />

      {error && (
        <section className="mb-5 rounded-[16px] bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-700">
          Rules API 오류: {error}
        </section>
      )}

      <section className="mb-5 flex items-center gap-3 rounded-[20px] bg-orange-50 px-5 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500" />
        <p className="truncate text-[13px] font-bold text-orange-700">
          규칙은 지식보다 우선 — 활성 규칙이 지식 문서 내용보다 먼저 적용됩니다.
        </p>
      </section>

      <RuleStatusOverview rules={rules} isLoading={isLoading} />

      {isLoading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((index) => (
            <RuleCardSkeleton key={index} />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-bold">등록된 규칙이 없습니다</h3>
              <p className="mt-2 text-[14px] font-semibold text-gray-500">
                규칙 추가 버튼으로 새 규칙을 만들 수 있습니다.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              isExpanded={expandedRuleId === rule.id}
              isMutating={isMutating}
              onToggleExpand={() => setExpandedRuleId((current) => (current === rule.id ? null : rule.id))}
              onUpdate={(data) => onUpdate(rule.id, data)}
              onResetBuiltin={() => onResetBuiltin(rule.id)}
              onDelete={() => handleDelete(rule)}
            />
          ))}
        </div>
      )}

      {isCreateOpen && (
        <RuleCreateModal
          isMutating={isMutating}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={async (input) => {
            await onCreate(input);
            setIsCreateOpen(false);
          }}
        />
      )}
    </>
  );
}

function RuleStatusOverview({ rules, isLoading }: { rules: RuleItem[]; isLoading: boolean }) {
  const activeCount = rules.filter((rule) => rule.active).length;
  const isAtLimit = rules.length >= MAX_RULES;

  return (
    <section className="mb-5 flex items-center gap-3 rounded-[16px] bg-[#fafafa] px-5 py-3">
      <ShieldCheck className="h-4 w-4 shrink-0 text-blue-500" />
      <span className="text-[13px] font-bold text-gray-400">규칙 현황</span>
      <span className="text-[13px] font-extrabold text-gray-900">
        {isLoading ? "-" : rules.length} / {MAX_RULES}개
      </span>
      <span className="text-[13px] font-bold text-blue-500">작동중 {isLoading ? "-" : activeCount}개</span>
      {isAtLimit && <span className="ml-auto shrink-0 text-[12px] font-bold text-orange-500">최대 개수 도달</span>}
    </section>
  );
}

function RuleCard({
  rule,
  isExpanded,
  isMutating,
  onToggleExpand,
  onUpdate,
  onResetBuiltin,
  onDelete,
}: {
  rule: RuleItem;
  isExpanded: boolean;
  isMutating: boolean;
  onToggleExpand: () => void;
  onUpdate: (data: RuleUpdateInput) => Promise<void>;
  onResetBuiltin: () => void;
  onDelete: () => void;
}) {
  const [instruction, setInstruction] = useState(rule.instruction);
  const [active, setActive] = useState(rule.active);

  const isDirty = useMemo(
    () => instruction !== rule.instruction || active !== rule.active,
    [instruction, active, rule],
  );

  // 펼칠 때마다 최신 rule 값으로 편집 폼을 초기화한다(접혀 있는 동안 외부에서
  // 갱신된 값이 있어도 펼치는 시점에만 반영해 편집 중 덮어쓰기를 피한다).
  const handleToggleExpand = () => {
    if (!isExpanded) {
      setInstruction(rule.instruction);
      setActive(rule.active);
    }
    onToggleExpand();
  };

  const handleSave = async () => {
    await onUpdate({ instruction, is_active: active });
  };

  return (
    <Card size="sm" className="min-w-0 overflow-hidden pl-6">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <button type="button" onClick={handleToggleExpand} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 truncate text-[16px] font-bold">{rule.name}</h3>
              {rule.isBuiltin && (
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                  기본 제공
                </span>
              )}
            </div>
            <p className="truncate text-[13px] font-semibold text-gray-500">{toSingleLine(rule.instruction)}</p>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-4">
          <Toggle enabled={rule.active} onChange={() => onUpdate({ is_active: !rule.active })} disabled={isMutating} />
          <button
            type="button"
            onClick={handleToggleExpand}
            className="rounded-full p-1.5 text-gray-700 transition-colors hover:bg-[#f2f2f2]"
            aria-label={isExpanded ? "접기" : "펼치기"}
          >
            <ChevronDown className={`h-6 w-6 stroke-[2.5] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-gray-100 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle icon={<ShieldCheck className="h-5 w-5 text-blue-500" />} title="지시문" />
                <span className="text-[12px] font-semibold text-gray-400">{instruction.length} / 200자</span>
              </div>

              <textarea
                value={instruction}
                onChange={(event) => setInstruction(event.target.value.slice(0, 200))}
                rows={3}
                className="w-full resize-none rounded-[20px] bg-[#f7f7f7] p-5 text-[15px] font-semibold leading-relaxed text-gray-700 outline-none"
              />

              <div className="mt-5 flex items-center justify-between gap-3">
                {rule.isBuiltin ? (
                  <Button variant="secondary" onClick={onResetBuiltin} disabled={isMutating}>
                    <RotateCcw className="h-4 w-4" />
                    기본값으로 복구
                  </Button>
                ) : (
                  <Button variant="danger" onClick={onDelete} disabled={isMutating}>
                    <Trash2 className="h-4 w-4" />
                    규칙 삭제
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setInstruction(rule.instruction);
                      setActive(rule.active);
                    }}
                    disabled={!isDirty}
                  >
                    취소
                  </Button>
                  <Button variant="primary" size="lg" onClick={handleSave} disabled={!isDirty || isMutating}>
                    {isMutating ? "저장중" : "저장"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function RuleCardSkeleton() {
  return (
    <Card size="sm">
      <div className="flex animate-pulse items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-32 rounded-full bg-gray-200" />
            <div className="h-5 w-12 rounded-full bg-gray-100" />
          </div>
          <div className="h-4 w-56 rounded-full bg-gray-100" />
        </div>
        <div className="h-6 w-11 shrink-0 rounded-full bg-gray-200" />
      </div>
    </Card>
  );
}

function RuleCreateModal({
  isMutating,
  onClose,
  onSubmit,
}: {
  isMutating: boolean;
  onClose: () => void;
  onSubmit: (input: RuleCreateInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !instruction.trim()) {
      setError("규칙 이름과 지시문을 입력해 주세요.");
      return;
    }
    setError(null);
    await onSubmit({ name: name.trim(), instruction: instruction.trim(), is_active: isActive });
  };

  return (
    <Modal title="규칙 추가" onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[12px] font-bold text-gray-500">규칙 이름</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold outline-none"
            placeholder="예: 불만 고객 상담원 전환"
          />
        </label>
        <label className="block">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[12px] font-bold text-gray-500">지시문</span>
            <span className="text-[12px] font-semibold text-gray-400">{instruction.length} / 200자</span>
          </div>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value.slice(0, 200))}
            rows={3}
            className="w-full resize-none rounded-[12px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold leading-relaxed outline-none"
            placeholder="AI가 따라야 할 규칙 내용을 입력하세요."
          />
        </label>
        <label className="flex items-center justify-between rounded-[12px] bg-[#f7f7f7] px-4 py-3">
          <span className="text-[13px] font-bold text-gray-700">바로 작동</span>
          <Toggle enabled={isActive} onChange={() => setIsActive((v) => !v)} />
        </label>
        {error && <p className="text-[12px] font-bold text-red-500">{error}</p>}
        <ModalActions isSubmitting={isMutating} submitLabel="추가" onClose={onClose} onSubmit={handleSubmit} />
      </div>
    </Modal>
  );
}
