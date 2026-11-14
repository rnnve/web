"use client";

import { useCallback, useEffect, useState } from "react";
import Stacks from "../components/home/stacks";
import GitHubShowcase from "../components/status/github-showcase";
import WidgetPreloads from "../components/status/widget-preloads";
import SectionRevealController from "../components/effects/section-reveal-controller";
import { readWidgetSnapshot, requestWidget } from "../lib/widget-request";
import { useSiteSettings } from "../components/settings/site-settings-provider";

type GitHubPayload = { repos: unknown; events: unknown };

export default function Developing() {
  const { t } = useSiteSettings();
  const [github, setGitHub] = useState<GitHubPayload>({
    repos: [],
    events: [],
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
      className="root-empty [&_section[data-reveal]]:!transform-none [&_section[data-reveal]]:!will-change-[opacity]"
      aria-label={t("Developing", "งานพัฒนา")}
    >
      <h1 className="sr-only">{t("Developing", "งานพัฒนา")}</h1>
      <WidgetPreloads />
      <SectionRevealController />
      <GitHubShowcase
        repos={github.repos}
        events={github.events}
        loading={githubLoading}
      />
      <Stacks />
    </main>
  );
}
