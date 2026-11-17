import { isRecord } from "./json";
import type { LyricsSignature } from "./lrc-red";

export function lyricsKey(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "");
}

export function titleVariants(value: string): string[] {
  const withoutFeatures = value
    .replace(/[([]\s*(?:feat\.?|ft\.?|featuring)\s+[^)\]]*[)\]]/gi, "")
    .trim();
  const variants = [withoutFeatures];
  const bilingual = withoutFeatures.match(
    /^(.*?)\s*[（(]([^()（）]+)[）)]\s*$/u,
  );
  if (
    bilingual &&
    !/\b(live|remix|version|acoustic|instrumental|remaster|edit|cover)\b/i.test(
      bilingual[2],
    )
  ) {
    const native = (s: string) =>
      /[^\p{Script=Latin}\p{M}\p{N}\p{P}\p{Z}\p{S}]/u.test(s);
    if (native(bilingual[1]) !== native(bilingual[2])) {
      variants.push(bilingual[1].trim(), bilingual[2].trim());
    }
  }
  return variants.filter(Boolean);
}

export function selectLyricsMatch(data: unknown, track: LyricsSignature) {
  if (!Array.isArray(data)) return null;
  const titles = titleVariants(track.title).map(lyricsKey);
  const artist = lyricsKey(track.artist.split(",")[0]);
  const candidates = data.filter(isRecord).filter((item) => {
    if (
      typeof item.trackName !== "string" ||
      typeof item.artistName !== "string"
    )
      return false;
    if (
      !titleVariants(item.trackName).some((name) =>
        titles.includes(lyricsKey(name)),
      )
    )
      return false;
    if (lyricsKey(item.artistName.split(",")[0]) !== artist) return false;
    if (
      track.duration !== undefined &&
      (typeof item.duration !== "number" ||
        !Number.isFinite(item.duration) ||
        Math.abs(item.duration - track.duration) > 3)
    )
      return false;
    return (
      typeof item.id === "number" &&
      typeof item.instrumental === "boolean" &&
      ((typeof item.plainLyrics === "string" && item.plainLyrics.trim()) ||
        (typeof item.syncedLyrics === "string" && item.syncedLyrics.trim()))
    );
  });
  const score = (item: Record<string, unknown>) =>
    (typeof item.syncedLyrics === "string" && item.syncedLyrics.trim()
      ? 10
      : 0) +
    (track.album &&
    typeof item.albumName === "string" &&
    lyricsKey(item.albumName) === lyricsKey(track.album)
      ? 2
      : 0);
  candidates.sort((a, b) => score(b) - score(a));
  return candidates[0] ?? null;
}
