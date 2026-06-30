"use client";

import { useCallback, useEffect, useState } from "react";
import type { RuleCreateInput, RuleItem, RuleUpdateInput } from "../types";
import { createRule, deleteRule, fetchRules, resetBuiltinRule, updateRule } from "./rulesApi";

function mapRuleInput(input: RuleUpdateInput): Partial<RuleItem> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.instruction !== undefined ? { instruction: input.instruction } : {}),
    ...(input.is_active !== undefined ? { active: input.is_active } : {}),
  };
}

export function useRulesWorkspace(organizationId: string) {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [isRulesLoading, setIsRulesLoading] = useState(false);
  const [isRulesMutating, setIsRulesMutating] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);

  const reloadRules = useCallback(async () => {
    setIsRulesLoading(true);
    setRulesError(null);

    try {
      const nextRules = await fetchRules(organizationId);
      setRules(nextRules);
    } catch (error) {
      setRulesError(error instanceof Error ? error.message : "Rules API 조회 실패");
    } finally {
      setIsRulesLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadRules() {
      if (isMounted) await reloadRules();
    }

    loadRules();

    return () => {
      isMounted = false;
    };
  }, [reloadRules]);

  const handleCreateRule = async (input: RuleCreateInput) => {
    setIsRulesMutating(true);
    setRulesError(null);

    try {
      const created = await createRule({ organizationId, data: input });
      await reloadRules();
      return created;
    } catch (error) {
      setRulesError(error instanceof Error ? error.message : "규칙 추가 실패");
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  const handleUpdateRule = async (ruleId: string, input: RuleUpdateInput) => {
    const previousRules = rules;
    setIsRulesMutating(true);
    setRulesError(null);
    setRules((current) => current.map((rule) => (rule.id === ruleId ? { ...rule, ...mapRuleInput(input) } : rule)));

    try {
      const updated = await updateRule({ organizationId, ruleId, data: input });
      setRules((current) => current.map((rule) => (rule.id === ruleId ? updated : rule)));
    } catch (error) {
      setRules(previousRules);
      setRulesError(error instanceof Error ? error.message : "규칙 수정 실패");
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  const handleResetBuiltinRule = async (ruleId: string) => {
    setIsRulesMutating(true);
    setRulesError(null);

    try {
      const reset = await resetBuiltinRule({ organizationId, ruleId });
      setRules((current) => current.map((rule) => (rule.id === ruleId ? reset : rule)));
    } catch (error) {
      setRulesError(error instanceof Error ? error.message : "규칙 초기화 실패");
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    setIsRulesMutating(true);
    setRulesError(null);

    try {
      await deleteRule({ organizationId, ruleId });
      await reloadRules();
    } catch (error) {
      setRulesError(error instanceof Error ? error.message : "규칙 삭제 실패");
      throw error;
    } finally {
      setIsRulesMutating(false);
    }
  };

  return {
    rules,
    isRulesLoading,
    isRulesMutating,
    rulesError,
    handleCreateRule,
    handleUpdateRule,
    handleResetBuiltinRule,
    handleDeleteRule,
  };
}
