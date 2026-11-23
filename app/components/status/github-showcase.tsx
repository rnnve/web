"use client";

import { memo, useMemo } from "react";
import {
  IconActivity,
  IconArrowUpRight,
  IconFolder,
  IconStar,
} from "@tabler/icons-react";
import { GithubLogo } from "@/components/logos/github";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSiteSettings } from "../settings/site-settings-provider";
import { activityCells, normalizeRepos } from "@/app/lib/github";
import styles from "../../developing/developing.module.css";

type GitHubShowcaseProps = {
  repos: unknown;
  contributions: unknown;
  loading?: boolean;
};

export function ContributionGraph({
  contributions,
  loading = false,
}: Pick<GitHubShowcaseProps, "contributions" | "loading">) {
  const { language, t } = useSiteSettings();
  const cells = useMemo(() => activityCells(contributions), [contributions]);
  const year = Number(cells.find((cell) => cell.inYear)?.key.slice(0, 4));
  const unavailable = !loading && !Array.isArray(contributions);
  const total = cells.reduce((sum, cell) => sum + cell.count, 0);
  const dateFormatter = new Intl.DateTimeFormat(
    language === "th" ? "th-TH" : "en",
    { dateStyle: "medium", timeZone: "UTC" },
  );

  return (
    <Card size="sm" aria-labelledby="github-showcase-title">
      <CardHeader>
        <CardTitle
          id="github-showcase-title"
          className="flex items-center gap-1.5 text-sm"
        >
          <IconActivity size={14} stroke={1.75} aria-hidden="true" />
          {t("Contributions", "การมีส่วนร่วม")}
        </CardTitle>
        <CardDescription>
          {loading
            ? t("Loading…", "กำลังโหลด…")
            : unavailable
              ? t(
                  "Contribution data unavailable",
                  "ไม่สามารถโหลดข้อมูลการมีส่วนร่วม",
                )
              : t(
                  `${total.toLocaleString()} contributions in ${year}`,
                  `มีส่วนร่วม ${total.toLocaleString()} ครั้งในปี ${year}`,
                )}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/rnnve"
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogo
                width={14}
                height={14}
                variant="mono"
                title=""
                aria-hidden="true"
              />
              GitHub
            </a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2 pt-5">
          <div
            className={styles.graph}
            aria-label={t(
              `${year} contribution calendar`,
              `ปฏิทินการมีส่วนร่วมปี ${year}`,
            )}
            aria-busy={loading}
          >
            {cells.map((cell) => (
              <span
                key={cell.key}
                data-level={cell.level}
                data-outside={!cell.inYear}
                data-future={cell.future}
                aria-hidden={!cell.inYear || undefined}
                tabIndex={
                  cell.inYear && !cell.future && !unavailable ? 0 : undefined
                }
                aria-label={`${cell.count} contributions · ${dateFormatter.format(new Date(`${cell.key}T00:00:00Z`))}`}
              >
                <span role="tooltip">
                  {cell.count} ·{" "}
                  {dateFormatter.format(new Date(`${cell.key}T00:00:00Z`))}
                </span>
              </span>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          {t(`January – December ${year}`, `มกราคม – ธันวาคม ${year}`)}
        </p>
      </CardContent>
    </Card>
  );
}

export function SelectedProjects({
  repos: rawRepos,
  loading = false,
}: Pick<GitHubShowcaseProps, "repos" | "loading">) {
  const { t } = useSiteSettings();
  const repos = useMemo(() => normalizeRepos(rawRepos), [rawRepos]);

  return (
    <section aria-labelledby="selected-projects-title">
      <h2
        id="selected-projects-title"
        className="mb-3 flex items-center gap-1.5 text-sm font-medium"
      >
        <IconFolder size={14} stroke={1.75} aria-hidden="true" />
        {t("Selected projects", "โปรเจกต์ที่เลือก")}
      </h2>
      <div
        className="overflow-hidden rounded-xl ring-1 ring-foreground/10"
        aria-busy={loading}
      >
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b px-3 py-3 last:border-b-0"
              role="status"
            >
              <span className="size-4 animate-pulse rounded bg-muted" />
              <span className="h-3 w-40 animate-pulse rounded bg-muted" />
              <span className="sr-only">
                {t("Loading project", "กำลังโหลดโปรเจกต์")}
              </span>
            </div>
          ))
        ) : repos.length ? (
          repos.map((repo) => (
            <a
              key={repo.url}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 border-b px-3 py-3 text-foreground no-underline transition-colors last:border-b-0 hover:bg-muted/50"
            >
              <GithubLogo
                width={15}
                height={15}
                variant="mono"
                title=""
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{repo.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {repo.description}
                </span>
              </span>
              {repo.language ? (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {repo.language}
                </Badge>
              ) : null}
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <IconStar size={13} stroke={1.75} aria-hidden="true" />
                {repo.stars}
              </span>
              <IconArrowUpRight
                size={14}
                stroke={1.75}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </a>
          ))
        ) : (
          <a
            className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground no-underline hover:text-foreground"
            href="https://github.com/rnnve?tab=repositories"
            target="_blank"
            rel="noreferrer"
          >
            <IconFolder size={14} stroke={1.75} aria-hidden="true" />
            {t(
              "Explore my projects on GitHub",
              "สำรวจโปรเจกต์ของเราบน GitHub",
            )}
          </a>
        )}
      </div>
    </section>
  );
}

function GitHubShowcase({
  repos,
  contributions,
  loading = false,
}: GitHubShowcaseProps) {
  return (
    <section aria-label="GitHub" className="grid gap-8">
      <ContributionGraph contributions={contributions} loading={loading} />
      <SelectedProjects repos={repos} loading={loading} />
    </section>
  );
}

export default memo(GitHubShowcase);
