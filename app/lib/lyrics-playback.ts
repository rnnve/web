import { isRecord } from "./json";
import { normalizeSpotify } from "./spotify";
import type { SpotifyView } from "./status-types";

export type LyricsPlayback = {
  track: SpotifyView;
  position: number;
  receivedAt: number;
  sourceProgress: number;
  sourceUpdatedAt: number;
};

export function lyricsProgress(playback: LyricsPlayback, now: number) {
  return Math.min(
    playback.track.duration || Infinity,
    Math.max(
      0,
      playback.position +
        (playback.track.isPlaying ? Math.max(0, now - playback.receivedAt) : 0),
    ),
  );
}

function timestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value))
    return value < 1e12 ? value * 1000 : value;
  return typeof value === "string" ? Date.parse(value) : NaN;
}

export function reconcileLyricsPlayback(
  previous: LyricsPlayback | null,
  raw: unknown,
  updatedAt: number | undefined,
  receivedAt: number,
): LyricsPlayback {
  const track = normalizeSpotify(raw);
  const sourceUpdatedAt =
    updatedAt && Number.isFinite(updatedAt)
      ? Math.min(updatedAt, receivedAt)
      : receivedAt;
  const envelope = isRecord(raw) ? raw : {};
  const root = isRecord(envelope.data) ? envelope.data : envelope;
  const startedAt = timestamp(root.startedAt);
  let position = track.progress + Math.min(5000, receivedAt - sourceUpdatedAt);
  // The upstream start time carries more precision than an HTTP Date header.
  const hasStartTime =
    Number.isFinite(startedAt) &&
    Math.abs(sourceUpdatedAt - startedAt - track.progress) < 5000;
  if (hasStartTime) position = receivedAt - startedAt;

  const sameTrack =
    previous?.track.isPlaying &&
    track.isPlaying &&
    previous.track.url === track.url &&
    previous.track.title === track.title &&
    previous.track.artist === track.artist &&
    previous.track.album === track.album;
  if (sameTrack) {
    if (sourceUpdatedAt < previous.sourceUpdatedAt) return previous;
    const predicted = lyricsProgress(previous, receivedAt);
    // Duplicate samples and sub-second HTTP timestamp rounding should never
    // rewind the lyric clock. Larger changes still apply real forward/back seeks.
    if (
      (!hasStartTime && track.progress === previous.sourceProgress) ||
      Math.abs(position - predicted) < 1500
    )
      position = predicted;
  }

  return {
    track,
    position: track.isPlaying ? Math.max(0, position) : 0,
    receivedAt,
    sourceProgress: track.progress,
    sourceUpdatedAt,
  };
}
