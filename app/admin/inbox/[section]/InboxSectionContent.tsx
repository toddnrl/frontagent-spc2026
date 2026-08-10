"use client";

import { InboxWorkspace } from "../../../../components/admin/inbox";
import type { CustomerSection } from "../../../../components/admin/types";
import { useAdminSessionContext } from "../../../../components/admin/AdminSessionContext";

export function InboxSectionContent({ section }: { section: CustomerSection }) {
  const session = useAdminSessionContext();

  if (!session.isReady || !session.user) return null;

  // InboxWorkspace 하위 컴포넌트들은 user.app_metadata.organization_id를
  // 읽어 organization_id를 만든다. 멤버십이 없어 selectedOrganizationId가
  // 없으면 그 값도 만들어질 수 없으므로, 여기서 미리 막아 잘못된 organization_id로
  // API를 호출하지 않게 한다.
  if (!session.selectedOrganizationId) {
    return (
      <div className="flex h-[calc(100vh-70px)] items-center justify-center text-[14px] font-semibold text-gray-400">
        연결된 조직이 없어 상담 내역을 표시할 수 없습니다.
      </div>
    );
  }

  return <InboxWorkspace activeSection={section} user={session.user} />;
}
