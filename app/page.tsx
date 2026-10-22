"use client";

import { CSSProperties, useCallback, useEffect, useState } from "react";
import AgeCalculator from "./components/age-calculator";
import PortfolioNavbar from "./components/portfolio-navbar";
import { DiscordWidget, SpotifyWidget, StatusIcon, type DiscordProfile, type SpotifyView } from "./test/status-widgets";
import "./test/test.css";

const PROFILE_NAME = "Ryn";
const PROFILE_IMAGE: string | null = null; // Set this to "/your-image.webp" after adding it to /public.
const BIRTH_DATE = "2006-01-01T00:00:00+07:00";

type JsonRecord = Record<string, unknown>;
type StatusPayload = { discord: unknown; spotify: unknown; errors?: { discord?: string | null; spotify?: string | null } };
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

function TypewriterGreeting() {
  const message = `Hey, I’m ${PROFILE_NAME}`;
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleCharacters((current) => {
        if (current >= message.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 72);
    return () => window.clearInterval(timer);
  }, [message.length]);

  return <p className={styles.typewriter} aria-label={message}><span aria-hidden="true">{message.slice(0, visibleCharacters)}</span><i aria-hidden="true" /></p>;
}

export default function Home() {
  const [payload, setPayload] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Status request failed");
      setPayload(await response.json() as StatusPayload);
    } catch {
      setPayload({ discord: null, spotify: null, errors: { discord: "Could not load Discord", spotify: "Could not load Spotify" } });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => void loadStatus(), 0);
    const interval = window.setInterval(() => void loadStatus(), 15_000);
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
    };
  }, [loadStatus]);

  const rawDiscord = payload?.discord;
  const discord = isRecord(rawDiscord) ? (isRecord(rawDiscord.data) ? rawDiscord.data : rawDiscord) as DiscordProfile : null;
  const spotify = normalizeSpotify(payload?.spotify);

  return (
    <main className="root-empty" aria-label="Home">
      <PortfolioNavbar />
      <section className={styles.homeHero} style={{ "--profile-accent": discord?.accentColor || "#a8f0ba" } as CSSProperties}>
        <div className={styles.homeHeroGrid}>
          <div className={styles.homeIdentity}>
            <div className={styles.homeAvatar} style={PROFILE_IMAGE ? { backgroundImage: `url(${PROFILE_IMAGE})` } : undefined}>{!PROFILE_IMAGE && <span>R</span>}</div>
            <TypewriterGreeting />
          </div>
          <article className={`${styles.glassCard} ${styles.aboutCard}`}>
            <p>I&apos;m <AgeCalculator birthDate={BIRTH_DATE} /> years old—a personal space for what I&apos;m building, listening to, and exploring.</p>
          </article>
          <div className={styles.homeStatusColumn} aria-label="Live status">
            {loading ? <div className={styles.homeLoading}><div/><div/></div> : <>
              <SpotifyWidget spotify={spotify} error={payload?.errors?.spotify} compact/>
              <DiscordWidget profile={discord} error={payload?.errors?.discord} compact/>
            </>}
          </div>
        </div>
        <a className={styles.scrollCue} href="#more"><span>Scroll for more</span><StatusIcon name="arrow" size={19}/></a>
        <div id="more" className={styles.homeMore} aria-hidden="true" />
      </section>
    </main>
  );
}
