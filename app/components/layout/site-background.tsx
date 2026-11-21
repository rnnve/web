"use client";

import { useEffect, useState } from "react";
import ShapeGrid from "../effects/ShapeGrid";
import { DEFAULT_SITE_ACCENT } from "@/app/lib/cover-accent";

export default function SiteBackground() {
  const [accent, setAccent] = useState(DEFAULT_SITE_ACCENT);
  useEffect(() => {
    const root = document.documentElement;
    const update = () =>
      setAccent(
        root.style.getPropertyValue("--site-accent").trim() ||
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
      <ShapeGrid
        shape="cross"
        direction="diagonal"
        lineColor="#2a2734"
        hoverColor={accent}
        hoverFillColor={accent}
        fillOpacity={0.15}
        cellSize={40}
        speed={0.5}
        tiltX={0}
        tiltY={0}
        rainbow={false}
        trail={0.55}
        twinkle={0.55}
        clickCascade={false}
      />
    </div>
  );
}
