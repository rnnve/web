"use client";

import { memo, useMemo } from "react";
import ExternalLinkIcon from "../ui/external-link-icon";
import { useSiteSettings } from "../settings/site-settings-provider";
import { normalizeRepos, activityCells } from "@/app/lib/github";
export { FEATURED_REPOSITORY_WHITELIST } from "@/app/config/portfolio";
type GitHubShowcaseProps = {
  repos: unknown;
  events: unknown;
  loading?: boolean;
};
function GitHubShowcase({
  repos: rawRepos,
  events,
  loading = false,
}: GitHubShowcaseProps) {
  const { language, t } = useSiteSettings();
  const repos = useMemo(() => normalizeRepos(rawRepos), [rawRepos]);
  const cells = useMemo(() => activityCells(events), [events]);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    [language],
  );
  const totalActivity = cells.reduce((total, cell) => total + cell.count, 0);
  return (
    <section
      id="more"
      className="github-showcase [width:min(960px,_calc(100%_-_48px))] [min-height:100svh] [margin-inline:auto] [padding:126px_0_92px] flex flex-col justify-center [padding-block:112px_84px] max-[761px]:[width:calc(100%_-_28px)] max-[761px]:[min-height:auto] max-[761px]:[padding:84px_0_48px] [.root-empty_&]:[width:min(960px,_calc(100%_-_48px))] [.root-empty_&]:[padding-block:112px_84px] max-[761px]:[.root-empty_&]:[width:calc(100%_-_24px)] max-[761px]:[.root-empty_&]:[padding-block:84px_56px]"
      aria-labelledby="github-showcase-title"
      data-reveal
    >
      <div className="github-showcase__heading [margin-bottom:28px] flex [align-items:end] justify-between [gap:30px] [&_p]:[margin:0_0_7px] [&_p]:[color:var(--md-sys-color-primary)] [&_p]:[font-size:12px] [&_p]:[font-weight:600] [&_p]:[letter-spacing:0.2px] [&_p]:[text-transform:none] [&_p]:[margin-bottom:8px] [&_h2]:[margin:0] [&_h2]:[font-size:clamp(38px,_6vw,_64px)] [&_h2]:[line-height:1] [&_h2]:[letter-spacing:-2.6px] [&_h2]:[color:var(--md-sys-color-on-surface)] [&_h2]:[font-weight:620] [&_h2_span]:[color:var(--md-sys-color-primary)] max-[761px]:[align-items:start] max-[761px]:[margin-bottom:24px] max-[761px]:block max-[421px]:[&_h2]:[font-size:34px] [&_>_span]:[max-width:230px] [&_>_span]:[color:var(--md-sys-color-on-surface-variant)] [&_>_span]:[font-size:13px] [&_>_span]:[line-height:1.45] [&_>_span]:text-right max-[761px]:[&_>_span]:block max-[761px]:[&_>_span]:[margin-top:12px] max-[761px]:[&_>_span]:text-left [.root-empty_&_p]:[color:var(--md-sys-color-primary)] [.root-empty_&_p]:[font-size:12px] [.root-empty_&_p]:[font-weight:600] [.root-empty_&_p]:[letter-spacing:0.2px] [.root-empty_&_p]:[text-transform:none] [.root-empty_&_h2]:[color:var(--md-sys-color-on-surface)] [.root-empty_&_h2]:[font-size:clamp(38px,_6vw,_64px)] [.root-empty_&_h2]:[font-weight:620] [.root-empty_&_h2]:[line-height:1] [.root-empty_&_h2]:[letter-spacing:-2.6px]">
        <div>
          <p>GitHub</p>
          <h2 id="github-showcase-title">
            {t("Building in public", "ผลงานที่แบ่งปัน")}
            <span>.</span>
          </h2>
        </div>
        <span>
          {t(
            "Selected work and recent activity",
            "ผลงานที่เลือกและกิจกรรมล่าสุด",
          )}
        </span>
      </div>
      <div className="github-showcase__grid grid [grid-template-columns:minmax(0,_1fr)] [gap:16px] max-[761px]:[grid-template-columns:1fr] [.root-empty_&]:[gap:16px]">
        <article className="github-activity-card [border:0] [color:var(--md-sys-color-on-surface)] [background:var(--md-sys-color-surface-container)] [box-shadow:none] [text-decoration:none] [backdrop-filter:none] [transition:background-color_0.2s_ease,_transform_0.4s_var(--md-motion-emphasized),_box-shadow_0.2s_ease] [min-height:220px] [padding:28px] flex flex-col justify-between [border-radius:var(--md-shape-medium)] [-webkit-backdrop-filter:none] [&:hover]:[border-color:transparent] [&:hover]:[background:var(--md-sys-color-surface-container-high)] [&:hover]:[transform:translateY(-3px)] [&:hover]:[box-shadow:var(--md-elevation-1)] max-[761px]:[min-height:200px] max-[761px]:overflow-hidden max-[421px]:[min-height:190px] max-[421px]:[padding:18px] motion-reduce:[transform:none]! [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-medium)] [.root-empty_&]:[color:var(--md-sys-color-on-surface)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:[min-height:220px] [.root-empty_&]:[padding:28px] [.root-empty_&:hover]:[border-color:transparent] [.root-empty_&:hover]:[background:var(--md-sys-color-surface-container-high)] [.root-empty_&:hover]:[box-shadow:var(--md-elevation-1)] [.root-empty_&:hover]:[transform:translateY(-3px)]">
          <div className="github-activity-card__top flex [align-items:start] justify-between [gap:20px] [&_div_span]:block [&_div_span]:[color:var(--md-sys-color-primary)] [&_div_span]:[font-size:10px] [&_div_span]:[font-weight:800] [&_div_span]:[letter-spacing:0.2px] [&_div_span]:[text-transform:none] [&_div_strong]:block [&_div_strong]:[margin-top:8px] [&_div_strong]:[font-size:clamp(22px,_3vw,_32px)] [&_div_strong]:[letter-spacing:-0.7px] [&_div_strong]:[font-weight:620] [&_>_a]:[width:44px] [&_>_a]:[height:44px] [&_>_a]:[margin:-10px_-10px_0_0] [&_>_a]:grid [&_>_a]:[place-items:center] [&_>_a]:[border-radius:50%] [&_>_a]:[color:var(--md-sys-color-primary)] [&_>_a]:[line-height:1] [&_>_a]:[text-decoration:none]">
            <div>
              <span>{t("GitHub activity", "กิจกรรมบน GitHub")}</span>
              <strong>
                {t(
                  `${totalActivity} public contributions`,
                  `มีส่วนร่วมสาธารณะ ${totalActivity} ครั้ง`,
                )}
              </strong>
            </div>
            <a
              href="https://github.com/rnnve"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub profile"
            >
              <ExternalLinkIcon size={22} />
            </a>
          </div>
          <div
            className="github-activity-graph [width:100%] [margin:14px_auto_11px] grid [grid-template-rows:repeat(7,_1fr)] [grid-auto-flow:column] [grid-auto-columns:1fr] [gap:clamp(3px,_0.4vw,_5px)] [&_>_span]:relative [&_>_span]:[aspect-ratio:1] [&_>_span]:[min-width:0] [&_>_span]:[border-radius:3px] [&_>_span]:[background:var(--md-sys-color-surface-container-highest)] [&_>_span]:[cursor:help] [&_>_span]:[outline:none] [&_>_span[data-level='1']]:[background:color-mix(_in_srgb,_var(--md-sys-color-primary)_30%,_var(--md-sys-color-surface-container)_)] [&_>_span[data-level='2']]:[background:color-mix(_in_srgb,_var(--md-sys-color-primary)_50%,_var(--md-sys-color-surface-container)_)] [&_>_span[data-level='3']]:[background:color-mix(_in_srgb,_var(--md-sys-color-primary)_72%,_var(--md-sys-color-surface-container)_)] [&_>_span[data-level='4']]:[background:var(--md-sys-color-primary)] [&_>_span[data-level='4']]:[box-shadow:none] [&_>_span:hover]:[z-index:5] [&_>_span:hover]:[outline:2px_solid_var(--ink)] [&_>_span:hover]:[outline-offset:2px] [&_>_span:focus-visible]:[z-index:5] [&_>_span:focus-visible]:[outline:2px_solid_var(--ink)] [&_>_span:focus-visible]:[outline-offset:2px] [&_>_span_>_span]:absolute [&_>_span_>_span]:[z-index:20] [&_>_span_>_span]:[left:50%] [&_>_span_>_span]:[bottom:calc(100%_+_9px)] [&_>_span_>_span]:[width:max-content] [&_>_span_>_span]:[max-width:170px] [&_>_span_>_span]:[padding:8px_10px] [&_>_span_>_span]:[border:1px_solid_var(--md-sys-color-outline-variant)] [&_>_span_>_span]:[border-radius:var(--md-shape-small)] [&_>_span_>_span]:[color:var(--ink)] [&_>_span_>_span]:[background:var(--md-sys-color-surface-container-highest)] [&_>_span_>_span]:[box-shadow:var(--md-elevation-2)] [&_>_span_>_span]:[font-size:10px] [&_>_span_>_span]:[font-style:normal] [&_>_span_>_span]:[line-height:1.1] [&_>_span_>_span]:[opacity:0] [&_>_span_>_span]:pointer-events-none [&_>_span_>_span]:[transform:translate(-50%,_5px)_scale(0.96)] [&_>_span_>_span]:[transition:opacity_0.14s_ease,_transform_0.16s_var(--ease)] [&_>_span_>_span::after]:[content:''] [&_>_span_>_span::after]:absolute [&_>_span_>_span::after]:[left:50%] [&_>_span_>_span::after]:[top:100%] [&_>_span_>_span::after]:[width:7px] [&_>_span_>_span::after]:[height:7px] [&_>_span_>_span::after]:[border-right:1px_solid_color-mix(in_srgb,_var(--purple-bright)_38%,_var(--line))] [&_>_span_>_span::after]:[border-bottom:1px_solid_color-mix(in_srgb,_var(--purple-bright)_38%,_var(--line))] [&_>_span_>_span::after]:[background:color-mix(in_srgb,_var(--surface)_94%,_var(--paper))] [&_>_span_>_span::after]:[transform:translate(-50%,_-4px)_rotate(45deg)] [&_>_span_>_span_strong]:[color:var(--purple-bright)] [&_>_span_>_span_strong]:[font-size:12px] [&_>_span_>_span_small]:[margin-top:4px] [&_>_span_>_span_small]:block [&_>_span_>_span_small]:[color:var(--ink-soft)] [&_>_span_>_span_small]:[font-size:8px] [&_>_span:hover_>_span]:[opacity:1] [&_>_span:hover_>_span]:[transform:translate(-50%,_0)_scale(1)] [&_>_span:focus-visible_>_span]:[opacity:1] [&_>_span:focus-visible_>_span]:[transform:translate(-50%,_0)_scale(1)] max-[761px]:[gap:2px] [.root-empty_&_>_span]:[background:var(--md-sys-color-surface-container-highest)] [.root-empty_&_>_span]:[box-shadow:none] [.root-empty_&_>_span[data-level='1']]:[background:color-mix(_in_srgb,_var(--md-sys-color-primary)_30%,_var(--md-sys-color-surface-container)_)] [.root-empty_&_>_span[data-level='2']]:[background:color-mix(_in_srgb,_var(--md-sys-color-primary)_50%,_var(--md-sys-color-surface-container)_)] [.root-empty_&_>_span[data-level='3']]:[background:color-mix(_in_srgb,_var(--md-sys-color-primary)_72%,_var(--md-sys-color-surface-container)_)] [.root-empty_&_>_span[data-level='4']]:[background:var(--md-sys-color-primary)]"
            aria-label={`${totalActivity} public GitHub contributions during the last forty-two weeks`}
          >
            {cells.map((cell) => (
              <span
                key={cell.key}
                data-level={cell.level}
                tabIndex={0}
                aria-label={`${cell.count} contributions on ${cell.key}`}
              >
                <span role="tooltip">
                  <strong>{cell.count}</strong> contribution
                  {cell.count === 1 ? "" : "s"}
                  <small>
                    {dateFormatter.format(new Date(`${cell.key}T00:00:00Z`))}
                  </small>
                </span>
              </span>
            ))}
          </div>
          <div className="github-activity-card__legend flex justify-between [gap:20px] [color:var(--ink-soft)] [font-size:9px] [&_>_span:last-child]:flex [&_>_span:last-child]:items-center [&_>_span:last-child]:[gap:4px] [&_i]:[width:8px] [&_i]:[height:8px] [&_i]:[border-radius:2px] [&_i]:[background:color-mix(in_srgb,_var(--ink-soft)_10%,_transparent)] [&_i:nth-of-type(2)]:[background:color-mix(in_srgb,_var(--purple)_32%,_var(--surface))] [&_i:nth-of-type(3)]:[background:color-mix(in_srgb,_var(--purple)_55%,_var(--surface))] [&_i:nth-of-type(4)]:[background:color-mix(in_srgb,_var(--purple-bright)_76%,_var(--surface))] [&_i:nth-of-type(5)]:[background:var(--purple-bright)] max-[421px]:[&_>_span:last-child]:hidden">
            <span>
              {t("42 weeks of public activity", "กิจกรรมสาธารณะใน 42 สัปดาห์")}
            </span>
            <span>
              {t("Less", "น้อย")} <i />
              <i />
              <i />
              <i />
              <i /> {t("More", "มาก")}
            </span>
          </div>
        </article>
        <div
          className="github-repo-grid grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:16px] max-[761px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[761px]:[gap:12px] max-[521px]:[grid-template-columns:1fr] max-[441px]:[grid-template-columns:1fr] [.root-empty_&]:[gap:16px] max-[521px]:[.root-empty_&]:[grid-template-columns:1fr]"
          aria-label="Recently updated repositories"
        >
          {loading
            ? Array.from(
                {
                  length: 4,
                },
                (_, index) => (
                  <div
                    className="github-repo-card [border:0] [color:var(--md-sys-color-on-surface)] [background:var(--md-sys-color-surface-container-low)] [box-shadow:none] [text-decoration:none] [backdrop-filter:none] [transition:background-color_0.2s_ease,_transform_0.4s_var(--md-motion-emphasized),_box-shadow_0.2s_ease] [min-height:196px] [padding:20px] flex flex-col overflow-hidden [border-radius:var(--md-shape-small)] [-webkit-backdrop-filter:none] [&:hover]:[border-color:transparent] [&:hover]:[background:var(--md-sys-color-surface-container-high)] [&:hover]:[transform:translateY(-3px)] [&:hover]:[box-shadow:var(--md-elevation-1)] [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:[gap:12px] [&_>_div]:[color:var(--md-sys-color-primary)] [&_>_div]:[font-size:12px] [&_>_div]:[font-weight:500] [&_>_div]:[letter-spacing:0.2px] [&_>_div]:[text-transform:none] [&_h3]:[margin:8px_0_8px] [&_h3]:overflow-hidden [&_h3]:[font-size:17px] [&_h3]:[letter-spacing:0] [&_h3]:[overflow-wrap:anywhere] [&_h3]:[line-height:1.4] [&_h3]:[margin-top:12px] [&_h3]:[font-weight:620] [&_p]:[margin:0] [&_p]:[display:-webkit-box] [&_p]:overflow-hidden [&_p]:[color:var(--ink-soft)] [&_p]:[font-size:14px] [&_p]:[line-height:1.6] [&_p]:[-webkit-box-orient:vertical] [&_p]:[-webkit-line-clamp:3] [&_footer]:[margin-top:auto] [&_footer]:[padding-top:16px] [&_footer]:flex [&_footer]:justify-between [&_footer]:[color:var(--ink-soft)] [&_footer]:[font-size:12px] max-[761px]:[min-height:196px] max-[761px]:[padding:20px] motion-reduce:[transform:none]! [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-small)] [.root-empty_&]:[color:var(--md-sys-color-on-surface)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:[min-height:196px] [.root-empty_&]:[padding:20px] [.root-empty_&]:[background:var(--md-sys-color-surface-container-low)] [.root-empty_&:hover]:[border-color:transparent] [.root-empty_&:hover]:[background:var(--md-sys-color-surface-container-high)] [.root-empty_&:hover]:[box-shadow:var(--md-elevation-1)] [.root-empty_&:hover]:[transform:translateY(-3px)] max-[521px]:[.root-empty_&]:[min-height:196px] github-repo-card--loading [background:linear-gradient(_110deg,_color-mix(in_srgb,_var(--surface)_70%,_transparent)_20%,_color-mix(in_srgb,_var(--purple-soft)_90%,_transparent)_38%,_color-mix(in_srgb,_var(--surface)_70%,_transparent)_56%_)] [background-size:250%_100%] [animation:shimmer_1.5s_linear_infinite]"
                    key={index}
                  />
                ),
              )
            : Array.from(
                {
                  length: 4,
                },
                (_, index) => {
                  const repo = repos[index];
                  return repo ? (
                    <a
                      className="github-repo-card [border:0] [color:var(--md-sys-color-on-surface)] [background:var(--md-sys-color-surface-container-low)] [box-shadow:none] [text-decoration:none] [backdrop-filter:none] [transition:background-color_0.2s_ease,_transform_0.4s_var(--md-motion-emphasized),_box-shadow_0.2s_ease] [min-height:196px] [padding:20px] flex flex-col overflow-hidden [border-radius:var(--md-shape-small)] [-webkit-backdrop-filter:none] [&:hover]:[border-color:transparent] [&:hover]:[background:var(--md-sys-color-surface-container-high)] [&:hover]:[transform:translateY(-3px)] [&:hover]:[box-shadow:var(--md-elevation-1)] [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:[gap:12px] [&_>_div]:[color:var(--md-sys-color-primary)] [&_>_div]:[font-size:12px] [&_>_div]:[font-weight:500] [&_>_div]:[letter-spacing:0.2px] [&_>_div]:[text-transform:none] [&_h3]:[margin:8px_0_8px] [&_h3]:overflow-hidden [&_h3]:[font-size:17px] [&_h3]:[letter-spacing:0] [&_h3]:[overflow-wrap:anywhere] [&_h3]:[line-height:1.4] [&_h3]:[margin-top:12px] [&_h3]:[font-weight:620] [&_p]:[margin:0] [&_p]:[display:-webkit-box] [&_p]:overflow-hidden [&_p]:[color:var(--ink-soft)] [&_p]:[font-size:14px] [&_p]:[line-height:1.6] [&_p]:[-webkit-box-orient:vertical] [&_p]:[-webkit-line-clamp:3] [&_footer]:[margin-top:auto] [&_footer]:[padding-top:16px] [&_footer]:flex [&_footer]:justify-between [&_footer]:[color:var(--ink-soft)] [&_footer]:[font-size:12px] max-[761px]:[min-height:196px] max-[761px]:[padding:20px] motion-reduce:[transform:none]! [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-small)] [.root-empty_&]:[color:var(--md-sys-color-on-surface)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:[min-height:196px] [.root-empty_&]:[padding:20px] [.root-empty_&]:[background:var(--md-sys-color-surface-container-low)] [.root-empty_&:hover]:[border-color:transparent] [.root-empty_&:hover]:[background:var(--md-sys-color-surface-container-high)] [.root-empty_&:hover]:[box-shadow:var(--md-elevation-1)] [.root-empty_&:hover]:[transform:translateY(-3px)] max-[521px]:[.root-empty_&]:[min-height:196px]"
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      key={repo.url}
                    >
                      <div>
                        <span>
                          {t("Repository", "คลังโค้ด")} {index + 1}/4
                        </span>
                        <ExternalLinkIcon size={16} />
                      </div>
                      <h3>{repo.name}</h3>
                      <p>{repo.description}</p>
                      <footer>
                        <span>{repo.language || "Code"}</span>
                        <span>☆ {repo.stars}</span>
                      </footer>
                    </a>
                  ) : (
                    <a
                      className="github-repo-card [border:0] [color:var(--md-sys-color-on-surface)] [background:var(--md-sys-color-surface-container-low)] [box-shadow:none] [text-decoration:none] [backdrop-filter:none] [transition:background-color_0.2s_ease,_transform_0.4s_var(--md-motion-emphasized),_box-shadow_0.2s_ease] [min-height:196px] [padding:20px] flex flex-col overflow-hidden [border-radius:var(--md-shape-small)] [-webkit-backdrop-filter:none] [&:hover]:[border-color:transparent] [&:hover]:[background:var(--md-sys-color-surface-container-high)] [&:hover]:[transform:translateY(-3px)] [&:hover]:[box-shadow:var(--md-elevation-1)] [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:[gap:12px] [&_>_div]:[color:var(--md-sys-color-primary)] [&_>_div]:[font-size:12px] [&_>_div]:[font-weight:500] [&_>_div]:[letter-spacing:0.2px] [&_>_div]:[text-transform:none] [&_h3]:[margin:8px_0_8px] [&_h3]:overflow-hidden [&_h3]:[font-size:17px] [&_h3]:[letter-spacing:0] [&_h3]:[overflow-wrap:anywhere] [&_h3]:[line-height:1.4] [&_h3]:[margin-top:12px] [&_h3]:[font-weight:620] [&_p]:[margin:0] [&_p]:[display:-webkit-box] [&_p]:overflow-hidden [&_p]:[color:var(--ink-soft)] [&_p]:[font-size:14px] [&_p]:[line-height:1.6] [&_p]:[-webkit-box-orient:vertical] [&_p]:[-webkit-line-clamp:3] [&_footer]:[margin-top:auto] [&_footer]:[padding-top:16px] [&_footer]:flex [&_footer]:justify-between [&_footer]:[color:var(--ink-soft)] [&_footer]:[font-size:12px] max-[761px]:[min-height:196px] max-[761px]:[padding:20px] motion-reduce:[transform:none]! [.root-empty_&]:[border:0] [.root-empty_&]:[border-radius:var(--md-shape-small)] [.root-empty_&]:[color:var(--md-sys-color-on-surface)] [.root-empty_&]:[background:var(--md-sys-color-surface-container)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:none] [.root-empty_&]:[backdrop-filter:none] [.root-empty_&]:[min-height:196px] [.root-empty_&]:[padding:20px] [.root-empty_&]:[background:var(--md-sys-color-surface-container-low)] [.root-empty_&:hover]:[border-color:transparent] [.root-empty_&:hover]:[background:var(--md-sys-color-surface-container-high)] [.root-empty_&:hover]:[box-shadow:var(--md-elevation-1)] [.root-empty_&:hover]:[transform:translateY(-3px)] max-[521px]:[.root-empty_&]:[min-height:196px] github-repo-card--empty justify-center [&_>_span]:[color:var(--md-sys-color-primary)] [&_>_span]:[font-size:12px] [&_>_span]:[text-transform:none] [&_>_span]:[letter-spacing:0.2px] [&_h3]:[white-space:normal]"
                      href="https://github.com/rnnve?tab=repositories"
                      target="_blank"
                      rel="noreferrer"
                      key={index}
                    >
                      <span>
                        {t("Repository", "คลังโค้ด")} {index + 1}/4
                      </span>
                      <h3>{t("Explore my projects", "สำรวจโปรเจกต์ของเรา")}</h3>
                    </a>
                  );
                },
              )}
        </div>
      </div>
    </section>
  );
}
export default memo(GitHubShowcase);
