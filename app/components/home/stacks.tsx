"use client";

import { memo, type ReactNode } from "react";
import LogoLoop from "../effects/logo-loop";
import { useSiteSettings } from "../settings/site-settings-provider";
type Tool = {
  name: string;
  href: string;
  color: string;
  logo: ReactNode;
};
const iconProps = {
  viewBox: "0 0 48 48",
  role: "img",
  focusable: false,
} as const;
const tools: Tool[] = [
  {
    name: "Next.js",
    href: "https://nextjs.org",
    color: "#ffffff",
    logo: (
      <svg {...iconProps}>
        <circle
          cx="24"
          cy="24"
          r="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M16 33V15l17 22M30 15v15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Astro",
    href: "https://astro.build",
    color: "#ff5d01",
    logo: (
      <svg {...iconProps}>
        <path d="M15 35 22 9h6l7 26-7-5h-8l-5 5Z" fill="currentColor" />
        <path
          d="M18 37c3 1 9 1 12 0-1 4-3 6-6 7-3-1-5-3-6-7Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "React",
    href: "https://react.dev",
    color: "#61dafb",
    logo: (
      <svg {...iconProps}>
        <circle cx="24" cy="24" r="3.5" fill="currentColor" />
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="24" cy="24" rx="20" ry="8" />
          <ellipse
            cx="24"
            cy="24"
            rx="20"
            ry="8"
            transform="rotate(60 24 24)"
          />
          <ellipse
            cx="24"
            cy="24"
            rx="20"
            ry="8"
            transform="rotate(120 24 24)"
          />
        </g>
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    href: "https://tailwindcss.com",
    color: "#38bdf8",
    logo: (
      <svg {...iconProps}>
        <path
          d="M8 22c4-10 12-12 20-6 3 2 5 2 8-1-4 10-12 12-20 6-3-2-5-2-8 1Zm4 11c4-10 12-12 20-6 3 2 5 2 8-1-4 10-12 12-20 6-3-2-5-2-8 1Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    href: "https://www.typescriptlang.org",
    color: "#3178c6",
    logo: (
      <svg {...iconProps}>
        <rect x="5" y="5" width="38" height="38" rx="5" fill="currentColor" />
        <path
          d="M13 20h17v4h-6v16h-5V24h-6v-4Zm18 7c0-4 3-7 8-7 2 0 4 .5 5 1.5v5c-2-1.5-3.5-2-5-2-1.5 0-2.5.6-2.5 1.6 0 2.7 9 1.5 9 8.1 0 4.3-3.4 6.8-8.4 6.8-2.7 0-5-.7-6.6-2.1v-5.2c2 1.7 4.1 2.7 6.3 2.7 1.8 0 2.8-.6 2.8-1.7 0-2.8-8.6-1.4-8.6-7.7Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    name: "Bun",
    href: "https://bun.sh",
    color: "#f6d7b0",
    logo: (
      <svg {...iconProps}>
        <path
          d="M6 27c0-10 8-18 18-18s18 8 18 18c0 9-8 14-18 14S6 36 6 27Z"
          fill="currentColor"
        />
        <path
          d="M14 24c3-4 17-4 20 0"
          fill="none"
          stroke="#2d2016"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="29" r="1.5" fill="#2d2016" />
        <circle cx="30" cy="29" r="1.5" fill="#2d2016" />
        <path
          d="M21 34c2 1.5 4 1.5 6 0"
          fill="none"
          stroke="#2d2016"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "ElysiaJS",
    href: "https://elysiajs.com",
    color: "#e879f9",
    logo: (
      <svg {...iconProps}>
        <path
          d="M24 5c10 0 18 8 18 18 0 12-9 20-22 20-8 0-14-5-14-12 0-6 4-10 10-11-2-8 2-15 8-15Z"
          fill="currentColor"
        />
        <path
          d="M17 28c4-5 10-7 17-5-2 8-7 13-15 13-3 0-5-2-5-4 0-2 1-3 3-4Z"
          fill="var(--surface-panel)"
        />
      </svg>
    ),
  },
  {
    name: "Python",
    href: "https://www.python.org",
    color: "#ffd343",
    logo: (
      <svg {...iconProps}>
        <path
          d="M24 5c-10 0-10 4-10 9v5h20v3H12c-5 0-8 4-8 10s3 10 8 10h5v-7c0-5 4-8 9-8h13c4 0 7-3 7-7v-6c0-5-4-9-10-9H24Zm-4 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"
          fill="#3776ab"
        />
        <path
          d="M24 43c10 0 10-4 10-9v-5H14v-3h22c5 0 8-4 8-10S41 6 36 6h-5v7c0 5-4 8-9 8H9c-4 0-7 3-7 7v6c0 5 4 9 10 9h12Zm4-5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Cloudflare",
    href: "https://www.cloudflare.com",
    color: "#f48120",
    logo: (
      <svg {...iconProps}>
        <path
          d="M8 34h31c4 0 6-2 6-5s-3-5-7-5h-1c-1-7-6-11-12-11-6 0-11 4-12 10-5 0-9 2-9 6 0 3 2 5 4 5Z"
          fill="currentColor"
        />
        <path
          d="M12 34h29"
          stroke="#faae40"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Vercel",
    href: "https://vercel.com",
    color: "#ffffff",
    logo: (
      <svg {...iconProps}>
        <path d="m24 7 21 36H3L24 7Z" fill="currentColor" />
      </svg>
    ),
  },
];
const stackLogos = tools.map((tool) => ({
  node: tool.logo,
  title: tool.name,
  href: tool.href,
  hoverColor: tool.color,
}));
function Stacks() {
  const { t } = useSiteSettings();
  return (
    <section
      id="developer"
      className="developer-tools [.home-page_.home-last-section_>_&]:[flex:1] [.home-page_.home-last-section_>_&]:[min-height:0] [width:min(960px,_calc(100%_-_48px))] [min-height:100svh] [margin-inline:auto] [padding:126px_0_92px] flex flex-col justify-center [padding-block:112px_84px] max-[761px]:[width:calc(100%_-_28px)] max-[761px]:[min-height:auto] max-[761px]:[padding:84px_0_56px] [.root-empty_&]:[width:min(960px,_calc(100%_-_48px))] [.root-empty_&]:[padding-block:112px_84px] max-[761px]:[.root-empty_&]:[width:calc(100%_-_24px)] max-[761px]:[.root-empty_&]:[padding-block:84px_56px] stacks"
      aria-labelledby="stacks-title"
      data-reveal
    >
      <div className="developer-tools__heading [max-width:680px] [margin-bottom:40px] [&_>_p:first-child]:[margin:0_0_8px] [&_>_p:first-child]:[color:var(--accent)] [&_>_p:first-child]:[font-size:12px] [&_>_p:first-child]:[font-weight:600] [&_>_p:first-child]:[letter-spacing:0.2px] [&_>_p:first-child]:[text-transform:none] [&_>_p:first-child]:[margin-bottom:8px] [&_h2]:[margin:0] [&_h2]:[font-size:clamp(38px,_6vw,_64px)] [&_h2]:[line-height:1] [&_h2]:[letter-spacing:-2.6px] [&_h2]:[color:var(--text)] [&_h2]:[font-weight:620] [&_h2_span]:[color:var(--accent)] [&_>_p:last-child]:[max-width:520px] [&_>_p:last-child]:[margin:17px_0_0] [&_>_p:last-child]:[color:var(--text-muted)] [&_>_p:last-child]:[font-size:14px] [&_>_p:last-child]:[line-height:1.65] max-[761px]:[margin-bottom:28px] max-[421px]:[&_h2]:[font-size:36px] [.root-empty_&_>_p:first-child]:[color:var(--accent)] [.root-empty_&_>_p:first-child]:[font-size:12px] [.root-empty_&_>_p:first-child]:[font-weight:600] [.root-empty_&_>_p:first-child]:[letter-spacing:0.2px] [.root-empty_&_>_p:first-child]:[text-transform:none] [.root-empty_&_h2]:[color:var(--text)] [.root-empty_&_h2]:[font-size:clamp(38px,_6vw,_64px)] [.root-empty_&_h2]:[font-weight:620] [.root-empty_&_h2]:[line-height:1] [.root-empty_&_h2]:[letter-spacing:-2.6px]">
        <p>{t("Stacks", "เทคโนโลยีที่ใช้")}</p>
        <h2 id="stacks-title">
          {t("Tools I build with", "เครื่องมือที่เราใช้")}
          <span>.</span>
        </h2>
        <p>
          {t(
            "My everyday stack for designing, developing, and shipping projects.",
            "เครื่องมือที่เราใช้ทุกวันในการออกแบบ พัฒนา และเผยแพร่โปรเจกต์",
          )}
        </p>
      </div>
      <div className="stacks__loop [min-width:0] [margin-top:32px] [padding-block:32px] [border-block:1px_solid_var(--border)] max-[761px]:[margin-top:24px] max-[761px]:[padding-block:24px]">
        <LogoLoop
          logos={stackLogos}
          speed={80}
          direction="left"
          logoHeight={40}
          gap={56}
          hoverSpeed={0}
          labels="inline"
          muted={0.5}
          ariaLabel={t("My technology stack", "เทคโนโลยีที่เราใช้")}
        />
      </div>
    </section>
  );
}
export default memo(Stacks);
