import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.39", "100.73.17.117"],
  async redirects() {
    return ["listening", "songs", "music"].map((alias) => ({
      source: `/${alias}`,
      destination: "/listen",
      permanent: true,
    }));
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
