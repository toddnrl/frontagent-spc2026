// 비로그인 임베드 위젯(플로팅 챗/콜 버튼)용: 위젯이 어느 회사 사이트에
// 박혀있는지를 가리키는 정적 식별자라 로그인 유저의 조직과는 무관하다.
export function getEmbedOrganizationId() {
  const configuredOrgId = readString(process.env.NEXT_PUBLIC_AGENT_ORGANIZATION_ID);
  return configuredOrgId ?? "org_test";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
