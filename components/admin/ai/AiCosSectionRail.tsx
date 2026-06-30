import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { aiSectionItems } from "./aiSections";
import type { AiCosSection } from "./types";

export function AiCosSectionRail({ activeSection }: { activeSection: AiCosSection }) {
  return (
    <aside className="flex h-full min-w-0 flex-col items-center justify-between overflow-hidden rounded-[20px] bg-white/60 py-4 backdrop-blur-md">
      <div className="flex flex-col gap-4 pt-1">
        {aiSectionItems.map(({ section, label, icon: Icon, isReady }) => {
          const isActive = activeSection === section;

          return (
            <Link
              key={section}
              href={`/admin/ai/${section}`}
              title={label}
              aria-disabled={!isReady}
              className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${
                isActive ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:bg-[#e2e2e2]/60 hover:text-gray-800"
              } ${!isReady ? "opacity-50" : ""}`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
      <button className="text-gray-400">
        <HelpCircle className="h-5 w-5" />
      </button>
    </aside>
  );
}
