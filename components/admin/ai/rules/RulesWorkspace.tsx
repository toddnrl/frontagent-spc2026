"use client";

import { RulesSection } from "./RulesSection";
import { useRulesWorkspace } from "./useRulesWorkspace";

export function RulesWorkspace({ organizationId }: { organizationId: string }) {
  const workspace = useRulesWorkspace(organizationId);

  return (
    <div className="min-h-0 overflow-y-auto rounded-[20px] bg-white p-8">
      <RulesSection
        rules={workspace.rules}
        isLoading={workspace.isRulesLoading}
        isMutating={workspace.isRulesMutating}
        error={workspace.rulesError}
        onCreate={workspace.handleCreateRule}
        onUpdate={workspace.handleUpdateRule}
        onResetBuiltin={workspace.handleResetBuiltinRule}
        onDelete={workspace.handleDeleteRule}
      />
    </div>
  );
}
