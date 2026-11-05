"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { usePageReady } from "../page-transition";
const TargetCursor = dynamic(() => import("./target-cursor"), {
  ssr: false,
});
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
  const pageReady = usePageReady();
  const enabled = useSyncExternalStore(
    subscribeToCursorPreference,
    canAnimateCursor,
    serverSnapshot,
  );
  if (!pageReady || !enabled) return null;
  return (
    <TargetCursor
      targetSelector="a[href], button:not(:disabled), .cursor-target"
      cursorColor="#ffffff"
      spinDuration={2}
      hideDefaultCursor={false}
      parallaxOn
    />
  );
}
