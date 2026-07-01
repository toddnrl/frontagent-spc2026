import { ChevronDown, Send, Tag } from "lucide-react";
import { TabRow } from "../ui/TabRow";

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-4 right-4">
      <div className="pointer-events-auto rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="mb-3 max-w-[200px]">
          <TabRow tabs={["고객응대", "내부대화"]} />
        </div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="고객에게 보낼 메시지를 입력해 주세요."
          className="h-16 w-full resize-none text-sm outline-none placeholder:text-gray-400"
        />
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <button className="text-xl">＋</button>
            <span className="font-bold">T</span>
            <span>@</span>
            <Tag className="h-5 w-5" />
          </div>
          <button
            onClick={onSend}
            disabled={!onSend || disabled || !value.trim()}
            className="flex h-11 items-center gap-2 rounded-full bg-gray-400 px-4 text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
