"use client";

import { SettingsSection } from "./SettingsSection";
import { useSettingsWorkspace } from "./useSettingsWorkspace";

export function SettingsWorkspace({ organizationId }: { organizationId: string }) {
  const workspace = useSettingsWorkspace(organizationId);

  return (
    <div className="min-h-0 min-w-0 overflow-y-auto rounded-[20px] bg-white p-8 [scrollbar-gutter:stable]">
      <SettingsSection workspace={workspace} />
    </div>
  );
}
