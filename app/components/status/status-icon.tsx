import type { ReactNode } from "react";
import { DiscordLogo } from "@/components/logos/discord";
import { GithubLogo } from "@/components/logos/github";
import { SpotifyLogo } from "@/components/logos/spotify";

type StatusIconName =
  | "arrow"
  | "discord"
  | "github"
  | "headphones"
  | "home"
  | "pin"
  | "refresh"
  | "spotify";

export function StatusIcon({
  name,
  size = 20,
}: {
  name: StatusIconName;
  size?: number;
}) {
  if (name === "discord" || name === "github" || name === "spotify") {
    const Logo =
      name === "discord"
        ? DiscordLogo
        : name === "github"
          ? GithubLogo
          : SpotifyLogo;
    return (
      <Logo
        width={size}
        height={size}
        variant="mono"
        title=""
        aria-hidden="true"
        focusable={false}
      />
    );
  }
  const paths: Record<
    Exclude<StatusIconName, "discord" | "github" | "spotify">,
    ReactNode
  > = {
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2v-3ZM20 14a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2v-3Z" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M6.1 8A7 7 0 0 1 18.5 6L20 8M4 16l1.5 2A7 7 0 0 0 17.9 16" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
