"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type TabRowItem = {
  id: string;
  label: string;
  href?: string;
};

export type TabRowVariant = "default" | "header";

const variantClasses: Record<
  TabRowVariant,
  { root: string; item: string; active: string; inactive: string }
> = {
  default: {
    root: "rounded-full bg-[#f2f2f2] p-1 text-xs font-bold",
    item: "rounded-full px-3 py-2",
    active: "text-gray-950",
    inactive: "text-gray-400",
  },
  header: {
    root: "rounded-full bg-white/70 p-1 text-[15px] font-bold shadow-inner",
    item: "flex h-10 items-center justify-center rounded-full px-3",
    active: "text-gray-950",
    inactive: "text-gray-400",
  },
};

function normalizeTabs(tabs: string[] | TabRowItem[]): TabRowItem[] {
  if (tabs.length === 0) return [];
  if (typeof tabs[0] === "string") {
    return (tabs as string[]).map((label) => ({ id: label, label }));
  }
  return tabs as TabRowItem[];
}

export function TabRow({
  tabs,
  active,
  onChange,
  variant = "default",
  className = "",
  buttonClassName = "",
  inset = "0.25rem",
  gap = "0.25rem",
}: {
  tabs: string[] | TabRowItem[];
  active?: string;
  onChange?: (tabId: string) => void;
  variant?: TabRowVariant;
  className?: string;
  buttonClassName?: string;
  inset?: string;
  gap?: string;
}) {
  const items = useMemo(() => normalizeTabs(tabs), [tabs]);
  const [internalActive, setInternalActive] = useState(items[0]?.id ?? "");
  const activeId = active ?? internalActive;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  const styles = variantClasses[variant];

  const handleChange = (tabId: string) => {
    setInternalActive(tabId);
    onChange?.(tabId);
  };

  if (items.length === 0) return null;

  return (
    <div
      className={`relative grid gap-1 ${styles.root} ${className}`.trim()}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      <div
        aria-hidden="true"
        className="absolute rounded-full bg-white shadow-sm transition-[left] duration-300 ease-out"
        style={{
          top: inset,
          bottom: inset,
          width: `calc((100% - (${inset} * 2) - ${(items.length - 1)} * ${gap}) / ${items.length})`,
          left: `calc(${inset} + ${activeIndex} * ((100% - (${inset} * 2) - ${(items.length - 1)} * ${gap}) / ${items.length} + ${gap}))`,
        }}
      />
      {items.map((item) => {
        const isActive = item.id === activeId;
        const itemClassName = `relative z-10 transition-colors duration-200 ${styles.item} ${
          isActive ? styles.active : styles.inactive
        } ${buttonClassName}`.trim();

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              className={itemClassName}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleChange(item.id)}
            className={itemClassName}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
