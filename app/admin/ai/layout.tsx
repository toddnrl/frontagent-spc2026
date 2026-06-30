"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AiCosSectionRail, AiCosSectionSidebar } from "../../../components/admin/ai";
import type { AiCosSection } from "../../../components/admin/ai/types";

const knownSections: AiCosSection[] = [
  "overview",
  "knowledge",
  "rules",
  "tasks",
  "test",
  "logs",
  "monitoring",
  "status",
  "docs",
  "settings",
];

function getActiveSection(pathname: string): AiCosSection {
  const [, , , section] = pathname.split("/");
  return knownSections.includes(section as AiCosSection) ? (section as AiCosSection) : "knowledge";
}

export default function AdminAiLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSection = getActiveSection(pathname);
  const sectionsWithSidebar: AiCosSection[] = ["knowledge", "logs"];

  const gridTemplateColumns = sectionsWithSidebar.includes(activeSection)
    ? "76px 240px 280px minmax(520px,1fr) 360px"
    : "76px 240px minmax(720px,1fr) 360px";

  return (
    <div
      className="grid h-[calc(100vh-70px)] min-h-0 gap-2 overflow-hidden px-2 pb-2"
      style={{ gridTemplateColumns }}
    >
      <AiCosSectionRail activeSection={activeSection} />
      <AiCosSectionSidebar activeSection={activeSection} />
      {children}
    </div>
  );
}
