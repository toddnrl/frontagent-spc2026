"use client";

import type { User } from "@supabase/supabase-js";
import { Bot, ChevronDown } from "lucide-react";
import type { OrganizationMembership } from "../../lib/organization";
import { Avatar } from "./ui";

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

      <div className="text-[15px] font-extrabold text-gray-900">AI CoS</div>

      <button onClick={onLogout} className="flex h-11 items-center gap-2 rounded-full bg-white px-3 shadow-sm">
        <Avatar label={user.user_metadata?.name?.[0] ?? user.email?.[0] ?? "U"} />
        <span className="text-[12px] font-bold text-green-500">●</span>
      </button>
    </header>
  );
}
