"use client";

import { memo, useMemo } from "react";
import ExternalLinkIcon from "../ui/external-link-icon";
import { useSiteSettings } from "../settings/site-settings-provider";
import { normalizeRepos, activityCells } from "@/app/lib/github";
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
    <section aria-labelledby="github-showcase-title" className={styles.work}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>GitHub / rnnve</p>
          <h2 id="github-showcase-title">
            {t("Building in public", "ผลงานที่แบ่งปัน")}
          </h2>
        </div>
        <a href="https://github.com/rnnve" target="_blank" rel="noreferrer">
          {t("View GitHub", "ดู GitHub")} <ExternalLinkIcon size={16} />
        </a>
      </div>
      <div className={styles.activity} aria-busy={loading}>
        <div className={styles.activityHeading}>
          <span>{t("Recent activity", "กิจกรรมล่าสุด")}</span>
          <span>
            {loading
              ? t("Loading…", "กำลังโหลด…")
              : t(
                  `${total} public contributions`,
                  `มีส่วนร่วมสาธารณะ ${total} ครั้ง`,
                )}
          </span>
        </div>
        <div
          className={styles.graph}
          aria-label={t(
            "42 weeks of public activity",
            "กิจกรรมสาธารณะใน 42 สัปดาห์",
          )}
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
        <div className={styles.legend}>
          <span>{t("Last 42 weeks", "42 สัปดาห์ที่ผ่านมา")}</span>
          <span>
            {t("Less", "น้อย")} <i />
            <i />
            <i />
            <i />
            <i /> {t("More", "มาก")}
          </span>
        </div>
      </div>
      <div className={styles.projectHeading}>
        <h3>{t("Selected projects", "โปรเจกต์ที่เลือก")}</h3>
        <span>
          {t(
            "Code, experiments & things I ship",
            "โค้ด งานทดลอง และผลงานของเรา",
          )}
        </span>
      </div>
      <div className={styles.projects} aria-busy={loading}>
        {loading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.skeleton} role="status">
              <span className="sr-only">
                {t("Loading project", "กำลังโหลดโปรเจกต์")}
              </span>
            </div>
          ))
        ) : repos.length ? (
          repos.map((repo, i) => (
            <a
              key={repo.url}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className={styles.project}
            >
              <div className={styles.projectTop}>
                <span>{String(i + 1).padStart(2, "0")} / Repository</span>
                <ExternalLinkIcon size={18} />
              </div>
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <div className={styles.projectMeta}>
                <span>{repo.language || "Code"}</span>
                <span>☆ {repo.stars}</span>
              </div>
            </a>
          ))
        ) : (
          <a
            className={styles.empty}
            href="https://github.com/rnnve?tab=repositories"
            target="_blank"
            rel="noreferrer"
          >
            {t("Explore my projects on GitHub", "สำรวจโปรเจกต์ของเราบน GitHub")}{" "}
            <ExternalLinkIcon size={18} />
          </a>
        )}
      </div>
    </section>
  );
}
export default memo(GitHubShowcase);
