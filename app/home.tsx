"use client";

import WidgetPreloads from "./components/widget-preloads";
import AgeCalculator from "./components/age-calculator";
import Stacks from "./components/stacks";
import GitHubShowcase from "./components/github-showcase";
import SectionRevealController from "./components/section-reveal-controller";
import DiscordWidget from "./components/discord-widget";
import SpotifyWidget from "./components/spotify-widget";
import { StatusIcon } from "./components/status-icon";
import usePortfolioStatus from "./hooks/use-portfolio-status";
import { BIRTH_DATE } from "./lib/birthday";
import { useSiteSettings } from "./components/site-settings-provider";
export default function Home() {
  const { language, t } = useSiteSettings();
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
    <main
      className="root-empty home-page [.root-empty&_>_:is(section,_.home-last-section)]:[min-height:100svh] [.root-empty&_>_:is(section,_.home-last-section)]:[scroll-snap-align:start] [.reveal-ready_&_section[data-reveal]]:[transform:none] [.reveal-ready_&_section[data-reveal]]:[will-change:opacity]"
      aria-label="Home"
    >
      <WidgetPreloads />
      <SectionRevealController />
      <section
        id="top"
        className="homeHero [--glass:color-mix(in_srgb,_var(--surface)_62%,_transparent)] [--glass-strong:color-mix(in_srgb,_var(--surface)_78%,_transparent)] [--glass-line:color-mix(in_srgb,_var(--purple-bright)_24%,_transparent)] [--muted:var(--ink-soft)] [height:100svh] [min-height:700px] relative [padding:120px_0_64px] [color:var(--md-sys-color-on-surface)] [width:min(960px,_calc(100%_-_48px))] [margin-inline:auto] max-[761px]:[height:auto] max-[761px]:[min-height:100svh] max-[761px]:[padding:104px_0_64px] max-[761px]:[width:calc(100%_-_28px)] [@media(min-width:_761px)_and_(max-height:_650px)]:[min-height:0] [@media(min-width:_761px)_and_(max-height:_650px)]:[padding-top:98px] [@media(min-width:_761px)_and_(max-height:_650px)]:[padding-bottom:44px] [.root-empty_&]:[width:min(960px,_calc(100%_-_48px))] [.root-empty_&]:[min-height:700px] [.root-empty_&]:[margin-inline:auto] [.root-empty_&]:[padding:120px_0_64px] max-[761px]:[.root-empty_&]:[width:calc(100%_-_32px)] max-[761px]:[.root-empty_&]:[height:auto] max-[761px]:[.root-empty_&]:[min-height:100svh] max-[761px]:[.root-empty_&]:[padding:calc(92px_+_env(safe-area-inset-top))_0_calc(56px_+_env(safe-area-inset-bottom))] max-[761px]:[.root-empty_&]:flex max-[761px]:[.root-empty_&]:flex-col max-[761px]:[.root-empty_&]:justify-center"
      >
        <div className="homeHeroGrid [height:100%] grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [grid-template-rows:auto_auto_auto] [align-content:center] items-center [column-gap:16px] [row-gap:16px] max-[761px]:[height:auto] max-[761px]:[grid-template-columns:1fr] max-[761px]:[grid-template-rows:auto] max-[761px]:[gap:14px] [@media(min-width:_761px)_and_(max-height:_650px)]:[align-content:center] [.root-empty_&]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] [.root-empty_&]:[column-gap:16px] [.root-empty_&]:[row-gap:16px] max-[761px]:[.root-empty_&]:[height:auto] max-[761px]:[.root-empty_&]:[grid-template-columns:1fr] max-[761px]:[.root-empty_&]:[gap:16px]">
          <div className="homeIdentity [grid-column:1_/_-1] flex items-center [gap:20px] [min-height:136px] [padding:12px_0] [color:var(--md-sys-color-on-surface)] [&_p]:[margin:0] [&_p]:[font-size:clamp(19px,_2vw,_26px)] [&_p]:[letter-spacing:-0.8px] [&_strong]:[color:var(--purple-bright)] [&_strong]:[font-weight:850] max-[761px]:[grid-column:auto] max-[761px]:[min-height:120px] max-[761px]:[padding:20px] max-[441px]:items-center max-[441px]:[gap:14px] [.root-empty_&]:[min-height:136px] [.root-empty_&]:[padding:12px_0] [.root-empty_&]:[gap:20px] [.root-empty_&]:[border-radius:0] [.root-empty_&]:[background:transparent] [.root-empty_&]:[color:var(--md-sys-color-on-surface)] [.root-empty_&]:[box-shadow:none] max-[761px]:[.root-empty_&]:[min-height:auto] max-[761px]:[.root-empty_&]:[padding:16px_4px]">
            <div className="homeIdentityCopy [min-width:0] [&_>_span]:block [&_>_span]:[margin-bottom:4px] [&_>_span]:[color:color-mix(_in_srgb,_var(--md-sys-color-on-primary-container)_76%,_transparent_)] [&_>_span]:[font-size:12px] [&_>_span]:[font-weight:600] [&_>_span]:[letter-spacing:0.2px] [&_h1]:[margin:0] [&_h1]:[font-size:clamp(32px,_5vw,_54px)] [&_h1]:[font-weight:650] [&_h1]:[line-height:1] [&_h1]:[letter-spacing:-2px] [&_h1_span]:[color:var(--md-sys-color-primary)] max-[761px]:[&_h1]:[font-size:clamp(30px,_10vw,_42px)] max-[761px]:[&_h1]:[letter-spacing:-1.4px] max-[441px]:[&_>_span]:[font-size:10px] max-[441px]:[&_h1]:[font-size:29px]">
              <h1>{t("Hey, I’m Rynnie.", "สวัสดี เราชื่อ Rynnie")}</h1>
            </div>
          </div>
          <article className="glassCard overflow-hidden [border:0] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [backdrop-filter:none] [border-radius:var(--md-shape-extra-large)] [-webkit-backdrop-filter:none] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] aboutCard [grid-column:1_/_-1] [min-height:132px] [padding:28px] flex flex-col justify-center [border-radius:var(--md-shape-extra-large)] [border:0] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [backdrop-filter:none] [&_h1]:[max-width:440px] [&_h1]:[margin:8px_0_12px] [&_h1]:[font-size:clamp(27px,_3vw,_40px)] [&_h1]:[line-height:1.02] [&_h1]:[letter-spacing:-1.7px] [&_>_p:last-child]:[width:100%] [&_>_p:last-child]:[max-width:none] [&_>_p:last-child]:[margin:0] [&_>_p:last-child]:[color:var(--md-sys-color-on-surface-variant)] [&_>_p:last-child]:[font-size:14px] [&_>_p:last-child]:[line-height:1.65] [&_strong]:[color:var(--md-sys-color-on-surface)] [&_strong]:[font-weight:650] [&_a]:[color:var(--md-sys-color-on-surface)] [&_a]:[font-weight:650] [&_a]:[text-decoration-color:var(--md-sys-color-primary)] [&_a]:[text-underline-offset:3px] [&_a]:[transition:text-decoration-color_0.2s_ease] [&_a]:[text-decoration-thickness:2px] [&_a:hover]:[text-decoration-color:#fff] min-[761px]:[&_>_p:last-child]:[font-size:14px] max-[761px]:[grid-column:auto] max-[761px]:[padding:24px] [@media(min-width:_761px)_and_(max-height:_650px)]:[min-height:96px] [@media(min-width:_761px)_and_(max-height:_650px)]:[padding:18px_30px] [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-extra-large)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:relative [.root-empty_&]:[top:-35px] [.root-empty_&]:[min-height:132px] [.root-empty_&]:[padding:28px] [.root-empty_&_>_p:last-child]:[color:var(--md-sys-color-on-surface-variant)] [.root-empty_&_>_p:last-child]:[font-size:14px] max-[761px]:[.root-empty_&]:[top:0] max-[761px]:[.root-empty_&]:[min-height:0] max-[761px]:[.root-empty_&]:[padding:22px]">
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
          <div
            className="homeStatusColumn [grid-column:1_/_-1] grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:16px] max-[761px]:[grid-column:auto] max-[761px]:[width:100%] max-[761px]:[grid-template-columns:1fr] max-[761px]:[gap:12px] [@media(min-width:_761px)_and_(max-height:_650px)]:[gap:clamp(36px,_7vw,_76px)] [.root-empty_&]:[gap:16px] [.root-empty_&]:relative [.root-empty_&]:[top:-30px] max-[761px]:[.root-empty_&]:[top:0]"
            aria-label="Live status"
          >
            {spotifyLoading ? (
              <div
                className="homeStatusSkeleton [min-height:104px] [border:1px_solid_var(--glass-line)] [border-radius:20px] [background:linear-gradient(_110deg,_color-mix(in_srgb,_var(--surface)_34%,_transparent)_20%,_color-mix(in_srgb,_var(--purple-soft)_52%,_transparent)_35%,_color-mix(in_srgb,_var(--surface)_34%,_transparent)_50%_)] [background-size:250%_100%] [animation:shimmer_1.5s_linear_infinite] [@media(min-width:_761px)_and_(max-height:_650px)]:[min-height:92px] motion-reduce:[animation:none]!"
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
                className="homeStatusSkeleton [min-height:104px] [border:1px_solid_var(--glass-line)] [border-radius:20px] [background:linear-gradient(_110deg,_color-mix(in_srgb,_var(--surface)_34%,_transparent)_20%,_color-mix(in_srgb,_var(--purple-soft)_52%,_transparent)_35%,_color-mix(in_srgb,_var(--surface)_34%,_transparent)_50%_)] [background-size:250%_100%] [animation:shimmer_1.5s_linear_infinite] [@media(min-width:_761px)_and_(max-height:_650px)]:[min-height:92px] motion-reduce:[animation:none]!"
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
        <a
          className="scrollCue absolute [left:50%] [bottom:20px] grid [justify-items:center] [gap:8px] [color:var(--md-sys-color-on-secondary-container)] [font-size:11px] [font-weight:750] [text-decoration:none] [transform:translateX(-50%)] [min-height:40px] [padding:0_16px] [grid-auto-flow:column] [place-items:center] [border-radius:20px] [background:var(--md-sys-color-secondary-container)] [&_svg]:[rotate:90deg] [&_svg]:[animation:scroll-cue_1.5s_ease-in-out_infinite] max-[761px]:relative max-[761px]:[left:auto] max-[761px]:[bottom:auto] max-[761px]:[width:max-content] max-[761px]:[margin:28px_auto_0] max-[761px]:[transform:none] [@media(min-width:_761px)_and_(max-height:_650px)]:[bottom:9px] motion-reduce:[&_svg]:[animation:none]! max-[761px]:[.root-empty_&]:static max-[761px]:[.root-empty_&]:[flex-shrink:0] max-[761px]:[.root-empty_&]:[width:max-content] max-[761px]:[.root-empty_&]:[margin:28px_auto_0] max-[761px]:[.root-empty_&]:[transform:none]"
          href="#more"
        >
          <span>{t("Scroll for more", "เลื่อนเพื่อดูเพิ่มเติม")}</span>
          <StatusIcon name="arrow" size={19} />
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
