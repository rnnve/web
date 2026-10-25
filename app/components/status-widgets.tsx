"use client";

import { useEffect, useState } from "react";
import WavyLinearProgress from "./wavy-linear-progress";

const styles = new Proxy({} as Record<string, string>, { get: (_target, property) => String(property) });

export type Activity = { name?: string; type?: string; details?: string | null; state?: string | null; icon?: string | null; timestamps?: { start?: number | null; end?: number | null } | null };
export type DiscordProfile = { username?: string; displayName?: string; globalName?: string; avatar?: string; banner?: string; accentColor?: string; badges?: string[]; status?: string; customStatus?: string | { text?: string; state?: string; emoji?: { name?: string } } | null; activities?: Activity[]; mobile?: boolean; desktop?: boolean; web?: boolean; guildName?: string };
export type SpotifyView = { isPlaying: boolean; title: string; artist: string; album: string; artwork: string; progress: number; duration: number; url: string };
export type GitHubView = { login: string; name: string; avatarUrl: string; profileUrl: string; bio: string; location: string; blog: string; repositories: number; followers: number; following: number; joinedAt: string };

type StatusIconName = "arrow" | "discord" | "github" | "headphones" | "home" | "pin" | "refresh" | "spotify";

export function StatusIcon({ name, size = 20 }: { name: StatusIconName; size?: number }) {
  const paths: Record<StatusIconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    discord: <><path d="M8 8.5a9.5 9.5 0 0 1 8 0M7 17c-2.5-.8-3.5-2.7-3.5-2.7.4-3.7 1.8-6.7 1.8-6.7A10 10 0 0 1 8 6.3l.8 1.2M17 17c2.5-.8 3.5-2.7 3.5-2.7-.4-3.7-1.8-6.7-1.8-6.7A10 10 0 0 0 16 6.3l-.8 1.2"/><circle cx="8.5" cy="12.5" r="1" fill="currentColor"/><circle cx="15.5" cy="12.5" r="1" fill="currentColor"/><path d="M8 16c2.7 1.2 5.3 1.2 8 0"/></>,
    github: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3 5.4 5.4 0 0 0 19.1 0S17.9-.4 15 1.5a14 14 0 0 0-6 0C6.1-.4 4.9 0 4.9 0a5.4 5.4 0 0 0-.2 3A5.8 5.8 0 0 0 3.2 7.1c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 9 18v4"/><path d="M9 19c-3 .9-3-1.5-4.2-2"/></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2v-3ZM20 14a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2v-3Z"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 18.5 6L20 8M4 16l1.5 2A7 7 0 0 0 17.9 16"/></>,
    spotify: <><circle cx="12" cy="12" r="9"/><path d="M7.5 10.2c3.8-1 7.1-.5 10 1M8.2 13c3.2-.7 6.1-.3 8.6.8M9 15.7c2.6-.5 4.8-.2 7 .7"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const formatTime = (milliseconds: number) => { const seconds = Math.floor(milliseconds / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; };
const toExternalUrl = (value: string) => /^https?:\/\//i.test(value) ? value : `https://${value}`;

export function DiscordWidget({ profile, error, compact = false }: { profile: DiscordProfile | null; error?: string | null; compact?: boolean }) {
  const status = profile?.status ?? "offline";
  const customStatus = typeof profile?.customStatus === "string" ? profile.customStatus : profile?.customStatus?.text || profile?.customStatus?.state;

  if (compact) {
    return <section className={`${styles.glassCard} ${styles.compactStatusCard}`} aria-labelledby="compact-discord-title">
      <div className={`${styles.compactStatusArtwork} ${styles.compactDiscordArtwork}`} style={profile?.avatar ? { backgroundImage: `url(${profile.avatar})` } : undefined}>{!profile?.avatar && <StatusIcon name="discord" size={30}/>}<span className={`${styles.statusDot} ${styles[`status_${status}`]}`}/></div>
      <div className={styles.compactStatusCopy}><h2 id="compact-discord-title">{profile?.displayName || profile?.globalName || "Discord profile"}</h2><p>@{profile?.username || "unavailable"}</p>{error && <span className={styles.compactStatusError}>{error}</span>}</div>
    </section>;
  }

  return <section className={`${styles.glassCard} ${styles.discordCard}`} aria-labelledby="discord-title">
    <div className={styles.discordBanner} style={profile?.banner ? { backgroundImage: `linear-gradient(180deg, transparent 15%, color-mix(in srgb, var(--paper) 76%, transparent)), url(${profile.banner})` } : undefined}><span className={styles.platformBadge}><StatusIcon name="discord" size={18}/>Discord</span><div className={styles.avatar} style={profile?.avatar ? { backgroundImage: `url(${profile.avatar})` } : undefined}><span className={`${styles.statusDot} ${styles[`status_${status}`]}`}/></div></div>
    <div className={styles.discordBody}>
      <div className={styles.identity}><div><p className={styles.presenceLabel}><span className={`${styles.statusDot} ${styles[`status_${status}`]}`}/>{status}</p><h2 id="discord-title">{profile?.displayName || profile?.globalName || "Discord profile"}</h2><p>@{profile?.username || "unavailable"}</p></div><div className={styles.deviceRow}>{profile?.desktop && <span title="Desktop">Desktop</span>}{profile?.mobile && <span title="Mobile">Mobile</span>}{profile?.web && <span title="Web">Web</span>}</div></div>
      {customStatus && <div className={styles.customStatus}>{customStatus}</div>}
      <div className={styles.profileMeta}><div><span>Member since</span><strong>2022</strong></div><div><span>Community</span><strong>{profile?.guildName || "Discord"}</strong></div><div><span>Activities</span><strong>{profile?.activities?.length ?? 0}</strong></div></div>
      {profile?.badges?.length ? <div className={styles.badges}>{profile.badges.map((badge) => <span key={badge}>{badge.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>)}</div> : null}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  </section>;
}

export function SpotifyWidget({ spotify, error, compact = false, syncedAt = 0 }: { spotify: SpotifyView; error?: string | null; compact?: boolean; syncedAt?: number }) {
  const [clock, setClock] = useState(0);

  useEffect(() => {
    if (!spotify.isPlaying) return;

    const timer = window.setInterval(() => {
      setClock(Date.now());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [spotify.isPlaying, spotify.title]);

  const currentProgress = spotify.isPlaying && syncedAt > 0
    ? Math.min(spotify.duration || Number.POSITIVE_INFINITY, spotify.progress + Math.max(0, clock - syncedAt))
    : spotify.progress;
  const progress = spotify.duration ? Math.min(100, Math.max(0, currentProgress / spotify.duration * 100)) : 0;

  if (compact) {
    return <section className={`${styles.glassCard} ${styles.compactStatusCard} ${styles.compactSpotifyCard}`} aria-labelledby="compact-spotify-title">
      <div className={`${styles.compactStatusArtwork} ${styles.compactSpotifyArtwork}`} style={spotify.artwork ? { backgroundImage: `url(${spotify.artwork})` } : undefined}>{!spotify.artwork && <StatusIcon name="spotify" size={32}/>}</div>
      <div className={styles.compactStatusCopy}><h2 id="compact-spotify-title">{spotify.title}</h2><p className={styles.compactScrollingText}><span>{spotify.isPlaying ? spotify.artist : spotify.title === "Nothing playing" ? "Spotify is quiet right now" : `Last played · ${spotify.artist}`}</span></p><WavyLinearProgress className={styles.compactSpotifyProgress} value={currentProgress} max={spotify.duration || 1} label={`${Math.round(progress)}% played`}/><div className={styles.compactSpotifyTimes}><span>{formatTime(currentProgress)}</span><span>{formatTime(spotify.duration)}</span></div>{error && <span className={styles.compactStatusError}>{error}</span>}</div>
    </section>;
  }

  return <section className={`${styles.glassCard} ${styles.spotifyCard}`} aria-labelledby="spotify-title">
    <div className={styles.cardTop}><span className={`${styles.platformIcon} ${styles.spotifyIcon}`}><StatusIcon name="spotify" size={23}/></span><div><p>Spotify</p><span>{spotify.isPlaying ? "Now playing" : "Not playing"}</span></div><i className={spotify.isPlaying ? styles.pulse : ""}/></div>
    <div className={`${styles.albumArt} ${!spotify.artwork ? styles.albumFallback : ""}`} style={spotify.artwork ? { backgroundImage: `url(${spotify.artwork})` } : undefined}>{!spotify.artwork && <StatusIcon name="headphones" size={54}/>} {spotify.isPlaying && <div className={styles.equalizer}><i/><i/><i/><i/></div>}</div>
    <div className={styles.trackInfo}><p>{spotify.album || (spotify.isPlaying ? "Currently listening" : "Playback paused")}</p><h2 id="spotify-title">{spotify.title}</h2><span>{spotify.artist}</span></div>
    <div className={styles.progress}><WavyLinearProgress value={currentProgress} max={spotify.duration || 1} label={`${Math.round(progress)}% played`}/><p><span>{formatTime(currentProgress)}</span><span>{formatTime(spotify.duration)}</span></p></div>
    {spotify.url ? <a className={styles.spotifyLink} href={spotify.url} target="_blank" rel="noreferrer">Open in Spotify <StatusIcon name="arrow" size={17}/></a> : <div className={styles.idleMessage}><span>♪</span>Waiting for the next song</div>}
    {error && <p className={styles.errorText}>{error}</p>}
  </section>;
}

export function GitHubWidget({ github, error }: { github: GitHubView; error?: string | null }) {
  return <section className={`${styles.glassCard} ${styles.githubCard}`} aria-labelledby="github-title">
    <div className={styles.githubProfile}><div className={styles.githubAvatar} style={github.avatarUrl ? { backgroundImage: `url(${github.avatarUrl})` } : undefined}>{!github.avatarUrl && <StatusIcon name="github" size={34}/>}</div><div className={styles.githubIdentity}><p><StatusIcon name="github" size={15}/>GitHub profile</p><h2 id="github-title">{github.name}</h2><span>@{github.login}</span></div></div>
    <div className={styles.githubContent}><p className={styles.githubBio}>{github.bio}</p><div className={styles.githubMeta}>{github.location && <span><StatusIcon name="pin" size={13}/>{github.location}</span>}{github.blog && <a href={toExternalUrl(github.blog)} target="_blank" rel="noreferrer">{github.blog.replace(/^https?:\/\//, "")}</a>}{github.joinedAt && <span>Joined {new Date(github.joinedAt).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>}</div></div>
    <div className={styles.githubStats} aria-label="GitHub profile statistics"><div><strong>{github.repositories}</strong><span>Repositories</span></div><div><strong>{github.followers}</strong><span>Followers</span></div><div><strong>{github.following}</strong><span>Following</span></div></div>
    <a className={styles.githubLink} href={github.profileUrl} target="_blank" rel="noreferrer">View GitHub <StatusIcon name="arrow" size={17}/></a>
    {error && <p className={styles.errorText}>{error}</p>}
  </section>;
}
