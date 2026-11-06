import type { ReactNode } from "react";

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
  const paths: Record<StatusIconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    discord: (
      <>
        <path d="M8 8.5a9.5 9.5 0 0 1 8 0M7 17c-2.5-.8-3.5-2.7-3.5-2.7.4-3.7 1.8-6.7 1.8-6.7A10 10 0 0 1 8 6.3l.8 1.2M17 17c2.5-.8 3.5-2.7 3.5-2.7-.4-3.7-1.8-6.7-1.8-6.7A10 10 0 0 0 16 6.3l-.8 1.2" />
        <circle cx="8.5" cy="12.5" r="1" fill="currentColor" />
        <circle cx="15.5" cy="12.5" r="1" fill="currentColor" />
        <path d="M8 16c2.7 1.2 5.3 1.2 8 0" />
      </>
    ),
    github: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3 5.4 5.4 0 0 0 19.1 0S17.9-.4 15 1.5a14 14 0 0 0-6 0C6.1-.4 4.9 0 4.9 0a5.4 5.4 0 0 0-.2 3A5.8 5.8 0 0 0 3.2 7.1c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 9 18v4" />
        <path d="M9 19c-3 .9-3-1.5-4.2-2" />
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
    spotify: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M7.5 10.2c3.8-1 7.1-.5 10 1M8.2 13c3.2-.7 6.1-.3 8.6.8M9 15.7c2.6-.5 4.8-.2 7 .7" />
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
