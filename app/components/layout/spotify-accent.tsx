"use client";

import { useEffect } from "react";
import {
  coverAccent,
  DEFAULT_SITE_ACCENT,
  interpolateAccent,
  randomAccentPosition,
} from "@/app/lib/cover-accent";
import { normalizeSpotify } from "@/app/lib/spotify";
import { spotifyStream } from "@/app/lib/status-stream";

const properties = ["--accent", "--accent-subtle", "--surface-selected"];

export default function SpotifyAccent() {
  useEffect(() => {
    let active = true;
    let generation = 0;
    let artwork: string | undefined;
    let colorFrame = 0;
    let retryAt = 0;
    let track = "";
    let position = 0;
    const root = document.documentElement;
    const paint = (color: string) => {
      if (color === DEFAULT_SITE_ACCENT) {
        properties.forEach((property) => root.style.removeProperty(property));
        return;
      }
      root.style.setProperty("--accent", color);
      root.style.setProperty(
        "--accent-subtle",
        `color-mix(in srgb, ${color} 8%, transparent)`,
      );
      root.style.setProperty(
        "--surface-selected",
        `color-mix(in srgb, ${color} 10%, transparent)`,
      );
    };
    const apply = (color: string) => {
      window.cancelAnimationFrame(colorFrame);
      const from = getComputedStyle(root).getPropertyValue("--accent").trim();
      if (
        document.hidden ||
        from === color ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        paint(color);
        return;
      }
      const startedAt = performance.now();
      const step = (now: number) => {
        if (!active) return;
        const progress = Math.min(1, (now - startedAt) / 2000);
        const eased = progress * progress * (3 - 2 * progress);
        paint(interpolateAccent(from, color, eased));
        if (progress < 1) colorFrame = window.requestAnimationFrame(step);
        else {
          colorFrame = 0;
          paint(color);
        }
      };
      colorFrame = window.requestAnimationFrame(step);
    };
    const receive = () => {
      const { data, error } = spotifyStream.getSnapshot();
      const spotify = normalizeSpotify(error ? null : data);
      const next = spotify.isPlaying ? spotify.artwork : "";
      const nextTrack = spotify.isPlaying
        ? JSON.stringify([spotify.url, spotify.title, spotify.artist])
        : "";
      const trackChanged = Boolean(nextTrack) && nextTrack !== track;
      if (trackChanged) {
        track = nextTrack;
        position = randomAccentPosition();
      }
      if (
        !trackChanged &&
        next === artwork &&
        (!retryAt || Date.now() < retryAt)
      )
        return;
      artwork = next;
      retryAt = 0;
      const version = ++generation;
      if (!next) {
        apply(DEFAULT_SITE_ACCENT);
        return;
      }
      void coverAccent(next, position).then((color) => {
        if (active && version === generation) {
          retryAt = color === DEFAULT_SITE_ACCENT ? Date.now() + 30_000 : 0;
          apply(color);
        }
      });
    };
    const unsubscribe = spotifyStream.subscribe(receive);
    receive();
    return () => {
      active = false;
      generation++;
      unsubscribe();
      window.cancelAnimationFrame(colorFrame);
      properties.forEach((property) => root.style.removeProperty(property));
    };
  }, []);
  return null;
}
