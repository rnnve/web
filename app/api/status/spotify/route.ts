const SPOTIFY_URL = "https://sptf.rynni.cc/api/spotify";
const STATUS_TIMEOUT_MS = 4_000;
let lastSpotify: unknown = null;

async function fetchSpotify(): Promise<unknown> {
  const response = await fetch(SPOTIFY_URL, {
    cache: "force-cache",
    headers: { Accept: "application/json", "User-Agent": "rynni-status-proxy" },
    next: { revalidate: 3 },
    signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return await response.json() as unknown;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const spotify = await fetchSpotify();
    if (spotify !== null) lastSpotify = spotify;

    return Response.json(
      { spotify, error: null, updatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json(
      { spotify: lastSpotify, error: lastSpotify === null ? "Spotify status is temporarily unavailable" : null, updatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
