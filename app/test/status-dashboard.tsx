"use client";

import Link from "next/link";
import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import "./test.css";
import { DiscordWidget, GitHubWidget, SpotifyWidget, StatusIcon, type DiscordProfile, type GitHubView, type SpotifyView } from "./status-widgets";

const styles = new Proxy({} as Record<string, string>, {
  get: (_target, property) => String(property),
});

type JsonRecord = Record<string, unknown>;

type ApiPayload = {
  discord: unknown;
  spotify: unknown;
  github: unknown;
  errors?: { discord?: string | null; spotify?: string | null; github?: string | null };
  updatedAt?: number;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function unwrapDiscord(value: unknown): DiscordProfile | null {
  if (!isRecord(value)) return null;
  const data = isRecord(value.data) ? value.data : value;
  return data as DiscordProfile;
}

function normalizeSpotify(value: unknown): SpotifyView {
  const root = isRecord(value) ? value : {};
  const track = isRecord(root.track) ? root.track : isRecord(root.item) ? root.item : isRecord(root.song) ? root.song : root;
  const album = isRecord(track.album) ? track.album : isRecord(root.album) ? root.album : undefined;
  const imageArray = Array.isArray(album?.images) ? album.images : [];
  const firstImage = isRecord(imageArray[0]) ? imageArray[0] : undefined;
  const artistArray = Array.isArray(track.artists) ? track.artists : Array.isArray(root.artists) ? root.artists : [];
  const artists = artistArray.map((artist) => isRecord(artist) ? readString(artist, "name") : typeof artist === "string" ? artist : "").filter(Boolean);
  const external = isRecord(track.external_urls) ? track.external_urls : isRecord(root.external_urls) ? root.external_urls : undefined;
  const playingValue = root.isPlaying ?? root.is_playing ?? root.playing;

  return {
    isPlaying: playingValue === true,
    title: readString(track, "name", "title", "track") || "Nothing playing",
    artist: artists.join(", ") || readString(root, "artist", "artists") || readString(track, "artist") || "Spotify is quiet right now",
    album: readString(album, "name", "title") || readString(root, "album"),
    artwork: readString(root, "albumImageUrl") || readString(firstImage, "url") || readString(root, "albumArt", "albumImage", "artwork", "image", "cover") || readString(track, "albumImageUrl", "albumArt", "artwork", "image"),
    progress: readNumber(root, "progressMs", "progress_ms", "progress"),
    duration: readNumber(track, "durationMs", "duration_ms", "duration") || readNumber(root, "durationMs", "duration_ms", "duration"),
    url: readString(external, "spotify") || readString(root, "url", "spotifyUrl", "externalUrl"),
  };
}

function normalizeGithub(value: unknown): GitHubView {
  const root = isRecord(value) ? value : {};

  return {
    login: readString(root, "login") || "rnnve",
    name: readString(root, "name") || readString(root, "login") || "GitHub profile",
    avatarUrl: readString(root, "avatar_url"),
    profileUrl: readString(root, "html_url") || "https://github.com/rnnve",
    bio: readString(root, "bio") || "Building thoughtful digital experiences on the web.",
    location: readString(root, "location"),
    blog: readString(root, "blog"),
    repositories: readNumber(root, "public_repos"),
    followers: readNumber(root, "followers"),
    following: readNumber(root, "following"),
    joinedAt: readString(root, "created_at"),
  };
}

export default function StatusDashboard({ embedded = false }: { embedded?: boolean }) {
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Status request failed");
      setPayload(await response.json() as ApiPayload);
    } catch {
      setPayload((current) => current ?? { discord: null, spotify: null, github: null, errors: { discord: "Could not load Discord", spotify: "Could not load Spotify", github: "Could not load GitHub" } });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => void loadStatus(true), 0);
    const interval = window.setInterval(() => void loadStatus(true), 15_000);
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
    };
  }, [loadStatus]);

  const discord = useMemo(() => unwrapDiscord(payload?.discord), [payload?.discord]);
  const spotify = useMemo(() => normalizeSpotify(payload?.spotify), [payload?.spotify]);
  const github = useMemo(() => normalizeGithub(payload?.github), [payload?.github]);
  const accent = discord?.accentColor || "#a8f0ba";

  const widgets = (
    <>
        <div className={styles.intro}>
          <div><p className={styles.kicker}>Social dashboard</p><h1>Here, <em>right now.</em></h1></div>
          <p>A small window into what I&apos;m doing, listening to, and building—updated automatically across my profiles.</p>
        </div>

        {loading ? <div className={styles.loadingGrid}><div/><div/><div/></div> : <div className={styles.dashboard}>
          <DiscordWidget profile={discord} error={payload?.errors?.discord}/>
          <SpotifyWidget spotify={spotify} error={payload?.errors?.spotify}/>
          <GitHubWidget github={github} error={payload?.errors?.github}/>

        </div>}

    </>
  );

  if (embedded) {
    return (
      <section id="status" className={`${styles.page} ${styles.embeddedPage}`} style={{ "--profile-accent": accent } as CSSProperties}>
        <div className={styles.aurora} aria-hidden="true"><span/><span/><span/></div>
        <div className={`${styles.shell} ${styles.embeddedShell}`}>{widgets}</div>
      </section>
    );
  }

  return (
    <div className={styles.page} style={{ "--profile-accent": accent } as CSSProperties}>
      <div className={styles.aurora} aria-hidden="true"><span/><span/><span/></div>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><span>R</span><strong>ryn<span>.</span></strong></Link>
        <div className={styles.liveBadge}><i/>Live presence</div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} onClick={() => void loadStatus()} aria-label="Refresh status"><span className={refreshing ? styles.spinning : ""}><StatusIcon name="refresh"/></span></button>
          <Link href="/" className={styles.homeButton}><StatusIcon name="home" size={17}/><span>Portfolio</span></Link>
        </div>
      </header>
      <main className={styles.shell}>
        {widgets}
      </main>
    </div>
  );
}
