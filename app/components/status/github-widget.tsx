"use client";

import { StatusIcon } from "./status-icon";
import type { GitHubView } from "@/app/lib/status-types";
const toExternalUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;
export default function GitHubWidget({
  github,
  error,
}: {
  github: GitHubView;
  error?: string | null;
}) {
  return (
    <section
      className="glassCard overflow-hidden [border:1px_solid_var(--border)] [background:var(--surface-panel)] [box-shadow:none] [backdrop-filter:blur(20px)] [border-radius:var(--radius-xl)] [-webkit-backdrop-filter:blur(20px)] [.root-empty_&]:[border:1px_solid_var(--border)] [.root-empty_&]:[border-radius:var(--radius-xl)] [.root-empty_&]:[background:var(--surface-panel)] [.root-empty_&]:[box-shadow:none] [.root-empty_&]:[-webkit-backdrop-filter:blur(20px)] [.root-empty_&]:[backdrop-filter:blur(20px)] githubCard [grid-column:1_/_-1] [min-height:224px] [padding:28px] grid [grid-template-columns:minmax(250px,_0.9fr)_minmax(280px,_1.25fr)_auto] [grid-template-rows:1fr_auto] items-center [gap:22px_34px] relative [border-radius:14px_38px_38px_38px] [&::before]:[content:''] [&::before]:[width:260px] [&::before]:[height:260px] [&::before]:absolute [&::before]:[right:-90px] [&::before]:[bottom:-150px] [&::before]:[border-radius:50%] [&::before]:[background:color-mix(in_srgb,_var(--accent)_12%,_transparent)] [&::before]:[filter:blur(3px)] [&::before]:pointer-events-none max-[761px]:[grid-column:auto] max-[761px]:[padding:22px] max-[761px]:[grid-template-columns:1fr] max-[761px]:[grid-template-rows:auto] max-[761px]:[gap:22px]"
      aria-labelledby="github-title"
    >
      <div className="githubProfile [min-width:0] flex items-center [gap:18px]">
        <div
          className="githubAvatar [width:86px] [height:86px] grid [place-items:center] [flex:0_0_auto] [border:4px_solid_color-mix(in_srgb,_var(--accent)_28%,_var(--surface-panel))] [border-radius:28px_28px_9px_28px] [color:var(--accent)] [background:linear-gradient(145deg,_var(--accent-subtle),_var(--surface-sunken))] [background-position:center] [background-size:cover] [box-shadow:0_14px_28px_var(--shadow)] max-[421px]:[width:72px] max-[421px]:[height:72px]"
          style={
            github.avatarUrl
              ? {
                  backgroundImage: `url(${github.avatarUrl})`,
                }
              : undefined
          }
        >
          {!github.avatarUrl && <StatusIcon name="github" size={34} />}
        </div>
        <div className="githubIdentity [min-width:0] [&_p]:[margin:0_0_7px] [&_p]:flex [&_p]:items-center [&_p]:[gap:6px] [&_p]:[color:var(--accent)] [&_p]:[font-size:8px] [&_p]:[font-weight:900] [&_p]:[letter-spacing:0.9px] [&_p]:uppercase [&_h2]:[margin:0] [&_h2]:overflow-hidden [&_h2]:[font-size:29px] [&_h2]:[letter-spacing:-1px] [&_h2]:whitespace-nowrap [&_h2]:[text-overflow:ellipsis] [&_>_span]:block [&_>_span]:[margin-top:3px] [&_>_span]:[color:var(--muted)] [&_>_span]:[font-size:11px] max-[421px]:[&_h2]:[font-size:24px]">
          <p>
            <StatusIcon name="github" size={15} />
            GitHub profile
          </p>
          <h2 id="github-title">{github.name}</h2>
          <span>@{github.login}</span>
        </div>
      </div>
      <div className="githubContent [min-width:0] [padding-left:30px] [border-left:1px_solid_var(--glass-line)] max-[761px]:[padding:19px_0_0] max-[761px]:[border-top:1px_solid_var(--glass-line)] max-[761px]:[border-left:0]">
        <p className="githubBio [max-width:480px] [margin:0] [color:var(--text)] [font-size:13px] [line-height:1.65]">
          {github.bio}
        </p>
        <div className="githubMeta [margin-top:13px] flex [flex-wrap:wrap] [gap:8px_17px] [&_span]:inline-flex [&_span]:items-center [&_span]:[gap:5px] [&_span]:[color:var(--muted)] [&_span]:[font-size:9px] [&_span]:[text-decoration:none] [&_a]:inline-flex [&_a]:items-center [&_a]:[gap:5px] [&_a]:[color:var(--accent)] [&_a]:[font-size:9px] [&_a]:[text-decoration:none] [&_a:hover]:[text-decoration:underline]">
          {github.location && (
            <span>
              <StatusIcon name="pin" size={13} />
              {github.location}
            </span>
          )}
          {github.blog && (
            <a
              href={toExternalUrl(github.blog)}
              target="_blank"
              rel="noreferrer"
            >
              {github.blog.replace(/^https?:\/\//, "")}
            </a>
          )}
          {github.joinedAt && (
            <span>
              Joined{" "}
              {new Date(github.joinedAt).toLocaleDateString("en", {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
      <div
        className="githubStats grid [grid-template-columns:repeat(3,_minmax(70px,_1fr))] [gap:8px] relative [z-index:1] [&_div]:[min-width:84px] [&_div]:[padding:13px_12px] [&_div]:[border:1px_solid_var(--glass-line)] [&_div]:[border-radius:16px_16px_6px_16px] [&_div]:[background:color-mix(in_srgb,_var(--surface-panel)_42%,_transparent)] [&_strong]:block [&_strong]:[color:var(--accent)] [&_strong]:[font-size:20px] [&_strong]:[letter-spacing:-0.5px] [&_span]:block [&_span]:[margin-top:3px] [&_span]:[color:var(--muted)] [&_span]:[font-size:7px] [&_span]:[font-weight:800] [&_span]:[letter-spacing:0.5px] [&_span]:uppercase max-[761px]:[width:100%] max-[421px]:[&_div]:[min-width:0] max-[421px]:[&_div]:[padding-inline:8px] max-[421px]:[&_span]:[font-size:6px]"
        aria-label="GitHub profile statistics"
      >
        <div>
          <strong>{github.repositories}</strong>
          <span>Repositories</span>
        </div>
        <div>
          <strong>{github.followers}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{github.following}</strong>
          <span>Following</span>
        </div>
      </div>
      <a
        className="githubLink [grid-column:1_/_-1] [min-height:43px] [padding:0_16px] flex items-center justify-center [gap:8px] relative [z-index:1] [border:1px_solid_var(--glass-line)] [border-radius:17px_17px_6px_17px] [color:var(--page-background)] [background:linear-gradient(135deg,_var(--accent),_var(--accent))] [font-size:10px] [font-weight:900] [text-decoration:none] [transition:filter_0.2s,_transform_0.2s] [&:hover]:[filter:brightness(1.1)] [&:hover]:[transform:translateY(-1px)] max-[761px]:[grid-column:auto]"
        href={github.profileUrl}
        target="_blank"
        rel="noreferrer"
      >
        View GitHub <StatusIcon name="arrow" size={17} />
      </a>
      {error && (
        <p className="errorText [.githubCard_>_&]:[grid-column:1_/_-1] [.githubCard_>_&]:[margin:-8px_0_0] [margin:14px_0_0] [color:var(--text-secondary)] [font-size:9px] max-[761px]:[.githubCard_>_&]:[grid-column:auto]">
          {error}
        </p>
      )}
    </section>
  );
}
