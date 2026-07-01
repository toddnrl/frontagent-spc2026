"use client";

import { InboxWorkspace } from "../../../../components/admin/inbox";
import type { CustomerSection } from "../../../../components/admin/types";
import { useAdminSessionContext } from "../../../../components/admin/AdminSessionContext";

export function InboxSectionContent({ section }: { section: CustomerSection }) {
  const session = useAdminSessionContext();

  if (!session.isReady || !session.user) return null;

  return <InboxWorkspace activeSection={section} user={session.user} />;
}
