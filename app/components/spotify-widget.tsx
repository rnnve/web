"use client";

import { useSiteSettings } from "./site-settings-provider";
import { StatusIcon } from "./status-icon";
import { useEffect, useState } from "react";
import type { SpotifyView } from "@/app/lib/status-types";
import WavyLinearProgress from "./wavy-linear-progress";

const formatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

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
  const title =
    spotify.title === "Nothing is playing"
      ? t("Nothing is playing", "ยังไม่มีเพลงที่กำลังเล่น")
      : spotify.title;
  const [clock, setClock] = useState(0);

  useEffect(() => {
    if (!spotify.isPlaying) return;

    const timer = window.setInterval(() => {
      setClock(Date.now());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [spotify.isPlaying, spotify.title]);

  const currentProgress =
    spotify.isPlaying && syncedAt > 0
      ? Math.min(
          spotify.duration || Number.POSITIVE_INFINITY,
          spotify.progress + Math.max(0, clock - syncedAt),
        )
      : spotify.progress;
  const progress = spotify.duration
    ? Math.min(100, Math.max(0, (currentProgress / spotify.duration) * 100))
    : 0;

  if (compact) {
    return (
      <section
        className="glassCard compactStatusCard compactSpotifyCard"
        aria-labelledby="compact-spotify-title"
      >
        <div
          className="compactStatusArtwork compactSpotifyArtwork"
          style={
            spotify.artwork
              ? { backgroundImage: `url(${spotify.artwork})` }
              : undefined
          }
        >
          {!spotify.artwork && <StatusIcon name="spotify" size={32} />}
        </div>
        <div className="compactStatusCopy">
          <h2 id="compact-spotify-title">{title}</h2>
          {spotify.isPlaying && (
            <>
              <p className="compactScrollingText">
                <span>{spotify.artist}</span>
              </p>
              <WavyLinearProgress
                className="compactSpotifyProgress"
                value={currentProgress}
                max={spotify.duration || 1}
                label={`${Math.round(progress)}% played`}
              />
              <div className="compactSpotifyTimes">
                <span>{formatTime(currentProgress)}</span>
                <span>{formatTime(spotify.duration)}</span>
              </div>
            </>
          )}
          {error && <span className="compactStatusError">{error}</span>}
        </div>
      </section>
    );
  }

  return (
    <section className="glassCard spotifyCard" aria-labelledby="spotify-title">
      <div className="cardTop">
        <span className="platformIcon spotifyIcon">
          <StatusIcon name="spotify" size={23} />
        </span>
        <div>
          <p>Spotify</p>
          <span>
            {spotify.isPlaying
              ? t("Now playing", "กำลังเล่น")
              : t("Not playing", "ไม่ได้เล่นเพลง")}
          </span>
        </div>
        <i className={spotify.isPlaying ? "pulse" : ""} />
      </div>
      <div
        className={`albumArt ${!spotify.artwork ? "albumFallback" : ""}`}
        style={
          spotify.artwork
            ? { backgroundImage: `url(${spotify.artwork})` }
            : undefined
        }
      >
        {!spotify.artwork && <StatusIcon name="headphones" size={54} />}{" "}
        {spotify.isPlaying && (
          <div className="equalizer">
            <i />
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className="trackInfo">
        <p>
          {spotify.album ||
            (spotify.isPlaying
              ? t("Currently listening", "กำลังฟัง")
              : t("Playback paused", "หยุดเล่นชั่วคราว"))}
        </p>
        <h2 id="spotify-title">{title}</h2>
        <span>{spotify.artist}</span>
      </div>
      <div className="progress">
        <WavyLinearProgress
          value={currentProgress}
          max={spotify.duration || 1}
          label={`${Math.round(progress)}% played`}
        />
        <p>
          <span>{formatTime(currentProgress)}</span>
          <span>{formatTime(spotify.duration)}</span>
        </p>
      </div>
      {spotify.url ? (
        <a
          className="spotifyLink"
          href={spotify.url}
          target="_blank"
          rel="noreferrer"
        >
          {t("Open in Spotify", "เปิดใน Spotify")}{" "}
          <StatusIcon name="arrow" size={17} />
        </a>
      ) : (
        <div className="idleMessage">
          <span>♪</span>
          {t("Waiting for the next song", "รอเพลงถัดไป")}
        </div>
      )}
      {error && <p className="errorText">{error}</p>}
    </section>
  );
}
