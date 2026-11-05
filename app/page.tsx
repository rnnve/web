"use client";

import WidgetPreloads from "./components/widget-preloads";
import AgeCalculator from "./components/age-calculator";
import BlurText from "./components/blur-text";
import { usePageReady } from "./page-transition";
import Stacks from "./components/stacks";
import GitHubShowcase from "./components/github-showcase";
import SectionRevealController from "./components/section-reveal-controller";
import SiteFooter from "./components/site-footer";
import DiscordWidget from "./components/discord-widget";
import SpotifyWidget from "./components/spotify-widget";
import { StatusIcon } from "./components/status-icon";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import { BIRTH_DATE } from "./lib/birthday";
import { useSiteSettings } from "./components/site-settings-provider";
import "./styles/home.css";

export default function Home() {
  const { language, t } = useSiteSettings();
  const pageReady = usePageReady();
  const {
    payload,
    discord,
    spotify,
    discordLoading,
    spotifyLoading,
    githubLoading,
    spotifySyncedAt,
  } = usePortfolioStatus();

  return (
    <main className="root-empty home-page" aria-label="Home">
      <WidgetPreloads />
      <SectionRevealController />
      <section id="top" className="homeHero" data-reveal>
        <div className="homeHeroGrid">
          <div className="homeIdentity">
            <div className="homeIdentityCopy">
              <h1>
                <BlurText
                  text={t("Hey, I’m Rynnie.", "สวัสดี เราชื่อ Rynnie")}
                  effect="tilt"
                  animateBy={language === "th" ? "words" : "letters"}
                  direction="bottom"
                  staggerFrom="start"
                  trigger="load"
                  enabled={pageReady}
                  delay={40}
                  stepDuration={0.45}
                  blur={8}
                  distance={40}
                />
              </h1>
            </div>
          </div>
          <article className="glassCard aboutCard">
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
                    <AgeCalculator birthDate={BIRTH_DATE} /> years old Semi-Full
                    Stack Developer
                  </strong>
                  . I mostly works on <strong>Discord bots and Web</strong>, I
                  also can design a little bit. My projects are mostly on my{" "}
                  <a
                    href="https://github.com/rnnve"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Github profile
                  </a>
                  .
                </>
              )}
            </p>
          </article>
          <div className="homeStatusColumn" aria-label="Live status">
            {spotifyLoading ? (
              <div
                className="homeStatusSkeleton"
                aria-label="Loading Spotify status"
              />
            ) : (
              <SpotifyWidget
                spotify={spotify}
                error={payload.errors?.spotify}
                syncedAt={spotifySyncedAt}
                compact
              />
            )}
            {discordLoading ? (
              <div
                className="homeStatusSkeleton"
                aria-label="Loading Discord status"
              />
            ) : (
              <DiscordWidget
                profile={discord}
                error={payload.errors?.discord}
                compact
              />
            )}
          </div>
        </div>
        <a className="scrollCue" href="#more">
          <span>{t("Scroll for more", "เลื่อนเพื่อดูเพิ่มเติม")}</span>
          <StatusIcon name="arrow" size={19} />
        </a>
      </section>
      <GitHubShowcase
        repos={payload.githubRepos}
        events={payload.githubEvents}
        loading={githubLoading}
      />
      <div className="home-last-section">
        <Stacks />
        <SiteFooter />
      </div>
    </main>
  );
}
