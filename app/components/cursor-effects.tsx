"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import "../styles/target-cursor.css";

const Crosshair = dynamic(() => import("./crosshair"), { ssr: false });
const TargetCursor = dynamic(() => import("./target-cursor"), { ssr: false });
const CURSOR_MEDIA =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeToCursorPreference(onChange: () => void) {
  const preference = window.matchMedia(CURSOR_MEDIA);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function canAnimateCursor() {
  return window.matchMedia(CURSOR_MEDIA).matches;
}

function serverSnapshot() {
  return false;
}

export default function CursorEffects() {
  const enabled = useSyncExternalStore(
    subscribeToCursorPreference,
    canAnimateCursor,
    serverSnapshot,
  );
  if (!enabled) return null;

  return (
    <>
      <Crosshair
        className="site-crosshair"
        color="#ffffff"
        thickness={1}
        opacity={0.35}
        fade={0.65}
        gap={22}
        smoothing={0}
        showCoordinates
        targetEffect="none"
        clickPulse={false}
        hideCursor={false}
      />
      <TargetCursor
        targetSelector="a[href], button:not(:disabled), .cursor-target"
        cursorColor="#ffffff"
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
      />
    </>
  );
}
