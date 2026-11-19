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

// Build complete Sunday–Saturday columns around the current UTC calendar year.
export function activityCells(value: unknown, now = new Date()) {
  const year = now.getUTCFullYear();
  const counts = new Map<string, { count: number; level: number }>();
  if (Array.isArray(value)) {
    for (const day of value) {
      if (
        !isRecord(day) ||
        typeof day.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        typeof day.count !== "number" ||
        !Number.isFinite(day.count) ||
        day.count < 0
      )
        continue;
      counts.set(day.date, {
        count: Math.floor(day.count),
        level: 0,
      });
    }
  }
  const peak = Math.max(
    0,
    ...[...counts]
      .filter(
        ([date]) =>
          date.startsWith(`${year}-`) && date <= now.toISOString().slice(0, 10),
      )
      .map(([, day]) => day.count),
  );
  for (const day of counts.values()) {
    day.level =
      day.count === 0
        ? 0
        : Math.max(1, Math.ceil((day.count / Math.max(1, peak)) * 4));
  }
  const start = new Date(Date.UTC(year, 0, 1));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const end = new Date(Date.UTC(year, 11, 31));
  end.setUTCDate(end.getUTCDate() + 6 - end.getUTCDay());
  const today = now.toISOString().slice(0, 10);
  const length = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return Array.from({ length }, (_, index) => {
    const date = new Date(start.getTime() + index * 86400000);
    const key = date.toISOString().slice(0, 10);
    const inYear = date.getUTCFullYear() === year;
    const future = key > today;
    const { count, level } =
      inYear && !future
        ? (counts.get(key) ?? { count: 0, level: 0 })
        : { count: 0, level: 0 };
    return { key, count, level, inYear, future };
  });
}
