import { normalizeListenData, parseListenPeriod } from "@/app/lib/lastfm";

const activityEndpoints = {
  recent: "/api/v2/lastfm/recent?limit=8",
  profile: "/api/v2/lastfm/profile",
};

function rankingEndpoints(period: string) {
  return {
    topTracks: `/api/v2/lastfm/top-tracks?period=${period}&limit=5`,
    topArtists: `/api/v2/lastfm/top-artists?period=${period}&limit=5`,
  };
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const period = parseListenPeriod(searchParams.get("period"));
  const view = searchParams.get("view");
  const endpoints =
    view === "activity"
      ? activityEndpoints
      : view === "rankings"
        ? rankingEndpoints(period)
        : { ...activityEndpoints, ...rankingEndpoints(period) };
  const results = await Promise.all(
    Object.entries(endpoints).map(async ([key, path]) => {
      try {
        const response = await fetch(`https://api.rynni.cc${path}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error("Upstream unavailable");
        return [key, await response.json()] as const;
      } catch {
        return [key, null] as const;
      }
    }),
  );
  const result = normalizeListenData(Object.fromEntries(results));
  return Response.json(result, {
    status:
      result.unavailable.length === Object.keys(endpoints).length ? 503 : 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
