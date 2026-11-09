import { isRecord } from "./json";
import type { LyricLine, LyricsRecord } from "./lyrics";

function milliseconds(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value * 1000
    : undefined;
}

function vocalText(group: Record<string, unknown>): string {
  if (!Array.isArray(group.Syllables)) return "";
  return group.Syllables.filter(isRecord)
    .map((syllable) =>
      typeof syllable.Text === "string"
        ? syllable.Text + (syllable.IsPartOfWord === true ? "" : " ")
        : "",
    )
    .join("")
    .trim();
}

export function normalizeSpicyLyrics(value: unknown): LyricsRecord | null {
  if (!isRecord(value) || !isRecord(value.Body)) return null;
  const body = value.Body;
  if (
    typeof body.id !== "string" ||
    !["Syllable", "Line", "Static"].includes(String(body.Type))
  )
    return null;
  const source = ["spicy_lyrics", "apple_music", "spotify"].includes(
    String(body.source),
  )
    ? (body.source as LyricsRecord["source"])
    : "unknown";
  const contributors: NonNullable<LyricsRecord["contributors"]> = [];
  if (source === "spicy_lyrics" && isRecord(body.UploadAttribution)) {
    for (const [key, role] of [
      ["Uploader", "uploader"],
      ["Maker", "maker"],
    ] as const) {
      const person = body.UploadAttribution[key];
      if (
        !isRecord(person) ||
        typeof person.username !== "string" ||
        !person.username.trim()
      )
        continue;
      const url =
        typeof person.url === "string" &&
        /^https:\/\/spicylyrics\.org\/uid\/[A-Za-z0-9_-]+$/.test(person.url)
          ? person.url
          : undefined;
      contributors.push({
        role,
        name: person.username,
        ...(url ? { url } : {}),
      });
    }
    // Community syncs require uploader attribution alongside the lyrics.
    if (!contributors.some((person) => person.role === "uploader")) return null;
  } else if (source === "spicy_lyrics") return null;

  const lines: LyricLine[] = [];
  const plain: string[] = [];
  const content = body.Type === "Static" ? body.Lines : body.Content;
  if (!Array.isArray(content)) return null;
  for (const entry of content) {
    if (!isRecord(entry)) continue;
    const group =
      body.Type === "Syllable" && isRecord(entry.Lead) ? entry.Lead : entry;
    let text =
      body.Type === "Syllable"
        ? vocalText(group)
        : typeof entry.Text === "string"
          ? entry.Text
          : "";
    if (body.Type === "Syllable" && Array.isArray(entry.Background)) {
      const background = entry.Background.filter(isRecord)
        .map(vocalText)
        .filter(Boolean);
      if (background.length) text += ` (${background.join(" ")})`;
    }
    plain.push(text);
    const syllables = Array.isArray(group.Syllables)
      ? group.Syllables.filter(isRecord)
      : [];
    const time =
      milliseconds(group.StartTime) ?? milliseconds(syllables[0]?.StartTime);
    if (body.Type !== "Static" && time !== undefined) {
      const end =
        milliseconds(group.EndTime) ?? milliseconds(syllables.at(-1)?.EndTime);
      lines.push({
        time,
        text,
        ...(end !== undefined && end > time ? { endTime: end } : {}),
      });
    }
  }
  if (!plain.some((text) => text.trim())) return null;
  lines.sort((a, b) => a.time - b.time);
  return {
    id: body.id,
    instrumental: false,
    plainLyrics: plain.join("\n"),
    syncedLyrics: null,
    lines,
    source,
    ...(contributors.length ? { contributors } : {}),
  };
}

// A provider cooldown is shared by requests handled by this server instance.
let retryAt = 0;
export async function fetchSpicyLyrics(
  trackId: string,
): Promise<LyricsRecord | null> {
  const key = process.env.SPICYLYRICS_API_KEY?.trim();
  if (!key || Date.now() < retryAt) return null;
  try {
    const response = await fetch(
      `https://api.spicylyrics.org/v1/lyrics/${trackId}`,
      {
        headers: { Accept: "application/json", Authorization: `Bearer ${key}` },
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(6000),
      },
    );
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
    if (!response.ok) return null;
    return normalizeSpicyLyrics(await response.json());
  } catch {
    return null;
  }
}
