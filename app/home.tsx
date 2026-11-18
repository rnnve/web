"use client";

import AgeCalculator from "./components/home/age-calculator";
import Image from "next/image";
import Link from "next/link";
import styles from "./home.module.css";
import { StatusIcon } from "./components/status/status-icon";
import SpotifyWidget from "./components/status/spotify-widget";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import { BIRTH_DATE } from "./lib/birthday";
import type { DiscordProfile } from "./lib/status-types";
import { useSiteSettings } from "./components/settings/site-settings-provider";
export default function Home({
  initialDiscord = null,
  discordUpdatedAt = 0,
}: {
  initialDiscord?: DiscordProfile | null;
  discordUpdatedAt?: number;
}) {
  const { language, t } = useSiteSettings();
  const { discord, payload, spotify, spotifyLoading, spotifySyncedAt } =
    usePortfolioStatus({
      profile: initialDiscord,
      updatedAt: discordUpdatedAt,
    });
  return (
    <main className="home-page" aria-label="Home">
      <section id="top" className={styles.hero}>
        <div className={styles.content}>
          <header className={styles.identity}>
            <h1>Rynnie{language === "en" ? "." : ""}</h1>
          </header>
          <div className={styles.overview}>
            <div className={styles.about}>
              <article className={styles.bio}>
                <p>
                  {language === "th" ? (
                    <>
                      เราอายุ{" "}
                      <strong>
                        <AgeCalculator birthDate={BIRTH_DATE} /> ปี เป็นนักพัฒนา
                        Semi-Full Stack
                      </strong>{" "}
                      ทำงานเกี่ยวกับ <strong>บอท Discord และเว็บไซต์</strong>{" "}
                      เป็นหลัก และออกแบบได้นิดหน่อย
                      ดูโปรเจกต์ส่วนใหญ่ของเราได้ที่{" "}
                      <Link href="/developing">หน้าผลงานและงานพัฒนา</Link>
                    </>
                  ) : (
                    <>
                      I&apos;m a{" "}
                      <strong>
                        <AgeCalculator birthDate={BIRTH_DATE} /> year old
                        Semi-Full Stack Developer
                      </strong>
                      . I mainly build{" "}
                      <strong>Discord bots and websites</strong>, with a little
                      design work too. You can find most of my projects on my{" "}
                      <Link href="/developing">Developing page</Link>.
                    </>
                  )}
                </p>
              </article>
              <div className={styles.status}>
                <div
                  className={styles.profile}
                  role="group"
                  aria-label={t("Discord profile", "โปรไฟล์ Discord")}
                >
                  <span className={styles.avatar}>
                    {discord?.avatar ? (
                      <Image
                        src={discord.avatar}
                        alt=""
                        fill
                        sizes="32px"
                        priority
                      />
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
                  <div
                    className={styles.nowPlaying}
                    aria-label="Live Spotify status"
                  >
                    <SpotifyWidget
                      compact
                      spotify={spotify}
                      error={payload.errors?.spotify}
                      syncedAt={spotifySyncedAt}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
