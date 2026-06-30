"use client";

import { useState } from "react";

export function TabRow({
  tabs,
  active,
  onChange,
  className = "",
  buttonClassName = "",
  inset = "0.25rem",
  gap = "0.25rem",
}: {
  tabs: string[];
  active?: string;
  onChange?: (tab: string) => void;
  className?: string;
  buttonClassName?: string;
  inset?: string;
  gap?: string;
}) {
  const [internalActive, setInternalActive] = useState(tabs[0]);
  const activeTab = active ?? internalActive;
  const activeIndex = Math.max(0, tabs.indexOf(activeTab));

  const handleChange = (tab: string) => {
    setInternalActive(tab);
    onChange?.(tab);
  };

  return (
    <div
      className={`relative grid gap-1 rounded-full bg-[#f2f2f2] p-1 text-xs font-bold ${className}`}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      <div
        className="absolute bottom-1 top-1 rounded-full bg-white shadow-sm transition-[left] duration-300 ease-out"
        style={{
          top: inset,
          bottom: inset,
          width: `calc((100% - (${inset} * 2) - ${(tabs.length - 1)} * ${gap}) / ${tabs.length})`,
          left: `calc(${inset} + ${activeIndex} * ((100% - (${inset} * 2) - ${(tabs.length - 1)} * ${gap}) / ${tabs.length} + ${gap}))`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleChange(tab)}
          className={`relative z-10 rounded-full px-3 py-2 transition-colors duration-200 ${
            tab === activeTab ? "text-gray-950" : "text-gray-400"
          } ${buttonClassName}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
