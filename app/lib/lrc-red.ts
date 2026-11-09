import { isRecord } from "./json";
import { parseSyncedLyrics, type LyricsRecord } from "./lyrics";

export type LyricsSignature = {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
};

function normalized(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-–—:.,!?()[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleKey(value: string) {
  // Featured-artist credits vary between providers; version labels must remain.
  return normalized(
    value.replace(/[([]\s*(?:feat\.?|ft\.?|featuring)\s+[^)\]]*[)\]]/gi, ""),
  );
}

export function selectLrcRedMatch(
  data: unknown,
  track: LyricsSignature,
): string | null {
  if (!isRecord(data) || !Array.isArray(data.hits)) return null;
  const title = titleKey(track.title);
  const artist = normalized(track.artist.split(",")[0]);
  const candidates = data.hits
    .filter(isRecord)
    .filter(
      (hit) =>
        typeof hit.isrc === "string" &&
        /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(hit.isrc) &&
        typeof hit.title === "string" &&
        titleKey(hit.title) === title &&
        typeof hit.artist === "string" &&
        normalized(hit.artist.split(",")[0]) === artist &&
        (track.duration === undefined ||
          (typeof hit.duration === "number" &&
            Number.isFinite(hit.duration) &&
            Math.abs(hit.duration - track.duration) <= 2.5)),
    );
  const score = (hit: Record<string, unknown>) =>
    (track.album &&
    typeof hit.album === "string" &&
    normalized(hit.album) === normalized(track.album)
      ? 0
      : 10) +
    (track.duration !== undefined && typeof hit.duration === "number"
      ? Math.abs(hit.duration - track.duration)
      : 0);
  candidates.sort((a, b) => score(a) - score(b));
  return candidates.length ? (candidates[0].isrc as string) : null;
}

let retryAt = 0;
export async function fetchLrcRedLyrics(
  track: LyricsSignature,
): Promise<LyricsRecord | null> {
  const email = process.env.LRC_RED_CONTACT_EMAIL?.trim();
  // The provider requires a homepage and contact email in client identification.
  if (
    !email ||
    !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) ||
    Date.now() < retryAt
  )
    return null;
  const headers = {
    "User-Agent": `RynLyrics/0.1.0 (https://rynni.cc; ${email})`,
  };
  const signal = AbortSignal.timeout(5000);
  async function get(url: string, accept: string) {
    const response = await fetch(url, {
      headers: { ...headers, Accept: accept },
      next: { revalidate: 86_400 },
      signal,
    });
    if (response.status === 429 || response.status === 503) {
      const raw = response.headers.get("Retry-After") ?? "60";
      const delay = /^\d+$/.test(raw)
        ? Number(raw) * 1000
        : Date.parse(raw) - Date.now();
      retryAt =
        Date.now() +
        (Number.isFinite(delay) ? Math.max(1000, delay) : 60_000) +
        Math.random() * 1000;
    }
    return response;
  }
  try {
    const query = new URLSearchParams({
      q: `${track.title} ${track.artist.split(",")[0].trim()}`,
    });
    const search = await get(
      `https://lrc.red/search.json?${query}`,
      "application/json",
    );
    if (!search.ok) return null;
    const isrc = selectLrcRedMatch(await search.json(), track);
    if (!isrc) return null;
    const response = await get(`https://lrc.red/s/${isrc}.lrc`, "text/plain");
    if (!response.ok) return null;
    const syncedLyrics = await response.text();
    const lines = parseSyncedLyrics(syncedLyrics);
    if (!lines.some((line) => line.text)) return null;
    return {
      id: isrc,
      instrumental: false,
      plainLyrics: lines.map((line) => line.text).join("\n"),
      syncedLyrics,
      source: "lrc_red",
    };
  } catch {
    return null;
  }
}
