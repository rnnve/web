"use client";

import { useEffect, useMemo, useState } from "react";
import { useSiteSettings } from "../settings/site-settings-provider";
import { StatusIcon } from "./status-icon";
import type { SpotifyView } from "@/app/lib/status-types";
import { spotifyPageUrl } from "@/app/lib/spotify";
import {
  activeLyricIndex,
  lyricsQuery,
  parseSyncedLyrics,
  preparePreviewLyrics,
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
  const { t } = useSiteSettings();
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
  const lines = useMemo(() => {
    const timedLines =
      lyrics?.lines ?? parseSyncedLyrics(lyrics?.syncedLyrics ?? "");
    return preparePreviewLyrics(timedLines);
  }, [lyrics]);
  const index = activeLyricIndex(lines, progress);
  const currentLine = lines[index];
  const nextLine = lines[index + 1];
  const artist = spotify.primaryArtist || spotify.artist.split(/,\s+/)[0];
  const title = spotify.isPlaying
    ? spotify.title
    : t("Nothing is playing", "ยังไม่มีเพลงที่กำลังเล่น");
  const showLyrics =
    spotify.isPlaying &&
    !loading &&
    !lyricsError &&
    !lyrics?.instrumental &&
    currentLine;

  return (
    <section
      className={`${styles.card} ${compact ? styles.compact : ""}`}
      aria-labelledby="spotify-widget-title"
    >
      {showLyrics && (
        <div className={styles.preview} key={`${index}-${currentLine.text}`}>
          {[lines[index - 1], currentLine, nextLine].map((line, slot) =>
            line ? (
              <p
                key={slot}
                aria-current={slot === 1 || undefined}
                title={line.text}
              >
                {line.text}
              </p>
            ) : null,
          )}
        </div>
      )}
      <div className={styles.track}>
        <div className={styles.artwork}>
          <SpotifyArtwork src={spotify.artwork} />
        </div>
        <div className={styles.copy}>
          <h2
            id="spotify-widget-title"
            className={title.length > 45 ? styles.longTitle : undefined}
            title={spotify.isPlaying ? `${title} — ${artist}` : title}
          >
            {spotify.isPlaying ? (
              <>
                <span className={styles.listening}>
                  {t("Listening", "กำลังฟัง")}
                </span>{" "}
                <a
                  className={styles.songTitle}
                  href={spotifyPageUrl(spotify.url, `${title} ${artist}`)}
                  target="_blank"
                  rel="noreferrer"
                  title={title}
                  aria-label={t(
                    `Open ${title} on Spotify (opens in a new tab)`,
                    `เปิด ${title} บน Spotify (แท็บใหม่)`,
                  )}
                >
                  {title}
                </a>{" "}
                <span className={styles.artist}>
                  {t("by", "โดย")}{" "}
                  <a
                    href={spotifyPageUrl(spotify.primaryArtistUrl, artist)}
                    target="_blank"
                    rel="noreferrer"
                    title={artist}
                    aria-label={t(
                      `Open ${artist} on Spotify (opens in a new tab)`,
                      `เปิด ${artist} บน Spotify (แท็บใหม่)`,
                    )}
                  >
                    {artist}
                  </a>
                </span>
              </>
            ) : (
              title
            )}
          </h2>
        </div>
      </div>
      {error && (
        <p className={styles.error} role="status">
          {error}
        </p>
      )}
    </section>
  );
}
