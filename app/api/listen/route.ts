import { normalizeListenData } from "@/app/lib/lastfm";

const endpoints = {
  current: "/api/v2/lastfm",
  recent: "/api/v2/lastfm/recent?limit=8",
  topTracks: "/api/v2/lastfm/top-tracks?period=7day&limit=5",
  topArtists: "/api/v2/lastfm/top-artists?period=7day&limit=5",
  profile: "/api/v2/lastfm/profile",
};

export async function GET() {
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
