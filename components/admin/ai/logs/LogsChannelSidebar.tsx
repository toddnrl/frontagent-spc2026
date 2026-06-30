import { ChevronDown, Search } from "lucide-react";
import { logsChannelLabel } from "./logsUtils";

export function LogsChannelSidebar({
  channels,
  channelFilter,
  totalCount,
  countByChannel,
  onChannelChange,
}: {
  channels: string[];
  channelFilter: string | "전체";
  totalCount: number;
  countByChannel: (channel: string) => number;
  onChannelChange: (channel: string | "전체") => void;
}) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-[#fafafa] px-4 py-7">
      <div className="mb-5 flex items-center justify-between px-1">
        <h2 className="text-[22px] font-bold">실행 로그</h2>
        <div className="flex gap-3 text-gray-500">
          <Search className="h-5 w-5" />
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-4 text-[13px] font-bold text-gray-400">채널</div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        <LogsFilterButton
          active={channelFilter === "전체"}
          label="전체"
          count={totalCount}
          onClick={() => onChannelChange("전체")}
        />
        {channels.map((channel) => (
          <LogsFilterButton
            key={channel}
            active={channelFilter === channel}
            label={logsChannelLabel[channel] ?? channel}
            count={countByChannel(channel)}
            onClick={() => onChannelChange(channel)}
          />
        ))}
      </div>
    </aside>
  );
}

function LogsFilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
        active ? "bg-[#e9e9e9] text-gray-950" : "text-gray-600 hover:bg-white"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="text-[12px] text-gray-400">{count}</span>
    </button>
  );
}
