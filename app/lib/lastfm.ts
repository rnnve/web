import { isRecord, readString } from "./json";

export const LISTEN_PERIODS = [
  "7day",
  "1month",
  "3month",
  "6month",
  "12month",
  "overall",
] as const;

export type ListenPeriod = (typeof LISTEN_PERIODS)[number];

export function parseListenPeriod(value: string | null): ListenPeriod {
  return LISTEN_PERIODS.includes(value as ListenPeriod)
    ? (value as ListenPeriod)
    : "7day";
}

export type ListenItem = {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  plays: number | null;
  timestamp: number | null;
  nowPlaying: boolean;
};

export type ListenData = {
  current: ListenItem | null;
  recent: ListenItem[];
  topTracks: ListenItem[];
  topArtists: ListenItem[];
  profile: { username: string; url: string; playcount: number | null } | null;
  unavailable: string[];
};

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function item(value: unknown): ListenItem | null {
  if (!isRecord(value)) return null;
  const name = readString(value, "name");
  if (!name) return null;
  const image = isRecord(value.image) ? value.image : {};
  const date = isRecord(value.date) ? value.date : {};
  const timestamp = Number(date.uts);
  return {
    name,
    artist: readString(value, "artist"),
    album: readString(value, "album"),
    image: safeUrl(readString(image, "extraLarge", "large", "medium")),
    url: safeUrl(readString(value, "url")),
    plays:
      typeof value.playcount === "number" && Number.isFinite(value.playcount)
        ? value.playcount
        : null,
    timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null,
    nowPlaying: value.nowPlaying === true,
  };
}

function data(value: unknown) {
  return isRecord(value) && value.success === true && isRecord(value.data)
    ? value.data
    : null;
}

function items(value: unknown, key: string) {
  const collection = data(value)?.[key];
  return Array.isArray(collection)
    ? collection
        .map(item)
        .filter((entry): entry is ListenItem => entry !== null)
    : [];
}

export function normalizeListenData(
  sources: Record<string, unknown>,
): ListenData {
  const currentData = data(sources.current);
  const current = item(currentData?.track);
  if (current && currentData?.nowPlaying === true) current.nowPlaying = true;
  const profileData = data(sources.profile);
  return {
    current,
    recent: items(sources.recent, "tracks"),
    topTracks: items(sources.topTracks, "tracks"),
    topArtists: items(sources.topArtists, "artists"),
    profile: profileData
      ? {
          username: readString(profileData, "username"),
          url: safeUrl(readString(profileData, "url")),
          playcount:
            typeof profileData.playcount === "number" &&
            Number.isFinite(profileData.playcount)
              ? profileData.playcount
              : null,
        }
      : null,
    unavailable: Object.keys(sources).filter(
      (key) => data(sources[key]) === null,
    ),
  };
}
