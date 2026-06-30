"use client";

import type { ReactNode } from "react";
import { AdminTopBar } from "../../components/admin/AdminTopBar";
import { AdminSessionProvider, useAdminSessionContext } from "../../components/admin/AdminSessionContext";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const session = useAdminSessionContext();

  if (!session.isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7] font-sans text-[13px] font-bold text-gray-400">
        관리자 세션 확인 중...
      </div>
    );
  }

  if (!session.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7] font-sans text-[13px] font-bold text-gray-400">
        로그인이 필요합니다.
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#ececec] text-[#1f1f1f]">
      <AdminTopBar
        user={session.user}
        onLogout={session.onLogout}
        memberships={session.memberships}
        selectedOrganizationId={session.selectedOrganizationId}
        onOrganizationChange={session.onOrganizationChange}
      />
      {children}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminSessionProvider>
  );
}
