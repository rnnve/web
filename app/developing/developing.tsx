"use client";

import { useCallback, useEffect, useState } from "react";
import { IconCode } from "@tabler/icons-react";
import Stacks from "../components/home/stacks";
import GitHubShowcase from "../components/status/github-showcase";
import WidgetPreloads from "../components/status/widget-preloads";
import { readWidgetSnapshot, requestWidget } from "../lib/widget-request";
import { useSiteSettings } from "../components/settings/site-settings-provider";

type GitHubPayload = { repos: unknown; contributions: unknown };

export default function Developing() {
  const { t } = useSiteSettings();
  const [github, setGitHub] = useState<GitHubPayload>({
    repos: [],
    contributions: null,
  });
  const [githubLoading, setGitHubLoading] = useState(true);
  const loadGitHub = useCallback(async () => {
    try {
      const next = await requestWidget<GitHubPayload>("/api/status/github");
      setGitHub(next);
    } catch {
      // The showcase falls back to its empty state when GitHub is unavailable.
    } finally {
      setGitHubLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    const refresh = () => {
      window.clearInterval(interval);
      if (document.hidden) return;
      void loadGitHub();
      interval = window.setInterval(loadGitHub, 300_000);
    };
    document.addEventListener("visibilitychange", refresh);
    const frame = window.requestAnimationFrame(() => {
      const cached = readWidgetSnapshot<GitHubPayload>("/api/status/github");
      if (cached) {
        setGitHub(cached);
        setGitHubLoading(false);
      }
      refresh();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadGitHub]);

  return (
    <main
      className="mx-auto w-[min(720px,calc(100%-40px))] pb-24 max-[767px]:pb-32"
      aria-label={t("Developing", "งานพัฒนา")}
    >
      <header className="mb-8 max-w-xl">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconCode size={14} stroke={1.75} aria-hidden="true" />
          {t("Code & craft", "โค้ดและงานสร้างสรรค์")}
        </p>
        <h1 className="text-3xl font-medium tracking-tight">
          {t("Developing", "งานพัฒนา")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(
            "Discord bots, websites, and the tools I use to bring ideas to life.",
            "บอท Discord เว็บไซต์ และเครื่องมือที่เราใช้สร้างไอเดียให้เป็นจริง",
          )}
        </p>
      </header>
      <WidgetPreloads />
      <GitHubShowcase
        repos={github.repos}
        contributions={github.contributions}
        loading={githubLoading}
      />
      <Stacks />
    </main>
  );
}
