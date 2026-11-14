"use client";

import { useSyncExternalStore } from "react";
import { discordStream, spotifyStream } from "@/app/lib/status-stream";
import { normalizeSpotify } from "@/app/lib/spotify";
import type { DiscordProfile } from "@/app/lib/status-types";

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

  return {
    payload: {
      errors: { spotify: spotify.error },
    },
    discord: discord.data as DiscordProfile | null,
    spotify: normalizeSpotify(spotify.data),
    spotifyLoading: !spotify.updatedAt && !spotify.error,
    spotifySyncedAt: spotify.updatedAt,
  };
}
