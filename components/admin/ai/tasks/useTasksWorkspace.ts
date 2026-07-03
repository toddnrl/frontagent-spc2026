"use client";

import { useCallback, useRef, useState } from "react";
import useSWR, { type KeyedMutator } from "swr";
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
  dedupeTaskEdgesByIdentity,
  deleteTaskEdge,
  deleteTaskFlow,
  deleteTaskNode,
  fetchTaskNodes,
  fetchTasksWorkspaceData,
  getTasksWorkspaceKey,
  isFallbackTaskEdge,
  mapTaskFlowInput,
  type TasksWorkspaceData,
  testTaskFlow,
  updateTaskEdge,
  updateTaskFlow,
  updateTaskNode,
} from "./tasksApi";
import {
  buildCreateInputFromTaskNode,
  buildPersistedTaskEdges,
  buildUpdateInputFromTaskNode,
  isDraftTaskNode,
} from "./nodeHelpers";

function patchTasksCache(
  mutate: KeyedMutator<TasksWorkspaceData>,
  patch: (current: TasksWorkspaceData) => TasksWorkspaceData,
) {
  return mutate((current) => (current ? patch(current) : current), { revalidate: false });
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function edgeSlotKey(edge: Pick<TaskEdge, "sourceNodeKey"> & Partial<TaskEdge>) {
  return `${edge.sourceNodeKey}:${isFallbackTaskEdge(edge as TaskEdge) ? "fallback" : "primary"}`;
}

function edgeNeedsUpdate(current: TaskEdge, desired: TaskEdge) {
  return (
    current.targetNodeKey !== desired.targetNodeKey ||
    current.edgeType !== desired.edgeType ||
    current.conditionType !== desired.conditionType ||
    (current.priority ?? 100) !== (desired.priority ?? 100) ||
    JSON.stringify(current.conditionConfig ?? {}) !== JSON.stringify(desired.conditionConfig ?? {})
  );
}

export function useTasksWorkspace(organizationId: string) {
  const swrKey = organizationId ? getTasksWorkspaceKey(organizationId) : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, () => fetchTasksWorkspaceData(organizationId));

  const taskFlows = data?.taskFlows ?? [];
  const taskNodesByFlowId = data?.taskNodesByFlowId ?? {};
  const taskEdgesByFlowId = data?.taskEdgesByFlowId ?? {};
  const taskEdgesByFlowIdRef = useRef(taskEdgesByFlowId);
  taskEdgesByFlowIdRef.current = taskEdgesByFlowId;

  const [isTasksMutating, setIsTasksMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [taskTestResults, setTaskTestResults] = useState<Record<string, TaskFlowTestResult>>({});

  const tasksError =
    mutationError ??
    (error instanceof Error ? error.message : error ? "태스크 API 조회 실패" : null);

  const refreshTasks = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const patchEdgesByFlowId = useCallback(
    (flowId: string, updater: (edges: TaskEdge[]) => TaskEdge[]) => {
      return patchTasksCache(mutate, (current) => {
        const nextEdgesByFlowId = {
          ...current.taskEdgesByFlowId,
          [flowId]: updater(current.taskEdgesByFlowId[flowId] ?? []),
        };
        taskEdgesByFlowIdRef.current = nextEdgesByFlowId;
        return { ...current, taskEdgesByFlowId: nextEdgesByFlowId };
      });
    },
    [mutate],
  );

  const handleCreateTaskFlow = async (input: TaskFlowCreateInput) => {
    setIsTasksMutating(true);
    setMutationError(null);

    try {
      const created = await createTaskFlow({ organizationId, data: input });
      await mutate();
      return created;
    } catch (error) {
      setMutationError(toErrorMessage(error, "태스크 추가 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleUpdateTaskFlow = async (flowId: string, input: TaskFlowUpdateInput) => {
    const previousData = data;
    setIsTasksMutating(true);
    setMutationError(null);

    await patchTasksCache(mutate, (current) => ({
      ...current,
      taskFlows: current.taskFlows.map((flow) =>
        flow.id === flowId ? { ...flow, ...mapTaskFlowInput(input) } : flow,
      ),
    }));

    try {
      const updated = await updateTaskFlow({ flowId, data: input });
      await patchTasksCache(mutate, (current) => ({
        ...current,
        taskFlows: current.taskFlows.map((flow) => (flow.id === flowId ? updated : flow)),
      }));
    } catch (error) {
      if (previousData) {
        await mutate(previousData, { revalidate: false });
        taskEdgesByFlowIdRef.current = previousData.taskEdgesByFlowId;
      } else {
        await mutate();
      }
      setMutationError(toErrorMessage(error, "태스크 수정 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleDeleteTaskFlow = async (flowId: string) => {
    setIsTasksMutating(true);
    setMutationError(null);

    try {
      await deleteTaskFlow(flowId);
      setTaskTestResults((current) => {
        const next = { ...current };
        delete next[flowId];
        return next;
      });
      await mutate();
    } catch (error) {
      setMutationError(toErrorMessage(error, "태스크 삭제 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleCreateTaskNode = async (flowId: string, input: TaskNodeCreateInput, sourceNodeKey?: string) => {
    setIsTasksMutating(true);
    setMutationError(null);

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

      await patchTasksCache(mutate, (current) => ({
        ...current,
        taskNodesByFlowId: {
          ...current.taskNodesByFlowId,
          [flowId]: [...(current.taskNodesByFlowId[flowId] ?? []), created],
        },
      }));

      const edgeSourceNodeKey = sourceNodeKey ?? previousNodes[previousNodes.length - 1]?.nodeKey;
      if (edgeSourceNodeKey) {
        await createTaskEdge({
          flowId,
          sourceNodeKey: edgeSourceNodeKey,
          targetNodeKey: created.nodeKey,
        });
      }

      await mutate();
      return created;
    } catch (error) {
      setMutationError(toErrorMessage(error, "노드 추가 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleUpdateTaskNode = async (flowId: string, nodeId: string, input: TaskNodeUpdateInput) => {
    const previousData = data;
    setIsTasksMutating(true);
    setMutationError(null);

    await patchTasksCache(mutate, (current) => ({
      ...current,
      taskNodesByFlowId: {
        ...current.taskNodesByFlowId,
        [flowId]: (current.taskNodesByFlowId[flowId] ?? []).map((node) =>
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
      },
    }));

    try {
      await updateTaskNode({ flowId, nodeId, data: input });
      await mutate();
    } catch (error) {
      if (previousData) {
        await mutate(previousData, { revalidate: false });
        taskEdgesByFlowIdRef.current = previousData.taskEdgesByFlowId;
      } else {
        await mutate();
      }
      setMutationError(toErrorMessage(error, "노드 수정 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleDeleteTaskNode = async (flowId: string, nodeId: string) => {
    setIsTasksMutating(true);
    setMutationError(null);

    try {
      await deleteTaskNode({ flowId, nodeId });
      await mutate();
    } catch (error) {
      setMutationError(toErrorMessage(error, "노드 삭제 실패"));
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
    setMutationError(null);

    const createEdge = async () => {
      const isFailureEdge = options?.isFailureEdge ?? false;
      return createTaskEdge({
        flowId,
        sourceNodeKey,
        targetNodeKey,
        edgeType: isFailureEdge ? "fallback" : "single",
        conditionType: isFailureEdge ? "fallback" : "always",
        conditionConfig: options?.conditionConfig ?? {},
        isFailureEdge,
        priority: isFailureEdge ? 200 : 100,
      });
    };

    try {
      const isFailureEdge = options?.isFailureEdge ?? false;
      const existingEdge = (taskEdgesByFlowIdRef.current[flowId] ?? []).find(
        (edge) => edge.sourceNodeKey === sourceNodeKey && isFallbackTaskEdge(edge) === isFailureEdge,
      );

      if (existingEdge) {
        try {
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
          await patchEdgesByFlowId(flowId, (edges) =>
            edges.map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge)),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (!message.toLowerCase().includes("not found")) throw error;
          const createdEdge = await createEdge();
          await patchEdgesByFlowId(flowId, (edges) => [
            ...edges.filter((edge) => edge.id !== existingEdge.id),
            createdEdge,
          ]);
        }
      } else {
        const createdEdge = await createEdge();
        await patchEdgesByFlowId(flowId, (edges) => [...edges, createdEdge]);
      }

      if (options?.clearFailureEdges) {
        const failureEdges = (taskEdgesByFlowIdRef.current[flowId] ?? []).filter(
          (edge) => edge.sourceNodeKey === sourceNodeKey && isFallbackTaskEdge(edge),
        );
        await Promise.all(failureEdges.map((edge) => deleteTaskEdge({ flowId, edgeId: edge.id })));
        if (failureEdges.length > 0) {
          await patchEdgesByFlowId(flowId, (edges) =>
            edges.filter((edge) => !failureEdges.some((item) => item.id === edge.id)),
          );
        }
      }

      await mutate();
    } catch (error) {
      setMutationError(toErrorMessage(error, "엣지 수정 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const syncTaskFlowEdgesFromNodes = async (flowId: string, nodes: TaskNode[]) => {
    const desiredEdges = dedupeTaskEdgesByIdentity(buildPersistedTaskEdges(nodes, flowId));
    const currentEdges = taskEdgesByFlowIdRef.current[flowId] ?? [];
    const desiredBySlot = new Map(desiredEdges.map((edge) => [edgeSlotKey(edge), edge]));
    const currentBySlot = new Map(currentEdges.map((edge) => [edgeSlotKey(edge), edge]));

    const toDelete = currentEdges.filter((edge) => !desiredBySlot.has(edgeSlotKey(edge)));
    const toCreate: TaskEdge[] = [];
    const toUpdate: Array<{ edgeId: string; desired: TaskEdge }> = [];

    desiredEdges.forEach((desired) => {
      const existing = currentBySlot.get(edgeSlotKey(desired));
      if (!existing) {
        toCreate.push(desired);
        return;
      }
      if (edgeNeedsUpdate(existing, desired)) {
        toUpdate.push({ edgeId: existing.id, desired });
      }
    });

    const [createdEdges, updatedEdges] = await Promise.all([
      Promise.all(
        toCreate.map((edge) =>
          createTaskEdge({
            flowId,
            sourceNodeKey: edge.sourceNodeKey,
            targetNodeKey: edge.targetNodeKey,
            conditionConfig: edge.conditionConfig ?? {},
            isFailureEdge: isFallbackTaskEdge(edge),
            edgeType: edge.edgeType,
            conditionType: edge.conditionType,
            priority: edge.priority,
          }),
        ),
      ),
      Promise.all(
        toUpdate.map(({ edgeId, desired }) =>
          updateTaskEdge({
            flowId,
            edgeId,
            data: {
              target_node_key: desired.targetNodeKey,
              edge_type: desired.edgeType,
              condition_type: desired.conditionType,
              condition_config: desired.conditionConfig ?? {},
              is_failure_edge: isFallbackTaskEdge(desired),
              priority: desired.priority,
            },
          }),
        ),
      ),
      Promise.all(toDelete.map((edge) => deleteTaskEdge({ flowId, edgeId: edge.id }))),
    ]);

    const deletedIds = new Set(toDelete.map((edge) => edge.id));
    const updatedById = new Map(updatedEdges.map((edge) => [edge.id, edge]));
    const nextEdges = [
      ...currentEdges
        .filter((edge) => !deletedIds.has(edge.id))
        .map((edge) => updatedById.get(edge.id) ?? edge),
      ...createdEdges,
    ];

    taskEdgesByFlowIdRef.current = { ...taskEdgesByFlowIdRef.current, [flowId]: nextEdges };
    return nextEdges;
  };

  const handleSaveTaskFlowDraft = async (
    flowId: string,
    draftNodes: TaskNode[],
    deletedNodeIds: string[],
    flowInput: TaskFlowUpdateInput,
  ) => {
    setIsTasksMutating(true);
    setMutationError(null);

    try {
      const serverNodes = await fetchTaskNodes(flowId);
      const serverIdByKey = new Map(serverNodes.map((node) => [node.nodeKey, node.id]));
      const serverIds = new Set(serverNodes.map((node) => node.id));

      const normalizedDraftNodes = draftNodes.map((draftNode) => {
        const serverId = serverIdByKey.get(draftNode.nodeKey);
        if (!serverId || isDraftTaskNode(draftNode)) {
          return draftNode;
        }
        return { ...draftNode, id: serverId };
      });

      const normalizedDeletedNodeIds = deletedNodeIds.filter((nodeId) => serverIds.has(nodeId));

      await Promise.all([
        ...normalizedDraftNodes.map((draftNode) =>
          isDraftTaskNode(draftNode) || !serverIdByKey.has(draftNode.nodeKey)
            ? createTaskNode({ flowId, data: buildCreateInputFromTaskNode(draftNode) })
            : updateTaskNode({
                flowId,
                nodeId: serverIdByKey.get(draftNode.nodeKey) ?? draftNode.id,
                data: buildUpdateInputFromTaskNode(draftNode),
              }),
        ),
        ...normalizedDeletedNodeIds.map((deletedNodeId) =>
          deleteTaskNode({ flowId, nodeId: deletedNodeId }),
        ),
      ]);

      const [nextEdges, updatedFlow, updatedNodes] = await Promise.all([
        syncTaskFlowEdgesFromNodes(flowId, normalizedDraftNodes),
        updateTaskFlow({ flowId, data: flowInput }),
        fetchTaskNodes(flowId),
      ]);

      await patchTasksCache(mutate, (current) => ({
        ...current,
        taskFlows: current.taskFlows.map((flow) => (flow.id === flowId ? updatedFlow : flow)),
        taskNodesByFlowId: { ...current.taskNodesByFlowId, [flowId]: updatedNodes },
        taskEdgesByFlowId: { ...current.taskEdgesByFlowId, [flowId]: nextEdges },
      }));
    } catch (error) {
      setMutationError(toErrorMessage(error, "태스크 저장 실패"));
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
    const targetEdges = (taskEdgesByFlowIdRef.current[flowId] ?? []).filter(
      (edge) =>
        edge.sourceNodeKey === sourceNodeKey &&
        (!options?.failureOnly || isFallbackTaskEdge(edge)) &&
        (!options?.primaryOnly || !isFallbackTaskEdge(edge)),
    );
    if (targetEdges.length === 0) return;

    setIsTasksMutating(true);
    setMutationError(null);
    try {
      await Promise.all(targetEdges.map((edge) => deleteTaskEdge({ flowId, edgeId: edge.id })));
      await patchEdgesByFlowId(flowId, (edges) =>
        edges.filter((edge) => !targetEdges.some((item) => item.id === edge.id)),
      );
      await mutate();
    } catch (error) {
      setMutationError(toErrorMessage(error, "엣지 삭제 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  const handleTestTaskFlow = async (flowId: string, message: string) => {
    setIsTasksMutating(true);
    setMutationError(null);

    try {
      const result = await testTaskFlow({ organizationId, flowId, message });
      setTaskTestResults((current) => ({ ...current, [flowId]: result }));
    } catch (error) {
      setMutationError(toErrorMessage(error, "태스크 테스트 실패"));
      throw error;
    } finally {
      setIsTasksMutating(false);
    }
  };

  return {
    taskFlows,
    taskNodesByFlowId,
    taskEdgesByFlowId,
    isTasksLoading: isLoading,
    isTasksMutating,
    tasksError,
    taskTestResults,
    refreshTasks,
    handleCreateTaskFlow,
    handleUpdateTaskFlow,
    handleDeleteTaskFlow,
    handleCreateTaskNode,
    handleUpdateTaskNode,
    handleDeleteTaskNode,
    handleUpsertTaskEdge,
    handleSaveTaskFlowDraft,
    handleClearTaskEdges,
    handleTestTaskFlow,
  };
}
