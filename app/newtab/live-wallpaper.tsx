"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./new-tab.styles";
const WALLPAPER_URL = "https://cdn.rynni.cc/assets/wallpapers/kanade.mp4";
export default function LiveWallpaper() {
  const video = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  function play() {
    const element = video.current;
    if (!element) return;
    // Defer the large video request until the page is usable or playback is requested.
    if (!element.getAttribute("src")) element.src = WALLPAPER_URL;
    void element.play().catch(() => {
      // The poster remains visible if autoplay is blocked or the CDN is unavailable.
    });
  }
  useEffect(() => {
    const element = video.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      if (document.hidden || reducedMotion.matches || manuallyPaused.current) {
        element?.pause();
      } else {
        play();
      }
    };
    // Let the search and shortcuts paint before starting the video download.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(updatePlayback);
    });
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      document.removeEventListener("visibilitychange", updatePlayback);
      reducedMotion.removeEventListener("change", updatePlayback);
      element?.pause();
    };
  }, []);
  return (
    <>
      <video
        ref={video}
        className={styles.wallpaper}
        poster="/newtab-wallpaper.webp"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className={styles.wallpaperShade} aria-hidden="true" />
      <button
        type="button"
        className={styles.wallpaperToggle}
        onClick={() => {
          if (video.current?.paused) {
            manuallyPaused.current = false;
            play();
          } else {
            manuallyPaused.current = true;
            video.current?.pause();
          }
        }}
      >
        <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
        {playing ? "Pause wallpaper" : "Play wallpaper"}
      </button>
    </>
  );
}
