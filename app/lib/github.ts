import { isRecord, readString } from "./json";
import { FEATURED_REPOSITORY_WHITELIST } from "@/app/config/portfolio";

type Repo = {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  fork: boolean;
};

export function normalizeRepos(value: unknown): Repo[] {
  if (!Array.isArray(value)) return [];
  const repos = value
    .filter(isRecord)
    .map((repo) => ({
      name: readString(repo, "name") || "Untitled repository",
      description:
        readString(repo, "description") || "A project from my GitHub profile.",
      url: readString(repo, "html_url") || "https://github.com/rnnve",
      language: readString(repo, "language"),
      stars:
        typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
      fork: repo.fork === true,
    }))
    .filter((repo) => !repo.fork);

  if (FEATURED_REPOSITORY_WHITELIST.length === 0) return repos.slice(0, 4);

  const reposByName = new Map(
    repos.map((repo) => [repo.name.toLowerCase(), repo]),
  );
  return FEATURED_REPOSITORY_WHITELIST.map((name) =>
    reposByName.get(name.toLowerCase()),
  )
    .filter((repo): repo is Repo => repo !== undefined)
    .slice(0, 4);
}

function activityLevel(count: number) {
  if (count === 0) return 0;
  if (count < 2) return 1;
  if (count < 4) return 2;
  if (count < 7) return 3;
  return 4;
}

export function activityCells(value: unknown) {
  const eventCounts = new Map<string, number>();
  if (Array.isArray(value)) {
    for (const event of value) {
      if (!isRecord(event)) continue;
      const createdAt = readString(event, "created_at");
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      const payload = isRecord(event.payload) ? event.payload : {};
      const weight =
        readString(event, "type") === "PushEvent" &&
        typeof payload.size === "number"
          ? Math.max(1, payload.size)
          : 1;
      eventCounts.set(day, (eventCounts.get(day) ?? 0) + weight);
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - today.getDay() - 41 * 7);
  return Array.from({ length: 42 * 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const count = eventCounts.get(key) ?? 0;
    const level = activityLevel(count);
    return { key, count, level };
  });
}
