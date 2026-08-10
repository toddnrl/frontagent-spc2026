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

export function AdminAiSectionContent({ section, label }: { section: AiCosSection; label: string }) {
  const session = useAdminSessionContext();

  if (!session.isReady || !session.user) return null;

  // useAdminSession이 organization_members 조회로 이미 검증한 값을 그대로 쓴다.
  // 멤버십이 없으면 유효한 organization_id가 없다는 뜻이라, 조직이 필요한
  // 화면을 잘못된 값으로 렌더링하는 대신 여기서 막는다.
  const organizationId = session.selectedOrganizationId;

  if (!organizationId) {
    return (
      <div className="flex min-h-0 items-center justify-center rounded-[20px] bg-white">
        <div className="text-center">
          <p className="text-[15px] font-extrabold text-gray-900">연결된 조직이 없습니다</p>
          <p className="mt-1 text-[13px] font-bold text-gray-400">
            이 계정에 연결된 조직이 없어 {label} 화면을 표시할 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

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
