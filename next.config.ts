import type { NextConfig } from "next";

// 로컬 개발 중 백엔드를 띄워놓고 테스트하려면 .env에
// AGENT_API_PROXY_TARGET=http://127.0.0.1:8000 을 추가한다. 설정이 없으면
// 기존처럼 배포된 서버로 프록시한다(.env.example 참고).
const agentApiProxyTarget = process.env.AGENT_API_PROXY_TARGET?.trim() || "https://api.light-code.dev";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/agent-api/:path*",
        destination: `${agentApiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
