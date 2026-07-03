"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const triggerClass =
  "flex w-full items-center justify-between gap-2 bg-transparent text-left outline-none disabled:cursor-not-allowed disabled:opacity-40";

const contentClass =
  "z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1 shadow-lg";

const itemClass =
  "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-sm font-semibold text-gray-900 outline-none transition-colors focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

export function Select({
  value,
  onChange,
  options,
  placeholder = "선택",
  label,
  disabled = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  boxed = false,
  size = "md",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  boxed?: boolean;
  size?: "sm" | "md";
}) {
  const selected = options.find((option) => option.value === value);
  const textSize = size === "sm" ? "text-[13px]" : "text-[14px]";

  const field = (
    <RadixSelect.Root
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled || options.length === 0}
    >
      <RadixSelect.Trigger className={`${triggerClass} ${textSize} font-bold text-gray-800 ${triggerClassName}`.trim()}>
        <RadixSelect.Value placeholder={placeholder}>{selected?.label}</RadixSelect.Value>
        <RadixSelect.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          collisionPadding={8}
          className={`${contentClass} ${contentClassName}`.trim()}
        >
          <RadixSelect.Viewport className="min-w-[var(--radix-select-trigger-width)] p-0.5">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );

  if (!boxed && !label) {
    return <div className={className}>{field}</div>;
  }

  return (
    <label className={`block ${boxed ? "rounded-[14px] bg-[#f7f7f7] px-4 py-3" : ""} ${className}`.trim()}>
      {label ? (
        <span className="mb-1 block text-[11px] font-extrabold text-gray-400">{label}</span>
      ) : null}
      {field}
    </label>
  );
}

function SelectItem({
  value,
  disabled,
  children,
}: {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <RadixSelect.Item value={value} disabled={disabled} className={itemClass}>
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check className="h-3.5 w-3.5 text-blue-500" strokeWidth={3} />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
