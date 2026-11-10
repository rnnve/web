"use client";

import WidgetPreloads from "./components/status/widget-preloads";
import AgeCalculator from "./components/home/age-calculator";
import Stacks from "./components/home/stacks";
import GitHubShowcase from "./components/status/github-showcase";
import SectionRevealController from "./components/effects/section-reveal-controller";
import Image from "next/image";
import styles from "./home.module.css";
import SpotifyWidget from "./components/status/spotify-widget";
import { StatusIcon } from "./components/status/status-icon";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import { BIRTH_DATE } from "./lib/birthday";
import { useSiteSettings } from "./components/settings/site-settings-provider";
export default function Home() {
  const { language, t } = useSiteSettings();
  const {
    payload,
    discord,
    spotify,
    spotifyLoading,
    githubLoading,
    spotifySyncedAt,
  } = usePortfolioStatus();
  return (
    <main
      className="root-empty home-page [.root-empty&_>_:is(section,_.home-last-section)]:[min-height:100svh] [.reveal-ready_&_section[data-reveal]]:[transform:none] [.reveal-ready_&_section[data-reveal]]:[will-change:opacity]"
      aria-label="Home"
    >
      <WidgetPreloads />
      <SectionRevealController />
      <section id="top" className={styles.hero}>
        <div className={styles.content}>
          <header className={styles.identity}>
            <p className={styles.greeting}>{t("Hey, I’m", "สวัสดี เราชื่อ")}</p>
            <h1>Rynnie{language === "en" ? "." : ""}</h1>
            <div className={styles.profile}>
              <span className={styles.avatar}>
                {discord?.avatar ? (
                  <Image src={discord.avatar} alt="" fill sizes="28px" />
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
              <span>@{discord?.username || "melrynni"}</span>
            </div>
          </header>
          {!spotifyLoading && spotify.isPlaying && (
            <div className={styles.music} aria-label="Live Spotify status">
              <SpotifyWidget
                spotify={spotify}
                error={payload.errors?.spotify}
                syncedAt={spotifySyncedAt}
                compact
              />
            </div>
          )}
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
                  เป็นหลัก และออกแบบได้นิดหน่อย ดูโปรเจกต์ส่วนใหญ่ของเราได้ที่{" "}
                  <a
                    href="https://github.com/rnnve"
                    target="_blank"
                    rel="noreferrer"
                  >
                    โปรไฟล์ GitHub
                  </a>
                </>
              ) : (
                <>
                  I&apos;m a{" "}
                  <strong>
                    <AgeCalculator birthDate={BIRTH_DATE} /> year old Semi-Full
                    Stack Developer
                  </strong>
                  . I mainly build <strong>Discord bots and websites</strong>,
                  with a little design work too. You can find most of my
                  projects on my{" "}
                  <a
                    href="https://github.com/rnnve"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub profile
                  </a>
                  .
                </>
              )}
            </p>
          </article>
          <div className={styles.actions}>
            <nav
              className={styles.socials}
              aria-label={t("Find me online", "ติดตามเรา")}
            >
              <a
                href="https://discord.com/users/969088519161139270"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord (opens in a new tab)"
                title="Discord"
              >
                <StatusIcon name="discord" size={18} />
                <span>Discord</span>
              </a>
              <a
                href="https://github.com/rnnve"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub (opens in a new tab)"
                title="GitHub"
              >
                <StatusIcon name="github" size={18} />
                <span>GitHub</span>
              </a>
            </nav>
          </div>
        </div>
        <a className={styles.scrollCue} href="#more">
          <span>{t("Scroll for more", "เลื่อนเพื่อดูเพิ่มเติม")}</span>
          <StatusIcon name="arrow" size={18} />
        </a>
      </section>
      <GitHubShowcase
        repos={payload.githubRepos}
        events={payload.githubEvents}
        loading={githubLoading}
      />
      <div className="home-last-section flex flex-col">
        <Stacks />
      </div>
    </main>
  );
}
