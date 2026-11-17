"use client";

import { useEffect, useState } from "react";
import { GeistMono } from "geist/font/mono";
import GradientASCII from "../effects/gradient-ascii";
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
      className={`site-background fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background ${GeistMono.className}`}
      aria-hidden="true"
    >
      <GradientASCII
        colors={[accent, interpolateAccent(accent, "#000000", 0.39)]}
        shape="rise"
        characters=" .·•●"
        cellSize={19}
        density={0.52}
        glyphOpacity={0.61}
        flicker={0.19}
        speed={0.65}
        clickEffect="none"
        fontFamily={GeistMono.style.fontFamily}
      />
    </div>
  );
}
