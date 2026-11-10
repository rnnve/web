"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "../settings/site-settings-provider";
import { StatusIcon } from "./status-icon";
import type { SpotifyView } from "@/app/lib/status-types";
import {
  lyricPreviewLines,
  lyricsProvider,
  lyricsQuery,
  parseSyncedLyrics,
} from "@/app/lib/lyrics";
import {
  lyricsProgress,
  reconcileLyricsPlayback,
  type LyricsPlayback,
} from "@/app/lib/lyrics-playback";
import useTrackLyrics from "@/app/hooks/use-track-lyrics";
import styles from "./spotify-widget.module.css";

function SpotifyArtwork({ src }: { src: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <StatusIcon name="spotify" size={28} />;
  return (
    // Artwork URLs come from the live Spotify status provider.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
    />
  );
}

export default function SpotifyWidget({
  spotify,
  error,
  compact = false,
  syncedAt = 0,
}: {
  spotify: SpotifyView;
  error?: string | null;
  compact?: boolean;
  syncedAt?: number;
}) {
  const { t, language } = useSiteSettings();
  const [clock, setClock] = useState(0);
  const [playback, setPlayback] = useState<LyricsPlayback | null>(null);
  useEffect(() => {
    if (!spotify.isPlaying) return;
    const tick = () => {
      if (document.hidden) return;
      const now = Date.now();
      setClock(now);
      setPlayback((previous) =>
        reconcileLyricsPlayback(previous, spotify, syncedAt || now, now),
      );
    };
    const frame = window.requestAnimationFrame(tick);
    const timer = window.setInterval(tick, 100);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [spotify, syncedAt]);
  const sameTrack =
    playback?.track.title === spotify.title &&
    playback.track.artist === spotify.artist &&
    playback.track.url === spotify.url;
  const progress =
    sameTrack && playback ? lyricsProgress(playback, clock) : spotify.progress;
  const {
    lyrics,
    loading,
    error: lyricsError,
  } = useTrackLyrics(lyricsQuery(spotify));
  const lines = useMemo(
    () => lyrics?.lines ?? parseSyncedLyrics(lyrics?.syncedLyrics ?? ""),
    [lyrics],
  );
  const rows = lyricPreviewLines(lines, progress);
  const title = spotify.isPlaying
    ? spotify.title
    : t("Nothing is playing", "ยังไม่มีเพลงที่กำลังเล่น");
  const provider = lyrics ? lyricsProvider(lyrics) : null;
  let message = "";
  if (!spotify.isPlaying) message = t("Waiting for music", "รอเพลงถัดไป");
  else if (loading) message = t("Finding lyrics…", "กำลังค้นหาเนื้อเพลง…");
  else if (lyricsError)
    message = t("Lyrics unavailable", "โหลดเนื้อเพลงไม่ได้");
  else if (lyrics?.instrumental) message = t("Instrumental", "เพลงบรรเลง");
  else if (!lines.length)
    message = lyrics?.plainLyrics
      ? t("Unsynced lyrics", "เนื้อเพลงไม่มีเวลา")
      : t("No lyrics found", "ไม่พบเนื้อเพลง");

  return (
    <section
      className={`${styles.card} ${compact ? styles.compact : ""}`}
      aria-labelledby="spotify-widget-title"
    >
      <div className={styles.track}>
        <div className={styles.artwork}>
          <SpotifyArtwork src={spotify.artwork} />
        </div>
        <div className={styles.copy}>
          <span className={styles.label}>
            {spotify.isPlaying ? t("Now playing", "กำลังฟัง") : "Spotify"}
          </span>
          <h2 id="spotify-widget-title" title={title}>
            {title}
          </h2>
          {spotify.isPlaying && <p title={spotify.artist}>{spotify.artist}</p>}
        </div>
      </div>
      <Link
        href={`/lyrics#${language}`}
        className={styles.preview}
        aria-label={t("Open full lyrics", "เปิดเนื้อเพลงทั้งหมด")}
      >
        {rows.map((line, index) => (
          <p
            key={index}
            className={
              index === 1 && !message && line ? styles.current : undefined
            }
            aria-current={index === 1 && !message && line ? "true" : undefined}
            aria-hidden={!line && index !== 1 ? true : undefined}
          >
            {message
              ? index === 1
                ? message
                : "\u00a0"
              : line?.text || (index === 1 ? "♪" : "\u00a0")}
          </p>
        ))}
      </Link>
      {provider && (
        <footer className={styles.credits}>
          <a href={provider.url} target="_blank" rel="noreferrer">
            {provider.name}
          </a>
          {lyrics?.contributors?.map((person) => (
            <span key={person.role}>
              ·{" "}
              {person.role === "uploader"
                ? t("Uploaded by", "อัปโหลดโดย")
                : t("Synced by", "จับเวลาโดย")}{" "}
              {person.url ? (
                <a href={person.url} target="_blank" rel="noreferrer">
                  {person.name}
                </a>
              ) : (
                person.name
              )}
            </span>
          ))}
        </footer>
      )}
      {error && (
        <p className={styles.error} role="status">
          {error}
        </p>
      )}
    </section>
  );
}
