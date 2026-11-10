"use client";

import { useSyncExternalStore } from "react";
import PatternWaves from "../effects/pattern-waves";
import { DEFAULT_SITE_ACCENT } from "@/app/lib/cover-accent";

function subscribeToAccent(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style"],
  });
  return () => observer.disconnect();
}

function readAccent() {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim() || DEFAULT_SITE_ACCENT
  );
}

const defaultAccent = () => DEFAULT_SITE_ACCENT;

export default function SiteBackground() {
  const accent = useSyncExternalStore(
    subscribeToAccent,
    readAccent,
    defaultAccent,
  );
  return (
    <div
      className="site-background fixed [inset:0] [z-index:0] overflow-hidden pointer-events-none [background:var(--page-background)]"
      aria-hidden="true"
    >
      <PatternWaves
        preset="silk"
        color={accent}
        backgroundColor="transparent"
        opacity={0.35}
        fade="edges"
        interactive
        cursorSize={50}
        cursorStrength={0.6}
      />
    </div>
  );
}
