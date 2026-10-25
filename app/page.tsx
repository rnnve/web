"use client";

import { CSSProperties, useCallback, useEffect, useState } from "react";
import AgeCalculator from "./components/age-calculator";
import DeveloperTools from "./components/developer-tools";
import GitHubShowcase from "./components/github-showcase";
import PortfolioNavbar from "./components/portfolio-navbar";
import SectionRevealController from "./components/section-reveal-controller";
import SiteFooter from "./components/site-footer";
import { DiscordWidget, SpotifyWidget, StatusIcon, type DiscordProfile, type SpotifyView } from "./components/status-widgets";
import "./styles/home.css";

const BIRTH_DATE = "2010-12-31T13:12:00+07:00";

type JsonRecord = Record<string, unknown>;
type StatusPayload = {
  discord?: unknown;
  spotify?: unknown;
  githubRepos?: unknown;
  githubEvents?: unknown;
  errors?: { discord?: string | null; spotify?: string | null };
};
type DiscordPayload = { discord: unknown; error?: string | null };
type SpotifyPayload = { spotify: unknown; error?: string | null };
type GitHubPayload = { repos: unknown; events: unknown };
const styles = new Proxy({} as Record<string, string>, { get: (_target, property) => String(property) });
const isRecord = (value: unknown): value is JsonRecord => typeof value === "object" && value !== null && !Array.isArray(value);

function readString(record: JsonRecord | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value) return value;
  }
  return "";
}

function readNumber(record: JsonRecord | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
}

function normalizeSpotify(value: unknown): SpotifyView {
  const root = isRecord(value) ? value : {};
  const track = isRecord(root.track) ? root.track : isRecord(root.item) ? root.item : isRecord(root.song) ? root.song : root;
  const album = isRecord(track.album) ? track.album : isRecord(root.album) ? root.album : undefined;
  const images = Array.isArray(album?.images) ? album.images : [];
  const firstImage = isRecord(images[0]) ? images[0] : undefined;
  const rawArtists = Array.isArray(track.artists) ? track.artists : Array.isArray(root.artists) ? root.artists : [];
  const artists = rawArtists.map((artist) => isRecord(artist) ? readString(artist, "name") : typeof artist === "string" ? artist : "").filter(Boolean);
  const external = isRecord(track.external_urls) ? track.external_urls : isRecord(root.external_urls) ? root.external_urls : undefined;

  return {
    isPlaying: (root.isPlaying ?? root.is_playing ?? root.playing) === true,
    title: readString(track, "name", "title", "track") || "Nothing playing",
    artist: artists.join(", ") || readString(root, "artist", "artists") || readString(track, "artist") || "Spotify is quiet right now",
    album: readString(album, "name", "title") || readString(root, "album"),
    artwork: readString(root, "albumImageUrl") || readString(firstImage, "url") || readString(root, "albumArt", "albumImage", "artwork", "image", "cover") || readString(track, "albumImageUrl", "albumArt", "artwork", "image"),
    progress: readNumber(root, "progressMs", "progress_ms", "progress"),
    duration: readNumber(track, "durationMs", "duration_ms", "duration") || readNumber(root, "durationMs", "duration_ms", "duration"),
    url: readString(external, "spotify") || readString(root, "url", "spotifyUrl", "externalUrl"),
  };
}

