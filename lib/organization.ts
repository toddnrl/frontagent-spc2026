import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type OrganizationMembership = {
  organizationId: string;
  organizationName: string;
  role: string;
};

// 로그인한 유저가 속한 조직 목록을 organization_members에서 조회한다.
// 로그인 시 1회만 호출하면 되는 가벼운 단일 인덱스 조회다.
export async function fetchOrganizationMemberships(
  userId: string,
): Promise<OrganizationMembership[]> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name)")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      organizationId: row.organization_id as string,
      organizationName: (organization as { name: string } | null)?.name ?? "조직",
      role: row.role as string,
    };
  });
}

// 로그인 콘솔(백오피스)용: organization_id는 App 최상단에서 organization_members를
// 조회한 뒤 user.app_metadata에 합성해 내려준다. 멤버십이 없는 과도기에는
// env 설정값 또는 "org_test"로 폴백해 기존 호출부(string 기대)가 깨지지 않게 한다.
export function getOrganizationId(user?: User | null) {
  const appMetadataOrgId = readString(user?.app_metadata?.organization_id);
  if (isUuid(appMetadataOrgId)) return appMetadataOrgId;

  const configuredOrgId = readString(process.env.NEXT_PUBLIC_AGENT_ORGANIZATION_ID);
  return configuredOrgId ?? "org_test";
}

// 비로그인 임베드 위젯(플로팅 챗/콜 버튼)용: 위젯이 어느 회사 사이트에
// 박혀있는지를 가리키는 정적 식별자라 로그인 유저의 조직과는 무관하다.
export function getEmbedOrganizationId() {
  const configuredOrgId = readString(process.env.NEXT_PUBLIC_AGENT_ORGANIZATION_ID);
  return configuredOrgId ?? "org_test";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isUuid(value: string | null): value is string {
  return value !== null && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
