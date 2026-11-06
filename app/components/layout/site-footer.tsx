"use client";

import ExternalLinkIcon from "../ui/external-link-icon";
export default function SiteFooter() {
  return (
    <footer className="site-footer relative [z-index:1] [flex-shrink:0] [width:min(960px,_calc(100%_-_48px))] [min-height:72px] [margin:30px_auto_24px] [padding:14px_18px] grid [grid-template-columns:minmax(0,_1fr)_auto] items-center [gap:24px] [border:0] [border-radius:var(--md-shape-extra-large)] [background:var(--md-sys-color-surface-container-low)] [box-shadow:none] [backdrop-filter:none] [margin-block:24px] [-webkit-backdrop-filter:none] [&_>_p]:[margin:0] [&_>_p]:[color:var(--ink-soft)] [&_>_p]:[font-size:10px] [&_>_p]:[letter-spacing:0.5px] [&_nav]:[justify-self:end] [&_nav]:flex [&_nav]:items-center [&_nav]:[gap:6px] [&_nav_a]:[min-height:40px] [&_nav_a]:[padding:0_10px] [&_nav_a]:flex [&_nav_a]:items-center [&_nav_a]:[gap:6px] [&_nav_a]:[border-radius:20px] [&_nav_a]:[color:var(--md-sys-color-on-secondary-container)] [&_nav_a]:[font-size:11px] [&_nav_a]:[font-weight:800] [&_nav_a]:[text-decoration:none] [&_nav_a]:[transition:color_0.2s,_background_0.2s,_transform_0.22s_var(--ease)] [&_nav_a]:[padding-inline:16px] [&_nav_a]:[background:var(--md-sys-color-secondary-container)] [&_nav_a:hover]:[color:var(--ink)] [&_nav_a:hover]:[background:var(--paper-deep)] [&_nav_a:hover]:[transform:translateY(-2px)] max-[641px]:[width:calc(100%_-_20px)] max-[641px]:[min-height:auto] max-[641px]:[margin-bottom:max(12px,_env(safe-area-inset-bottom))] max-[641px]:[padding:16px] max-[641px]:[grid-template-columns:1fr] max-[641px]:[gap:14px] max-[641px]:[&_nav]:[justify-self:start] max-[641px]:[&_nav]:[gap:0] max-[641px]:[&_nav_a]:[min-height:44px] max-[641px]:[&_nav_a]:[padding-inline:10px] max-[761px]:[width:calc(100%_-_28px)]">
      <p>
        &copy; 2026 Rynnie
        {process.env.NEXT_PUBLIC_COMMIT_HASH && (
          <span className="site-footer__commit [&_a]:[text-decoration:underline] [&_a]:[color:#fff] [&_a]:[text-decoration-color:currentColor] [&_a]:[text-underline-offset:2px] [&_a:hover]:[color:#fff]">
            {" · commit "}
            <a
              href={`https://github.com/rnnve/web/commit/${process.env.NEXT_PUBLIC_COMMIT_HASH}`}
              target="_blank"
              rel="noreferrer"
            >
              {process.env.NEXT_PUBLIC_COMMIT_HASH.slice(0, 7)}
            </a>
            {" @ "}
            <a
              href="https://github.com/rnnve/web"
              target="_blank"
              rel="noreferrer"
            >
              rnnve/web
            </a>
          </span>
        )}
      </p>
      <nav aria-label="Footer navigation">
        <a href="https://github.com/rnnve" target="_blank" rel="noreferrer">
          GitHub <ExternalLinkIcon size={14} />
        </a>
      </nav>
    </footer>
  );
}
