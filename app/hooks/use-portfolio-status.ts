"use client";

import { useSyncExternalStore } from "react";
import {
  getDiscordProfileSnapshot,
  rememberDiscordProfile,
  subscribeDiscordProfile,
} from "@/app/lib/discord-profile-cache";
import { spotifyStream } from "@/app/lib/status-stream";
import { normalizeSpotify } from "@/app/lib/spotify";
import type { DiscordProfile } from "@/app/lib/status-types";

export default function usePortfolioStatus(initial?: {
  profile: DiscordProfile | null;
  updatedAt: number;
}) {
  if (typeof window !== "undefined") {
    rememberDiscordProfile(initial?.profile ?? null, initial?.updatedAt ?? 0);
  }
  const discord = useSyncExternalStore(
    subscribeDiscordProfile,
    getDiscordProfileSnapshot,
    () => initial?.profile ?? null,
  );
  const spotify = useSyncExternalStore(
    spotifyStream.subscribe,
    spotifyStream.getSnapshot,
    spotifyStream.getServerSnapshot,
  );

  return {
    payload: {
      errors: { spotify: spotify.error },
    },
    discord: discord ?? initial?.profile ?? null,
    spotify: normalizeSpotify(spotify.data),
    spotifyLoading: !spotify.updatedAt && !spotify.error,
    spotifySyncedAt: spotify.updatedAt,
  };
}
