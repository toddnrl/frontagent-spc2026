"use client";

import { ArrowLeft, CheckCircle2, Database, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Toggle } from "../../ui";
import type {
  TaskEdge,
  TaskFlow,
  TaskFlowCreateInput,
  TaskFlowUpdateInput,
  TaskNode,
  TaskNodeCreateInput,
  TaskNodeUpdateInput,
} from "../types";
import {
  applyTaskNodeUpdateInputToNode,
  buildCreateInputFromTaskNode,
  buildDefaultNodeInput,
  buildTaskNodeFromCreateInput,
  buildUpdateInputFromTaskNode,
  buildVisualTaskEdges,
  defaultTriggerDescription,
  DIAGRAM_BRANCH_NODE_H,
  DIAGRAM_GRID,
  DIAGRAM_H_GAP,
  DIAGRAM_NODE_W,
  DIAGRAM_PAD,
  DIAGRAM_TRIGGER_Y,
  getTaskStartNode,
  isDraftTaskNode,
  isFallbackTaskEdge,
  normalizeLegacyEndTaskNodes,
  taskNodeCategories,
  taskNodeDefinitions,
  type TaskNodeType,
} from "./nodeHelpers";
import { TaskFlowDiagram } from "./TaskFlowDiagram";
import { TaskFlowInspector } from "./TaskFlowInspector";
import { TaskNodeInspector } from "./TaskNodeInspector";
import { TaskVariablesInspector } from "./TaskVariablesInspector";

