"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconArrowUpRight, IconMusic, IconRefresh } from "@tabler/icons-react";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import {
  lyricsProgress,
  reconcileLyricsPlayback,
  type LyricsPlayback,
} from "../lib/lyrics-playback";
import { requestWidget } from "../lib/widget-request";
import {
  activeLyricIndex,
  parseSyncedLyrics,
  spotifyTrackId,
  type LyricsRecord,
} from "../lib/lyrics";
import styles from "./lyrics.module.css";

function createLyricsSession() {
  const cache = new Map<string, LyricsRecord | null>();
  let retryAt = 0;
  return {
    has: (query: string) => cache.has(query),
    get: (query: string) => cache.get(query),
    save(query: string, lyrics: LyricsRecord | null) {
      if (cache.size >= 20) cache.clear();
      cache.set(query, lyrics);
    },
    getRetryAt: () => retryAt,
    deferRetry(seconds: number) {
      retryAt = Date.now() + seconds * 1000 + Math.random() * 1000;
    },
  };
}
type LyricsSession = ReturnType<typeof createLyricsSession>;

function formatTime(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Lyrics({
  query,
  progress,
  session,
}: {
  query: string;
  progress: number;
  session: LyricsSession;
}) {
  const { t } = useSiteSettings();
  const [lyrics, setLyrics] = useState<LyricsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [follow, setFollow] = useState(true);
  const viewport = useRef<HTMLDivElement>(null);
  const activeLine = useRef<HTMLParagraphElement>(null);
  const previousIndex = useRef(-1);
  const [now, setNow] = useState(0);
  const [retryAt, setRetryAt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      setRetryAt(session.getRetryAt());
      try {
        if (session.has(query)) {
          setLyrics(session.get(query) ?? null);
          return;
        }
        if (Date.now() < session.getRetryAt())
          throw new Error("Wait before retrying");
        const response = await fetch(`/api/lyrics?${query}`, {
          signal: controller.signal,
        });
        if (response.status === 429 || response.status === 503) {
          const seconds = Number(response.headers.get("Retry-After")) || 60;
          session.deferRetry(seconds);
          setRetryAt(session.getRetryAt());
        }
        if (!response.ok) throw new Error("Unavailable");
        const data = (await response.json()) as { lyrics: LyricsRecord | null };
        if (!active) return;
        session.save(query, data.lyrics);
        setLyrics(data.lyrics);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [query, retry, session]);

  const lines = useMemo(
    () => lyrics?.lines ?? parseSyncedLyrics(lyrics?.syncedLyrics ?? ""),
    [lyrics],
  );
  const index = activeLyricIndex(lines, progress);
  useLayoutEffect(() => {
    const container = viewport.current;
    const line = activeLine.current;
    if (!follow || !container || !line) return;
    const from = container.scrollTop;
    const target = () =>
      Math.max(
        0,
        Math.min(
          container.scrollHeight - container.clientHeight,
          container.scrollTop +
            line.getBoundingClientRect().top -
            container.getBoundingClientRect().top -
            (container.clientHeight - line.clientHeight) / 2,
        ),
      );
    const to = target();
    const jump =
      previousIndex.current < 0 ||
      Math.abs(index - previousIndex.current) > 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    previousIndex.current = index;
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const amount = Math.min(1, (now - start) / 140);
      container.scrollTo({
        top: from + (to - from) * (1 - (1 - amount) ** 3),
        behavior: "instant",
      });
      if (amount < 1) frame = window.requestAnimationFrame(animate);
    };
    if (jump) container.scrollTo({ top: to, behavior: "instant" });
    else frame = window.requestAnimationFrame(animate);
    let width = container.clientWidth;
    let height = container.clientHeight;
    let lineHeight = line.clientHeight;
    const observer = new ResizeObserver(() => {
      if (
        width === container.clientWidth &&
        height === container.clientHeight &&
        lineHeight === line.clientHeight
      )
        return;
      width = container.clientWidth;
      height = container.clientHeight;
      lineHeight = line.clientHeight;
      window.cancelAnimationFrame(frame);
      container.scrollTo({ top: target(), behavior: "instant" });
    });
    observer.observe(container);
    observer.observe(line);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [index, follow]);

  const waiting = now < retryAt;
  let message = "";
  if (loading) message = t("Finding the words…", "กำลังค้นหาเนื้อเพลง…");
  else if (error)
    message = t(
      "Couldn’t load lyrics right now.",
      "โหลดเนื้อเพลงไม่สำเร็จในตอนนี้",
    );
  else if (lyrics?.instrumental)
    message = t(
      "Just the music. This track is instrumental.",
      "เพลงนี้เป็นเพลงบรรเลง ไม่มีเนื้อร้อง",
    );
  else if (!lines.length && !lyrics?.plainLyrics)
    message = t(
      "No lyrics found for this song yet.",
      "ยังไม่พบเนื้อเพลงสำหรับเพลงนี้",
    );

  return (
    <section
      className={styles.lyricsPanel}
      aria-label={t("Song lyrics", "เนื้อเพลง")}
      aria-busy={loading}
    >
      <div className={styles.toolbar}>
        <span>
          {lines.length
            ? t("Synced lyrics", "เนื้อเพลงตามเวลา")
            : t("Lyrics", "เนื้อเพลง")}
        </span>
        {lines.length > 0 && (
          <button
            type="button"
            aria-pressed={follow}
            onClick={() => setFollow(!follow)}
          >
            {follow
              ? t("Following song", "เลื่อนตามเพลง")
              : t("Follow song", "เลื่อนตามเพลง")}
          </button>
        )}
      </div>
      {message ? (
        <div className={styles.message} role="status">
          <IconMusic size={32} stroke={1.3} aria-hidden="true" />
          <p>{message}</p>
          {error && (
            <button
              type="button"
              disabled={waiting}
              onClick={() => setRetry((value) => value + 1)}
            >
              <IconRefresh size={16} aria-hidden="true" />
              {waiting
                ? t("Please wait before retrying", "กรุณารอก่อนลองอีกครั้ง")
                : t("Try again", "ลองอีกครั้ง")}
            </button>
          )}
        </div>
      ) : (
        <div
          ref={viewport}
          className={`${styles.lines} ${lines.length ? "" : styles.unsynced}`}
          tabIndex={0}
          aria-label={t("Scrollable lyrics", "เลื่อนอ่านเนื้อเพลง")}
        >
          {lines.length ? (
            lines.map((line, i) => (
              <p
                key={`${line.time}-${i}`}
                ref={i === index ? activeLine : undefined}
                aria-current={i === index ? "true" : undefined}
                className={i === index ? styles.active : undefined}
              >
                {line.text || "♪"}
              </p>
            ))
          ) : (
            <p className={styles.plain}>{lyrics?.plainLyrics}</p>
          )}
        </div>
      )}
      {!message && !lines.length && (
        <p className={styles.note}>
          {t(
            "Timing isn’t available for this song.",
            "เพลงนี้ยังไม่มีเนื้อเพลงแบบตามเวลา",
          )}
        </p>
      )}
      <footer className={styles.credit}>
        {t("Lyrics from", "เนื้อเพลงจาก")}{" "}
        <a
          href={
            lyrics?.source === "lrc_red"
              ? "https://lrc.red"
              : lyrics?.source && lyrics.source !== "lrclib"
                ? "https://spicylyrics.org"
                : "https://lrclib.net"
          }
          target="_blank"
          rel="noreferrer"
        >
          {lyrics?.source === "lrc_red"
            ? "lrc.red"
            : lyrics?.source === "spicy_lyrics"
              ? "Spicy Lyrics"
              : lyrics?.source === "apple_music"
                ? "Apple Music via Spicy Lyrics"
                : lyrics?.source === "spotify"
                  ? "Spotify via Spicy Lyrics"
                  : lyrics?.source === "unknown"
                    ? "Spicy Lyrics"
                    : "LRCLIB"}{" "}
          <IconArrowUpRight size={13} aria-hidden="true" />
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
    </section>
  );
}

export default function LyricsViewer() {
  const { t } = useSiteSettings();
  const [playback, setPlayback] = useState<LyricsPlayback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [clock, setClock] = useState(0);
  const [session] = useState(createLyricsSession);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let pending = false;
    async function load() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const data = await requestWidget<{
          spotify: unknown;
          error?: string | null;
          updatedAt?: number;
        }>("/api/status/spotify", { cache: "no-store" });
        if (!active) return;
        if (data.error) throw new Error("Unavailable");
        const receivedAt = Date.now();
        setClock(receivedAt);
        setPlayback((previous) =>
          reconcileLyricsPlayback(
            previous,
            data.spotify,
            data.updatedAt,
            receivedAt,
          ),
        );
        setError(false);
      } catch {
        if (active) {
          setPlayback(null);
          setError(true);
        }
      } finally {
        pending = false;
        if (active) {
          setLoading(false);
          timer = window.setTimeout(load, 1000);
        }
      }
    }
    const refresh = () => {
      window.clearTimeout(timer);
      void load();
    };
    void load();
    document.addEventListener("visibilitychange", refresh);
    const ticker = window.setInterval(() => {
      if (!document.hidden) setClock(Date.now());
    }, 100);
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearInterval(ticker);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const track = playback?.track;
  const progress = playback ? lyricsProgress(playback, clock) : 0;
  const query = new URLSearchParams();
  if (track?.isPlaying) {
    query.set("track_name", track.title);
    query.set("artist_name", track.artist);
    const id = spotifyTrackId(track.url);
    if (id) query.set("spotify_id", id);
    if (track.album) query.set("album_name", track.album);
    const seconds = Math.round(track.duration / 1000);
    if (seconds >= 1 && seconds <= 3600) query.set("duration", String(seconds));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>
            {t("A listening experiment", "ทดลองฟังเพลง")}
          </span>
          <h1>{t("The words behind the music.", "ถ้อยคำในเสียงเพลง")}</h1>
          <p>
            {t(
              "Live lyrics for what I’m playing right now.",
              "เนื้อเพลงของเพลงที่เรากำลังฟังอยู่",
            )}
          </p>
        </div>
      </header>
      {track?.isPlaying ? (
        <div className={styles.layout}>
          <aside className={styles.track}>
            <div className={styles.artwork}>
              <IconMusic size={56} stroke={1} aria-hidden="true" />
              {/* Artwork is supplied by the live Spotify status provider. */}
              {track.artwork && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={track.artwork}
                  src={track.artwork}
                  alt={t(
                    `Album artwork for ${track.album || track.title}`,
                    `ปกอัลบั้ม ${track.album || track.title}`,
                  )}
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <span className={styles.kicker}>
              {t("Now playing", "กำลังฟัง")}
            </span>
            <h2>{track.title}</h2>
            <p className={styles.artist}>{track.artist}</p>
            {track.album && <p className={styles.album}>{track.album}</p>}
            <div
              className={styles.progress}
              role="progressbar"
              aria-label={t("Song progress", "ความคืบหน้าของเพลง")}
              aria-valuemin={0}
              aria-valuemax={track.duration || 1}
              aria-valuenow={Math.floor(progress)}
              aria-valuetext={`${formatTime(progress)} / ${formatTime(track.duration)}`}
            >
              <span
                style={{
                  width: `${track.duration ? (progress / track.duration) * 100 : 0}%`,
                }}
              />
            </div>
            <div className={styles.time}>
              <span>{formatTime(progress)}</span>
              <span>{formatTime(track.duration)}</span>
            </div>
            {track.url.startsWith("https://open.spotify.com/") && (
              <a
                className={styles.spotify}
                href={track.url}
                target="_blank"
                rel="noreferrer"
              >
                {t("Open in Spotify", "เปิดใน Spotify")}
                <IconArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </aside>
          <Lyrics
            key={query.toString()}
            query={query.toString()}
            progress={progress}
            session={session}
          />
        </div>
      ) : (
        <div className={styles.idle} role="status">
          <IconMusic size={48} stroke={1.2} aria-hidden="true" />
          <h2>
            {loading
              ? t("Tuning in…", "กำลังเชื่อมต่อ…")
              : error
                ? t(
                    "Listening status is unavailable.",
                    "ยังโหลดสถานะการฟังไม่ได้",
                  )
                : t("Quiet for now.", "ตอนนี้ยังเงียบอยู่")}
          </h2>
          <p>
            {error
              ? t(
                  "We’ll check again in a moment.",
                  "จะลองตรวจสอบอีกครั้งในอีกสักครู่",
                )
              : t(
                  "Lyrics will appear when I play a song.",
                  "เนื้อเพลงจะแสดงเมื่อเราเริ่มฟังเพลง",
                )}
          </p>
        </div>
      )}
    </main>
  );
}
