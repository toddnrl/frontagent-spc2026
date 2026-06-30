"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgentRun } from "../types";
import { fetchAgentRuns } from "./logsApi";
import { LOGS_POLL_INTERVAL_MS, mapAgentRunRecord } from "./logsUtils";

const VISIBLE_PAGE_SIZE = 50;

export function useLogsWorkspace(organizationId: string) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<string | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<AgentRun["status"] | "전체">("전체");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_PAGE_SIZE);

  const loadRuns = useCallback(() => {
    return fetchAgentRuns(organizationId)
      .then((payload) => {
        setRuns((payload.items ?? []).map(mapAgentRunRecord));
      })
      .catch(() => setRuns([]))
      .finally(() => setIsLoading(false));
  }, [organizationId]);

  useEffect(() => {
    void loadRuns();
    const intervalId = window.setInterval(loadRuns, LOGS_POLL_INTERVAL_MS);
    // organizationId(=loadRuns)가 바뀌면 이전 조직의 runs가 화면에 남지 않도록
    // 다음 effect가 새로 데이터를 불러오기 전까지 로딩 상태로 되돌린다.
    return () => {
      window.clearInterval(intervalId);
      setIsLoading(true);
    };
  }, [loadRuns]);

  const channels = useMemo<string[]>(
    () => Array.from(new Set(runs.map((run) => run.channel).filter((channel): channel is string => Boolean(channel)))),
    [runs],
  );

  const channelFilteredRuns = useMemo(
    () => (channelFilter === "전체" ? runs : runs.filter((run) => run.channel === channelFilter)),
    [runs, channelFilter],
  );

  const visibleRuns = useMemo(
    () => (statusFilter === "전체" ? channelFilteredRuns : channelFilteredRuns.filter((run) => run.status === statusFilter)),
    [channelFilteredRuns, statusFilter],
  );

  // 필터를 바꾸면 페이지네이션을 처음부터 다시 보여준다.
  const changeChannelFilter = (filter: string | "전체") => {
    setChannelFilter(filter);
    setVisibleCount(VISIBLE_PAGE_SIZE);
  };

  const changeStatusFilter = (filter: AgentRun["status"] | "전체") => {
    setStatusFilter(filter);
    setVisibleCount(VISIBLE_PAGE_SIZE);
  };

  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? null;
  const successCount = channelFilteredRuns.filter((run) => run.status === "success").length;
  const errorCount = channelFilteredRuns.filter((run) => run.status === "error").length;

  return {
    runs,
    isLoading,
    channels,
    channelFilter,
    setChannelFilter: changeChannelFilter,
    statusFilter,
    setStatusFilter: changeStatusFilter,
    selectedRunId,
    setSelectedRunId,
    selectedRun,
    visibleRuns,
    visibleCount,
    onLoadMore: () => setVisibleCount((count) => Math.min(count + VISIBLE_PAGE_SIZE, visibleRuns.length)),
    channelFilteredCount: channelFilteredRuns.length,
    successCount,
    errorCount,
    refresh: () => {
      setIsLoading(true);
      void loadRuns();
    },
  };
}
