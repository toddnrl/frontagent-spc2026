"use client";

import type { User } from "@supabase/supabase-js";
import { Bot, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrganizationMembership } from "../../lib/organization";
import { Avatar } from "./ui";

const tabs = [
  { label: "고객", href: "/admin/inbox" },
  { label: "팀", href: "/admin/team" },
  { label: "AI CoS", href: "/admin/ai" },
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
  const activeTabIndex = tabs.findIndex((tab) => pathname.startsWith(tab.href));
  const indicatorIndex = activeTabIndex >= 0 ? activeTabIndex : tabs.length - 1;

  return (
    <header className="flex h-[70px] items-center justify-between px-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-black text-white">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-[17px] font-semibold">Front Desk</span>
        </div>
        {memberships && memberships.length > 0 && (
          <div className="relative flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gray-100 text-gray-500">
              <Bot className="h-4 w-4" />
            </div>
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

      <div className="relative grid w-[276px] grid-cols-3 rounded-full bg-white/70 p-1 shadow-inner">
        <div
          className="absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${indicatorIndex * 100}%)` }}
        />
        {tabs.map((tab, index) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative z-10 flex h-10 items-center justify-center rounded-full text-[15px] font-bold transition-colors duration-200 ${
              index === indicatorIndex ? "text-gray-950" : "text-gray-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-gray-500 shadow-sm">
          <Search className="h-5 w-5" />
          <span className="text-[15px] font-semibold">검색</span>
        </button>
        <button onClick={onLogout} className="flex h-11 items-center gap-2 rounded-full bg-white px-3 shadow-sm">
          <Avatar label={user.user_metadata?.name?.[0] ?? user.email?.[0] ?? "U"} />
          <span className="text-[12px] font-bold text-green-500">●</span>
        </button>
      </div>
    </header>
  );
}
