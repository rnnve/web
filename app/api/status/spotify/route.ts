const SPOTIFY_URL = "https://sptf.rynni.cc/api/spotify";

export async function GET() {
  try {
    const response = await fetch(SPOTIFY_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);

    return Response.json(
      { spotify: await response.json(), error: null, updatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json(
      { spotify: null, error: "Spotify status is temporarily unavailable", updatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
