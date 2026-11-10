"use client";

import { useEffect } from "react";
import { coverAccent, DEFAULT_SITE_ACCENT } from "@/app/lib/cover-accent";
import { isRecord } from "@/app/lib/json";
import { normalizeSpotify } from "@/app/lib/spotify";
import { requestWidget, subscribeWidget } from "@/app/lib/widget-request";

const STATUS_URL = "/api/status/spotify";
const properties = ["--accent", "--accent-subtle", "--surface-selected"];

export default function SpotifyAccent() {
  useEffect(() => {
    let active = true;
    let generation = 0;
    let artwork: string | undefined;
    let lastStatusAt = 0;
    let pending = false;
    const root = document.documentElement;
    const apply = (color: string) => {
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
    const receive = (data: unknown) => {
      lastStatusAt = Date.now();
      const spotify = normalizeSpotify(
        isRecord(data) && !data.error ? data.spotify : null,
      );
      const next = spotify.isPlaying ? spotify.artwork : "";
      if (next === artwork) return;
      artwork = next;
      const version = ++generation;
      if (!next) {
        apply(DEFAULT_SITE_ACCENT);
        return;
      }
      void coverAccent(next).then((color) => {
        if (active && version === generation) apply(color);
      });
    };
    const unsubscribe = subscribeWidget(STATUS_URL, receive);
    const poll = async () => {
      // Home and lyrics already poll Spotify; reuse their results when available.
      if (document.hidden || pending || Date.now() - lastStatusAt < 1500)
        return;
      pending = true;
      try {
        await requestWidget(STATUS_URL, { cache: "no-store" });
      } catch {
        if (active) receive(null);
      } finally {
        pending = false;
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 1000);
    const resume = () => void poll();
    document.addEventListener("visibilitychange", resume);
    return () => {
      active = false;
      generation++;
      unsubscribe();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", resume);
      properties.forEach((property) => root.style.removeProperty(property));
    };
  }, []);
  return null;
}
