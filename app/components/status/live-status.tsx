"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  const reducedMotion = useReducedMotion();
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
      <AnimatePresence>
        {!spotifyLoading && spotify.isPlaying && (
          <motion.div
            key="now-playing"
            className={styles.nowPlaying}
            aria-label="Live Spotify status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <SpotifyWidget
              compact
              spotify={spotify}
              error={payload.errors?.spotify}
              syncedAt={spotifySyncedAt}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