export default function Home() {
  const [payload, setPayload] = useState<StatusPayload>({ discord: null, spotify: null, githubRepos: [], githubEvents: [] });
  const [discordLoading, setDiscordLoading] = useState(true);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [githubLoading, setGitHubLoading] = useState(true);
  const [lastSpotify, setLastSpotify] = useState<SpotifyView | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(window.localStorage.getItem("ryn:last-spotify") ?? "null") as unknown;
      return isRecord(saved) && typeof saved.title === "string" ? saved as SpotifyView : null;
    } catch {
      return null;
    }
  });

  const rememberSpotify = useCallback((value: unknown) => {
    const nextSpotify = normalizeSpotify(value);
    if (!nextSpotify.isPlaying || nextSpotify.title === "Nothing playing") return;
    setLastSpotify(nextSpotify);
    try {
      window.localStorage.setItem("ryn:last-spotify", JSON.stringify(nextSpotify));
    } catch {
      // The live widget still works when local storage is unavailable.
    }
  }, []);

  const loadDiscord = useCallback(async () => {
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Discord request failed");
      const next = await response.json() as DiscordPayload;
      setPayload((current) => ({
        ...current,
        discord: next.discord,
        errors: { ...current.errors, discord: next.error ?? null },
      }));
    } catch {
      setPayload((current) => ({ ...current, errors: { ...current.errors, discord: "Could not load Discord" } }));
    } finally {
      setDiscordLoading(false);
    }
  }, []);

  const loadSpotify = useCallback(async () => {
    try {
      const response = await fetch("/api/status/spotify", { cache: "no-store" });
      if (!response.ok) throw new Error("Spotify request failed");
      const next = await response.json() as SpotifyPayload;
      rememberSpotify(next.spotify);
      setPayload((current) => ({
        discord: current?.discord ?? null,
        spotify: next.spotify,
        githubRepos: current?.githubRepos,
        githubEvents: current?.githubEvents,
        errors: { ...current?.errors, spotify: next.error ?? null },
      }));
    } catch {
      setPayload((current) => ({
        discord: current?.discord ?? null,
        spotify: current?.spotify ?? null,
        githubRepos: current?.githubRepos,
        githubEvents: current?.githubEvents,
        errors: { ...current?.errors, spotify: "Could not load Spotify" },
      }));
    } finally {
      setSpotifyLoading(false);
    }
  }, [rememberSpotify]);

  const loadGitHub = useCallback(async () => {
    try {
      const response = await fetch("/api/status/github", { cache: "no-store" });
      if (!response.ok) throw new Error("GitHub request failed");
      const next = await response.json() as GitHubPayload;
      setPayload((current) => ({ ...current, githubRepos: next.repos, githubEvents: next.events }));
    } catch {
      // The showcase falls back to its empty state when GitHub is unavailable.
    } finally {
      setGitHubLoading(false);
    }
  }, []);

  useEffect(() => {
    let discordInterval: number | undefined;
    let spotifyInterval: number | undefined;
    let githubInterval: number | undefined;

    const stopPolling = () => {
      if (discordInterval !== undefined) window.clearInterval(discordInterval);
      if (spotifyInterval !== undefined) window.clearInterval(spotifyInterval);
      if (githubInterval !== undefined) window.clearInterval(githubInterval);
      discordInterval = undefined;
      spotifyInterval = undefined;
      githubInterval = undefined;
    };

    const startPolling = () => {
      stopPolling();
      if (document.hidden) return;
      void loadDiscord();
      void loadSpotify();
      void loadGitHub();
      discordInterval = window.setInterval(() => void loadDiscord(), 15_000);
      spotifyInterval = window.setInterval(() => void loadSpotify(), 5_000);
      githubInterval = window.setInterval(() => void loadGitHub(), 300_000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopPolling();
      else startPolling();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [loadDiscord, loadGitHub, loadSpotify]);

  const rawDiscord = payload.discord;
  const discord = isRecord(rawDiscord) ? (isRecord(rawDiscord.data) ? rawDiscord.data : rawDiscord) as DiscordProfile : null;
  const liveSpotify = normalizeSpotify(payload.spotify);

  const spotify = liveSpotify.isPlaying ? liveSpotify : lastSpotify ? { ...lastSpotify, isPlaying: false } : liveSpotify;

  return (
    <main className="root-empty" aria-label="Home">
      <SectionRevealController />
      <PortfolioNavbar />
      <section id="top" className={styles.homeHero} style={{ "--profile-accent": discord?.accentColor || "#ff76b8" } as CSSProperties} data-reveal>
        <div className={styles.homeHeroGrid}>
          <div className={styles.homeIdentity}>
            <div className={styles.homeIdentityCopy}>
              <h1>Hey, I’m Rynnie<span aria-hidden="true">.</span></h1>
            </div>
          </div>
          <article className={`${styles.glassCard} ${styles.aboutCard}`}>
            <p>
              I&apos;m a <strong><AgeCalculator birthDate={BIRTH_DATE} /> years old Semi-Full Stack Developer</strong>. I mostly works on <strong>Discord bots and Web</strong>, I also can design a little bit. My projects are mostly on my <a href="https://github.com/rnnve" target="_blank" rel="noreferrer">Github profile</a>.
            </p>
          </article>
          <div className={styles.homeStatusColumn} aria-label="Live status">
            {spotifyLoading ? <div className={styles.homeStatusSkeleton} aria-label="Loading Spotify status"/> : <SpotifyWidget spotify={spotify} error={payload.errors?.spotify} compact/>}
            {discordLoading ? <div className={styles.homeStatusSkeleton} aria-label="Loading Discord status"/> : <DiscordWidget profile={discord} error={payload.errors?.discord} compact/>}
          </div>
        </div>
        <a className={styles.scrollCue} href="#more"><span>Scroll for more</span><StatusIcon name="arrow" size={19}/></a>
      </section>
      <GitHubShowcase repos={payload.githubRepos} events={payload.githubEvents} loading={githubLoading} />
      <DeveloperTools />
      <SiteFooter />
    </main>
  );
}
