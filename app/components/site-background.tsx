"use client";

import dynamic from "next/dynamic";
import { usePageReady } from "../page-transition";
import { useSiteSettings } from "./site-settings-provider";
import "../styles/pattern-waves.css";

const PatternWaves = dynamic(() => import("./pattern-waves"), { ssr: false });

export default function SiteBackground() {
  const pageReady = usePageReady();
  const { backgroundAnimation } = useSiteSettings();
  return (
    <div className="site-background" aria-hidden="true">
      {pageReady && backgroundAnimation && (
        <PatternWaves
          preset="ocean"
          color="#ffffff"
          backgroundColor="transparent"
          fade="edges"
          opacity={0.28}
          interactive
          cursorSize={50}
          cursorStrength={0.6}
          wave="swell"
          spacing={10}
          markSize={0.9}
          depth={0.42}
          shine={1}
          speed={0.5}
          direction={100}
        />
      )}
    </div>
  );
}
