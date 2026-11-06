"use client";

import { useSiteSettings } from "../settings/site-settings-provider";
import { StatusIcon } from "./status-icon";
import { useEffect, useState } from "react";
import type { SpotifyView } from "@/app/lib/status-types";
import WavyLinearProgress from "./wavy-linear-progress";

function SpotifyArtwork({ src }: { src: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <StatusIcon name="spotify" size={32} />;

  return (
    // Artwork URLs come from the live Spotify status provider.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailedSrc(src)}
    />
  );
}
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
      if (!document.hidden) setClock(Date.now());
    }, 100);
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
        className="glassCard overflow-hidden [border:0] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [backdrop-filter:none] [border-radius:var(--md-shape-extra-large)] [-webkit-backdrop-filter:none] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] compactStatusCard [min-height:112px] [padding:16px] grid [grid-template-columns:72px_minmax(0,_1fr)] items-center [gap:16px] [border-radius:var(--md-shape-extra-large)] [border:0] [background:var(--md-sys-color-surface-container-high)] [box-shadow:none] [backdrop-filter:none] [transition:background-color_0.25s_ease,_transform_0.4s_var(--md-motion-emphasized),_box-shadow_0.25s_ease] [@media(min-width:_761px)_and_(max-height:_650px)]:[min-height:92px] [@media(min-width:_761px)_and_(max-height:_650px)]:[grid-template-columns:68px_minmax(0,_1fr)] [&:hover]:[background:var(--md-sys-color-surface-container-highest)] [&:hover]:[box-shadow:var(--md-elevation-1)] [&:hover]:[transform:translateY(-2px)] motion-reduce:[transform:none]! [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:[min-height:112px] [.root-empty_&]:[padding:16px] [.root-empty_&]:[grid-template-columns:72px_minmax(0,_1fr)] [.root-empty_&]:[gap:16px] [.root-empty_&]:[background:var(--md-sys-color-surface-container-high)] [.root-empty_&:hover]:[background:var(--md-sys-color-surface-container-highest)] [.root-empty_&:hover]:[box-shadow:var(--md-elevation-1)] max-[761px]:[.root-empty_&]:[min-height:104px] max-[761px]:[.root-empty_&]:[padding:14px] max-[761px]:[.root-empty_&]:[grid-template-columns:64px_minmax(0,_1fr)] max-[761px]:[.root-empty_&]:[gap:14px] compactSpotifyCard"
        aria-labelledby="compact-spotify-title"
      >
        <div className="compactStatusArtwork relative overflow-hidden [width:72px] [aspect-ratio:1] grid [place-items:center] [border:0] [border-radius:var(--md-shape-large)] [color:var(--md-sys-color-on-primary-container)] [background:linear-gradient(145deg,_var(--purple-soft),_var(--paper-deep))] [background-position:center] [background-size:cover] [box-shadow:none] [background-color:var(--md-sys-color-primary-container)] [background-image:none] [@media(min-width:_761px)_and_(max-height:_650px)]:[width:68px] [.root-empty_&]:[width:72px] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-large)] [.root-empty_&]:[color:var(--md-sys-color-on-primary-container)] [.root-empty_&]:[background-color:var(--md-sys-color-primary-container)] [.root-empty_&]:[box-shadow:none] max-[761px]:[.root-empty_&]:[width:64px] compactSpotifyArtwork">
          <SpotifyArtwork src={spotify.artwork} />
        </div>
        <div className="compactStatusCopy [min-width:0] [&_h2]:[margin:0] [&_h2]:overflow-hidden [&_h2]:[font-size:17px] [&_h2]:[line-height:1.15] [&_h2]:[letter-spacing:-0.25px] [&_h2]:whitespace-nowrap [&_h2]:[text-overflow:ellipsis] [&_h2]:[color:var(--md-sys-color-on-surface)] [&_h2]:[font-weight:650] [&_>_p]:[margin:5px_0_0] [&_>_p]:overflow-hidden [&_>_p]:[color:var(--md-sys-color-on-surface-variant)] [&_>_p]:[font-size:12px] [&_>_p]:whitespace-nowrap [.compactSpotifyCard_&_h2]:[font-size:clamp(14px,_1.35vw,_17px)] [.compactSpotifyCard_&_h2]:[letter-spacing:-0.35px]">
          <h2 id="compact-spotify-title">{title}</h2>
          {spotify.isPlaying && (
            <>
              <p className="compactScrollingText [&_span]:[width:max-content] [&_span]:[min-width:100%] [&_span]:block [&:hover_span]:[animation:compact-text-scroll_5s_linear_infinite_alternate]">
                <span>{spotify.artist}</span>
              </p>
              <WavyLinearProgress
                className="compactSpotifyProgress [width:100%] [margin-top:10px] [--m3e-linear-progress-indicator-thickness:6px] [--m3e-linear-wavy-progress-indicator-amplitude:2px] [--m3e-linear-wavy-progress-indicator-wavelength:14px] [--m3e-progress-indicator-color:var(--md-sys-color-primary)] [--m3e-progress-indicator-track-color:var(--md-sys-color-outline-variant)] [.root-empty_&]:[width:100%] [.root-empty_&]:[margin-top:10px] [.root-empty_&]:[--m3e-progress-indicator-color:var(--md-sys-color-primary)] [.root-empty_&]:[--m3e-progress-indicator-track-color:var(--md-sys-color-outline-variant)]"
                value={currentProgress}
                max={spotify.duration || 1}
                label={`${Math.round(progress)}% played`}
              />
              <div className="compactSpotifyTimes [margin-top:3px] flex justify-between [color:var(--md-sys-color-on-surface-variant)] [font-size:7px] [font-variant-numeric:tabular-nums]">
                <span>{formatTime(currentProgress)}</span>
                <span>{formatTime(spotify.duration)}</span>
              </div>
            </>
          )}
          {error && (
            <span className="compactStatusError [margin-top:5px] block [color:var(--coral)] [font-size:7px]">
              {error}
            </span>
          )}
        </div>
      </section>
    );
  }
  return (
    <section
      className="glassCard overflow-hidden [border:0] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [backdrop-filter:none] [border-radius:var(--md-shape-extra-large)] [-webkit-backdrop-filter:none] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] spotifyCard [.homeStatusColumn_&]:[min-height:132px] [.homeStatusColumn_&]:[padding:14px_16px] [.homeStatusColumn_&]:[border-radius:20px] [padding:24px] [border-radius:38px_38px_38px_14px] max-[761px]:[padding:20px]"
      aria-labelledby="spotify-title"
    >
      <div className="cardTop grid [grid-template-columns:auto_1fr_auto] items-center [gap:11px] [&_>_div_p]:[margin:0] [&_>_div_p]:block [&_>_div_p]:[font-size:12px] [&_>_div_p]:[font-weight:900] [&_>_div_span]:[margin:0] [&_>_div_span]:block [&_>_div_span]:[margin-top:3px] [&_>_div_span]:[color:var(--muted)] [&_>_div_span]:[font-size:8px] [&_>_div_span]:uppercase [&_>_div_span]:[letter-spacing:0.8px] [&_>_i]:[width:9px] [&_>_i]:[height:9px] [&_>_i]:[border-radius:50%] [&_>_i]:[background:var(--line)] motion-reduce:[&_>_i]:[animation:none]!">
        <span className="platformIcon [.homeStatusColumn_&]:[width:34px] [.homeStatusColumn_&]:[height:34px] [width:42px] [height:42px] grid [place-items:center] [flex:0_0_auto] [border-radius:50%_50%_36%_64%_/_55%_38%_62%_45%] spotifyIcon [color:var(--paper)] [background:linear-gradient(145deg,_var(--purple-bright),_var(--purple))]">
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
        <i
          className={
            spotify.isPlaying
              ? "pulse [.cardTop_>_i&]:[background:var(--purple-bright)] [.cardTop_>_i&]:[box-shadow:0_0_0_5px_color-mix(in_srgb,_var(--purple-bright)_12%,_transparent)] [.cardTop_>_i&]:[animation:pulse_1.5s_ease-in-out_infinite]"
              : ""
          }
        />
      </div>
      <div
        className={`albumArt [.homeStatusColumn_&]:[width:58px] [.homeStatusColumn_&]:[aspect-ratio:1] [.homeStatusColumn_&]:[float:left] [.homeStatusColumn_&]:[margin:12px_13px_0_0] [.homeStatusColumn_&]:[border-radius:14px] relative [width:100%] [aspect-ratio:1.45] [margin-top:24px] overflow-hidden [border-radius:30px_30px_9px_30px] [background-size:cover] [background-position:center] [box-shadow:0_18px_35px_var(--shadow)] max-[421px]:[aspect-ratio:1.3] ${!spotify.artwork ? "albumFallback" : ""}`}
      >
        <SpotifyArtwork src={spotify.artwork} />
        {spotify.isPlaying && (
          <div className="equalizer absolute [right:14px] [bottom:14px] [height:36px] [padding:8px_10px] flex [align-items:end] [gap:3px] [border-radius:14px_14px_5px_14px] [background:var(--md-sys-color-surface-container-high)] [backdrop-filter:none] [-webkit-backdrop-filter:none] [&_i]:[width:3px] [&_i]:[height:45%] [&_i]:[border-radius:3px] [&_i]:[background:var(--purple-bright)] [&_i]:[animation:equalize_0.7s_ease-in-out_infinite_alternate] [&_i:nth-child(2)]:[height:100%] [&_i:nth-child(2)]:[animation-delay:-0.2s] [&_i:nth-child(3)]:[height:70%] [&_i:nth-child(3)]:[animation-delay:-0.45s] [&_i:nth-child(4)]:[height:35%] [&_i:nth-child(4)]:[animation-delay:-0.1s] motion-reduce:[&_i]:[animation:none]!">
            <i />
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
      <div className="trackInfo [.homeStatusColumn_&]:[min-height:58px] [.homeStatusColumn_&]:[padding-top:13px] [.homeStatusColumn_&]:[margin-top:0] [.homeStatusColumn_&_h2]:[font-size:16px] [margin-top:22px] [&_p]:[margin:0_0_6px] [&_p]:[color:var(--purple-bright)] [&_p]:[font-size:8px] [&_p]:[font-weight:900] [&_p]:[letter-spacing:1px] [&_p]:uppercase [&_h2]:[margin:0] [&_h2]:overflow-hidden [&_h2]:[font-size:20px] [&_h2]:[letter-spacing:-0.55px] [&_h2]:whitespace-nowrap [&_h2]:[text-overflow:ellipsis] [&_>_span]:block [&_>_span]:[margin-top:5px] [&_>_span]:overflow-hidden [&_>_span]:[color:var(--muted)] [&_>_span]:[font-size:11px] [&_>_span]:whitespace-nowrap [&_>_span]:[text-overflow:ellipsis]">
        <p>
          {spotify.album ||
            (spotify.isPlaying
              ? t("Currently listening", "กำลังฟัง")
              : t("Playback paused", "หยุดเล่นชั่วคราว"))}
        </p>
        <h2 id="spotify-title">{title}</h2>
        <span>{spotify.artist}</span>
      </div>
      <div className="progress [.homeStatusColumn_&]:hidden [margin-top:21px] [&_>_m3e-linear-progress-indicator]:[width:100%] [&_>_m3e-linear-progress-indicator]:[--m3e-linear-progress-indicator-thickness:7px] [&_>_m3e-linear-progress-indicator]:[--m3e-linear-wavy-progress-indicator-amplitude:2px] [&_>_m3e-linear-progress-indicator]:[--m3e-linear-wavy-progress-indicator-wavelength:16px] [&_>_m3e-linear-progress-indicator]:[--m3e-progress-indicator-color:var(--purple-bright)] [&_>_m3e-linear-progress-indicator]:[--m3e-progress-indicator-track-color:color-mix(_in_srgb,_var(--purple-bright)_14%,_transparent_)] [&_p]:[margin:6px_0_0] [&_p]:flex [&_p]:justify-between [&_p]:[color:var(--muted)] [&_p]:[font-size:8px]">
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
          className="spotifyLink [.homeStatusColumn_&]:hidden [min-height:42px] [margin-top:18px] [padding:0_15px] flex items-center justify-between [border:1px_solid_var(--glass-line)] [border-radius:18px_18px_7px_18px] [color:var(--ink)] [background:color-mix(in_srgb,_var(--surface)_48%,_transparent)] [font-size:10px] [font-weight:900] [text-decoration:none] [&:hover]:[background:color-mix(in_srgb,_var(--purple-soft)_62%,_transparent)]"
          href={spotify.url}
          target="_blank"
          rel="noreferrer"
        >
          {t("Open in Spotify", "เปิดใน Spotify")}{" "}
          <StatusIcon name="arrow" size={17} />
        </a>
      ) : (
        <div className="idleMessage [.homeStatusColumn_&]:hidden [min-height:42px] [margin-top:18px] [padding:0_14px] flex items-center [gap:9px] [border:1px_dashed_var(--glass-line)] [border-radius:18px_18px_7px_18px] [color:var(--muted)] [font-size:9px] [&_>_span]:[color:var(--purple-bright)] [&_>_span]:[font-size:16px]">
          <span>♪</span>
          {t("Waiting for the next song", "รอเพลงถัดไป")}
        </div>
      )}
      {error && (
        <p className="errorText [.githubCard_>_&]:[grid-column:1_/_-1] [.githubCard_>_&]:[margin:-8px_0_0] [margin:14px_0_0] [color:var(--coral)] [font-size:9px] max-[761px]:[.githubCard_>_&]:[grid-column:auto]">
          {error}
        </p>
      )}
    </section>
  );
}
