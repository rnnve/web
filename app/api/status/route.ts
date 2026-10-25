const DISCORD_URL = "https://api.rynni.cc/v2/discord/user/1";
const STATUS_TIMEOUT_MS = 4_000;
let lastDiscord: unknown = null;

async function fetchDiscord(): Promise<unknown> {
  const response = await fetch(DISCORD_URL, {
    cache: "force-cache",
    headers: { Accept: "application/json", "User-Agent": "rynni-status-proxy" },
    next: { revalidate: 10 },
    signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return await response.json() as unknown;
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
  } catch {
    return Response.json(
      {
        discord: lastDiscord,
        error: lastDiscord === null ? "Discord status is temporarily unavailable" : null,
        updatedAt: Date.now(),
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