function TaskNodeTypePopover({
  disabled,
  onSelect,
  onClose,
}: {
  disabled?: boolean;
  onSelect: (nodeType: TaskNodeType) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="노드 선택 닫기"
        className="fixed inset-0 z-20 cursor-default bg-transparent"
        onClick={onClose}
      />
      <div className="absolute left-0 top-[52px] z-30 w-[360px] rounded-[22px] border border-gray-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
        <div className="px-2 pb-2">
          <div className="text-[13px] font-extrabold text-gray-900">추가할 노드 선택</div>
          <div className="mt-0.5 text-[11px] font-bold text-gray-400">
            {disabled ? "단계를 추가하려면 먼저 플로우를 생성해야 합니다." : "노드 타입을 고르면 세부 설정을 입력할 수 있습니다."}
          </div>
        </div>
        {disabled && (
          <div className="mb-2 rounded-[16px] bg-amber-50 p-3">
            <div className="text-[12px] font-extrabold text-amber-700">아직 저장되지 않은 태스크입니다</div>
            <div className="mt-1 text-[11px] font-bold leading-relaxed text-amber-600">
              태스크가 저장된 뒤 단계를 추가할 수 있습니다.
            </div>
          </div>
        )}
        <div className="space-y-3">
          {taskNodeCategories.map((category) => {
            const definitions = taskNodeDefinitions.filter(
              (definition) => definition.category === category.value,
            );
            if (definitions.length === 0) return null;

            return (
              <div key={category.value}>
                <div className="px-2 pb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-gray-400">
                  {category.label}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {definitions.map((definition) => {
                    const Icon = definition.icon;
                    return (
                      <button
                        key={definition.type}
                        type="button"
                        onClick={() => onSelect(definition.type)}
                        disabled={disabled}
                        className="group rounded-[16px] border border-transparent bg-[#f7f7f7] p-3 text-left transition-colors hover:border-blue-100 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-[#f7f7f7]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-gray-500 transition-colors group-hover:text-blue-600">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="mt-2 block text-[13px] font-extrabold text-gray-900">
                          {definition.label}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-[11px] font-bold leading-relaxed text-gray-400">
                          {definition.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function TaskBuilderPage({
  flow,
  nodes,
  edges,
  isMutating,
  error,
  onBack,
  onCreate,
  onUpdate,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  onUpsertEdge,
  onClearEdges,
}: {
  flow: TaskFlow | null;
  nodes: TaskNode[];
  edges: TaskEdge[];
  isMutating: boolean;
  error: string | null;
  onBack: () => void;
  onCreate: (input: TaskFlowCreateInput) => Promise<TaskFlow>;
  onUpdate: (flowId: string, data: TaskFlowUpdateInput) => Promise<void>;
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
}) {
  const [name, setName] = useState(flow?.name ?? "");
  const [triggerDescription, setTriggerDescription] = useState(flow?.triggerDescription ?? defaultTriggerDescription);
  const [isEnabled, setIsEnabled] = useState(flow?.isEnabled ?? true);
  const [showNodeTypePopover, setShowNodeTypePopover] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [showTriggerPanel, setShowTriggerPanel] = useState(false);
  const [showVariablesPanel, setShowVariablesPanel] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const initialNodes = normalizeLegacyEndTaskNodes(nodes);
  const [draftNodes, setDraftNodes] = useState<TaskNode[]>(initialNodes);
  const [draftEdges, setDraftEdges] = useState<TaskEdge[]>(edges);
  const draftNodesRef = useRef<TaskNode[]>(initialNodes);
  const draftEdgesRef = useRef<TaskEdge[]>(edges);
  const deletedNodeIdsRef = useRef<string[]>([]);
  const selectedNode = selectedNodeId ? draftNodes.find((node) => node.id === selectedNodeId) ?? null : null;
  const selectedNodeSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const isSavingRef = useRef(false);
  const openTriggerSettings = () => {
    if (!flow) return;
    setSelectedNodeId(null);
    setShowVariablesPanel(false);
    setShowTriggerPanel(true);
  };

  const openVariablesPanel = () => {
    if (!flow) return;
    setSelectedNodeId(null);
    setShowTriggerPanel(false);
    setShowVariablesPanel(true);
  };

  useEffect(() => {
    if (isSavingRef.current) return;
    const normalizedNodes = normalizeLegacyEndTaskNodes(nodes);
    setName(flow?.name ?? "");
    setTriggerDescription(flow?.triggerDescription ?? defaultTriggerDescription);
    setIsEnabled(flow?.isEnabled ?? true);
    setDraftNodes(normalizedNodes);
    setDraftEdges(edges);
    draftNodesRef.current = normalizedNodes;
    draftEdgesRef.current = edges;
    deletedNodeIdsRef.current = [];
    setSelectedNodeId(null);
    setFocusNodeId(null);
    setShowTriggerPanel(!!flow && normalizedNodes.length === 0);
    setShowVariablesPanel(false);
  }, [flow?.id, nodes, edges]);

  const visualEdges = buildVisualTaskEdges(draftNodes, draftEdges, flow?.id ?? "");

  const buildFlowInput = (): TaskFlowCreateInput => ({
    name: name.trim(),
    trigger_description: triggerDescription.trim() || null,
    allowed_channels: ["chat", "voice"],
    is_enabled: isEnabled,
  });

  const handleSaveFlow = async () => {
    if (!name.trim()) {
      setLocalError("태스크 이름을 입력해 주세요.");
      return;
    }

    setLocalError(null);
    if (flow && selectedNodeSaveRef.current) {
      const isNodeSaved = await selectedNodeSaveRef.current();
      if (!isNodeSaved) return;
    }

    isSavingRef.current = true;
    try {
      const input = buildFlowInput();
      if (flow) {
        const draftNodesSnapshot = [...draftNodesRef.current];
        const draftEdgesSnapshot = buildVisualTaskEdges(draftNodesRef.current, draftEdgesRef.current, flow.id);
        const deletedNodeIdsSnapshot = [...deletedNodeIdsRef.current];

        const sourceKeys = Array.from(
          new Set([
            ...edges.map((edge) => edge.sourceNodeKey),
            ...draftEdgesSnapshot.map((edge) => edge.sourceNodeKey),
          ]),
        );
        await Promise.all(sourceKeys.map((sourceNodeKey) => onClearEdges(flow.id, sourceNodeKey)));

        await Promise.all(
          draftNodesSnapshot.map((draftNode) =>
            isDraftTaskNode(draftNode)
              ? onCreateNode(flow.id, buildCreateInputFromTaskNode(draftNode))
              : onUpdateNode(flow.id, draftNode.id, buildUpdateInputFromTaskNode(draftNode)),
          ),
        );

        await Promise.all(deletedNodeIdsSnapshot.map((deletedNodeId) => onDeleteNode(flow.id, deletedNodeId)));

        await Promise.all(
          draftEdgesSnapshot.map((draftEdge) =>
            onUpsertEdge(flow.id, draftEdge.sourceNodeKey, draftEdge.targetNodeKey, {
              isFailureEdge: isFallbackTaskEdge(draftEdge),
              conditionConfig: draftEdge.conditionConfig,
            }),
          ),
        );

        await onUpdate(flow.id, input);
        deletedNodeIdsRef.current = [];
      } else {
        await onCreate(input);
      }
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleCreateNode = async (nodeType: TaskNodeType) => {
    if (!flow) {
      setLocalError("먼저 태스크 기본 정보를 저장해 주세요.");
      return;
    }

    setLocalError(null);
    setShowNodeTypePopover(false);
    const anchorNode = selectedNode ?? draftNodes[draftNodes.length - 1] ?? null;
    const created = buildTaskNodeFromCreateInput(
      flow.id,
      buildDefaultNodeInput({
        nodeType,
        index: draftNodes.length,
        anchorNode,
      }),
    );
    const nextNodes = [...draftNodesRef.current, created];
    draftNodesRef.current = nextNodes;
    setDraftNodes(nextNodes);
    if (anchorNode) {
      await handleUpsertEdgeDraft(anchorNode.nodeKey, created.nodeKey, { clearFailureEdges: true });
    }
    setSelectedNodeId(created.id);
    setFocusNodeId(created.id);
  };

  const handleUpdateNodeDraft = async (nodeId: string, input: TaskNodeUpdateInput) => {
    setLocalError(null);
    const previousNode = draftNodesRef.current.find((node) => node.id === nodeId) ?? null;
    const nextNodes = draftNodesRef.current.map((node) =>
      node.id === nodeId ? applyTaskNodeUpdateInputToNode(node, input) : node,
    );
    const nextNode = nextNodes.find((node) => node.id === nodeId) ?? null;
    if (previousNode && nextNode && previousNode.nodeKey !== nextNode.nodeKey) {
      const nextEdges = draftEdgesRef.current.map((edge) => ({
        ...edge,
        sourceNodeKey: edge.sourceNodeKey === previousNode.nodeKey ? nextNode.nodeKey : edge.sourceNodeKey,
        targetNodeKey: edge.targetNodeKey === previousNode.nodeKey ? nextNode.nodeKey : edge.targetNodeKey,
      }));
      draftEdgesRef.current = nextEdges;
      setDraftEdges(nextEdges);
    }
    draftNodesRef.current = nextNodes;
    setDraftNodes(nextNodes);
  };

  const handleUpsertEdgeDraft = async (
    sourceNodeKey: string,
    targetNodeKey: string,
    options?: { isFailureEdge?: boolean; conditionConfig?: Record<string, unknown>; clearFailureEdges?: boolean },
  ) => {
    const isFailureEdge = options?.isFailureEdge ?? false;
    const filtered = draftEdgesRef.current.filter((edge) => {
      if (edge.sourceNodeKey !== sourceNodeKey) return true;
      if (options?.clearFailureEdges && isFallbackTaskEdge(edge)) return false;
      return isFallbackTaskEdge(edge) !== isFailureEdge;
    });
    const nextEdge: TaskEdge = {
      id: `draft-${sourceNodeKey}-${isFailureEdge ? "fallback" : "primary"}-${Date.now()}`,
      flowId: flow?.id ?? "",
      sourceNodeKey,
      targetNodeKey,
      edgeType: isFailureEdge ? "fallback" : "single",
      conditionType: isFailureEdge ? "fallback" : "always",
      conditionConfig: options?.conditionConfig ?? {},
      isFailureEdge,
      priority: isFailureEdge ? 200 : 100,
    };
    const nextEdges = [...filtered, nextEdge];
    draftEdgesRef.current = nextEdges;
    setDraftEdges(nextEdges);
  };

  const handleClearEdgesDraft = async (
    sourceNodeKey: string,
    options?: { failureOnly?: boolean; primaryOnly?: boolean },
  ) => {
    const nextEdges = draftEdgesRef.current.filter((edge) => {
      if (edge.sourceNodeKey !== sourceNodeKey) return true;
      if (options?.failureOnly) return !isFallbackTaskEdge(edge);
      if (options?.primaryOnly) return isFallbackTaskEdge(edge);
      return false;
    });
    draftEdgesRef.current = nextEdges;
    setDraftEdges(nextEdges);
  };

  const handleAutoLayoutDraft = () => {
    const nodeMap = new Map<string, TaskNode>(draftNodesRef.current.map((node) => [node.nodeKey, node]));
    const edgesForLayout = buildVisualTaskEdges(draftNodesRef.current, draftEdgesRef.current, flow?.id ?? "");
    const firstNode = getTaskStartNode(draftNodesRef.current);
    if (!firstNode) return;

    const positioned = new Map<string, { x: number; y: number }>();
    const laneGap = DIAGRAM_BRANCH_NODE_H + 100;
    const firstNodeX = DIAGRAM_PAD + DIAGRAM_NODE_W + DIAGRAM_H_GAP;
    const xOfDepth = (depth: number) => firstNodeX + depth * (DIAGRAM_NODE_W + DIAGRAM_H_GAP);
    const yOfLane = (lane: number) => DIAGRAM_TRIGGER_Y + lane * laneGap;
    const outgoingOf = (nodeKey: string): TaskEdge[] =>
      edgesForLayout
        .filter((edge) => edge.sourceNodeKey === nodeKey)
        .sort((a, b) => {
          if (isFallbackTaskEdge(a) === isFallbackTaskEdge(b)) return (a.priority ?? 100) - (b.priority ?? 100);
          return isFallbackTaskEdge(a) ? 1 : -1;
        });

    const mainPath: string[] = [];
    const mainPathSet = new Set<string>();
    let currentMainKey: string | undefined = firstNode.nodeKey;
    while (currentMainKey && !mainPathSet.has(currentMainKey)) {
      mainPath.push(currentMainKey);
      mainPathSet.add(currentMainKey);
      const primaryEdge: TaskEdge | undefined = outgoingOf(currentMainKey).find((edge) => !isFallbackTaskEdge(edge));
      currentMainKey = primaryEdge && nodeMap.has(primaryEdge.targetNodeKey) ? primaryEdge.targetNodeKey : undefined;
    }

    const mainDepthByKey = new Map<string, number>();
    mainPath.forEach((nodeKey, depth) => {
      mainDepthByKey.set(nodeKey, depth);
      positioned.set(nodeKey, {
        x: xOfDepth(depth),
        y: yOfLane(0),
      });
    });

    const helperKeys = draftNodesRef.current
      .map((node) => node.nodeKey)
      .filter((nodeKey) => !mainPathSet.has(nodeKey));
    const helperKeySet = new Set(helperKeys);
    const helperDepthByKey = new Map<string, number>();
    const neighborsByKey = new Map<string, string[]>();
    const addNeighbor = (a: string, b: string) => {
      if (!helperKeySet.has(a) || !helperKeySet.has(b)) return;
      neighborsByKey.set(a, [...(neighborsByKey.get(a) ?? []), b]);
      neighborsByKey.set(b, [...(neighborsByKey.get(b) ?? []), a]);
    };
    edgesForLayout.forEach((edge) => addNeighbor(edge.sourceNodeKey, edge.targetNodeKey));

    const directedOutgoingByKey = new Map<string, TaskEdge[]>();
    const incomingCountByKey = new Map<string, number>();
    helperKeys.forEach((key) => incomingCountByKey.set(key, 0));
    edgesForLayout.forEach((edge) => {
      if (mainPathSet.has(edge.sourceNodeKey) && helperKeySet.has(edge.targetNodeKey)) {
        helperDepthByKey.set(edge.targetNodeKey, 0);
      }
      if (helperKeySet.has(edge.sourceNodeKey) && helperKeySet.has(edge.targetNodeKey)) {
        directedOutgoingByKey.set(edge.sourceNodeKey, [...(directedOutgoingByKey.get(edge.sourceNodeKey) ?? []), edge]);
        incomingCountByKey.set(edge.targetNodeKey, (incomingCountByKey.get(edge.targetNodeKey) ?? 0) + 1);
      }
    });

    const helperVisited = new Set<string>();
    const components: string[][] = [];
    helperKeys.forEach((startKey) => {
      if (helperVisited.has(startKey)) return;
      const component: string[] = [];
      const componentQueue = [startKey];
      helperVisited.add(startKey);
      while (componentQueue.length > 0) {
        const currentKey = componentQueue.shift()!;
        component.push(currentKey);
        (neighborsByKey.get(currentKey) ?? []).forEach((neighborKey) => {
          if (helperVisited.has(neighborKey)) return;
          helperVisited.add(neighborKey);
          componentQueue.push(neighborKey);
        });
      }
      components.push(component);
    });

    components.sort((a, b) => {
      const aDepth = Math.min(...a.map((key) => helperDepthByKey.get(key) ?? Number.MAX_SAFE_INTEGER));
      const bDepth = Math.min(...b.map((key) => helperDepthByKey.get(key) ?? Number.MAX_SAFE_INTEGER));
      if (aDepth !== bDepth) return aDepth - bDepth;
      return a[0].localeCompare(b[0]);
    });

    let helperDepthCursor = 0;
    const helperLane = 1;
    components.forEach((component) => {
      const componentSet = new Set(component);
      const componentDepthByKey = new Map<string, number>();
      const seededRoots = component.filter((key) => helperDepthByKey.has(key));
      const roots = seededRoots.length > 0
        ? seededRoots
        : component.filter((key) => (incomingCountByKey.get(key) ?? 0) === 0);
      const startKeys = roots.length > 0 ? roots : [component[0]];
      const depthQueue: string[] = [];
      startKeys.forEach((key, index) => {
        componentDepthByKey.set(key, helperDepthByKey.get(key) ?? helperDepthCursor + index);
        depthQueue.push(key);
      });

      while (depthQueue.length > 0) {
        const currentKey = depthQueue.shift()!;
        const currentDepth = componentDepthByKey.get(currentKey) ?? 0;
        const outgoingEdges = (directedOutgoingByKey.get(currentKey) ?? []).filter((edge) =>
          componentSet.has(edge.targetNodeKey),
        );

        outgoingEdges.forEach((edge) => {
          const targetKey = edge.targetNodeKey;
          const nextDepth = currentDepth + 1;
          const existingDepth = componentDepthByKey.get(targetKey);
          if (existingDepth === undefined || nextDepth > existingDepth) {
            componentDepthByKey.set(targetKey, nextDepth);
          }
          depthQueue.push(targetKey);
        });
      }

      component.forEach((nodeKey, index) => {
        if (!componentDepthByKey.has(nodeKey)) {
          componentDepthByKey.set(nodeKey, helperDepthCursor + index);
        }
      });

      const laneOffsetByDepth = new Map<number, number>();
      component.forEach((nodeKey) => {
        const depth = componentDepthByKey.get(nodeKey) ?? helperDepthCursor;
        const laneOffset = laneOffsetByDepth.get(depth) ?? 0;
        laneOffsetByDepth.set(depth, laneOffset + 1);
        positioned.set(nodeKey, {
          x: xOfDepth(depth),
          y: yOfLane(helperLane + laneOffset),
        });
      });
      helperDepthCursor = Math.max(helperDepthCursor, ...Array.from(componentDepthByKey.values())) + 2;
    });

    const nextNodes = draftNodesRef.current.map((node) => {
      const position = positioned.get(node.nodeKey);
      if (!position) return node;
      return {
        ...node,
        positionX: Math.round(position.x / DIAGRAM_GRID) * DIAGRAM_GRID,
        positionY: Math.round(position.y / DIAGRAM_GRID) * DIAGRAM_GRID,
      };
    });
    draftNodesRef.current = nextNodes;
    setDraftNodes(nextNodes);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!window.confirm("이 노드를 삭제할까요?")) return;
    setLocalError(null);
    if (!nodeId.startsWith("draft-node-")) {
      const nextDeletedIds = Array.from(new Set([...deletedNodeIdsRef.current, nodeId]));
      deletedNodeIdsRef.current = nextDeletedIds;
    }
    const nodeToDelete = draftNodesRef.current.find((node) => node.id === nodeId);
    const nextNodes = draftNodesRef.current.filter((node) => node.id !== nodeId);
    const nextEdges = draftEdgesRef.current.filter(
      (edge) => edge.sourceNodeKey !== nodeToDelete?.nodeKey && edge.targetNodeKey !== nodeToDelete?.nodeKey,
    );
    draftNodesRef.current = nextNodes;
    draftEdgesRef.current = nextEdges;
    setDraftNodes(nextNodes);
    setDraftEdges(nextEdges);
    setSelectedNodeId(null);
  };

  const openNodeTypePopover = () => {
    if (!flow) {
      setLocalError(null);
      setShowNodeTypePopover((current) => !current);
      return;
    }
    setShowNodeTypePopover((current) => !current);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-gray-600 hover:bg-gray-200"
            aria-label="목록으로"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-bold leading-tight">
              {flow ? name : "새 태스크"}
            </h1>
            <p className="truncate text-[12px] font-bold text-gray-400">
              {draftNodes.length} steps · {visualEdges.length} edges
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {flow && (
            <>
              <button
                type="button"
                onClick={openVariablesPanel}
                className={
                  showVariablesPanel
                    ? "flex items-center gap-2 rounded-[14px] border border-blue-100 bg-blue-50 px-3 py-2 text-[13px] font-extrabold text-blue-600"
                    : "flex items-center gap-2 rounded-[14px] border border-gray-200 bg-white px-3 py-2 text-[13px] font-extrabold text-gray-600 hover:bg-gray-50"
                }
              >
                <Database className="h-4 w-4" />
                변수
              </button>
              <label className="flex items-center gap-2 px-2 py-2">
                <span className="text-[13px] font-extrabold text-gray-600">활성화</span>
                <Toggle enabled={isEnabled} onChange={() => setIsEnabled((value) => !value)} disabled={isMutating} />
              </label>
            </>
          )}
          <Button variant="primary" onClick={handleSaveFlow} disabled={isMutating}>
            <CheckCircle2 className="h-4 w-4" />
            태스크 저장
          </Button>
        </div>
      </div>

      {(error || localError) && (
        <div className="mb-3 rounded-[14px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600">
          {localError ?? error}
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] border border-gray-200">
        <TaskFlowDiagram
          key={flow?.id ?? "new"}
          nodes={draftNodes}
          edges={visualEdges}
          trigger={{
            name: name || "새 태스크",
            description: triggerDescription || flow?.description,
          }}
          onTriggerClick={openTriggerSettings}
          isTriggerSelected={showTriggerPanel && !selectedNode}
          selectedNodeId={selectedNodeId}
          focusNodeId={focusNodeId}
          focusRightInset={selectedNodeId || showTriggerPanel || showVariablesPanel ? 430 : 0}
          onMoveNode={async (node, position) => {
            await handleUpdateNodeDraft(node.id, {
              position_x: position.x,
              position_y: position.y,
            });
          }}
          onAutoLayout={handleAutoLayoutDraft}
          onNodeClick={(node) => {
            void (async () => {
              if (selectedNodeSaveRef.current) {
                const isNodeSaved = await selectedNodeSaveRef.current();
                if (!isNodeSaved) return;
              }
              setSelectedNodeId(node.id);
              setFocusNodeId(null);
              setShowTriggerPanel(false);
              setShowVariablesPanel(false);
            })();
          }}
        />

        <div className="absolute left-5 top-5 z-20">
          <button
            type="button"
            onClick={openNodeTypePopover}
            disabled={isMutating}
            className="flex items-center gap-2 rounded-[14px] border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-extrabold text-blue-600 shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition-colors hover:bg-blue-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            단계 추가
          </button>
          {showNodeTypePopover && (
            <TaskNodeTypePopover
              disabled={!flow}
              onSelect={handleCreateNode}
              onClose={() => setShowNodeTypePopover(false)}
            />
          )}
        </div>

        {flow && showTriggerPanel && !selectedNode && (
          <TaskFlowInspector
            nodes={draftNodes}
            name={name}
            triggerDescription={triggerDescription}
            onNameChange={setName}
            onTriggerDescriptionChange={setTriggerDescription}
            onClose={() => setShowTriggerPanel(false)}
          />
        )}

        {flow && showVariablesPanel && !selectedNode && (
          <TaskVariablesInspector nodes={draftNodes} onClose={() => setShowVariablesPanel(false)} />
        )}

        {flow && selectedNode && (
          <TaskNodeInspector
            key={selectedNode.id}
            node={selectedNode}
            nodes={draftNodes}
            edges={visualEdges}
            isMutating={isMutating}
            onClose={() => {
              void (async () => {
                if (selectedNodeSaveRef.current) {
                  const isNodeSaved = await selectedNodeSaveRef.current();
                  if (!isNodeSaved) return;
                }
                setSelectedNodeId(null);
              })();
            }}
            onUpdate={handleUpdateNodeDraft}
            onDelete={handleDeleteNode}
            onUpsertEdge={async (_flowId, sourceNodeKey, targetNodeKey, options) =>
              handleUpsertEdgeDraft(sourceNodeKey, targetNodeKey, options)
            }
            onClearEdges={async (_flowId, sourceNodeKey, options) => handleClearEdgesDraft(sourceNodeKey, options)}
            registerSave={(save) => {
              selectedNodeSaveRef.current = save;
            }}
          />
        )}
      </div>

    </div>
  );
}
