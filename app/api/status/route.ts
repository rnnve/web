const DISCORD_URL = "https://api.rynni.cc/v2/discord/user/1";
const STATUS_TIMEOUT_MS = 10_000;
const STATUS_RETRIES = 1;
let lastDiscord: unknown = null;

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

async function fetchDiscord(retries = STATUS_RETRIES): Promise<unknown> {
  try {
    const response = await fetch(DISCORD_URL, {
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
    if (retries > 0) return fetchDiscord(retries - 1);
    throw error;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const discord = await fetchDiscord();
    if (discord !== null) lastDiscord = discord;

    return Response.json(
      { discord, error: null, updatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Discord status request failed", error);
    return Response.json(
      {
        discord: lastDiscord,
        error: lastDiscord === null ? "Discord status is temporarily unavailable" : null,
        diagnostic: describeFailure(error),
        updatedAt: Date.now(),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
