"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  createTaskEdge,
  createTaskFlow,
  createTaskNode,
  deleteTaskEdge,
  deleteTaskFlow,
  deleteTaskNode,
  fetchTaskEdges,
  fetchTaskFlows,
  fetchTaskNodes,
  isFallbackTaskEdge,
  mapTaskFlowInput,
  testTaskFlow,
  updateTaskEdge,
  updateTaskFlow,
  updateTaskNode,
} from "./tasksApi";

export function useTasksWorkspace(organizationId: string) {
  const [taskFlows, setTaskFlows] = useState<TaskFlow[]>([]);
  const [taskNodesByFlowId, setTaskNodesByFlowId] = useState<Record<string, TaskNode[]>>({});
  const [taskEdgesByFlowId, setTaskEdgesByFlowId] = useState<Record<string, TaskEdge[]>>({});
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTasksMutating, setIsTasksMutating] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [taskTestResults, setTaskTestResults] = useState<Record<string, TaskFlowTestResult>>({});

  const reloadTasks = useCallback(async () => {
    setIsTasksLoading(true);
    setTasksError(null);

    try {
      const nextFlows = await fetchTaskFlows(organizationId);
      setTaskFlows(nextFlows);

      const nodeEntries = await Promise.all(
        nextFlows.map(async (flow) => {
          try {
            return [flow.id, await fetchTaskNodes(flow.id)] as const;
          } catch {
            return [flow.id, []] as const;
          }
        }),
      );
      const edgeEntries = await Promise.all(
        nextFlows.map(async (flow) => {
          try {
            return [flow.id, await fetchTaskEdges(flow.id)] as const;
          } catch {
            return [flow.id, []] as const;
          }
        }),
      );
      setTaskNodesByFlowId(Object.fromEntries(nodeEntries));
      setTaskEdgesByFlowId(Object.fromEntries(edgeEntries));
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "태스크 API 조회 실패");
    } finally {
      setIsTasksLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (isMounted) await reloadTasks();
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [reloadTasks]);

  const handleCreateTaskFlow = async (input: TaskFlowCreateInput) => {
    setIsTasksMutating(true);
    setTasksError(null);

    try {
      const created = await createTaskFlow({ organizationId, data: input });
      await reloadTasks();
      return created;
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "태스크 추가 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleUpdateTaskFlow = async (flowId: string, input: TaskFlowUpdateInput) => {
    const previousFlows = taskFlows;
    setIsTasksMutating(true);
    setTasksError(null);
    setTaskFlows((current) => current.map((flow) => (flow.id === flowId ? { ...flow, ...mapTaskFlowInput(input) } : flow)));

    try {
      const updated = await updateTaskFlow({ flowId, data: input });
      setTaskFlows((current) => current.map((flow) => (flow.id === flowId ? updated : flow)));
    } catch (error) {
      setTaskFlows(previousFlows);
      setTasksError(error instanceof Error ? error.message : "태스크 수정 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleDeleteTaskFlow = async (flowId: string) => {
    setIsTasksMutating(true);
    setTasksError(null);

    try {
      await deleteTaskFlow(flowId);
      setTaskTestResults((current) => {
        const next = { ...current };
        delete next[flowId];
        return next;
      });
      await reloadTasks();
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "태스크 삭제 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleCreateTaskNode = async (flowId: string, input: TaskNodeCreateInput, sourceNodeKey?: string) => {
    setIsTasksMutating(true);
    setTasksError(null);

    try {
      const previousNodes = taskNodesByFlowId[flowId] ?? [];
      const created = await createTaskNode({
        flowId,
        data: {
          ...input,
          position_x: input.position_x ?? 80 + previousNodes.length * 220,
          position_y: input.position_y ?? 80 + (previousNodes.length % 2) * 140,
        },
      });
      setTaskNodesByFlowId((current) => ({
        ...current,
        [flowId]: [...(current[flowId] ?? []), created],
      }));

      const edgeSourceNodeKey = sourceNodeKey ?? previousNodes[previousNodes.length - 1]?.nodeKey;
      if (edgeSourceNodeKey) {
        await createTaskEdge({
          flowId,
          sourceNodeKey: edgeSourceNodeKey,
          targetNodeKey: created.nodeKey,
        });
      }

      await reloadTasks();
      return created;
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "노드 추가 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleUpdateTaskNode = async (flowId: string, nodeId: string, input: TaskNodeUpdateInput) => {
    const previousNodes = taskNodesByFlowId[flowId] ?? [];
    setIsTasksMutating(true);
    setTasksError(null);
    setTaskNodesByFlowId((current) => ({
      ...current,
      [flowId]: (current[flowId] ?? []).map((node) =>
        node.id === nodeId
          ? {
              ...node,
              nodeKey: input.node_key ?? node.nodeKey,
              nodeType: input.node_type ?? node.nodeType,
              label: input.label ?? node.label,
              config: input.config ?? node.config,
              code: input.code ?? node.code,
              positionX: input.position_x ?? node.positionX,
              positionY: input.position_y ?? node.positionY,
              timeoutSeconds: input.timeout_seconds ?? node.timeoutSeconds,
              retryLimit: input.retry_limit ?? node.retryLimit,
            }
          : node,
      ),
    }));

    try {
      await updateTaskNode({ flowId, nodeId, data: input });
      await reloadTasks();
    } catch (error) {
      setTaskNodesByFlowId((current) => ({ ...current, [flowId]: previousNodes }));
      setTasksError(error instanceof Error ? error.message : "노드 수정 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleDeleteTaskNode = async (flowId: string, nodeId: string) => {
    setIsTasksMutating(true);
    setTasksError(null);

    try {
      await deleteTaskNode({ flowId, nodeId });
      await reloadTasks();
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "노드 삭제 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleUpsertTaskEdge = async (
    flowId: string,
    sourceNodeKey: string,
    targetNodeKey: string,
    options?: { isFailureEdge?: boolean; conditionConfig?: Record<string, unknown>; clearFailureEdges?: boolean },
  ) => {
    if (!targetNodeKey) return;
    setIsTasksMutating(true);
    setTasksError(null);

    try {
      const isFailureEdge = options?.isFailureEdge ?? false;
      const existingEdge = (taskEdgesByFlowId[flowId] ?? []).find(
        (edge) => edge.sourceNodeKey === sourceNodeKey && isFallbackTaskEdge(edge) === isFailureEdge,
      );

      if (existingEdge) {
        const updatedEdge = await updateTaskEdge({
          flowId,
          edgeId: existingEdge.id,
          data: {
            target_node_key: targetNodeKey,
            edge_type: isFailureEdge ? "fallback" : "single",
            condition_type: isFailureEdge ? "fallback" : "always",
            condition_config: options?.conditionConfig ?? existingEdge.conditionConfig ?? {},
            is_failure_edge: isFailureEdge,
          },
        });
        setTaskEdgesByFlowId((current) => ({
          ...current,
          [flowId]: (current[flowId] ?? []).map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge)),
        }));
      } else {
        const createdEdge = await createTaskEdge({
          flowId,
          sourceNodeKey,
          targetNodeKey,
          edgeType: isFailureEdge ? "fallback" : "single",
          conditionType: isFailureEdge ? "fallback" : "always",
          conditionConfig: options?.conditionConfig ?? {},
          isFailureEdge,
          priority: isFailureEdge ? 200 : 100,
        });
        setTaskEdgesByFlowId((current) => ({
          ...current,
          [flowId]: [...(current[flowId] ?? []), createdEdge],
        }));
      }

      if (options?.clearFailureEdges) {
        const failureEdges = (taskEdgesByFlowId[flowId] ?? []).filter(
          (edge) => edge.sourceNodeKey === sourceNodeKey && isFallbackTaskEdge(edge),
        );
        await Promise.all(failureEdges.map((edge) => deleteTaskEdge({ flowId, edgeId: edge.id })));
        if (failureEdges.length > 0) {
          setTaskEdgesByFlowId((current) => ({
            ...current,
            [flowId]: (current[flowId] ?? []).filter((edge) => !failureEdges.some((item) => item.id === edge.id)),
          }));
        }
      }

      await reloadTasks();
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "엣지 수정 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleClearTaskEdges = async (
    flowId: string,
    sourceNodeKey: string,
    options?: { failureOnly?: boolean; primaryOnly?: boolean },
  ) => {
    const targetEdges = (taskEdgesByFlowId[flowId] ?? []).filter(
      (edge) =>
        edge.sourceNodeKey === sourceNodeKey &&
        (!options?.failureOnly || isFallbackTaskEdge(edge)) &&
        (!options?.primaryOnly || !isFallbackTaskEdge(edge)),
    );
    if (targetEdges.length === 0) return;

    setIsTasksMutating(true);
    setTasksError(null);
    try {
      await Promise.all(targetEdges.map((edge) => deleteTaskEdge({ flowId, edgeId: edge.id })));
      setTaskEdgesByFlowId((current) => ({
        ...current,
        [flowId]: (current[flowId] ?? []).filter((edge) => !targetEdges.some((item) => item.id === edge.id)),
      }));
      await reloadTasks();
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "엣지 삭제 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleTestTaskFlow = async (flowId: string, message: string) => {
    setIsTasksMutating(true);
    setTasksError(null);

    try {
      const result = await testTaskFlow({ organizationId, flowId, message });
      setTaskTestResults((current) => ({ ...current, [flowId]: result }));
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "태스크 테스트 실패");
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  return {
    taskFlows,
    taskNodesByFlowId,
    taskEdgesByFlowId,
    isTasksLoading,
    isTasksMutating,
    tasksError,
    taskTestResults,
    handleCreateTaskFlow,
    handleUpdateTaskFlow,
    handleDeleteTaskFlow,
    handleCreateTaskNode,
    handleUpdateTaskNode,
    handleDeleteTaskNode,
    handleUpsertTaskEdge,
    handleClearTaskEdges,
    handleTestTaskFlow,
  };
}
