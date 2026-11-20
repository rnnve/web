"use client";

import Image from "next/image";
import { StatusIcon } from "./status-icon";
import SpotifyWidget from "./spotify-widget";
import usePortfolioStatus from "../../hooks/use-portfolio-status";
import { useSiteSettings } from "../settings/site-settings-provider";
import type { DiscordProfile } from "../../lib/status-types";
import styles from "../../home.module.css";

export default function LiveStatus({
  initialDiscord = null,
  discordUpdatedAt = 0,
  className = "",
}: {
  initialDiscord?: DiscordProfile | null;
  discordUpdatedAt?: number;
  className?: string;
}) {
  const { t } = useSiteSettings();
  const { discord, payload, spotify, spotifyLoading, spotifySyncedAt } =
    usePortfolioStatus({
      profile: initialDiscord,
      updatedAt: discordUpdatedAt,
    });
  return (
    <div className={`${styles.status} ${className}`}>
      <div
        className={styles.profile}
        role="group"
        aria-label={t("Discord profile", "โปรไฟล์ Discord")}
      >
        <span className={styles.avatar}>
          {discord?.avatar ? (
            <Image src={discord.avatar} alt="" fill sizes="32px" priority />
          ) : (
            <StatusIcon name="discord" size={18} />
          )}
          <span
            className={styles.presence}
            data-status={discord?.status ?? "offline"}
            role="img"
            aria-label={`Discord: ${discord?.status ?? "offline"}`}
          />
        </span>
        <span className={styles.profileText}>
          <strong>
            {discord?.displayName ||
              discord?.globalName ||
              discord?.username ||
              "Rynnie"}
          </strong>
          <span>@{discord?.username || "melrynni"}</span>
        </span>
      </div>
      {!spotifyLoading && spotify.isPlaying && (
        <div className={styles.nowPlaying} aria-label="Live Spotify status">
          <SpotifyWidget
            compact
            spotify={spotify}
            error={payload.errors?.spotify}
            syncedAt={spotifySyncedAt}
          />
        </div>
      )}
    </div>
  );
}
