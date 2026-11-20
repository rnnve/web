import type { ListenData } from "./lastfm";

const PREFIX = "ryn:listen:v1:";
const snapshots = new Map<string, ListenData>();
const pending = new Map<string, Promise<ListenData>>();
let generation = 0;

function isListenData(value: unknown): value is ListenData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ListenData>;
  return (
    Array.isArray(data.recent) &&
    Array.isArray(data.topTracks) &&
    Array.isArray(data.topArtists) &&
    Array.isArray(data.unavailable)
  );
}

// Keep one snapshot per period for this browser tab, including across reloads.
export function readListenSnapshot(url: string): ListenData | null {
  const memory = snapshots.get(url);
  if (memory) return memory;
  try {
    const data: unknown = JSON.parse(
      sessionStorage.getItem(PREFIX + url) ?? "null",
    );
    if (isListenData(data)) {
      snapshots.set(url, data);
      return data;
    }
  } catch {
    /* Storage is optional. */
  }
  return null;
}

export function loadListenSnapshot(url: string): Promise<ListenData> {
  const cached = readListenSnapshot(url);
  if (cached) return Promise.resolve(cached);
  const existing = pending.get(url);
  if (existing) return existing;
  const version = generation;
  const request = fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Listening unavailable");
      const data: unknown = await response.json();
      if (!isListenData(data)) throw new Error("Invalid listening response");
      if (version === generation) {
        snapshots.set(url, data);
        try {
          sessionStorage.setItem(PREFIX + url, JSON.stringify(data));
        } catch {
          /* Memory still covers navigation. */
        }
      }
      return data;
    })
    .finally(() => {
      if (pending.get(url) === request) pending.delete(url);
    });
  pending.set(url, request);
  return request;
}

export function clearListenSnapshots() {
  generation++;
  snapshots.clear();
  pending.clear();
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    /* Storage is optional. */
  }
}
