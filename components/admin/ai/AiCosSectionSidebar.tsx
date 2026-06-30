import Link from "next/link";
import { aiSectionItems } from "./aiSections";
import type { AiCosSection } from "./types";

export function AiCosSectionSidebar({ activeSection }: { activeSection: AiCosSection }) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[20px] bg-white px-4 py-7">
      <div className="mb-5 px-1">
        <h2 className="text-[22px] font-bold">AI CoS</h2>
      </div>

      <div className="-mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {aiSectionItems.map(({ section, label, icon: Icon, isReady }) => {
          const isActive = activeSection === section;

          return (
            <Link
              key={section}
              href={`/admin/ai/${section}`}
              aria-disabled={!isReady}
              className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-[14px] font-bold transition-colors ${
                isActive ? "bg-[#f2f6ff] text-blue-600" : "text-gray-600 hover:bg-gray-50"
              } ${!isReady ? "opacity-50" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
