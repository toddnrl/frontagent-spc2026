"use client";

import { useState } from "react";
import useSWR, { type KeyedMutator } from "swr";
import type { RuleCreateInput, RuleItem, RuleUpdateInput } from "../types";
import { createRule, deleteRule, fetchRules, getRulesWorkspaceKey, resetBuiltinRule, updateRule } from "./rulesApi";

function mapRuleInput(input: RuleUpdateInput): Partial<RuleItem> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.instruction !== undefined ? { instruction: input.instruction } : {}),
    ...(input.is_active !== undefined ? { active: input.is_active } : {}),
  };
}

function patchRulesCache(mutate: KeyedMutator<RuleItem[]>, patch: (current: RuleItem[]) => RuleItem[]) {
  return mutate((current) => (current ? patch(current) : current), { revalidate: false });
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useRulesWorkspace(organizationId: string) {
  const swrKey = organizationId ? getRulesWorkspaceKey(organizationId) : null;
  const { data, error, isLoading, mutate } = useSWR(swrKey, () => fetchRules(organizationId));

  const rules = data ?? [];
  const [isRulesMutating, setIsRulesMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const rulesError =
    mutationError ??
    (error instanceof Error ? error.message : error ? "Rules API 조회 실패" : null);

  const handleCreateRule = async (input: RuleCreateInput) => {
    setIsRulesMutating(true);
    setMutationError(null);

    try {
      const created = await createRule({ organizationId, data: input });
      await mutate();
      return created;
    } catch (error) {
      setMutationError(toErrorMessage(error, "규칙 추가 실패"));
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  const handleUpdateRule = async (ruleId: string, input: RuleUpdateInput) => {
    const previousRules = data;
    setIsRulesMutating(true);
    setMutationError(null);

    await patchRulesCache(mutate, (current) =>
      current.map((rule) => (rule.id === ruleId ? { ...rule, ...mapRuleInput(input) } : rule)),
    );

    try {
      const updated = await updateRule({ organizationId, ruleId, data: input });
      await patchRulesCache(mutate, (current) =>
        current.map((rule) => (rule.id === ruleId ? updated : rule)),
      );
    } catch (error) {
      if (previousRules) {
        await mutate(previousRules, { revalidate: false });
      } else {
        await mutate();
      }
      setMutationError(toErrorMessage(error, "규칙 수정 실패"));
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  const handleResetBuiltinRule = async (ruleId: string) => {
    setIsRulesMutating(true);
    setMutationError(null);

    try {
      const reset = await resetBuiltinRule({ organizationId, ruleId });
      await patchRulesCache(mutate, (current) => current.map((rule) => (rule.id === ruleId ? reset : rule)));
    } catch (error) {
      setMutationError(toErrorMessage(error, "규칙 초기화 실패"));
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    setIsRulesMutating(true);
    setMutationError(null);

    try {
      await deleteRule({ organizationId, ruleId });
      await mutate();
    } catch (error) {
      setMutationError(toErrorMessage(error, "규칙 삭제 실패"));
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  return {
    rules,
    isRulesLoading: isLoading,
    isRulesMutating,
    rulesError,
    handleCreateRule,
    handleUpdateRule,
    handleResetBuiltinRule,
    handleDeleteRule,
  };
}
