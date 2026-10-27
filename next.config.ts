import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.39"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/status",
          destination: "https://api.rynni.cc/v2/discord/user/1",
        },
        {
          source: "/api/status/spotify",
          destination: "https://sptf.rynni.cc/api/spotify",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
