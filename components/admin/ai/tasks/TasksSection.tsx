import { MoreVertical, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Dropdown } from "@/components/ui/Dropdown";
import { BUILDER_ENTER_DELAY_MS, BUILDER_EXIT_MS, LAYOUT_SPRING } from "../layoutMotion";
import type {
  TaskEdge,
  TaskFlow,
  TaskFlowCreateInput,
  TaskFlowGenerateFromBriefResponse,
  TaskFlowGenerateResponse,
  TaskFlowTestResult,
  TaskFlowUpdateInput,
  TaskNode,
  TaskNodeCreateInput,
  TaskNodeUpdateInput,
} from "../types";
import { PageHeader } from "./common";
import { defaultTriggerDescription } from "./nodeHelpers";
import { TaskBuilderPage } from "./TaskBuilderPage";
import { TaskGenerateModal } from "./TaskGenerateModal";

export function TasksSection({
  organizationId,
  taskFlows,
  taskNodesByFlowId,
  taskEdgesByFlowId,
  isLoading,
  isMutating,
  error,
  testResults,
  onCreate,
  onUpdate,
  onSaveDraft,
  onDelete,
  onTest,
  onUpsertEdge,
  onClearEdges,
  onRefresh,
  onBuilderOpenChange,
}: {
  organizationId: string;
  taskFlows: TaskFlow[];
  taskNodesByFlowId: Record<string, TaskNode[]>;
  taskEdgesByFlowId: Record<string, TaskEdge[]>;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  testResults: Record<string, TaskFlowTestResult>;
  onCreate: (input: TaskFlowCreateInput) => Promise<TaskFlow>;
  onUpdate: (flowId: string, data: TaskFlowUpdateInput) => Promise<void>;
  onSaveDraft: (
    flowId: string,
    draftNodes: TaskNode[],
    deletedNodeIds: string[],
    flowInput: TaskFlowUpdateInput,
  ) => Promise<void>;
  onDelete: (flowId: string) => Promise<void>;
  onTest: (flowId: string, message: string) => Promise<void>;
  onUpsertEdge: (
    flowId: string,
    sourceNodeKey: string,
    targetNodeKey: string,
    options?: { isFailureEdge?: boolean; conditionConfig?: Record<string, unknown>; clearFailureEdges?: boolean },
  ) => Promise<void>;
  onClearEdges: (
    flowId: string,
    sourceNodeKey: string,
    options?: { failureOnly?: boolean; primaryOnly?: boolean },
  ) => Promise<void>;
  onRefresh: () => Promise<void>;
  onBuilderOpenChange?: (isOpen: boolean) => void;
}) {
  const [builderFlowId, setBuilderFlowId] = useState<string | null>(null);
  const [builderFlowDraft, setBuilderFlowDraft] = useState<TaskFlow | null>(null);
  const [showBuilderContent, setShowBuilderContent] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const onBuilderOpenChangeRef = useRef(onBuilderOpenChange);

  useEffect(() => {
    onBuilderOpenChangeRef.current = onBuilderOpenChange;
  }, [onBuilderOpenChange]);

  const clearTransitionTimer = () => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const openBuilder = (flowId: string, flowDraft: TaskFlow | null = null) => {
    clearTransitionTimer();
    setBuilderFlowDraft(flowDraft);
    setBuilderFlowId(flowId);
    onBuilderOpenChange?.(true);
    transitionTimerRef.current = window.setTimeout(() => {
      setShowBuilderContent(true);
      transitionTimerRef.current = null;
    }, BUILDER_ENTER_DELAY_MS);
  };

  const closeBuilder = () => {
    clearTransitionTimer();
    setShowBuilderContent(false);
    transitionTimerRef.current = window.setTimeout(() => {
      setBuilderFlowId(null);
      setBuilderFlowDraft(null);
      onBuilderOpenChange?.(false);
      transitionTimerRef.current = null;
    }, BUILDER_EXIT_MS);
  };

  useEffect(() => {
    return () => {
      clearTransitionTimer();
      onBuilderOpenChangeRef.current?.(false);
    };
  }, []);

  const handleDelete = async (flow: TaskFlow) => {
    if (!window.confirm(`${flow.name} 태스크를 삭제할까요?`)) return;
    await onDelete(flow.id);
  };

  const handleCreateTaskAndOpen = async () => {
    openBuilder("__new__");
  };

  const handleGenerateComplete = async (result: {
    message: string;
    openFlowId: string | null;
    response: TaskFlowGenerateResponse | TaskFlowGenerateFromBriefResponse;
  }) => {
    setIsGenerateOpen(false);
    setGenerateMessage(result.message);
    await onRefresh();
    if (result.openFlowId) {
      openBuilder(result.openFlowId);
    }
  };

  if (builderFlowId) {
    const flow = taskFlows.find((item) => item.id === builderFlowId) ?? (
      builderFlowDraft?.id === builderFlowId ? builderFlowDraft : null
    );
    const nodes = flow ? taskNodesByFlowId[flow.id] ?? [] : [];
    const edges = flow ? taskEdgesByFlowId[flow.id] ?? [] : [];
    const handleCreateFromBuilder = async (input: TaskFlowCreateInput) => {
      const created = await onCreate(input);
      openBuilder(created.id, created);
      return created;
    };

    return (
      <motion.div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        initial={false}
        animate={{
          opacity: showBuilderContent ? 1 : 0,
          x: showBuilderContent ? 0 : -16,
        }}
        transition={LAYOUT_SPRING}
        style={{ pointerEvents: showBuilderContent ? "auto" : "none" }}
      >
        <TaskBuilderPage
          flow={flow}
          nodes={nodes}
          edges={edges}
          isMutating={isMutating}
          error={error}
          onBack={closeBuilder}
          onCreate={handleCreateFromBuilder}
          onSaveDraft={onSaveDraft}
        />
      </motion.div>
    );
  }

  return (
    <>
      <PageHeader
        title="태스크"
        description="AI가 실제로 실행하는 예약, 환불, 알림, 상담원 연결 워크플로우입니다."
        secondaryAction="AI로 생성"
        secondaryActionIcon={<Sparkles className="h-4 w-4" />}
        onSecondaryAction={() => {
          setGenerateMessage(null);
          setIsGenerateOpen(true);
        }}
        secondaryActionDisabled={isMutating}
        action="태스크 추가"
        onAction={handleCreateTaskAndOpen}
        actionDisabled={isMutating}
      />
      {generateMessage && (
        <div className="mb-4 rounded-[16px] bg-blue-50 px-4 py-3 text-[13px] font-bold text-blue-700">
          {generateMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-[16px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="grid gap-3" aria-busy="true" aria-label="태스크 불러오는 중">
          {[0, 1, 2].map((index) => (
            <TaskCardSkeleton key={index} />
          ))}
        </div>
      ) : taskFlows.length === 0 ? (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-bold">아직 등록된 태스크가 없습니다</h3>
              <p className="mt-2 text-[14px] font-semibold text-gray-500">
                AI로 생성하거나 직접 추가해서 첫 태스크 플로우를 만드세요.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  setGenerateMessage(null);
                  setIsGenerateOpen(true);
                }}
                disabled={isMutating}
              >
                <Sparkles className="h-4 w-4" />
                AI로 생성
              </Button>
              <Button variant="secondary" onClick={handleCreateTaskAndOpen} disabled={isMutating}>
                <Plus className="h-4 w-4" />
                추가
              </Button>
            </div>
          </div>
        </Card>
      ) : (
      <div className="grid gap-3">
        {taskFlows.map((task) => (
          <Card key={task.id} size="sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="truncate text-[16px] font-bold">{task.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      task.isEnabled ? "bg-blue-50 text-blue-600" : "bg-[#f2f2f2] text-gray-500"
                    }`}
                  >
                    {task.isEnabled ? "활성" : "비활성"}
                  </span>
                </div>
                <p className="truncate text-[13px] font-semibold text-gray-500">
                  {task.triggerDescription || task.description || "트리거 설명이 없습니다."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Toggle
                  enabled={task.isEnabled}
                  onChange={() => onUpdate(task.id, { is_enabled: !task.isEnabled })}
                  disabled={isMutating}
                />
                <TaskRowMenu
                  disabled={isMutating}
                  onEdit={() => openBuilder(task.id)}
                  onDelete={() => handleDelete(task)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
      {isGenerateOpen && (
        <TaskGenerateModal
          organizationId={organizationId}
          isMutating={isMutating}
          onClose={() => setIsGenerateOpen(false)}
          onComplete={handleGenerateComplete}
        />
      )}
    </>
  );
}

function TaskRowMenu({
  disabled,
  onEdit,
  onDelete,
}: {
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Dropdown
      align="end"
      trigger={
        <button
          type="button"
          disabled={disabled}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-[#f2f2f2] hover:text-gray-700 disabled:opacity-50"
          aria-label="태스크 메뉴"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
      items={[
        { label: "수정", onClick: onEdit, icon: "edit" },
        {
          label: "삭제",
          onClick: onDelete,
          icon: "delete",
          variant: "danger",
          separator: true,
        },
      ]}
    />
  );
}

function TaskCardSkeleton() {
  return (
    <Card size="sm">
      <div className="flex animate-pulse items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-4 w-36 rounded-full bg-gray-200" />
            <div className="h-5 w-11 rounded-full bg-gray-100" />
          </div>
          <div className="h-4 w-56 rounded-full bg-gray-100" />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="h-6 w-11 rounded-full bg-gray-200" />
          <div className="h-8 w-8 rounded-full bg-gray-100" />
        </div>
      </div>
    </Card>
  );
}
