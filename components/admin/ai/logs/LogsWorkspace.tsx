"use client";

import { RefreshCw } from "lucide-react";
import { PageHeader } from "../../ui";
import { LogsChannelSidebar } from "./LogsChannelSidebar";
import { LogsRunDetail } from "./LogsRunDetail";
import { LogsRunList } from "./LogsRunList";
import { useLogsWorkspace } from "./useLogsWorkspace";

export function LogsWorkspace({ organizationId }: { organizationId: string }) {
  const workspace = useLogsWorkspace(organizationId);

  return (
    <>
      <LogsChannelSidebar
        channels={workspace.channels}
        channelFilter={workspace.channelFilter}
        totalCount={workspace.runs.length}
        countByChannel={(channel) => workspace.runs.filter((run) => run.channel === channel).length}
        onChannelChange={workspace.setChannelFilter}
      />

      <div className="min-h-0 overflow-y-auto rounded-[20px] bg-white p-8">
        <PageHeader
          title="실행 로그"
          description="Agent가 어떤 지식, 규칙, 태스크를 사용했는지 채널별로 추적합니다."
          action="새로고침"
          actionIcon={<RefreshCw className="h-4 w-4" />}
          onAction={workspace.refresh}
        />
        <LogsRunList
          runs={workspace.visibleRuns}
          visibleCount={workspace.visibleCount}
          isLoading={workspace.isLoading}
          statusFilter={workspace.statusFilter}
          selectedRunId={workspace.selectedRunId}
          totalCount={workspace.channelFilteredCount}
          successCount={workspace.successCount}
          errorCount={workspace.errorCount}
          onSelectRun={workspace.setSelectedRunId}
          onStatusFilterChange={workspace.setStatusFilter}
          onLoadMore={workspace.onLoadMore}
        />
      </div>

      <LogsRunDetail selectedRun={workspace.selectedRun} />
    </>
  );
}
