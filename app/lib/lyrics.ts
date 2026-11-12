export type LyricsRecord = {
  id: number | string;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
  lines?: LyricLine[];
  source?:
    | "lrclib"
    | "lrc_red"
    | "spicy_lyrics"
    | "apple_music"
    | "spotify"
    | "unknown";
  contributors?: { role: "uploader" | "maker"; name: string; url?: string }[];
};

export type LyricLine = { time: number; text: string; endTime?: number };

// LRC can repeat timestamps on a line and declare a global offset in ms.
export function parseSyncedLyrics(source: string): LyricLine[] {
  const offset = Number(source.match(/^\[offset:([+-]?\d+)\]/im)?.[1] ?? 0);
  const lines: LyricLine[] = [];
  for (const line of source.split(/\r?\n/)) {
    const timestamps = [
      ...line.matchAll(/\[(\d+):(\d{2})(?:[.:](\d{1,3}))?\]/g),
    ];
    const text = line.replace(/\[[^\]]*\]/g, "").trim();
    for (const stamp of timestamps) {
      if (Number(stamp[2]) >= 60) continue;
      const time =
        Number(stamp[1]) * 60_000 +
        Number(stamp[2]) * 1000 +
        Number((stamp[3] ?? "").padEnd(3, "0")) -
        offset;
      lines.push({ time: Math.max(0, time), text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function activeLyricIndex(lines: LyricLine[], progress: number): number {
  let index = -1;
  for (let i = 0; i < lines.length && lines[i].time <= progress; i++) index = i;
  return index >= 0 &&
    lines[index].endTime !== undefined &&
    progress >= lines[index].endTime!
    ? -1
    : index;
}

export function spotifyTrackId(url: string): string | null {
  const match = url.match(
    /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/([A-Za-z0-9]{22})(?:[?#].*)?$/,
  );
  return match?.[1] ?? null;
}
import type { SpotifyView } from "./status-types";

export function lyricsQuery(track: SpotifyView | undefined): string {
  if (!track?.isPlaying) return "";
  const query = new URLSearchParams({
    track_name: track.title,
    artist_name: track.artist,
  });
  const id = spotifyTrackId(track.url);
  if (id) query.set("spotify_id", id);
  if (track.album) query.set("album_name", track.album);
  const duration = Math.round(track.duration / 1000);
  if (duration >= 1 && duration <= 3600)
    query.set("duration", String(duration));
  return query.toString();
}

export function preparePreviewLyrics(lines: LyricLine[]): LyricLine[] {
  const visible: LyricLine[] = [];
  for (const line of lines) {
    const text = line.text.replace(/[♩♪♫♬🎵🎶][\uFE0E\uFE0F]?/gu, "").trim();
    // Each visible line stays current until the next visible start time.
    if (text) visible.push({ time: line.time, text });
  }
  return visible;
}
