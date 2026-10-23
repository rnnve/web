const DISCORD_URL = "https://api.rynni.cc/v2/discord/user/1";
const SPOTIFY_URL = "https://sptf.rynni.cc/api/spotify";
const GITHUB_URL = "https://api.github.com/users/rnnve";
const GITHUB_REPOS_URL = "https://api.github.com/users/rnnve/repos?sort=updated&direction=desc&per_page=100";
const GITHUB_EVENTS_URL = "https://api.github.com/users/rnnve/events/public?per_page=100";
const LASTFM_TOP_TRACKS_URL = "https://api.rynni.cc/api/v2/lastfm/top-tracks";
const LASTFM_TOP_ARTISTS_URL = "https://api.rynni.cc/api/v2/lastfm/top-artists";
const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "rynni-profile-widget",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

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
  const [discord, spotify, github, githubRepos, githubEvents, lastfmTopTracks, lastfmTopArtists] = await Promise.allSettled([
    fetchJson(DISCORD_URL),
    fetchJson(SPOTIFY_URL),
    fetchJson(GITHUB_URL, {
      cache: "force-cache",
      headers: githubHeaders,
      next: { revalidate: 3600 },
    }),
    fetchJson(GITHUB_REPOS_URL, {
      cache: "force-cache",
      headers: githubHeaders,
      next: { revalidate: 900 },
    }),
    fetchJson(GITHUB_EVENTS_URL, {
      cache: "force-cache",
      headers: githubHeaders,
      next: { revalidate: 900 },
    }),
    fetchJson(LASTFM_TOP_TRACKS_URL),
    fetchJson(LASTFM_TOP_ARTISTS_URL),
  ]);

  return Response.json(
    {
      discord: discord.status === "fulfilled" ? discord.value : null,
      spotify: spotify.status === "fulfilled" ? spotify.value : null,
      github: github.status === "fulfilled" ? github.value : null,
      githubRepos: githubRepos.status === "fulfilled" ? githubRepos.value : [],
      githubEvents: githubEvents.status === "fulfilled" ? githubEvents.value : [],
      lastfm: {
        topTracks: lastfmTopTracks.status === "fulfilled" ? lastfmTopTracks.value : null,
        topArtists: lastfmTopArtists.status === "fulfilled" ? lastfmTopArtists.value : null,
      },
      errors: {
        discord: discord.status === "rejected" ? "Discord status is temporarily unavailable" : null,
        spotify: spotify.status === "rejected" ? "Spotify status is temporarily unavailable" : null,
        github: github.status === "rejected" ? "GitHub profile is temporarily unavailable" : null,
        githubRepos: githubRepos.status === "rejected" ? "GitHub repositories are temporarily unavailable" : null,
        githubEvents: githubEvents.status === "rejected" ? "GitHub activity is temporarily unavailable" : null,
        lastfmTopTracks: lastfmTopTracks.status === "rejected" ? "Last.fm top tracks are temporarily unavailable" : null,
        lastfmTopArtists: lastfmTopArtists.status === "rejected" ? "Last.fm top artists are temporarily unavailable" : null,
      },
      updatedAt: Date.now(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
