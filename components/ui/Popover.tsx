"use client";

import * as Radix from "@radix-ui/react-popover";
import type { ReactNode } from "react";

export function Popover({
  trigger,
  children,
  align = "end",
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
}) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild>{trigger}</Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          side="bottom"
          align={align}
          sideOffset={8}
          collisionPadding={8}
          className="z-50 min-w-[200px] overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.10)]"
        >
          {children}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
