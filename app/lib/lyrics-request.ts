import type { LyricsRecord } from "./lyrics";

export class LyricsRequestError extends Error {
  constructor(public retryAt = 0) {
    super("Lyrics unavailable");
  }
}

export function createLyricsRequester() {
  const cache = new Map<
    string,
    { lyrics: LyricsRecord | null; expiresAt: number }
  >();
  const pending = new Map<string, Promise<LyricsRecord | null>>();
  let retryAt = 0;
  return function requestLyrics(query: string): Promise<LyricsRecord | null> {
    const saved = cache.get(query);
    if (saved && saved.expiresAt > Date.now())
      return Promise.resolve(saved.lyrics);
    if (Date.now() < retryAt)
      return Promise.reject(new LyricsRequestError(retryAt));
    const existing = pending.get(query);
    if (existing) return existing;
    const request = fetch(`/api/lyrics?${query}`, {
      signal: AbortSignal.timeout(25_000),
    })
      .then(async (response) => {
        if (response.status === 429 || response.status === 503) {
          const delay =
            Math.max(1, Number(response.headers.get("Retry-After")) || 60) *
            1000;
          retryAt = Date.now() + delay + Math.random() * delay * 0.3;
        }
        if (!response.ok) throw new LyricsRequestError(retryAt);
        const data = (await response.json()) as { lyrics: LyricsRecord | null };
        if (cache.size >= 24) cache.delete(cache.keys().next().value!);
        cache.set(query, {
          lyrics: data.lyrics,
          expiresAt: Date.now() + (data.lyrics ? 86_400_000 : 300_000),
        });
        return data.lyrics;
      })
      .finally(() => pending.delete(query));
    pending.set(query, request);
    return request;
  };
}

export const requestLyrics = createLyricsRequester();
