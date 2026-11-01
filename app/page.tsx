"use client";

import WidgetPreloads from "./components/widget-preloads";
import AgeCalculator from "./components/age-calculator";
import BlurText from "./components/blur-text";
import { usePageReady } from "./page-transition";
import Stacks from "./components/stacks";
import GitHubShowcase from "./components/github-showcase";
import PortfolioNavbar from "./components/portfolio-navbar";
import SectionRevealController from "./components/section-reveal-controller";
import SiteFooter from "./components/site-footer";
import DiscordWidget from "./components/discord-widget";
import SpotifyWidget from "./components/spotify-widget";
import { StatusIcon } from "./components/status-icon";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import { BIRTH_DATE } from "./lib/birthday";
import "./styles/home.css";

export default function Home() {
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
    <main className="root-empty" aria-label="Home">
      <WidgetPreloads />
      <SectionRevealController />
      <PortfolioNavbar />
      <section id="top" className="homeHero" data-reveal>
        <div className="homeHeroGrid">
          <div className="homeIdentity">
            <div className="homeIdentityCopy">
              <h1>
                <BlurText
                  text="Hey, I’m Rynnie."
                  effect="tilt"
                  animateBy="letters"
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
              I&apos;m a{" "}
              <strong>
                <AgeCalculator birthDate={BIRTH_DATE} /> years old Semi-Full
                Stack Developer
              </strong>
              . I mostly works on <strong>Discord bots and Web</strong>, I also
              can design a little bit. My projects are mostly on my{" "}
              <a
                href="https://github.com/rnnve"
                target="_blank"
                rel="noreferrer"
              >
                Github profile
              </a>
              .
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
          <span>Scroll for more</span>
          <StatusIcon name="arrow" size={19} />
        </a>
      </section>
      <GitHubShowcase
        repos={payload.githubRepos}
        events={payload.githubEvents}
        loading={githubLoading}
      />
      <Stacks />
      <SiteFooter />
    </main>
  );
}
