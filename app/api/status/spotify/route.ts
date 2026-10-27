const SPOTIFY_URL = "https://sptf.rynni.cc/api/spotify";
const STATUS_TIMEOUT_MS = 10_000;
const STATUS_RETRIES = 1;
let lastSpotify: unknown = null;

function describeFailure(error: unknown) {
  const cause = error instanceof Error && typeof error.cause === "object" && error.cause !== null
    ? error.cause as { code?: unknown }
    : null;

  return {
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message : String(error),
    causeCode: typeof cause?.code === "string" ? cause.code : null,
  };
}

async function fetchSpotify(retries = STATUS_RETRIES): Promise<unknown> {
  try {
    const response = await fetch(SPOTIFY_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error([
        `http_${response.status}`,
        `cf_mitigated_${response.headers.get("cf-mitigated") ?? "none"}`,
        `content_type_${response.headers.get("content-type") ?? "unknown"}`,
      ].join(";"));
    }
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
  } catch (error) {
    console.error("Spotify status request failed", error);
    return Response.json(
      {
        spotify: lastSpotify,
        error: lastSpotify === null ? "Spotify status is temporarily unavailable" : null,
        diagnostic: describeFailure(error),
        updatedAt: Date.now(),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
