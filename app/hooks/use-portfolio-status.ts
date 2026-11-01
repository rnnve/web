"use client";

import { useCallback, useEffect, useState } from "react";
import { isRecord } from "@/app/lib/json";
import { readWidgetSnapshot, requestWidget } from "@/app/lib/widget-request";
import { normalizeSpotify } from "@/app/lib/spotify";
import type { DiscordProfile } from "@/app/lib/status-types";

type StatusPayload = {
  discord: unknown;
  spotify: unknown;
  githubRepos: unknown;
  githubEvents: unknown;
  errors?: { discord?: string | null; spotify?: string | null };
};
type DiscordPayload = { discord: unknown; error?: string | null };
type SpotifyPayload = {
  spotify: unknown;
  error?: string | null;
  updatedAt?: number;
};
type GitHubPayload = { repos: unknown; events: unknown };

export default function usePortfolioStatus() {
  const [payload, setPayload] = useState<StatusPayload>({
    discord: null,
    spotify: null,
    githubRepos: [],
    githubEvents: [],
  });
  const [discordLoading, setDiscordLoading] = useState(true);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [githubLoading, setGitHubLoading] = useState(true);
  const [spotifySyncedAt, setSpotifySyncedAt] = useState(0);
  const loadDiscord = useCallback(async () => {
    try {
      const next = await requestWidget<DiscordPayload>("/api/status");
      setPayload((current) => ({
        ...current,
        discord: next.error ? current.discord : next.discord,
        errors: { ...current.errors, discord: next.error ?? null },
      }));
    } catch {
      setPayload((current) => ({
        ...current,
        errors: { ...current.errors, discord: "Could not load Discord" },
      }));
    } finally {
      setDiscordLoading(false);
    }
  }, []);

  const loadSpotify = useCallback(async () => {
    try {
      const next = await requestWidget<SpotifyPayload>("/api/status/spotify", {
        cache: "no-store",
      });
      setSpotifySyncedAt(next.updatedAt || Date.now());
      setPayload((current) => ({
        ...current,
        spotify: next.error ? current.spotify : next.spotify,
        errors: { ...current.errors, spotify: next.error ?? null },
      }));
    } catch {
      setPayload((current) => ({
        ...current,
        errors: { ...current.errors, spotify: "Could not load Spotify" },
      }));
    } finally {
      setSpotifyLoading(false);
    }
  }, []);

  const loadGitHub = useCallback(async () => {
    try {
      const next = await requestWidget<GitHubPayload>("/api/status/github");
      setPayload((current) => ({
        ...current,
        githubRepos: next.repos,
        githubEvents: next.events,
      }));
    } catch {
      // The showcase falls back to its empty state when GitHub is unavailable.
    } finally {
      setGitHubLoading(false);
    }
  }, []);

  useEffect(() => {
    const pollers = [
      { load: loadDiscord, intervalMs: 15_000 },
      { load: loadSpotify, intervalMs: 1_000 },
      { load: loadGitHub, intervalMs: 300_000 },
    ];
    let intervals: number[] = [];

    const stopPolling = () => {
      intervals.forEach((interval) => window.clearInterval(interval));
      intervals = [];
    };

    const startPolling = () => {
      stopPolling();
      if (document.hidden) return;

      intervals = pollers.map(({ load, intervalMs }) => {
        void load();
        return window.setInterval(() => void load(), intervalMs);
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopPolling();
      else startPolling();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Restore after hydration so server and initial client markup stay identical.
    const restoreFrame = window.requestAnimationFrame(() => {
      const discord = readWidgetSnapshot<DiscordPayload>("/api/status");
      const github = readWidgetSnapshot<GitHubPayload>("/api/status/github");
      setPayload((current) => ({
        ...current,
        discord: discord?.discord ?? current.discord,
        githubRepos: github?.repos ?? current.githubRepos,
        githubEvents: github?.events ?? current.githubEvents,
      }));
      if (discord) setDiscordLoading(false);
      if (github) setGitHubLoading(false);
      startPolling();
    });

    return () => {
      window.cancelAnimationFrame(restoreFrame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [loadDiscord, loadGitHub, loadSpotify]);

  const rawDiscord = payload.discord;
  const discord = isRecord(rawDiscord)
    ? ((isRecord(rawDiscord.data)
        ? rawDiscord.data
        : rawDiscord) as DiscordProfile)
    : null;
  const spotify = normalizeSpotify(payload.spotify);

  return {
    payload,
    discord,
    spotify,
    discordLoading,
    spotifyLoading,
    githubLoading,
    spotifySyncedAt,
  };
}
