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

const STATUS_TIMEOUT_MS = 15_000;
let lastDiscord: unknown = null;
let lastSpotify: unknown = null;

async function fetchJson(url: string, init: RequestInit = {}, retries = 0): Promise<unknown> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("User-Agent")) headers.set("User-Agent", "rynni-status-proxy");

  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...init,
      headers,
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    return await response.json() as unknown;
  } catch (error) {
    if (retries > 0) return fetchJson(url, init, retries - 1);
    throw error;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const [discord, spotify, github, githubRepos, githubEvents, lastfmTopTracks, lastfmTopArtists] = await Promise.allSettled([
    fetchJson(DISCORD_URL, {}, 1),
    fetchJson(SPOTIFY_URL, {}, 1),
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

  if (discord.status === "fulfilled" && discord.value !== null) lastDiscord = discord.value;
  if (spotify.status === "fulfilled" && spotify.value !== null) lastSpotify = spotify.value;
  const discordValue = discord.status === "fulfilled" ? discord.value : lastDiscord;
  const spotifyValue = spotify.status === "fulfilled" ? spotify.value : lastSpotify;

  return Response.json(
    {
      discord: discordValue,
      spotify: spotifyValue,
      github: github.status === "fulfilled" ? github.value : null,
      githubRepos: githubRepos.status === "fulfilled" ? githubRepos.value : [],
      githubEvents: githubEvents.status === "fulfilled" ? githubEvents.value : [],
      lastfm: {
        topTracks: lastfmTopTracks.status === "fulfilled" ? lastfmTopTracks.value : null,
        topArtists: lastfmTopArtists.status === "fulfilled" ? lastfmTopArtists.value : null,
      },
      errors: {
        discord: discord.status === "rejected" && discordValue === null ? "Discord status is temporarily unavailable" : null,
        spotify: spotify.status === "rejected" && spotifyValue === null ? "Spotify status is temporarily unavailable" : null,
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
