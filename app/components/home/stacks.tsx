"use client";

import { memo, type ReactNode } from "react";
import { IconStack2 } from "@tabler/icons-react";
import { NextjsLogo } from "@/components/logos/nextjs";
import { AstroLogo } from "@/components/logos/astro";
import { ReactLogo } from "@/components/logos/react";
import { TailwindcssLogo } from "@/components/logos/tailwindcss";
import { TypescriptLogo } from "@/components/logos/typescript";
import { BunLogo } from "@/components/logos/bun";
import { PythonLogo } from "@/components/logos/python";
import { CloudflareLogo } from "@/components/logos/cloudflare";
import { VercelLogo } from "@/components/logos/vercel";
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
      <NextjsLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "Astro",
    href: "https://astro.build",
    color: "#ff5d01",
    logo: (
      <AstroLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "React",
    href: "https://react.dev",
    color: "#61dafb",
    logo: (
      <ReactLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "Tailwind CSS",
    href: "https://tailwindcss.com",
    color: "#38bdf8",
    logo: (
      <TailwindcssLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "TypeScript",
    href: "https://www.typescriptlang.org",
    color: "#3178c6",
    logo: (
      <TypescriptLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "Bun",
    href: "https://bun.sh",
    color: "#f6d7b0",
    logo: (
      <BunLogo variant="color" title="" aria-hidden="true" focusable={false} />
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
      <PythonLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "Cloudflare",
    href: "https://www.cloudflare.com",
    color: "#f48120",
    logo: (
      <CloudflareLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
  {
    name: "Vercel",
    href: "https://vercel.com",
    color: "#ffffff",
    logo: (
      <VercelLogo
        variant="color"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    ),
  },
];
function Stacks() {
  const { t } = useSiteSettings();
  return (
    <section id="developer" className="mt-8" aria-labelledby="stacks-title">
      <h2
        id="stacks-title"
        className="mb-3 flex items-center gap-1.5 text-sm font-medium"
      >
        <IconStack2 size={14} stroke={1.75} aria-hidden="true" />
        {t("Tools I build with", "เครื่องมือที่เราใช้")}
      </h2>
      <ul
        className="flex flex-wrap gap-2"
        aria-label={t("My technology stack", "เทคโนโลยีที่เราใช้")}
      >
        {tools.map((tool) => (
          <li key={tool.name}>
            <a
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-2 rounded-lg border bg-card px-2.5 text-xs text-foreground no-underline transition-colors hover:bg-muted"
            >
              <span
                className="grid size-4 place-items-center [&>svg]:size-4"
                style={{ color: tool.color }}
                aria-hidden="true"
              >
                {tool.logo}
              </span>
              {tool.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
export default memo(Stacks);
