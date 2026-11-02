"use client";

import { useSiteSettings } from "./site-settings-provider";
import { StatusIcon } from "./status-icon";
import type { DiscordProfile } from "@/app/lib/status-types";

export default function DiscordWidget({
  profile,
  error,
  compact = false,
}: {
  profile: DiscordProfile | null;
  error?: string | null;
  compact?: boolean;
}) {
  const { t } = useSiteSettings();
  const status = profile?.status ?? "offline";
  const customStatus =
    typeof profile?.customStatus === "string"
      ? profile.customStatus
      : profile?.customStatus?.text || profile?.customStatus?.state;

  if (compact) {
    return (
      <section
        className="glassCard compactStatusCard"
        aria-labelledby="compact-discord-title"
      >
        <div
          className="compactStatusArtwork compactDiscordArtwork"
          style={
            profile?.avatar
              ? { backgroundImage: `url(${profile.avatar})` }
              : undefined
          }
        >
          {!profile?.avatar && <StatusIcon name="discord" size={30} />}
          <span className={`statusDot status_${status}`} />
        </div>
        <div className="compactStatusCopy">
          <h2 id="compact-discord-title">
            {profile?.displayName ||
              profile?.globalName ||
              t("Discord profile", "โปรไฟล์ Discord")}
          </h2>
          <p>@{profile?.username || t("unavailable", "ไม่พร้อมใช้งาน")}</p>
          {error && <span className="compactStatusError">{error}</span>}
        </div>
      </section>
    );
  }

  return (
    <section className="glassCard discordCard" aria-labelledby="discord-title">
      <div
        className="discordBanner"
        style={
          profile?.banner
            ? {
                backgroundImage: `linear-gradient(180deg, transparent 15%, color-mix(in srgb, var(--paper) 76%, transparent)), url(${profile.banner})`,
              }
            : undefined
        }
      >
        <span className="platformBadge">
          <StatusIcon name="discord" size={18} />
          Discord
        </span>
        <div
          className="avatar"
          style={
            profile?.avatar
              ? { backgroundImage: `url(${profile.avatar})` }
              : undefined
          }
        >
          <span className={`statusDot status_${status}`} />
        </div>
      </div>
      <div className="discordBody">
        <div className="identity">
          <div>
            <p className="presenceLabel">
              <span className={`statusDot status_${status}`} />
              {status}
            </p>
            <h2 id="discord-title">
              {profile?.displayName ||
                profile?.globalName ||
                t("Discord profile", "โปรไฟล์ Discord")}
            </h2>
            <p>@{profile?.username || t("unavailable", "ไม่พร้อมใช้งาน")}</p>
          </div>
          <div className="deviceRow">
            {profile?.desktop && <span title="Desktop">Desktop</span>}
            {profile?.mobile && <span title="Mobile">Mobile</span>}
            {profile?.web && <span title="Web">Web</span>}
          </div>
        </div>
        {customStatus && <div className="customStatus">{customStatus}</div>}
        <div className="profileMeta">
          <div>
            <span>{t("Member since", "เป็นสมาชิกตั้งแต่")}</span>
            <strong>2022</strong>
          </div>
          <div>
            <span>{t("Community", "ชุมชน")}</span>
            <strong>{profile?.guildName || "Discord"}</strong>
          </div>
          <div>
            <span>{t("Activities", "กิจกรรม")}</span>
            <strong>{profile?.activities?.length ?? 0}</strong>
          </div>
        </div>
        {profile?.badges?.length ? (
          <div className="badges">
            {profile.badges.map((badge) => (
              <span key={badge}>
                {badge.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            ))}
          </div>
        ) : null}
        {error && <p className="errorText">{error}</p>}
      </div>
    </section>
  );
}
