"use client";

import * as Radix from "@radix-ui/react-dropdown-menu";
import { ChevronRight, SquarePen, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export type DropdownIconPreset = "edit" | "delete";

export type DropdownItem = {
  label: string;
  onClick?: () => void;
  icon?: ReactNode | DropdownIconPreset;
  variant?: "default" | "danger" | "accent";
  disabled?: boolean;
  separator?: boolean;
  children?: DropdownItem[];
};

const presetIcons: Record<DropdownIconPreset, ReactNode> = {
  edit: <SquarePen className="h-4 w-4" strokeWidth={2} />,
  delete: <Trash2 className="h-4 w-4" strokeWidth={2} />,
};

function resolveDropdownIcon(icon?: ReactNode | DropdownIconPreset) {
  if (!icon) return null;
  if (icon === "edit") return presetIcons.edit;
  if (icon === "delete") return presetIcons.delete;
  return icon;
}

const itemClass = (variant?: DropdownItem["variant"]) =>
  `flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 ${
    variant === "danger"
      ? "text-red-500 focus:bg-red-100"
      : variant === "accent"
        ? "text-blue-600 focus:bg-blue-50"
        : "text-gray-900 focus:bg-gray-100"
  }`;

const iconClass = (variant?: DropdownItem["variant"]) =>
  `shrink-0 text-gray-400 ${variant === "danger" ? "text-red-400" : ""}`;

const contentClass =
  "z-50 min-w-[160px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1 shadow-lg";

function DropdownItemNode({ item }: { item: DropdownItem }) {
  if (item.children && item.children.length > 0) {
    return (
      <Radix.Sub>
        <Radix.SubTrigger className={itemClass(item.variant)}>
          {item.icon ? <span className={iconClass(item.variant)}>{resolveDropdownIcon(item.icon)}</span> : null}
          <span className="flex-1">{item.label}</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Radix.SubTrigger>
        <Radix.Portal>
          <Radix.SubContent sideOffset={4} collisionPadding={8} className={contentClass}>
            {item.children.map((child) => (
              <DropdownItemNode key={child.label} item={child} />
            ))}
          </Radix.SubContent>
        </Radix.Portal>
      </Radix.Sub>
    );
  }

  return (
    <Radix.Item
      disabled={item.disabled}
      onSelect={item.onClick}
      className={itemClass(item.variant)}
    >
      {item.icon ? <span className={iconClass(item.variant)}>{resolveDropdownIcon(item.icon)}</span> : null}
      {item.label}
    </Radix.Item>
  );
}

export function Dropdown({
  trigger,
  items,
  align = "end",
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "center" | "end";
}) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild>{trigger}</Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          side="bottom"
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={contentClass}
        >
          {items.map((item) => (
            <div key={item.label}>
              {item.separator && <Radix.Separator className="my-1 h-px bg-gray-100" />}
              <DropdownItemNode item={item} />
            </div>
          ))}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
