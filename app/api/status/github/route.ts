const GITHUB_REPOS_URL = "https://api.github.com/users/rnnve/repos?sort=updated&direction=desc&per_page=100";
const GITHUB_EVENTS_URL = "https://api.github.com/users/rnnve/events/public?per_page=100";
const GITHUB_TIMEOUT_MS = 5_000;
const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "rynni-profile-widget",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function fetchGitHub(url: string, revalidate: number): Promise<unknown> {
  const response = await fetch(url, {
    cache: "force-cache",
    headers: githubHeaders,
    next: { revalidate },
    signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return await response.json() as unknown;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const [repos, events] = await Promise.allSettled([
    fetchGitHub(GITHUB_REPOS_URL, 900),
    fetchGitHub(GITHUB_EVENTS_URL, 300),
  ]);

  return Response.json(
    {
      repos: repos.status === "fulfilled" ? repos.value : [],
      events: events.status === "fulfilled" ? events.value : [],
      updatedAt: Date.now(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
