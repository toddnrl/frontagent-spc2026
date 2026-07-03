import { CheckCircle2, ChevronDown, Clock, Plus } from "lucide-react";
import type { ReactNode } from "react";

export type Tone = "green" | "blue" | "amber" | "red" | "gray";

const toneClasses: Record<Tone, string> = {
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
};

export function WorkspaceMain({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <main className="min-w-0 overflow-y-auto rounded-[20px] bg-[#f8f8f8] p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold">{title}</h1>
          <p className="mt-1 text-[15px] font-semibold text-gray-400">
            {description}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-bold shadow-sm">
          <Plus className="h-4 w-4" />
          {action}
        </button>
      </div>
      {children}
    </main>
  );
}

export function WorkspacePanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[24px] bg-white p-5 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-[16px] font-bold">
        {icon}
        {title}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  tone = "green",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <section className="rounded-[22px] bg-white p-5">
      <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${toneClasses[tone]}`}>
        {label}
      </div>
      <div className="text-[30px] font-extrabold">{value}</div>
    </section>
  );
}

export function QueueRow({
  title,
  owner,
  description,
  status,
}: {
  title: string;
  owner: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] bg-[#f7f7f7] p-4">
      <div className="min-w-0">
        <div className="truncate font-bold">{title}</div>
        <div className="mt-1 truncate text-[13px] font-semibold text-gray-500">
          {owner} · {description}
        </div>
      </div>
      <StatusPill>{status}</StatusPill>
    </div>
  );
}

export function CompactQueueRows({
  rows,
}: {
  rows: [string, string, string, string][];
}) {
  return (
    <div className="grid gap-2">
      {rows.map(([title, owner, description, status]) => (
        <div
          key={`${title}-${owner}`}
          className="flex items-center justify-between gap-4 rounded-[16px] bg-[#f7f7f7] px-4 py-3"
        >
          <div className="min-w-0">
            <div className="truncate font-bold">{title}</div>
            <div className="truncate text-[12px] font-semibold text-gray-400">
              {owner} · {description}
            </div>
          </div>
          <StatusPill>{status}</StatusPill>
        </div>
      ))}
    </div>
  );
}

export function InfoCard({
  title,
  meta,
  text,
}: {
  title: string;
  meta: string;
  text: string;
}) {
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] p-4">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-bold">{title}</span>
        <span className="shrink-0 text-[12px] font-bold text-gray-400">
          {meta}
        </span>
      </div>
      <p className="text-[13px] font-semibold leading-relaxed text-gray-500">
        {text}
      </p>
    </div>
  );
}

export function DetailSidebar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <aside className="min-w-0 overflow-y-auto rounded-[20px] bg-white px-5 py-6">
      {children}
    </aside>
  );
}

export function DetailIntro({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f2f2f2]">
        {icon}
      </div>
      <h2 className="text-[24px] font-bold">{title}</h2>
      <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-500">
        {description}
      </p>
    </div>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <h3 className="mb-3 flex items-center gap-1 text-[16px] font-bold">
        {title}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[16px] bg-[#f7f7f7] px-4 py-3 text-[14px]">
      <span className="shrink-0 font-semibold text-gray-500">{label}</span>
      <span className="min-w-0 text-right font-bold">{value}</span>
    </div>
  );
}

export function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-[16px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-bold">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <span>{text}</span>
    </div>
  );
}

export function TimelineItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] p-4">
      <div className="mb-1 flex items-center gap-2 text-[14px] font-bold">
        <Clock className="h-4 w-4 text-gray-400" />
        {title}
      </div>
      <p className="text-[13px] font-semibold leading-relaxed text-gray-500">
        {text}
      </p>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
