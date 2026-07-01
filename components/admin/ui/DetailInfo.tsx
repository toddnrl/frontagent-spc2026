import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-7">
      <h3 className="mb-4 flex items-center gap-1 text-base font-bold">
        {title}
        <ChevronDown className="h-4 w-4" />
      </h3>
      {children}
    </section>
  );
}

export function DetailRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="space-y-4">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 text-sm">
          <span className="shrink-0 text-gray-500">{label}</span>
          <span className="text-right font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}
