import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function PanelSection({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-gray-100">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f3f4f6] text-gray-700">
            {icon}
          </span>
          <span className="truncate text-[16px] font-extrabold text-gray-900">{title}</span>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}
