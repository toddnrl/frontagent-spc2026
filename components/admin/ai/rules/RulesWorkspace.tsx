"use client";

import type { User } from "@supabase/supabase-js";
import { AiCosDetailPanel } from "../AiCosDetailPanel";
import { RulesSection } from "./RulesSection";
import { useRulesWorkspace } from "./useRulesWorkspace";

export function RulesWorkspace({ organizationId, user }: { organizationId: string; user?: User | null }) {
  const workspace = useRulesWorkspace(organizationId);

  return (
    <>
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
      <AiCosDetailPanel activeSection="rules" organizationId={organizationId} user={user} />
    </>
  );
}
