"use client";

import { MoreVertical, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Toggle } from "../../ui";
import { BUILDER_ENTER_DELAY_MS, BUILDER_EXIT_MS, LAYOUT_SPRING } from "../layoutMotion";
import type {
  TaskEdge,
  TaskFlow,
  TaskFlowCreateInput,
  TaskFlowTestResult,
  TaskFlowUpdateInput,
  TaskNode,
  TaskNodeCreateInput,
  TaskNodeUpdateInput,
} from "../types";
import { PageHeader } from "./common";
import { defaultTriggerDescription } from "./nodeHelpers";
import { TaskBuilderPage } from "./TaskBuilderPage";

export function TasksSection({
  taskFlows,
  taskNodesByFlowId,
  taskEdgesByFlowId,
  isLoading,
  isMutating,
  error,
  testResults,
  onCreate,
  onUpdate,
  onDelete,
  onTest,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onUpsertEdge,
  onClearEdges,
  onBuilderOpenChange,
}: {
  taskFlows: TaskFlow[];
  taskNodesByFlowId: Record<string, TaskNode[]>;
  taskEdgesByFlowId: Record<string, TaskEdge[]>;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  testResults: Record<string, TaskFlowTestResult>;
  onCreate: (input: TaskFlowCreateInput) => Promise<TaskFlow>;
  onUpdate: (flowId: string, data: TaskFlowUpdateInput) => Promise<void>;
  onDelete: (flowId: string) => Promise<void>;
  onTest: (flowId: string, message: string) => Promise<void>;
  onCreateNode: (flowId: string, input: TaskNodeCreateInput, sourceNodeKey?: string) => Promise<TaskNode>;
  onUpdateNode: (flowId: string, nodeId: string, input: TaskNodeUpdateInput) => Promise<void>;
  onDeleteNode: (flowId: string, nodeId: string) => Promise<void>;
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
  onBuilderOpenChange?: (isOpen: boolean) => void;
}) {
  const [builderFlowId, setBuilderFlowId] = useState<string | null>(null);
  const [builderFlowDraft, setBuilderFlowDraft] = useState<TaskFlow | null>(null);
  const [showBuilderContent, setShowBuilderContent] = useState(false);
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
    const created = await onCreate({
      name: "새 태스크",
      trigger_description: defaultTriggerDescription,
      allowed_channels: ["chat", "voice"],
      is_enabled: true,
    });
    openBuilder(created.id, created);
  };

  if (builderFlowId) {
    const flow = taskFlows.find((item) => item.id === builderFlowId) ?? (
      builderFlowDraft?.id === builderFlowId ? builderFlowDraft : null
    );
    const nodes = flow ? taskNodesByFlowId[flow.id] ?? [] : [];
    const edges = flow ? taskEdgesByFlowId[flow.id] ?? [] : [];

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
          onCreate={onCreate}
          onUpdate={onUpdate}
          onCreateNode={onCreateNode}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onUpsertEdge={onUpsertEdge}
          onClearEdges={onClearEdges}
        />
      </motion.div>
    );
  }

  return (
    <>
      <PageHeader
        title="태스크"
        description="AI가 실제로 실행하는 예약, 환불, 알림, 상담원 연결 워크플로우입니다."
        action="태스크 추가"
        onAction={handleCreateTaskAndOpen}
        actionDisabled={isMutating}
      />
      {error && (
        <div className="mb-4 rounded-[16px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="grid gap-5">
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
                트리거 조건을 입력해 첫 태스크 플로우를 만드세요.
              </p>
            </div>
            <Button variant="dark" onClick={handleCreateTaskAndOpen} disabled={isMutating}>
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>
        </Card>
      ) : (
      <div className="grid grid-cols-1 gap-3">
        {taskFlows.map((task) => (
          <Card key={task.id} size="sm" className="min-w-0 overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="min-w-0 truncate text-[16px] font-bold">{task.name}</h3>
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={disabled}
        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-[#f2f2f2] hover:text-gray-700 disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-36 rounded-[20px] bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="block w-full rounded-[14px] px-3.5 py-2.5 text-left text-[13px] font-bold text-gray-700 transition-colors hover:bg-[#f2f2f2]"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="block w-full rounded-[14px] px-3.5 py-2.5 text-left text-[13px] font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 animate-pulse">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-5 w-40 rounded-full bg-gray-200" />
            <div className="h-5 w-12 rounded-full bg-gray-100" />
          </div>
          <div className="h-4 w-64 rounded-full bg-gray-100" />
        </div>
        <div className="flex shrink-0 items-center gap-2 animate-pulse">
          <div className="h-9 w-16 rounded-full bg-gray-200" />
          <div className="h-9 w-14 rounded-full bg-gray-100" />
          <div className="h-9 w-9 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="h-16 animate-pulse rounded-[18px] bg-[#f7f7f7]" />
    </Card>
  );
}
