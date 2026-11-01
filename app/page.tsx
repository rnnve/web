"use client";

import WidgetPreloads from "./components/widget-preloads";
import AgeCalculator from "./components/age-calculator";
import DeveloperTools from "./components/developer-tools";
import GitHubShowcase from "./components/github-showcase";
import PortfolioNavbar from "./components/portfolio-navbar";
import SectionRevealController from "./components/section-reveal-controller";
import SiteFooter from "./components/site-footer";
import DiscordWidget from "./components/discord-widget";
import SpotifyWidget from "./components/spotify-widget";
import { StatusIcon } from "./components/status-icon";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import "./styles/home.css";

const BIRTH_DATE = "2010-12-31T13:12:00+07:00";

export default function Home() {
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
                Hey, I’m Rynnie<span aria-hidden="true">.</span>
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
      <DeveloperTools />
      <SiteFooter />
    </main>
  );
}
