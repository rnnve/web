"use client";

import Image from "next/image";
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
        className="glassCard overflow-hidden [border:0] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [backdrop-filter:none] [border-radius:var(--md-shape-extra-large)] [-webkit-backdrop-filter:none] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] compactStatusCard [min-height:112px] [padding:16px] grid [grid-template-columns:72px_minmax(0,_1fr)] items-center [gap:16px] [border-radius:var(--md-shape-extra-large)] [border:0] [background:var(--md-sys-color-surface-container-high)] [box-shadow:none] [backdrop-filter:none] [transition:background-color_0.25s_ease,_transform_0.4s_var(--md-motion-emphasized),_box-shadow_0.25s_ease] [@media(min-width:_761px)_and_(max-height:_650px)]:[min-height:92px] [@media(min-width:_761px)_and_(max-height:_650px)]:[grid-template-columns:68px_minmax(0,_1fr)] [&:hover]:[background:var(--md-sys-color-surface-container-highest)] [&:hover]:[box-shadow:var(--md-elevation-1)] [&:hover]:[transform:translateY(-2px)] motion-reduce:[transform:none]! [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:[min-height:112px] [.root-empty_&]:[padding:16px] [.root-empty_&]:[grid-template-columns:72px_minmax(0,_1fr)] [.root-empty_&]:[gap:16px] [.root-empty_&]:[background:var(--md-sys-color-surface-container-high)] [.root-empty_&:hover]:[background:var(--md-sys-color-surface-container-highest)] [.root-empty_&:hover]:[box-shadow:var(--md-elevation-1)] max-[761px]:[.root-empty_&]:[min-height:104px] max-[761px]:[.root-empty_&]:[padding:14px] max-[761px]:[.root-empty_&]:[grid-template-columns:64px_minmax(0,_1fr)] max-[761px]:[.root-empty_&]:[gap:14px]"
        aria-labelledby="compact-discord-title"
      >
        <div className="compactStatusArtwork relative [width:72px] [aspect-ratio:1] grid [place-items:center] [border:0] [border-radius:var(--md-shape-large)] [color:var(--md-sys-color-on-primary-container)] [background:linear-gradient(145deg,_var(--purple-soft),_var(--paper-deep))] [background-position:center] [background-size:cover] [box-shadow:none] [background-color:var(--md-sys-color-primary-container)] [background-image:none] [@media(min-width:_761px)_and_(max-height:_650px)]:[width:68px] [.root-empty_&]:[width:72px] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-large)] [.root-empty_&]:[color:var(--md-sys-color-on-primary-container)] [.root-empty_&]:[background-color:var(--md-sys-color-primary-container)] [.root-empty_&]:[box-shadow:none] max-[761px]:[.root-empty_&]:[width:64px] compactDiscordArtwork [border-radius:50%] [.root-empty_&]:[border-radius:50%]">
          {profile?.avatar ? (
            <Image
              src={profile.avatar}
              alt=""
              fill
              sizes="76px"
              className="compactDiscordAvatar [object-fit:cover] [border-radius:inherit]"
            />
          ) : (
            <StatusIcon name="discord" size={30} />
          )}
          <span
            className={`statusDot [.compactStatusArtwork_&]:absolute [.compactStatusArtwork_&]:[right:2px] [.compactStatusArtwork_&]:[bottom:3px] [.compactStatusArtwork_&]:[width:13px] [.compactStatusArtwork_&]:[height:13px] [.compactStatusArtwork_&]:[border:3px_solid_var(--surface)] [.homeStatusColumn_.avatar_&]:[width:16px] [.homeStatusColumn_.avatar_&]:[height:16px] [.homeStatusColumn_.avatar_&]:[border-width:3px] [.avatar_&]:absolute [.avatar_&]:[right:-3px] [.avatar_&]:[bottom:-3px] [.avatar_&]:[width:25px] [.avatar_&]:[height:25px] [.avatar_&]:[border:5px_solid_var(--surface)] inline-block [width:8px] [height:8px] [border-radius:50%] [background:#777] [.presenceLabel_&]:[width:7px] [.presenceLabel_&]:[height:7px] status_${status}`}
          />
        </div>
        <div className="compactStatusCopy [min-width:0] [&_h2]:[margin:0] [&_h2]:overflow-hidden [&_h2]:[font-size:17px] [&_h2]:[line-height:1.15] [&_h2]:[letter-spacing:-0.25px] [&_h2]:whitespace-nowrap [&_h2]:[text-overflow:ellipsis] [&_h2]:[color:var(--md-sys-color-on-surface)] [&_h2]:[font-weight:650] [&_>_p]:[margin:5px_0_0] [&_>_p]:overflow-hidden [&_>_p]:[color:var(--md-sys-color-on-surface-variant)] [&_>_p]:[font-size:12px] [&_>_p]:whitespace-nowrap [.compactSpotifyCard_&_h2]:[font-size:clamp(14px,_1.35vw,_17px)] [.compactSpotifyCard_&_h2]:[letter-spacing:-0.35px]">
          <h2 id="compact-discord-title">
            {profile?.displayName ||
              profile?.globalName ||
              t("Discord profile", "โปรไฟล์ Discord")}
          </h2>
          <p>@{profile?.username || t("unavailable", "ไม่พร้อมใช้งาน")}</p>
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
      className="glassCard overflow-hidden [border:0] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [backdrop-filter:none] [border-radius:var(--md-shape-extra-large)] [-webkit-backdrop-filter:none] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] discordCard [.homeStatusColumn_&]:[min-height:0] [.homeStatusColumn_&]:[border-radius:20px] [min-height:570px] [border-radius:38px_38px_14px_38px] max-[761px]:[min-height:auto]"
      aria-labelledby="discord-title"
    >
      <div
        className="discordBanner [.homeStatusColumn_&]:[height:62px] [height:212px] relative [background:linear-gradient(_145deg,_color-mix(in_srgb,_var(--md-sys-color-primary)_45%,_var(--purple-soft)),_var(--paper-deep)_)] [background-size:cover] [background-position:center] [&::after]:[content:''] [&::after]:absolute [&::after]:[inset:0] [&::after]:[background:linear-gradient(_to_top,_color-mix(in_srgb,_var(--paper)_80%,_transparent),_transparent_65%_)] max-[761px]:[height:180px]"
        style={
          profile?.banner
            ? {
                backgroundImage: `linear-gradient(180deg, transparent 15%, color-mix(in srgb, var(--paper) 76%, transparent)), url(${profile.banner})`,
              }
            : undefined
        }
      >
        <span className="platformBadge [.homeStatusColumn_&]:[top:12px] [.homeStatusColumn_&]:[right:12px] absolute [z-index:2] [top:18px] [right:18px] [padding:8px_11px] flex items-center [gap:7px] [border:1px_solid_var(--glass-line)] [border-radius:14px_14px_5px_14px] [background:var(--md-sys-color-surface-container-high)] [backdrop-filter:none] [font-size:10px] [font-weight:800] [-webkit-backdrop-filter:none]">
          <StatusIcon name="discord" size={18} />
          Discord
        </span>
        <div
          className="avatar [.homeStatusColumn_&]:[left:16px] [.homeStatusColumn_&]:[bottom:-22px] [.homeStatusColumn_&]:[width:50px] [.homeStatusColumn_&]:[height:50px] [.homeStatusColumn_&]:[border-width:3px] [.homeStatusColumn_&]:[border-radius:15px] absolute [z-index:3] [left:28px] [bottom:-54px] [width:112px] [height:112px] [border:6px_solid_var(--surface)] [border-radius:38px_38px_13px_38px] [background:linear-gradient(145deg,_var(--purple-bright),_var(--purple))] [background-size:cover] [background-position:center] [box-shadow:0_15px_30px_var(--shadow)] max-[421px]:[left:20px] max-[421px]:[width:102px] max-[421px]:[height:102px]"
          style={
            profile?.avatar
              ? {
                  backgroundImage: `url(${profile.avatar})`,
                }
              : undefined
          }
        >
          <span
            className={`statusDot [.compactStatusArtwork_&]:absolute [.compactStatusArtwork_&]:[right:2px] [.compactStatusArtwork_&]:[bottom:3px] [.compactStatusArtwork_&]:[width:13px] [.compactStatusArtwork_&]:[height:13px] [.compactStatusArtwork_&]:[border:3px_solid_var(--surface)] [.homeStatusColumn_.avatar_&]:[width:16px] [.homeStatusColumn_.avatar_&]:[height:16px] [.homeStatusColumn_.avatar_&]:[border-width:3px] [.avatar_&]:absolute [.avatar_&]:[right:-3px] [.avatar_&]:[bottom:-3px] [.avatar_&]:[width:25px] [.avatar_&]:[height:25px] [.avatar_&]:[border:5px_solid_var(--surface)] inline-block [width:8px] [height:8px] [border-radius:50%] [background:#777] [.presenceLabel_&]:[width:7px] [.presenceLabel_&]:[height:7px] status_${status}`}
          />
        </div>
      </div>
      <div className="discordBody [.homeStatusColumn_&]:[padding:29px_16px_14px] [padding:70px_28px_28px] max-[761px]:[padding-inline:20px]">
        <div className="identity [.homeStatusColumn_&_h2]:[margin-top:2px] [.homeStatusColumn_&_h2]:[font-size:17px] [.homeStatusColumn_&_>_div_>_p:last-child]:[font-size:10px] flex items-start justify-between [gap:20px] [&_h2]:[margin:5px_0_1px] [&_h2]:[font-size:30px] [&_h2]:[letter-spacing:-1.2px] [&_>_div_>_p:last-child]:[margin:0] [&_>_div_>_p:last-child]:[color:var(--muted)] [&_>_div_>_p:last-child]:[font-size:12px] max-[421px]:block">
          <div>
            <p className="presenceLabel flex items-center [gap:7px] [margin:0] [color:var(--muted)] [font-size:9px] [font-weight:900] [letter-spacing:1px] uppercase">
              <span
                className={`statusDot [.compactStatusArtwork_&]:absolute [.compactStatusArtwork_&]:[right:2px] [.compactStatusArtwork_&]:[bottom:3px] [.compactStatusArtwork_&]:[width:13px] [.compactStatusArtwork_&]:[height:13px] [.compactStatusArtwork_&]:[border:3px_solid_var(--surface)] [.homeStatusColumn_.avatar_&]:[width:16px] [.homeStatusColumn_.avatar_&]:[height:16px] [.homeStatusColumn_.avatar_&]:[border-width:3px] [.avatar_&]:absolute [.avatar_&]:[right:-3px] [.avatar_&]:[bottom:-3px] [.avatar_&]:[width:25px] [.avatar_&]:[height:25px] [.avatar_&]:[border:5px_solid_var(--surface)] inline-block [width:8px] [height:8px] [border-radius:50%] [background:#777] [.presenceLabel_&]:[width:7px] [.presenceLabel_&]:[height:7px] status_${status}`}
              />
              {status}
            </p>
            <h2 id="discord-title">
              {profile?.displayName ||
                profile?.globalName ||
                t("Discord profile", "โปรไฟล์ Discord")}
            </h2>
            <p>@{profile?.username || t("unavailable", "ไม่พร้อมใช้งาน")}</p>
          </div>
          <div className="deviceRow [.homeStatusColumn_&]:hidden flex [flex-wrap:wrap] justify-end [gap:6px] [&_span]:[padding:6px_9px] [&_span]:[border:1px_solid_var(--glass-line)] [&_span]:[border-radius:12px] [&_span]:[background:color-mix(in_srgb,_var(--purple-soft)_32%,_transparent)] [&_span]:[color:var(--muted)] [&_span]:[font-size:8px] [&_span]:[font-weight:800] [&_span]:uppercase max-[421px]:[margin-top:13px] max-[421px]:justify-start">
            {profile?.desktop && <span title="Desktop">Desktop</span>}
            {profile?.mobile && <span title="Mobile">Mobile</span>}
            {profile?.web && <span title="Web">Web</span>}
          </div>
        </div>
        {customStatus && (
          <div className="customStatus [.homeStatusColumn_&]:[margin-top:8px] [.homeStatusColumn_&]:[padding-block:8px] [margin-top:18px] [padding:12px_14px] [border:1px_solid_var(--glass-line)] [border-radius:16px_16px_6px_16px] [background:color-mix(in_srgb,_var(--surface)_42%,_transparent)] [color:var(--ink)] [font-size:11px]">
            {customStatus}
          </div>
        )}
        <div className="profileMeta [.homeStatusColumn_&]:hidden [margin-top:25px] [padding-top:22px] grid [grid-template-columns:repeat(3,_1fr)] [gap:15px] [border-top:1px_solid_var(--glass-line)] [&_span]:block [&_span]:[margin-bottom:5px] [&_span]:[color:var(--muted)] [&_span]:[font-size:8px] [&_span]:uppercase [&_span]:[letter-spacing:0.7px] [&_strong]:block [&_strong]:overflow-hidden [&_strong]:[font-size:11px] [&_strong]:whitespace-nowrap [&_strong]:[text-overflow:ellipsis] max-[761px]:[gap:8px] max-[421px]:[grid-template-columns:1fr_1fr] max-[421px]:[&_>_div:last-child]:hidden">
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
          <div className="badges [.homeStatusColumn_&]:hidden [&_span]:[padding:6px_9px] [&_span]:[border:1px_solid_var(--glass-line)] [&_span]:[border-radius:12px] [&_span]:[background:color-mix(in_srgb,_var(--purple-soft)_52%,_transparent)] [&_span]:[color:var(--purple-bright)] [&_span]:[font-size:8px] [&_span]:[font-weight:800] [&_span]:uppercase [margin-top:20px] flex [flex-wrap:wrap] [gap:7px]">
            {profile.badges.map((badge) => (
              <span key={badge}>
                {badge.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            ))}
          </div>
        ) : null}
        {error && (
          <p className="errorText [.githubCard_>_&]:[grid-column:1_/_-1] [.githubCard_>_&]:[margin:-8px_0_0] [margin:14px_0_0] [color:var(--coral)] [font-size:9px] max-[761px]:[.githubCard_>_&]:[grid-column:auto]">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
