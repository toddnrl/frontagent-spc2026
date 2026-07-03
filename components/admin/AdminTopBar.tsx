"use client";

import type { User } from "@supabase/supabase-js";
import { ChevronDown, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrganizationMembership } from "../../lib/organization";
import { TabRow } from "@/components/ui/TabRow";
import { Popover } from "@/components/ui/Popover";
import { Avatar } from "@/components/ui/Avatar";

const adminTabs = [
  { id: "inbox", label: "고객", href: "/admin/inbox" },
  { id: "team", label: "팀", href: "/admin/team" },
  { id: "ai", label: "AI CoS", href: "/admin/ai" },
] as const;

export function AdminTopBar({
  user,
  onLogout,
  memberships,
  selectedOrganizationId,
  onOrganizationChange,
}: {
  user: User;
  onLogout: () => void;
  memberships?: OrganizationMembership[];
  selectedOrganizationId?: string | null;
  onOrganizationChange?: (organizationId: string) => void;
}) {
  const pathname = usePathname();
  const activeTabId =
    adminTabs.find((tab) => pathname.startsWith(tab.href))?.id ?? adminTabs[adminTabs.length - 1].id;

  return (
    <header className="flex h-[70px] items-center justify-between px-5">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center rounded-full bg-white px-4 py-2 shadow-sm transition-colors hover:bg-gray-50">
          <span className="text-[17px] font-semibold">Callbee</span>
        </Link>
        {memberships && memberships.length > 0 && (
          <div className="relative flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
            <select
              value={selectedOrganizationId ?? ""}
              onChange={(event) => onOrganizationChange?.(event.target.value)}
              className="appearance-none bg-transparent pr-5 text-[14px] font-bold text-gray-700 outline-none"
            >
              {memberships.map((membership) => (
                <option key={membership.organizationId} value={membership.organizationId}>
                  {membership.organizationName}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
      </div>

      <TabRow
        variant="header"
        tabs={[...adminTabs]}
        active={activeTabId}
        className="w-[276px]"
      />

      <div className="flex items-center gap-3">
        <button className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-gray-500 shadow-sm">
          <Search className="h-5 w-5" />
          <span className="text-[15px] font-semibold">검색</span>
        </button>
        <Popover
          trigger={
            <button className="flex h-11 items-center gap-2 rounded-full bg-white px-3 shadow-sm hover:bg-gray-50 transition-colors">
              <Avatar label={user.user_metadata?.name?.[0] ?? user.email?.[0] ?? "U"} />
              <span className="text-[12px] font-bold text-green-500">●</span>
            </button>
          }
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-[13px] font-bold text-gray-900">
              {user.user_metadata?.name ?? user.email ?? "사용자"}
            </p>
            <p className="truncate text-[11px] font-medium text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </Popover>
      </div>
    </header>
  );
}
