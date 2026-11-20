"use client";

import {
  DISCORD_PROFILE_TTL_MS,
  isDiscordProfileFresh,
  normalizeDiscord,
} from "./discord-profile";
import type { DiscordProfile } from "./status-types";

const STORAGE_KEY = "ryn:discord-profile";

type Entry = { profile: DiscordProfile; savedAt: number };

let memory: Entry | null = null;
let pending: Promise<void> | null = null;
let refreshTimer: number | undefined;
const listeners = new Set<() => void>();

function readStorage(): Entry | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    );
    if (
      !saved ||
      typeof saved !== "object" ||
      !("savedAt" in saved) ||
      typeof saved.savedAt !== "number"
    )
      return null;
    const profile = normalizeDiscord(
      "profile" in saved ? saved.profile : null,
    );
    if (!profile) return null;
    return { profile, savedAt: saved.savedAt };
  } catch {
    return null;
  }
}

function writeStorage(entry: Entry) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // The in-memory copy still covers this visit.
  }
}

function sameProfile(left: DiscordProfile, right: DiscordProfile) {
  return (
    left.username === right.username &&
    left.displayName === right.displayName &&
    left.globalName === right.globalName &&
    left.avatar === right.avatar &&
    left.status === right.status
  );
}

function publish(entry: Entry) {
  const changed = !memory || !sameProfile(memory.profile, entry.profile);
  memory = entry;
  writeStorage(entry);
  scheduleRefresh(entry.savedAt);
  if (changed) listeners.forEach((listener) => listener());
}

function scheduleRefresh(savedAt: number) {
  if (typeof window === "undefined") return;
  window.clearTimeout(refreshTimer);
  const remaining = savedAt + DISCORD_PROFILE_TTL_MS - Date.now();
  refreshTimer = window.setTimeout(
    () => void refreshDiscordProfile(),
    Math.max(0, remaining),
  );
}

export function getDiscordProfileSnapshot(): DiscordProfile | null {
  if (!memory) memory = readStorage();
  return memory?.profile ?? null;
}

export function rememberDiscordProfile(
  profile: DiscordProfile | null,
  savedAt: number,
) {
  if (!memory) memory = readStorage();
  if (profile && isDiscordProfileFresh(savedAt)) {
    if (
      memory &&
      isDiscordProfileFresh(memory.savedAt) &&
      memory.savedAt >= savedAt
    ) {
      scheduleRefresh(memory.savedAt);
      return;
    }
    publish({ profile, savedAt });
    return;
  }
  if (memory && isDiscordProfileFresh(memory.savedAt)) {
    scheduleRefresh(memory.savedAt);
    return;
  }
  void refreshDiscordProfile();
}

export function clearDiscordProfileCache() {
  memory = null;
  pending = null;
  if (typeof window !== "undefined") window.clearTimeout(refreshTimer);
}

export function refreshDiscordProfile() {
  if (pending) return pending;
  pending = fetch("/api/status")
    .then(async (response) => {
      if (!response.ok) throw new Error(`Discord profile ${response.status}`);
      const body: unknown = await response.json();
      const profile = normalizeDiscord(body);
      if (!profile) return;
      const updatedAt =
        body &&
        typeof body === "object" &&
        "updatedAt" in body &&
        typeof body.updatedAt === "number"
          ? body.updatedAt
          : Date.now();
      publish({
        profile,
        savedAt: isDiscordProfileFresh(updatedAt) ? updatedAt : Date.now(),
      });
    })
    .catch(() => {
      // Keep the last profile on screen when the daily refresh fails.
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

export function subscribeDiscordProfile(listener: () => void) {
  listeners.add(listener);
  if (!memory) memory = readStorage();
  if (memory && isDiscordProfileFresh(memory.savedAt))
    scheduleRefresh(memory.savedAt);
  else void refreshDiscordProfile();
  return () => {
    listeners.delete(listener);
  };
}
