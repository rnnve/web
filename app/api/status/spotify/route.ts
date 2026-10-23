const SPOTIFY_URL = "https://sptf.rynni.cc/api/spotify";
const STATUS_TIMEOUT_MS = 15_000;
let lastSpotify: unknown = null;

async function fetchSpotify(retries = 1): Promise<unknown> {
  try {
    const response = await fetch(SPOTIFY_URL, {
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": "rynni-status-proxy" },
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    return await response.json() as unknown;
  } catch (error) {
    if (retries > 0) return fetchSpotify(retries - 1);
    throw error;
  }
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
