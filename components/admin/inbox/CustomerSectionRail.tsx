import { Archive, CalendarClock, Inbox, Phone, Send, Tag, Users } from "lucide-react";
import Link from "next/link";
import type { CustomerSection } from "../types";

const customerItems: Array<{
  section: CustomerSection;
  label: string;
  icon: typeof Inbox;
}> = [
  { section: "conversations", label: "상담 수신함", icon: Inbox },
  { section: "calls", label: "전화", icon: Phone },
  { section: "customers", label: "고객", icon: Users },
  { section: "appointments", label: "예약", icon: CalendarClock },
  { section: "campaigns", label: "서비스", icon: Tag },
  { section: "outbound", label: "알림 발송", icon: Send },
];

export function CustomerSectionRail({ activeSection }: { activeSection: CustomerSection }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[20px]">
      <aside className="flex h-full flex-col items-center justify-between rounded-[20px] bg-white/60 py-4 backdrop-blur-md">
        <div className="flex flex-col gap-4 pt-1">
          {customerItems.map(({ section, label, icon: Icon }) => {
            const isActive = activeSection === section;

            return (
              <Link
                key={section}
                title={label}
                href={`/admin/inbox/${section}`}
                className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${
                  isActive
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:bg-[#e2e2e2]/60 hover:text-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
        <button className="text-gray-400" aria-label="보관함">
          <Archive className="h-5 w-5" />
        </button>
      </aside>
    </div>
  );
}
