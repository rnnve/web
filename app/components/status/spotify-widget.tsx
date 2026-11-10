"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useSiteSettings } from "../settings/site-settings-provider";
import { StatusIcon } from "./status-icon";
import type { SpotifyView } from "@/app/lib/status-types";
import {
  lyricPreviewLines,
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

function LyricPreviewLine({
  text,
  active,
  empty,
  availableMs,
}: {
  text: string;
  active: boolean;
  empty: boolean;
  availableMs: number;
}) {
  const row = useRef<HTMLParagraphElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [windowMs] = useState(availableMs);
  useEffect(() => {
    const element = row.current;
    const span = content.current;
    if (!element || !span) return;
    let mounted = true;
    const measure = () => {
      if (mounted)
        setOverflow(
          Math.max(0, Math.ceil(span.scrollWidth - element.clientWidth)),
        );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(span);
    void document.fonts.ready.then(measure);
    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [text]);
  return (
    <p
      ref={row}
      className={`${active ? styles.current : ""} ${overflow > 1 ? styles.overflowing : ""}`}
      aria-current={active ? "true" : undefined}
      aria-hidden={empty || undefined}
      title={empty ? undefined : text}
      style={
        {
          "--lyric-overflow": `${overflow}px`,
          "--lyric-duration": `${Math.max(0.8, Math.min(12, overflow / 35, (windowMs - 200) / 1000))}s`,
        } as CSSProperties
      }
    >
      <span ref={content}>{text}</span>
    </p>
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
          <LyricPreviewLine
            key={`${index}-${line?.time ?? message}`}
            active={index === 1 && !message && Boolean(line)}
            empty={(!line || Boolean(message)) && index !== 1}
            availableMs={rows[2] ? Math.max(0, rows[2].time - progress) : 5000}
            text={
              message
                ? index === 1
                  ? message
                  : "\u00a0"
                : line?.text || (index === 1 ? "♪" : "\u00a0")
            }
          />
        ))}
      </Link>
      {error && (
        <p className={styles.error} role="status">
          {error}
        </p>
      )}
    </section>
  );
}
