import { NO_STORE_HEADERS, statusCacheHeaders } from "@/app/lib/status-handler";

const GITHUB_REPOS_URL =
  "https://api.github.com/users/rnnve/repos?sort=updated&direction=desc&per_page=100";
const GITHUB_TIMEOUT_MS = 5_000;
const REPOSITORY_CACHE_SECONDS = 900;
const CONTRIBUTION_CACHE_SECONDS = 300;
const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "rynni-profile-widget",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function fetchGitHub(
  url: string,
  revalidate: number,
  authenticated = true,
): Promise<unknown> {
  const response = await fetch(url, {
    cache: "force-cache",
    headers: authenticated ? githubHeaders : { Accept: "application/json" },
    next: { revalidate },
    signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return (await response.json()) as unknown;
}

export async function GET() {
  const year = new Date().getUTCFullYear();
  const [repos, contributions] = await Promise.allSettled([
    fetchGitHub(GITHUB_REPOS_URL, REPOSITORY_CACHE_SECONDS),
    fetchGitHub(
      `https://github-contributions-api.jogruber.de/v4/rnnve?y=${year}`,
      CONTRIBUTION_CACHE_SECONDS,
      false,
    ).then((value) => {
      if (
        !value ||
        typeof value !== "object" ||
        !("contributions" in value) ||
        !Array.isArray(value.contributions)
      )
        throw new Error("Invalid contribution calendar");
      return value.contributions;
    }),
  ]);

  return Response.json(
    {
      repos: repos.status === "fulfilled" ? repos.value : [],
      contributions:
        contributions.status === "fulfilled" ? contributions.value : null,
      year,
      updatedAt: Date.now(),
    },
    {
      headers:
        repos.status === "fulfilled" && contributions.status === "fulfilled"
          ? statusCacheHeaders(60)
          : NO_STORE_HEADERS,
    },
  );
}
