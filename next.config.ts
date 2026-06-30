import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/agent-api/:path*",
        destination: "https://api.light-code.dev/:path*",
      },
    ];
  },
};

export default nextConfig;
