"use client";

import { Hand, MessageSquare, Minus, Plus, Workflow, Zap } from "lucide-react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { TaskEdge, TaskNode } from "../types";
import {
  BRANCH_FALLBACK_PORT_OFFSET,
  BRANCH_MATCH_PORT_OFFSET,
  describeTaskNode,
  DIAGRAM_BRANCH_NODE_H,
  DIAGRAM_GRID,
  DIAGRAM_H_GAP,
  DIAGRAM_NODE_H,
  DIAGRAM_NODE_W,
  DIAGRAM_PAD,
  DIAGRAM_TRIGGER_Y,
  formatNodePrefix,
  getTaskStartNode,
  getTaskNodeDefinition,
  isFallbackTaskEdge,
  nodeIconByType,
  nodeTypeIconBackground,
  nodeTypeIconColor,
  normalizeTaskNodeType,
  PORT_SLOT_COUNT,
  PORT_SLOT_ORDER,
  readConfigString,
  readNextStepMode,
} from "./nodeHelpers";

export function TaskFlowDiagram({
  nodes,
  edges,
  trigger,
  onTriggerClick,
  isTriggerSelected = false,
  selectedNodeId,
  focusNodeId,
  focusRightInset = 0,
  onNodeClick,
  onMoveNode,
  onAutoLayout,
}: {
  nodes: TaskNode[];
  edges: TaskEdge[];
  trigger?: {
    name: string;
    description?: string;
  };
  onTriggerClick?: () => void;
  isTriggerSelected?: boolean;
  selectedNodeId?: string | null;
  focusNodeId?: string | null;
  focusRightInset?: number;
  onNodeClick?: (node: TaskNode) => void;
  onMoveNode?: (node: TaskNode, position: { x: number; y: number }) => Promise<void> | void;
  onAutoLayout?: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isAutoPanning, setIsAutoPanning] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({ x: DIAGRAM_PAD, y: DIAGRAM_TRIGGER_Y });
  const [draggingNode, setDraggingNode] = useState<{
    nodeId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const canvasExtraSpace = 1000;
  const rows: Array<{ key: string; kind: "trigger" | "node"; node?: TaskNode }> = [];
  if (trigger) rows.push({ key: "__trigger__", kind: "trigger" });
  nodes.forEach((node) => rows.push({ key: node.nodeKey, kind: "node", node }));

  const rowIndexByKey = new Map(rows.map((row, index) => [row.key, index]));
  const fallbackXOf = (index: number) => DIAGRAM_PAD + index * (DIAGRAM_NODE_W + DIAGRAM_H_GAP);
  const nodeXOf = (node: TaskNode) => draggingNode?.nodeId === node.id ? draggingNode.x : node.positionX;
  const nodeYOf = (node: TaskNode) => draggingNode?.nodeId === node.id ? draggingNode.y : node.positionY;
  const triggerXOf = () => (draggingNode?.nodeId === "__trigger__" ? draggingNode.x : triggerPosition.x);
  const triggerYOf = () => (draggingNode?.nodeId === "__trigger__" ? draggingNode.y : triggerPosition.y);
  const xOf = (index: number) => {
    const row = rows[index];
    if (row?.kind === "trigger") return triggerXOf();
    if (row?.kind === "node" && row.node) return nodeXOf(row.node);
    return fallbackXOf(index);
  };
  const yOf = (index: number) => {
    const row = rows[index];
    if (row?.kind === "trigger") return triggerYOf();
    if (row?.kind === "node" && row.node) return nodeYOf(row.node);
    return DIAGRAM_TRIGGER_Y;
  };
  const nodeByKey = new Map(nodes.map((node) => [node.nodeKey, node]));
  const snapDiagramValue = (value: number) => Math.max(0, Math.round(value / DIAGRAM_GRID) * DIAGRAM_GRID);
  const outgoingEdgesOf = (nodeKey: string) => edges.filter((edge) => edge.sourceNodeKey === nodeKey);
  const shouldShowNodeBranchRows = (node: TaskNode) => {
    const mode = readNextStepMode(node.config.next_step_mode);
    if (mode === "end") return false;
    const outgoingEdges = outgoingEdgesOf(node.nodeKey);
    return mode === "branch" || outgoingEdges.length > 1;
  };
  const nodeHeightOf = (node: TaskNode) => (shouldShowNodeBranchRows(node) ? DIAGRAM_BRANCH_NODE_H : DIAGRAM_NODE_H);
  const heightOfIndex = (index: number) => {
    const row = rows[index];
    if (row?.kind === "node" && row.node) return nodeHeightOf(row.node);
    return DIAGRAM_NODE_H;
  };
  const labelForNodeKey = (nodeKey: string | undefined) => {
    if (!nodeKey) return "미연결";
    const node = nodeByKey.get(nodeKey);
    return node?.label || nodeKey;
  };
  const nodeRects = [
    ...(trigger ? [{ x: triggerXOf(), y: triggerYOf(), width: DIAGRAM_NODE_W, height: DIAGRAM_NODE_H }] : []),
    ...nodes.map((node) => ({ x: nodeXOf(node), y: nodeYOf(node), width: DIAGRAM_NODE_W, height: nodeHeightOf(node) })),
  ];
  const maxNodeX = Math.max(DIAGRAM_NODE_W, ...nodeRects.map((rect) => rect.x + DIAGRAM_NODE_W));
  const maxNodeY = Math.max(DIAGRAM_NODE_H, ...nodeRects.map((rect) => rect.y + rect.height));
  const contentWidth = Math.max(
    canvasExtraSpace + DIAGRAM_NODE_W,
    maxNodeX + canvasExtraSpace,
  );
  const contentHeight = Math.max(
    canvasExtraSpace + DIAGRAM_NODE_H,
    maxNodeY + canvasExtraSpace,
  );
  const firstNodeKey = getTaskStartNode(nodes)?.nodeKey;
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) : null;
  const isTriggerEdgeActive = isTriggerSelected || (!!firstNodeKey && selectedNode?.nodeKey === firstNodeKey);
  const portKeysBySide = new Map<string, string[]>();

  const portKeyOf = (nodeKey: string, side: "left" | "right") => `${nodeKey}:${side}`;
  const getEdgeSides = () => ({ sourceSide: "right" as const, targetSide: "left" as const });

  const addPortKey = (nodeKey: string, side: "left" | "right", edgeKey: string) => {
    const mapKey = portKeyOf(nodeKey, side);
    const current = portKeysBySide.get(mapKey) ?? [];
    if (!current.includes(edgeKey)) {
      current.push(edgeKey);
      portKeysBySide.set(mapKey, current);
    }
  };

  if (trigger && firstNodeKey && rowIndexByKey.has(firstNodeKey)) {
    addPortKey("__trigger__", "right", "trigger-edge");
    addPortKey(firstNodeKey, "left", "trigger-edge");
  }

  edges.forEach((edge) => {
    const sourceIndex = rowIndexByKey.get(edge.sourceNodeKey);
    const targetIndex = rowIndexByKey.get(edge.targetNodeKey);
    if (sourceIndex === undefined || targetIndex === undefined) return;
    const { sourceSide, targetSide } = getEdgeSides();
    addPortKey(edge.sourceNodeKey, sourceSide, edge.id);
    addPortKey(edge.targetNodeKey, targetSide, edge.id);
  });

  const incomingEdgeOffsetByKey = new Map<string, number>();
  const incomingEdgesByTargetKey = new Map<string, TaskEdge[]>();
  edges.forEach((edge) => {
    incomingEdgesByTargetKey.set(edge.targetNodeKey, [...(incomingEdgesByTargetKey.get(edge.targetNodeKey) ?? []), edge]);
  });
  incomingEdgesByTargetKey.forEach((targetEdges) => {
    if (targetEdges.length < 2) return;
    const sortedEdges = [...targetEdges].sort((left, right) => {
      const leftSource = nodeByKey.get(left.sourceNodeKey);
      const rightSource = nodeByKey.get(right.sourceNodeKey);
      const leftY = leftSource ? nodeYOf(leftSource) : 0;
      const rightY = rightSource ? nodeYOf(rightSource) : 0;
      if (leftY !== rightY) return leftY - rightY;
      const leftX = leftSource ? nodeXOf(leftSource) : 0;
      const rightX = rightSource ? nodeXOf(rightSource) : 0;
      if (leftX !== rightX) return leftX - rightX;
      return left.id.localeCompare(right.id);
    });
    sortedEdges.forEach((edge, index) => {
      const distanceFromBottom = sortedEdges.length - 1 - index;
      incomingEdgeOffsetByKey.set(edge.id, -Math.min(2.4, distanceFromBottom * 0.65));
    });
  });

  const baseYOf = (nodeKey: string) => {
    if (nodeKey === "__trigger__") return triggerYOf();
    const node = nodeByKey.get(nodeKey);
    return node ? nodeYOf(node) : DIAGRAM_PAD;
  };

  const baseXOf = (nodeKey: string) => {
    if (nodeKey === "__trigger__") return triggerXOf();
    const node = nodeByKey.get(nodeKey);
    return node ? nodeXOf(node) : DIAGRAM_PAD;
  };

  const edgeByKey = new Map(edges.map((edge) => [edge.id, edge]));
  const counterpartPointOf = (nodeKey: string, edgeKey: string, side: "left" | "right") => {
    const edge = edgeByKey.get(edgeKey);
    if (edgeKey === "trigger-edge") {
      const counterpartKey = side === "right" ? firstNodeKey ?? "" : "__trigger__";
      return { x: baseXOf(counterpartKey), y: baseYOf(counterpartKey) };
    }
    if (!edge) return { x: baseXOf(nodeKey), y: baseYOf(nodeKey) };
    const counterpartKey = side === "right" ? edge.targetNodeKey : edge.sourceNodeKey;
    return { x: baseXOf(counterpartKey), y: baseYOf(counterpartKey) };
  };

  const getPortSlotOffset = (nodeKey: string, side: "left" | "right", slot: number) => {
    const safeSlot = Math.min(PORT_SLOT_COUNT - 1, Math.max(0, slot));
    if (nodeKey === "__trigger__") {
      return ((safeSlot + 1) * DIAGRAM_NODE_H) / (PORT_SLOT_COUNT + 1);
    }

    const node = nodeByKey.get(nodeKey);
    if (!node) return ((safeSlot + 1) * DIAGRAM_NODE_H) / (PORT_SLOT_COUNT + 1);
    if (side === "left") {
      return ((safeSlot + 1) * DIAGRAM_NODE_H) / (PORT_SLOT_COUNT + 1);
    }
    if (side === "right" && shouldShowNodeBranchRows(node)) {
      const branchOffsets = [40, 80, 120, BRANCH_MATCH_PORT_OFFSET, BRANCH_FALLBACK_PORT_OFFSET];
      return branchOffsets[safeSlot] ?? branchOffsets[2];
    }

    return ((safeSlot + 1) * nodeHeightOf(node)) / (PORT_SLOT_COUNT + 1);
  };

  // 같은 포트(노드+방향)로 여러 엣지가 모이면 슬롯을 강제로 분산한다.
  // 특히 한 노드로 들어오는 엣지가 3~4개 이상일 때 모두 중앙으로 몰리면
  // 선이 한 줄처럼 겹쳐 보이므로, 상대 위치 순서대로 위/아래 포트를 나눠 쓴다.
  const assignedSlotByPortEdge = new Map<string, number>();
  portKeysBySide.forEach((keys, mapKey) => {
    if (keys.length < 2) return;
    const [nodeKey, side] = mapKey.split(":") as [string, "left" | "right"];
    const sortedKeys = [...keys].sort((left, right) => {
      const leftPoint = counterpartPointOf(nodeKey, left, side);
      const rightPoint = counterpartPointOf(nodeKey, right, side);
      if (leftPoint.y !== rightPoint.y) return leftPoint.y - rightPoint.y;
      if (leftPoint.x !== rightPoint.x) return leftPoint.x - rightPoint.x;
      return left.localeCompare(right);
    });
    const slotOrder = side === "left"
      ? Array.from({ length: PORT_SLOT_COUNT }, (_, slot) => slot)
      : PORT_SLOT_COUNT === PORT_SLOT_ORDER.length
        ? PORT_SLOT_ORDER
        : Array.from({ length: PORT_SLOT_COUNT }, (_, slot) => slot);

    sortedKeys.forEach((edgeKey, index) => {
      assignedSlotByPortEdge.set(`${mapKey}:${edgeKey}`, slotOrder[index % slotOrder.length]);
    });
  });

  const getPortY = (nodeKey: string, side: "left" | "right", edgeKey: string, preferredSlot?: number) => {
    if (preferredSlot !== undefined) {
      return baseYOf(nodeKey) + getPortSlotOffset(nodeKey, side, preferredSlot);
    }

    const slot = assignedSlotByPortEdge.get(`${portKeyOf(nodeKey, side)}:${edgeKey}`) ?? 2;
    return baseYOf(nodeKey) + getPortSlotOffset(nodeKey, side, slot);
  };

  const getEdgePortYs = (sourceKey: string, targetKey: string, edgeKey: string) => {
    const { sourceSide, targetSide } = getEdgeSides();
    return {
      sourceY: getPortY(sourceKey, sourceSide, edgeKey, 2),
      targetY: getPortY(targetKey, targetSide, edgeKey),
    };
  };

  const getBranchSourceSlot = (edge: TaskEdge) => {
    const sourceNode = nodeByKey.get(edge.sourceNodeKey);
    if (!sourceNode) return null;
    if (!shouldShowNodeBranchRows(sourceNode)) return null;
    const branchTargetKey = readConfigString(sourceNode.config.branch_node_key);
    const fallbackTargetKey = readConfigString(sourceNode.config.fallback_node_key);
    const sourceEdges = outgoingEdgesOf(edge.sourceNodeKey);
    const fallbackByTarget = !!fallbackTargetKey && edge.targetNodeKey === fallbackTargetKey;
    const matchByTarget = !!branchTargetKey && edge.targetNodeKey === branchTargetKey;
    const fallbackByOrder =
      !fallbackByTarget &&
      !matchByTarget &&
      sourceEdges.length > 1 &&
      sourceEdges.findIndex((item) => item.id === edge.id) > 0;
    const isFallbackBranch = fallbackByTarget || (!matchByTarget && (isFallbackTaskEdge(edge) || fallbackByOrder));
    return isFallbackBranch ? 4 : 3;
  };

  const getBranchSourceY = (edge: TaskEdge) => {
    const sourceNode = nodeByKey.get(edge.sourceNodeKey);
    if (!sourceNode) return null;
    const slot = getBranchSourceSlot(edge);
    if (slot === null) return null;
    return nodeYOf(sourceNode) + getPortSlotOffset(edge.sourceNodeKey, "right", slot);
  };

  const buildRoundedOrthogonalPath = (points: Array<{ x: number; y: number }>, radius = 14) => {
    if (points.length < 2) return "";
    const commands = [`M ${points[0].x} ${points[0].y}`];

    for (let index = 1; index < points.length - 1; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const next = points[index + 1];
      const previousVector = {
        x: Math.sign(current.x - previous.x),
        y: Math.sign(current.y - previous.y),
      };
      const nextVector = {
        x: Math.sign(next.x - current.x),
        y: Math.sign(next.y - current.y),
      };
      const isCorner = previousVector.x !== nextVector.x || previousVector.y !== nextVector.y;
      const previousLength = Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y);
      const nextLength = Math.abs(next.x - current.x) + Math.abs(next.y - current.y);
      const cornerRadius = Math.min(radius, previousLength / 2, nextLength / 2);

      if (!isCorner || cornerRadius <= 0) {
        commands.push(`L ${current.x} ${current.y}`);
        continue;
      }

      const beforeCorner = {
        x: current.x - previousVector.x * cornerRadius,
        y: current.y - previousVector.y * cornerRadius,
      };
      const afterCorner = {
        x: current.x + nextVector.x * cornerRadius,
        y: current.y + nextVector.y * cornerRadius,
      };

      commands.push(`L ${beforeCorner.x} ${beforeCorner.y}`);
      commands.push(`Q ${current.x} ${current.y} ${afterCorner.x} ${afterCorner.y}`);
    }

    const last = points[points.length - 1];
    commands.push(`L ${last.x} ${last.y}`);
    return commands.join(" ");
  };

  const drawEdge = (
    sourceIndex: number,
    targetIndex: number,
    options: { color: string; key: string; sourceY: number; targetY: number; label?: string; active?: boolean; routeOffset?: number },
  ) => {
    const active = options.active ?? false;
    const sx = xOf(sourceIndex) + DIAGRAM_NODE_W;
    const targetPortX = xOf(targetIndex);
    const arrowTipX = targetPortX - 4;
    const arrowStartX = arrowTipX - 10;
    const tx = arrowTipX - 3;
    const routeOffsetX = (options.routeOffset ?? 0) * 34;
    const sourceStem = Math.max(18, 72 + routeOffsetX);
    const targetStem = Math.max(18, 72 - routeOffsetX);
    const midX = (sx + tx) / 2 + routeOffsetX;
    const isForwardByPosition = tx > sx + 56;
    const span = Math.max(1, Math.round(Math.abs(tx - sx) / (DIAGRAM_NODE_W + DIAGRAM_H_GAP)));
    const shouldAvoidNodes = !isForwardByPosition;
    const laneOffset = Math.min(3, Math.max(1, span - 1)) * 18 + Math.abs(options.routeOffset ?? 0) * 8;
    const routeY = isForwardByPosition
      ? Math.min(yOf(sourceIndex), yOf(targetIndex)) - 34 - laneOffset
      : Math.max(yOf(sourceIndex) + heightOfIndex(sourceIndex), yOf(targetIndex) + heightOfIndex(targetIndex)) + 34 + laneOffset;
    const labelY = shouldAvoidNodes ? routeY : (options.sourceY + options.targetY) / 2;
    const path = buildRoundedOrthogonalPath(
      shouldAvoidNodes
        ? [
            { x: sx, y: options.sourceY },
            { x: sx + sourceStem, y: options.sourceY },
            { x: sx + sourceStem, y: routeY },
            { x: tx - targetStem, y: routeY },
            { x: tx - targetStem, y: options.targetY },
            { x: tx, y: options.targetY },
          ]
        : [
            { x: sx, y: options.sourceY },
            { x: midX, y: options.sourceY },
            { x: midX, y: options.targetY },
            { x: tx, y: options.targetY },
          ],
    );

    return (
      <g key={options.key} className="pointer-events-none">
        <path
          d={path}
          fill="none"
          stroke={options.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={active ? "7 7" : undefined}
          className={active ? "animate-[task-edge-flow_0.8s_linear_infinite]" : undefined}
        />
        <path
          d={`M ${arrowStartX} ${options.targetY - 6} L ${arrowTipX} ${options.targetY} L ${arrowStartX} ${options.targetY + 6}`}
          fill="none"
          stroke={options.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {options.label && (
          <text x={midX} y={labelY - 12} textAnchor="middle" className="fill-gray-400 text-[11px] font-bold">
            {options.label}
          </text>
        )}
      </g>
    );
  };

  const drawEdgePorts = (
    sourceIndex: number,
    targetIndex: number,
    options: { color: string; key: string; sourceY: number; targetY: number; active?: boolean },
  ) => {
    const sx = xOf(sourceIndex) + DIAGRAM_NODE_W;
    const tx = xOf(targetIndex);
    const active = options.active ?? false;

    return (
      <g key={options.key} className="pointer-events-none">
        <circle cx={sx} cy={options.sourceY} r={active ? 5 : 4} fill={options.color} stroke="#fff" strokeWidth="2.5" />
        <circle cx={tx} cy={options.targetY} r={active ? 5 : 4} fill={options.color} stroke="#fff" strokeWidth="2.5" />
      </g>
    );
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    panRef.current = { startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panRef.current) return;
    setOffset({
      x: panRef.current.originX + (event.clientX - panRef.current.startX),
      y: panRef.current.originY + (event.clientY - panRef.current.startY),
    });
  };

  const endPan = () => {
    panRef.current = null;
  };

  const handleNodePointerDown = (event: ReactPointerEvent<HTMLDivElement>, node: TaskNode) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    setDraggingNode({
      nodeId: node.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: node.positionX,
      startY: node.positionY,
      x: node.positionX,
      y: node.positionY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTriggerPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    setDraggingNode({
      nodeId: "__trigger__",
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: triggerPosition.x,
      startY: triggerPosition.y,
      x: triggerPosition.x,
      y: triggerPosition.y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleNodePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingNode) return;
    event.stopPropagation();
    setDraggingNode((current) => {
      if (!current) return current;
      return {
        ...current,
        x: snapDiagramValue(current.startX + (event.clientX - current.startClientX) / zoom),
        y: snapDiagramValue(current.startY + (event.clientY - current.startClientY) / zoom),
      };
    });
  };

  const endNodeDrag = (event: ReactPointerEvent<HTMLDivElement>, node: TaskNode) => {
    if (!draggingNode || draggingNode.nodeId !== node.id) return;
    event.stopPropagation();
    const snapped = {
      x: snapDiagramValue(draggingNode.x),
      y: snapDiagramValue(draggingNode.y),
    };
    setDraggingNode(null);
    void onMoveNode?.(node, snapped);
  };

  const endTriggerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingNode || draggingNode.nodeId !== "__trigger__") return;
    event.stopPropagation();
    const snapped = {
      x: snapDiagramValue(draggingNode.x),
      y: snapDiagramValue(draggingNode.y),
    };
    setDraggingNode(null);
    setTriggerPosition(snapped);
  };

  const clampZoom = (value: number) => Math.min(2, Math.max(0.4, Math.round(value * 100) / 100));

  const adjustZoom = (delta: number) => {
    setZoom((value) => clampZoom(value + delta));
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (draggingNode) return;
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const nextZoom = clampZoom(zoom - event.deltaY * 0.002);
      if (nextZoom === zoom) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      const diagramX = (cursorX - offset.x) / zoom;
      const diagramY = (cursorY - offset.y) / zoom;

      setZoom(nextZoom);
      setOffset({
        x: cursorX - diagramX * nextZoom,
        y: cursorY - diagramY * nextZoom,
      });
      return;
    }

    setOffset((current) => ({
      x: current.x - event.deltaX,
      y: current.y - event.deltaY,
    }));
  };

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;

    const updateViewportSize = () => {
      const rect = element.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    };

    updateViewportSize();
    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!focusNodeId || viewportSize.width <= 0 || viewportSize.height <= 0) return;
    const node = nodes.find((item) => item.id === focusNodeId);
    if (!node) return;

    const nodeCenterX = node.positionX + DIAGRAM_NODE_W / 2;
    const nodeCenterY = node.positionY + nodeHeightOf(node) / 2;
    const usableWidth = Math.max(320, viewportSize.width - focusRightInset);

    // 카메라 이동은 외부 트리거(focusNodeId)에 반응하는 부수효과지만, setState를
    // 다음 틱으로 미뤄 effect 본문에서의 동기 호출을 피한다.
    const panTimer = window.setTimeout(() => {
      setIsAutoPanning(true);
      setOffset({
        x: usableWidth / 2 - nodeCenterX * zoom,
        y: viewportSize.height / 2 - nodeCenterY * zoom,
      });
    }, 0);

    const settleTimer = window.setTimeout(() => setIsAutoPanning(false), 260);
    return () => {
      window.clearTimeout(panTimer);
      window.clearTimeout(settleTimer);
    };
  }, [focusNodeId, focusRightInset, viewportSize.width, viewportSize.height, zoom, nodes.length, !!trigger]);

  const minimapW = 220;
  const minimapH = 108;
  const minimapPadding = 12;
  const minimapWorldPadding = 40;
  const minimapMinX = Math.min(0, ...nodeRects.map((rect) => rect.x)) - minimapWorldPadding;
  const minimapMinY = Math.min(0, ...nodeRects.map((rect) => rect.y)) - minimapWorldPadding;
  const minimapMaxX = Math.max(DIAGRAM_NODE_W, ...nodeRects.map((rect) => rect.x + rect.width)) + minimapWorldPadding;
  const minimapMaxY = Math.max(DIAGRAM_NODE_H, ...nodeRects.map((rect) => rect.y + rect.height)) + minimapWorldPadding;
  const minimapWorldWidth = Math.max(1, minimapMaxX - minimapMinX);
  const minimapWorldHeight = Math.max(1, minimapMaxY - minimapMinY);
  const minimapScale = Math.min(
    (minimapW - minimapPadding * 2) / minimapWorldWidth,
    (minimapH - minimapPadding * 2) / minimapWorldHeight,
  );
  const minimapContentW = minimapWorldWidth * minimapScale;
  const minimapContentH = minimapWorldHeight * minimapScale;
  const minimapOffsetX = (minimapW - minimapContentW) / 2;
  const minimapOffsetY = (minimapH - minimapContentH) / 2;
  const toMinimapX = (value: number) => minimapOffsetX + (value - minimapMinX) * minimapScale;
  const toMinimapY = (value: number) => minimapOffsetY + (value - minimapMinY) * minimapScale;
  const visibleWidth = viewportSize.width / zoom;
  const visibleHeight = viewportSize.height / zoom;
  const visibleLeft = -offset.x / zoom;
  const visibleTop = -offset.y / zoom;
  const rawMinimapViewport = {
    x: toMinimapX(visibleLeft),
    y: toMinimapY(visibleTop),
    width: Math.max(8, visibleWidth * minimapScale),
    height: Math.max(8, visibleHeight * minimapScale),
  };
  const minimapViewportWidth = Math.max(8, Math.min(rawMinimapViewport.width, minimapContentW));
  const minimapViewportHeight = Math.max(8, Math.min(rawMinimapViewport.height, minimapContentH));
  const minimapViewport = {
    x: Math.max(minimapOffsetX, Math.min(rawMinimapViewport.x, minimapOffsetX + minimapContentW - minimapViewportWidth)),
    y: Math.max(minimapOffsetY, Math.min(rawMinimapViewport.y, minimapOffsetY + minimapContentH - minimapViewportHeight)),
    width: minimapViewportWidth,
    height: minimapViewportHeight,
  };

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
      style={{
        backgroundColor: "#fbfcfd",
        backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1.4px)",
        backgroundSize: `${DIAGRAM_GRID * zoom}px ${DIAGRAM_GRID * zoom}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPan}
      onPointerLeave={endPan}
      onWheel={handleWheel}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: contentWidth,
          height: contentHeight,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transition: isAutoPanning ? "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${contentWidth} ${contentHeight}`}>
          <defs>
            <style>
              {`@keyframes task-edge-flow { from { stroke-dashoffset: 14; } to { stroke-dashoffset: 0; } }`}
            </style>
          </defs>
          {trigger && firstNodeKey && rowIndexByKey.has(firstNodeKey) &&
            drawEdge(0, rowIndexByKey.get(firstNodeKey)!, {
              color: isTriggerEdgeActive ? "#3182F6" : "#cbd5e1",
              key: "trigger-edge",
              ...getEdgePortYs("__trigger__", firstNodeKey, "trigger-edge"),
              active: isTriggerEdgeActive,
            })}
          {edges.map((edge) => {
            const sourceIndex = rowIndexByKey.get(edge.sourceNodeKey);
            const targetIndex = rowIndexByKey.get(edge.targetNodeKey);
            if (sourceIndex === undefined || targetIndex === undefined) return null;
            const isActive = selectedNode?.nodeKey === edge.sourceNodeKey || selectedNode?.nodeKey === edge.targetNodeKey;
            const edgePorts = getEdgePortYs(edge.sourceNodeKey, edge.targetNodeKey, edge.id);
            const branchSourceY = getBranchSourceY(edge);

            return drawEdge(sourceIndex, targetIndex, {
              key: edge.id,
              color: isFallbackTaskEdge(edge) && isActive ? "#ef4444" : isActive ? "#3182F6" : "#cbd5e1",
              ...edgePorts,
              sourceY: branchSourceY ?? edgePorts.sourceY,
              routeOffset: incomingEdgeOffsetByKey.get(edge.id) ?? 0,
              active: isActive,
              label: edge.conditionType !== "always" && !isFallbackTaskEdge(edge) ? edge.conditionType : undefined,
            });
          })}
        </svg>

        {trigger && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTriggerClick?.();
            }}
            onPointerDown={handleTriggerPointerDown}
            onPointerMove={handleNodePointerMove}
            onPointerUp={endTriggerDrag}
            onPointerCancel={endTriggerDrag}
            className={`absolute flex cursor-grab flex-col rounded-[18px] border-2 bg-white px-4 pb-4 pt-6 text-left transition-shadow active:cursor-grabbing ${
              isTriggerSelected
                ? "border-blue-400 shadow-[0_12px_34px_rgba(49,130,246,0.18)]"
                : "border-blue-100 shadow-[0_8px_24px_rgba(15,23,42,0.07)] hover:border-blue-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
            }`}
            style={{ left: triggerXOf(), top: triggerYOf(), width: DIAGRAM_NODE_W, minHeight: DIAGRAM_NODE_H }}
          >
            <span
              className={`absolute -top-4 left-5 w-fit rounded-full px-3 py-1.5 text-[11px] font-extrabold shadow-sm ${
                isTriggerSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              트리거
            </span>
            <span className="absolute -top-4 right-5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold text-blue-600 shadow-sm">
              시작
            </span>
            <div className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-500">
                <Zap className="h-5 w-5 fill-current" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-extrabold text-gray-900">
                  {trigger.name || "트리거"}
                </div>
              </div>
            </div>
            <div className="mt-3 line-clamp-3 text-[12px] font-semibold leading-relaxed text-gray-500">
              {trigger.description || "트리거 조건을 설정해 주세요."}
            </div>
          </button>
        )}

        {rows.map((row) => {
          if (row.kind !== "node" || !row.node) return null;
          const node = row.node;
          const normalizedNodeType = normalizeTaskNodeType(node.nodeType);
          const Icon = nodeIconByType[normalizedNodeType] ?? MessageSquare;
          const iconColor = nodeTypeIconColor[normalizedNodeType] ?? "text-gray-500";
          const iconBackground = nodeTypeIconBackground[normalizedNodeType] ?? "bg-gray-100";
          const nodeTypeLabel = getTaskNodeDefinition(normalizedNodeType).label;
          const nodePrefix = formatNodePrefix(nodes.findIndex((item) => item.id === node.id));
          const nodeOutgoingEdges = outgoingEdgesOf(node.nodeKey);
          const shouldShowBranchRows = shouldShowNodeBranchRows(node);
          const isTerminalNode = readNextStepMode(node.config.next_step_mode) === "end";
          const branchTarget = nodeOutgoingEdges.find((edge) => !isFallbackTaskEdge(edge))?.targetNodeKey;
          const fallbackTarget = nodeOutgoingEdges.find((edge) => isFallbackTaskEdge(edge))?.targetNodeKey;
          const branchConditionText = readConfigString(node.config.branch_condition);
          const nodeDescription = describeTaskNode(node);

          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              onPointerDown={(event) => handleNodePointerDown(event, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={(event) => endNodeDrag(event, node)}
              onPointerCancel={(event) => endNodeDrag(event, node)}
              onClick={(event) => {
                event.stopPropagation();
                onNodeClick?.(node);
              }}
              className={`absolute flex cursor-grab flex-col rounded-[18px] border bg-white px-4 pb-4 pt-6 transition-shadow active:cursor-grabbing ${
                isSelected
                  ? "border-blue-400 shadow-[0_0_0_3px_rgba(49,130,246,0.25),0_8px_24px_rgba(15,23,42,0.1)]"
                  : "border-blue-100 shadow-[0_8px_24px_rgba(15,23,42,0.07)] hover:border-blue-200"
              }`}
              style={{ left: nodeXOf(node), top: nodeYOf(node), width: DIAGRAM_NODE_W, height: nodeHeightOf(node) }}
            >
              <span className={`absolute -top-4 left-5 w-fit rounded-full px-3 py-1.5 text-[11px] font-extrabold shadow-sm ${
                isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
              }`}>
                {nodeTypeLabel}
              </span>
              {isTerminalNode && (
                <span className="absolute -top-4 right-5 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-extrabold text-gray-600 shadow-sm">
                  종료
                </span>
              )}
              <div className={`flex items-center gap-2.5 ${nodeDescription || shouldShowBranchRows ? "" : "min-h-[82px]"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${iconBackground} ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`${nodeDescription || shouldShowBranchRows ? "text-[15px]" : "text-[16px]"} truncate font-extrabold text-gray-900`}>
                    {nodePrefix} {node.label}
                  </div>
                  {(nodeDescription || shouldShowBranchRows) && (
                    <div className="truncate text-[11px] font-bold text-gray-400">{node.nodeKey}</div>
                  )}
                </div>
              </div>
              {nodeDescription && (
                <div className={`mt-3 text-[12px] font-semibold leading-relaxed text-gray-500 ${
                  shouldShowBranchRows ? "line-clamp-2" : "line-clamp-3"
                }`}>
                  {nodeDescription}
                </div>
              )}
              {shouldShowBranchRows && branchConditionText && (
                <div className="mt-2 truncate rounded-[10px] bg-blue-50 px-2.5 py-1.5 text-[11px] font-extrabold text-blue-600">
                  IF {branchConditionText}
                </div>
              )}
              {shouldShowBranchRows && (
                <div className="absolute bottom-4 left-4 right-4 space-y-1.5 border-t border-gray-100 pt-2">
                  <div className="relative flex h-7 items-center justify-between rounded-[10px] bg-blue-50 px-2.5 text-[11px] font-extrabold text-blue-600">
                    <span>조건이 맞으면</span>
                    <span className="max-w-[120px] truncate text-blue-500">{labelForNodeKey(branchTarget)}</span>
                  </div>
                  <div className="relative flex h-7 items-center justify-between rounded-[10px] bg-gray-50 px-2.5 text-[11px] font-extrabold text-gray-500">
                    <span>일치하지 않으면</span>
                    <span className="max-w-[120px] truncate">{labelForNodeKey(fallbackTarget)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${contentWidth} ${contentHeight}`}>
          {trigger && firstNodeKey && rowIndexByKey.has(firstNodeKey) &&
            drawEdgePorts(0, rowIndexByKey.get(firstNodeKey)!, {
              color: isTriggerEdgeActive ? "#3182F6" : "#cbd5e1",
              key: "trigger-edge-ports",
              ...getEdgePortYs("__trigger__", firstNodeKey, "trigger-edge"),
              active: isTriggerEdgeActive,
            })}
          {edges.map((edge) => {
            const sourceIndex = rowIndexByKey.get(edge.sourceNodeKey);
            const targetIndex = rowIndexByKey.get(edge.targetNodeKey);
            if (sourceIndex === undefined || targetIndex === undefined) return null;
            const isActive = selectedNode?.nodeKey === edge.sourceNodeKey || selectedNode?.nodeKey === edge.targetNodeKey;
            const edgePorts = getEdgePortYs(edge.sourceNodeKey, edge.targetNodeKey, edge.id);
            const branchSourceY = getBranchSourceY(edge);

            return drawEdgePorts(sourceIndex, targetIndex, {
              key: `${edge.id}-ports`,
              color: isFallbackTaskEdge(edge) && isActive ? "#ef4444" : isActive ? "#3182F6" : "#cbd5e1",
              ...edgePorts,
              sourceY: branchSourceY ?? edgePorts.sourceY,
              active: isActive,
            });
          })}
        </svg>
      </div>

      <div
        className="absolute bottom-4 left-4 z-10 flex items-center divide-x divide-gray-200 overflow-hidden rounded-[14px] border border-gray-200 bg-white/95 shadow-sm backdrop-blur"
        style={{ width: minimapW }}
        onPointerDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
      >
        <span className="flex h-9 w-10 items-center justify-center text-gray-400">
          <Hand className="h-4 w-4" />
        </span>
        <div className="flex flex-1 items-center justify-center gap-1 divide-x divide-gray-200 px-1.5">
        <div className="flex items-center gap-1 pr-1.5">
        <button
          type="button"
          onClick={() => adjustZoom(-0.1)}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-gray-600 hover:bg-gray-100"
          aria-label="축소"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-[12px] font-extrabold text-gray-700">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => adjustZoom(0.1)}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-gray-600 hover:bg-gray-100"
          aria-label="확대"
        >
          <Plus className="h-4 w-4" />
        </button>
        </div>
        <div className="pl-1.5">
        <button
          type="button"
          onClick={() => {
            onAutoLayout?.();
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          disabled={!onAutoLayout}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-gray-600 hover:bg-gray-100"
          aria-label="자동 정렬"
        >
          <Workflow className="h-4 w-4" />
        </button>
        </div>
        </div>
      </div>

      <div
        className="absolute bottom-16 left-4 z-10 overflow-hidden rounded-[12px] border border-gray-200 bg-white/95 shadow-sm"
        style={{ width: minimapW, height: minimapH }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <svg width={minimapW} height={minimapH}>
          {rows.map((row, index) => (
            <rect
              key={`mini-${row.key}`}
              x={toMinimapX(xOf(index))}
              y={toMinimapY(yOf(index))}
              width={DIAGRAM_NODE_W * minimapScale}
              height={heightOfIndex(index) * minimapScale}
              rx={3}
              fill={row.kind === "trigger" ? "#93c5fd" : "#cbd5e1"}
            />
          ))}
          <rect
            x={minimapViewport.x}
            y={minimapViewport.y}
            width={minimapViewport.width}
            height={minimapViewport.height}
            rx={4}
            fill="rgba(49, 130, 246, 0.10)"
            stroke="#3182F6"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
