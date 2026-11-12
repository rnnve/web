"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { discordStream, spotifyStream } from "@/app/lib/status-stream";
import { readWidgetSnapshot, requestWidget } from "@/app/lib/widget-request";
import { normalizeSpotify } from "@/app/lib/spotify";
import type { DiscordProfile } from "@/app/lib/status-types";

type GitHubPayload = { repos: unknown; events: unknown };

export default function usePortfolioStatus() {
  const discord = useSyncExternalStore(
    discordStream.subscribe,
    discordStream.getSnapshot,
    discordStream.getServerSnapshot,
  );
  const spotify = useSyncExternalStore(
    spotifyStream.subscribe,
    spotifyStream.getSnapshot,
    spotifyStream.getServerSnapshot,
  );
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

  return {
    payload: {
      githubRepos: github.repos,
      githubEvents: github.events,
      errors: { spotify: spotify.error },
    },
    discord: discord.data as DiscordProfile | null,
    spotify: normalizeSpotify(spotify.data),
    spotifyLoading: !spotify.updatedAt && !spotify.error,
    githubLoading,
    spotifySyncedAt: spotify.updatedAt,
  };
}
