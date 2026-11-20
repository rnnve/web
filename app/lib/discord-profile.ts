import { isRecord, readString } from "./json";
import type { DiscordProfile } from "./status-types";

export const DISCORD_PROFILE_URL = "https://api.rynni.cc/v2/discord/user/1";
export const DISCORD_PROFILE_TTL_MS = 24 * 60 * 60 * 1000;

export function isDiscordProfileFresh(savedAt: number, now = Date.now()) {
  return (
    Number.isFinite(savedAt) &&
    now >= savedAt &&
    now - savedAt < DISCORD_PROFILE_TTL_MS
  );
}

export function normalizeDiscord(value: unknown): DiscordProfile | null {
  if (!isRecord(value)) return null;
  let record = value;
  if (isRecord(record.discord)) record = record.discord;
  if (isRecord(record.data)) record = record.data;
  const username = readString(record, "username");
  const displayName = readString(record, "displayName", "display_name");
  const globalName = readString(record, "globalName", "global_name");
  const avatar = readString(record, "avatar", "avatarUrl", "avatar_url");
  const status = readString(record, "status");
  if (!username && !displayName && !globalName && !avatar) return null;
  return {
    ...(username ? { username } : {}),
    ...(displayName ? { displayName } : {}),
    ...(globalName ? { globalName } : {}),
    ...(avatar ? { avatar } : {}),
    ...(status ? { status } : {}),
  };
}

export async function loadDiscordProfile(now = Date.now()) {
  try {
    const response = await fetch(DISCORD_PROFILE_URL, {
      next: { revalidate: DISCORD_PROFILE_TTL_MS / 1000 },
    });
    if (!response.ok) return null;
    const profile = normalizeDiscord(await response.json());
    if (!profile) return null;
    const sourceTime = Date.parse(response.headers.get("date") ?? "");
    return {
      profile,
      updatedAt: Number.isFinite(sourceTime) ? sourceTime : now,
    };
  } catch {
    return null;
  }
}
