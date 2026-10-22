const DISCORD_URL = "https://api.rynni.cc/v2/discord/user/1";
const SPOTIFY_URL = "https://sptf.rynni.cc/api/spotify";
const GITHUB_URL = "https://api.github.com/users/rnnve";
const LASTFM_TOP_TRACKS_URL = "https://api.rynni.cc/api/v2/lastfm/top-tracks";
const LASTFM_TOP_ARTISTS_URL = "https://api.rynni.cc/api/v2/lastfm/top-artists";

async function fetchJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function GET() {
  const [discord, spotify, github, lastfmTopTracks, lastfmTopArtists] = await Promise.allSettled([
    fetchJson(DISCORD_URL),
    fetchJson(SPOTIFY_URL),
    fetchJson(GITHUB_URL, {
      cache: "force-cache",
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "rynni-profile-widget",
      },
      next: { revalidate: 3600 },
    }),
    fetchJson(LASTFM_TOP_TRACKS_URL),
    fetchJson(LASTFM_TOP_ARTISTS_URL),
  ]);

  return Response.json(
    {
      discord: discord.status === "fulfilled" ? discord.value : null,
      spotify: spotify.status === "fulfilled" ? spotify.value : null,
      github: github.status === "fulfilled" ? github.value : null,
      lastfm: {
        topTracks: lastfmTopTracks.status === "fulfilled" ? lastfmTopTracks.value : null,
        topArtists: lastfmTopArtists.status === "fulfilled" ? lastfmTopArtists.value : null,
      },
      errors: {
        discord: discord.status === "rejected" ? "Discord status is temporarily unavailable" : null,
        spotify: spotify.status === "rejected" ? "Spotify status is temporarily unavailable" : null,
        github: github.status === "rejected" ? "GitHub profile is temporarily unavailable" : null,
        lastfmTopTracks: lastfmTopTracks.status === "rejected" ? "Last.fm top tracks are temporarily unavailable" : null,
        lastfmTopArtists: lastfmTopArtists.status === "rejected" ? "Last.fm top artists are temporarily unavailable" : null,
      },
      updatedAt: Date.now(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
