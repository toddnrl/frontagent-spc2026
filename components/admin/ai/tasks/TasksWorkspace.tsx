"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { AiCosDetailPanel } from "../AiCosDetailPanel";
import { TasksSection } from "./TasksSection";
import { useTasksWorkspace } from "./useTasksWorkspace";

export function TasksWorkspace({ organizationId, user }: { organizationId: string; user?: User | null }) {
  const workspace = useTasksWorkspace(organizationId);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <>
      <div
        className={
          isBuilderOpen
            ? "col-span-2 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-white p-8"
            : "min-h-0 min-w-0 overflow-y-auto rounded-[20px] bg-white p-8 [scrollbar-gutter:stable]"
        }
      >
        <TasksSection
          taskFlows={workspace.taskFlows}
          taskNodesByFlowId={workspace.taskNodesByFlowId}
          taskEdgesByFlowId={workspace.taskEdgesByFlowId}
          isLoading={workspace.isTasksLoading}
          isMutating={workspace.isTasksMutating}
          error={workspace.tasksError}
          testResults={workspace.taskTestResults}
          onCreate={workspace.handleCreateTaskFlow}
          onUpdate={workspace.handleUpdateTaskFlow}
          onDelete={workspace.handleDeleteTaskFlow}
          onTest={workspace.handleTestTaskFlow}
          onCreateNode={workspace.handleCreateTaskNode}
          onUpdateNode={workspace.handleUpdateTaskNode}
          onDeleteNode={workspace.handleDeleteTaskNode}
          onUpsertEdge={workspace.handleUpsertTaskEdge}
          onClearEdges={workspace.handleClearTaskEdges}
          onBuilderOpenChange={setIsBuilderOpen}
        />
      </div>
      {!isBuilderOpen && <AiCosDetailPanel activeSection="tasks" organizationId={organizationId} user={user} />}
    </>
  );
}
