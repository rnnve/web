import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";

function getCommitHash() {
  const deploymentHash =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.COMMIT_REF;
  if (deploymentHash && /^[a-f0-9]{7,40}$/i.test(deploymentHash)) {
    return deploymentHash;
  }

  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**",
      },
    ],
  },
  // Preserve navigation headers so Markdown negotiation can leave React requests alone.
  skipProxyUrlNormalize: true,
  env: { NEXT_PUBLIC_COMMIT_HASH: getCommitHash() },
  allowedDevOrigins: ["192.168.1.39", "100.73.17.117", "100.119.174.10"],
  async redirects() {
    return [
      ...["/sitemap", "/sm.xml"].map((source) => ({
        source,
        destination: "/sitemap.xml",
        permanent: true,
      })),
      { source: "/nt", destination: "/newtab", permanent: true },
      ...["listening", "songs", "music"].map((alias) => ({
        source: `/${alias}`,
        destination: "/listen",
        permanent: true,
      })),
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
