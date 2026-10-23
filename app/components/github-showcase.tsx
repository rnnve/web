type JsonRecord = Record<string, unknown>;

type GitHubShowcaseProps = { repos: unknown; events: unknown; loading?: boolean };
type Repo = { name: string; description: string; url: string; language: string; stars: number; fork: boolean };

// Add repository names here in the exact order you want them displayed.
// When this is empty, the four most recently updated repositories are used.
export const FEATURED_REPOSITORY_WHITELIST: string[] = ["rnnve", "web", "api", "dcutils"];

const isRecord = (value: unknown): value is JsonRecord => typeof value === "object" && value !== null && !Array.isArray(value);
function readString(record: JsonRecord, key: string) { return typeof record[key] === "string" ? record[key] as string : ""; }

function normalizeRepos(value: unknown): Repo[] {
  if (!Array.isArray(value)) return [];
  const repos = value.filter(isRecord).map((repo) => ({
    name: readString(repo, "name") || "Untitled repository",
    description: readString(repo, "description") || "A project from my GitHub profile.",
    url: readString(repo, "html_url") || "https://github.com/rnnve",
    language: readString(repo, "language"),
    stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
    fork: repo.fork === true,
  })).filter((repo) => !repo.fork);

  if (FEATURED_REPOSITORY_WHITELIST.length === 0) return repos.slice(0, 4);

  const reposByName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo]));
  return FEATURED_REPOSITORY_WHITELIST
    .map((name) => reposByName.get(name.toLowerCase()))
    .filter((repo): repo is Repo => repo !== undefined)
    .slice(0, 4);
}

function activityCells(value: unknown) {
  const eventCounts = new Map<string, number>();
  if (Array.isArray(value)) {
    for (const event of value) {
      if (!isRecord(event)) continue;
      const createdAt = readString(event, "created_at");
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      const payload = isRecord(event.payload) ? event.payload : {};
      const weight = readString(event, "type") === "PushEvent" && typeof payload.size === "number" ? Math.max(1, payload.size) : 1;
      eventCounts.set(day, (eventCounts.get(day) ?? 0) + weight);
    }
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - today.getDay() - 15 * 7);
  return Array.from({ length: 16 * 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const count = eventCounts.get(key) ?? 0;
    const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
    return { key, count, level };
  });
}

export default function GitHubShowcase({ repos: rawRepos, events, loading = false }: GitHubShowcaseProps) {
  const repos = normalizeRepos(rawRepos);
  const cells = activityCells(events);
  const totalActivity = cells.reduce((total, cell) => total + cell.count, 0);
  return (
    <section id="more" className="github-showcase" aria-labelledby="github-showcase-title">
      <div className="github-showcase__heading"><p>Github</p></div>
      <div className="github-showcase__grid">
        <article className="github-activity-card">
          <div className="github-activity-card__top"><div><span>GitHub activity</span><strong>{totalActivity} public contributions</strong></div><a href="https://github.com/rnnve" target="_blank" rel="noreferrer" aria-label="Open GitHub profile">↗</a></div>
          <div className="github-activity-graph" aria-label={`${totalActivity} public GitHub contributions during the last sixteen weeks`}>
            {cells.map((cell) => (
              <span key={cell.key} data-level={cell.level} tabIndex={0} aria-label={`${cell.count} contributions on ${cell.key}`}>
                <span role="tooltip"><strong>{cell.count}</strong> contribution{cell.count === 1 ? "" : "s"}<small>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${cell.key}T00:00:00Z`))}</small></span>
              </span>
            ))}
          </div>
          <div className="github-activity-card__legend"><span>16 weeks of public activity</span><span>Less <i/><i/><i/><i/><i/> More</span></div>
        </article>
        <div className="github-repo-grid" aria-label="Recently updated repositories">
          {loading ? Array.from({ length: 4 }, (_, index) => <div className="github-repo-card github-repo-card--loading" key={index} />) : Array.from({ length: 4 }, (_, index) => {
            const repo = repos[index];
            return repo ? (
              <a className="github-repo-card" href={repo.url} target="_blank" rel="noreferrer" key={repo.url}><div><span>Repository {index + 1}/4</span><b aria-hidden="true">↗</b></div><h3>{repo.name}</h3><p>{repo.description}</p><footer><span>{repo.language || "Code"}</span><span>☆ {repo.stars}</span></footer></a>
            ) : (
              <a className="github-repo-card github-repo-card--empty" href="https://github.com/rnnve?tab=repositories" target="_blank" rel="noreferrer" key={index}><span>Repository {index + 1}/4</span><h3>Explore my projects</h3></a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
