"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { fetchOrganizationMemberships, type OrganizationMembership } from "../../lib/organization";
import { isSupabaseReady, supabase } from "../../lib/supabase";

export function useAdminSession() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(!isSupabaseReady);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [membershipsLoaded, setMembershipsLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseReady) return;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        setIsAuthReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 로그인 시 1회만 organization_members를 조회한다. 조직 전환은 이후
  // selectedOrganizationId만 바꾸는 것으로 처리되어 추가 조회가 없다.
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    fetchOrganizationMemberships(user.id).then((items) => {
      if (isCancelled) return;
      setMemberships(items);
      setSelectedOrganizationId((current) => current ?? items[0]?.organizationId ?? null);
      setMembershipsLoaded(true);
    });

    // 로그아웃(user가 null로 바뀜) 시 이전 조직 정보가 남지 않도록 정리한다.
    return () => {
      isCancelled = true;
      setMemberships([]);
      setSelectedOrganizationId(null);
      setMembershipsLoaded(false);
    };
  }, [user]);

  // 기존 getOrganizationId(user) 호출부를 그대로 두기 위해, 선택된
  // organizationId를 user.app_metadata에 합성해 내려준다.
  const userWithOrganization = useMemo(() => {
    if (!user || !selectedOrganizationId) return user;
    return {
      ...user,
      app_metadata: { ...user.app_metadata, organization_id: selectedOrganizationId },
    };
  }, [user, selectedOrganizationId]);

  const isOrganizationReady = !user || membershipsLoaded;

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return {
    user: userWithOrganization,
    isReady: isAuthReady && isOrganizationReady,
    memberships,
    selectedOrganizationId,
    onOrganizationChange: setSelectedOrganizationId,
    onLogout: handleLogout,
  };
}
