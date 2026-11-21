"use client";

import { useEffect, useState } from "react";
import AeroShards from "../effects/AeroShards";
import SiteWakeBackground from "./site-wake-background";
import { DEFAULT_SITE_ACCENT } from "@/app/lib/cover-accent";

export default function SiteBackground() {
  const [failed, setFailed] = useState(false);
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
  if (failed) return <SiteWakeBackground />;

  return (
    <div
      className="site-background fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background"
      aria-hidden="true"
    >
      <AeroShards
        shardColor={accent}
        accentColor={accent}
        placement="full"
        material="glass"
        markers="plus"
        count={1300}
        depthOfField={0.75}
        vignette={0.3}
        dpr={1.5}
        mouseInteraction
        pulseOnClick
        holdToGather
        onError={() => setFailed(true)}
      />
    </div>
  );
}
