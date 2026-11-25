"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { preload } from "react-dom";
import { LISTEN_PERIODS } from "../../lib/lastfm";
import { loadListenSnapshot } from "../../lib/listen-cache";
import { requestWidget } from "../../lib/widget-request";

const PORTFOLIO_ROUTES = [
  "/",
  "/developing",
  "/listen",
  "/birthday",
  "/ask",
  "/docs",
] as const;

const GITHUB_STATUS = "/api/status/github";
const LISTEN_DEFAULT = "/api/listen?period=7day";

function listenRankingsUrl(period: (typeof LISTEN_PERIODS)[number]) {
  return period === "7day"
    ? LISTEN_DEFAULT
    : `/api/listen?view=rankings&period=${period}`;
}

/** Warm portfolio routes and widget caches as soon as the site shell mounts. */
export default function PortfolioPreloads() {
  const router = useRouter();

  useEffect(() => {
    for (const href of PORTFOLIO_ROUTES) {
      router.prefetch(href);
    }

    preload(GITHUB_STATUS, { as: "fetch", crossOrigin: "anonymous" });
    preload(LISTEN_DEFAULT, { as: "fetch", crossOrigin: "anonymous" });

    void import("../../developing/developing");
    void import("../../listen/listen-dashboard");

    void requestWidget(GITHUB_STATUS).catch(() => {
      // Developing falls back to its empty showcase when GitHub is unavailable.
    });
    void loadListenSnapshot(LISTEN_DEFAULT).catch(() => {
      // Listening shows its own error state if the first warm fails.
    });

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 1);
    const cancelIdle =
      typeof window.cancelIdleCallback === "function"
        ? window.cancelIdleCallback
        : (id: number) => window.clearTimeout(id);

    const idleId = idle(() => {
      for (const period of LISTEN_PERIODS) {
        if (period === "7day") continue;
        void loadListenSnapshot(listenRankingsUrl(period)).catch(() => {});
      }
    });

    return () => {
      cancelIdle(idleId as number);
    };
  }, [router]);

  return null;
}
