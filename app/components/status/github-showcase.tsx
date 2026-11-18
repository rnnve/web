"use client";

import { memo, useMemo } from "react";
import {
  IconActivity,
  IconArrowUpRight,
  IconBrandGithub,
  IconFolder,
  IconStar,
} from "@tabler/icons-react";
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
  events: unknown;
  loading?: boolean;
};

function GitHubShowcase({
  repos: rawRepos,
  events,
  loading = false,
}: GitHubShowcaseProps) {
  const { language, t } = useSiteSettings();
  const repos = useMemo(() => normalizeRepos(rawRepos), [rawRepos]);
  const cells = useMemo(() => activityCells(events), [events]);
  const total = cells.reduce((sum, cell) => sum + cell.count, 0);
  const dateFormatter = new Intl.DateTimeFormat(
    language === "th" ? "th-TH" : "en",
    { dateStyle: "medium", timeZone: "UTC" },
  );

  return (
    <section aria-labelledby="github-showcase-title" className="grid gap-8">
      <Card size="sm">
        <CardHeader>
          <CardTitle
            id="github-showcase-title"
            className="flex items-center gap-1.5 text-sm"
          >
            <IconActivity size={14} stroke={1.75} aria-hidden="true" />
            {t("Recent activity", "กิจกรรมล่าสุด")}
          </CardTitle>
          <CardDescription>
            {loading
              ? t("Loading…", "กำลังโหลด…")
              : t(
                  `${total} public contributions`,
                  `มีส่วนร่วมสาธารณะ ${total} ครั้ง`,
                )}
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/rnnve"
                target="_blank"
                rel="noreferrer"
              >
                <IconBrandGithub size={14} stroke={1.75} aria-hidden="true" />
                GitHub
              </a>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div
            className={styles.graph}
            aria-label={t(
              "42 weeks of public activity",
              "กิจกรรมสาธารณะใน 42 สัปดาห์",
            )}
            aria-busy={loading}
          >
            {cells.map((cell) => (
              <span
                key={cell.key}
                data-level={cell.level}
                tabIndex={0}
                aria-label={`${cell.count} contributions · ${dateFormatter.format(new Date(`${cell.key}T00:00:00Z`))}`}
              >
                <span role="tooltip">
                  {cell.count} ·{" "}
                  {dateFormatter.format(new Date(`${cell.key}T00:00:00Z`))}
                </span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t("Last 42 weeks", "42 สัปดาห์ที่ผ่านมา")}
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
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
                <IconBrandGithub
                  size={15}
                  stroke={1.75}
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
      </div>
    </section>
  );
}

export default memo(GitHubShowcase);
