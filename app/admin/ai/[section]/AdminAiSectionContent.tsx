"use client";

import {
  KnowledgeWorkspace,
  LogsWorkspace,
  RulesWorkspace,
  SettingsWorkspace,
  TasksWorkspace,
} from "../../../../components/admin/ai";
import type { AiCosSection } from "../../../../components/admin/ai/types";
import { useAdminSessionContext } from "../../../../components/admin/AdminSessionContext";
import { getOrganizationId } from "../../../../lib/organization";

export function AdminAiSectionContent({ section, label }: { section: AiCosSection; label: string }) {
  const session = useAdminSessionContext();

  if (!session.isReady || !session.user) return null;

  const organizationId = getOrganizationId(session.user);

  if (section === "knowledge") {
    return <KnowledgeWorkspace organizationId={organizationId} user={session.user} />;
  }

  if (section === "rules") {
    return <RulesWorkspace organizationId={organizationId} user={session.user} />;
  }

  if (section === "logs") {
    return <LogsWorkspace organizationId={organizationId} />;
  }

  if (section === "tasks") {
    return <TasksWorkspace organizationId={organizationId} user={session.user} />;
  }

  if (section === "settings") {
    return <SettingsWorkspace organizationId={organizationId} />;
  }

  return (
    <div className="flex min-h-0 items-center justify-center rounded-[20px] bg-white">
      <div className="text-center">
        <p className="text-[15px] font-extrabold text-gray-900">{label}</p>
        <p className="mt-1 text-[13px] font-bold text-gray-400">이 섹션({section})은 아직 이식 중입니다.</p>
      </div>
    </div>
  );
}
