"use client";

import { useEffect, useState } from "react";
import Aurora from "../effects/aurora";
import { DEFAULT_SITE_ACCENT, interpolateAccent } from "@/app/lib/cover-accent";

export default function SiteBackground() {
  const [accent, setAccent] = useState(DEFAULT_SITE_ACCENT);
  useEffect(() => {
    const root = document.documentElement;
    const update = () =>
      setAccent(
        getComputedStyle(root).getPropertyValue("--site-accent").trim() ||
          DEFAULT_SITE_ACCENT,
      );
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className="site-background fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background"
      aria-hidden="true"
    >
      <Aurora
        colorStops={
          accent === DEFAULT_SITE_ACCENT
            ? ["#ffffff", "#9aa0ad", "#ffffff"]
            : [accent, interpolateAccent(accent, "#000000", 0.35), accent]
        }
        amplitude={1.25}
        blend={0}
        height={0.24}
        speed={2.2}
        glow={0.6}
        brightness={0.8}
        direction="bottom"
      />
    </div>
  );
}
