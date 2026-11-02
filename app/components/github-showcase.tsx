"use client";

import ExternalLinkIcon from "./external-link-icon";
import { useSiteSettings } from "./site-settings-provider";
import { normalizeRepos, activityCells } from "@/app/lib/github";
export { FEATURED_REPOSITORY_WHITELIST } from "@/app/config/portfolio";

type GitHubShowcaseProps = {
  repos: unknown;
  events: unknown;
  loading?: boolean;
};

export default function GitHubShowcase({
  repos: rawRepos,
  events,
  loading = false,
}: GitHubShowcaseProps) {
  const { language, t } = useSiteSettings();
  const repos = normalizeRepos(rawRepos);
  const cells = activityCells(events);
  const totalActivity = cells.reduce((total, cell) => total + cell.count, 0);
  return (
    <section
      id="more"
      className="github-showcase"
      aria-labelledby="github-showcase-title"
      data-reveal
    >
      <div className="github-showcase__heading">
        <div>
          <p>GitHub</p>
          <h2 id="github-showcase-title">
            {t("Building in public", "ผลงานที่แบ่งปัน")}
            <span>.</span>
          </h2>
        </div>
        <span>
          {t(
            "Selected work and recent activity",
            "ผลงานที่เลือกและกิจกรรมล่าสุด",
          )}
        </span>
      </div>
      <div className="github-showcase__grid">
        <article className="github-activity-card">
          <div className="github-activity-card__top">
            <div>
              <span>{t("GitHub activity", "กิจกรรมบน GitHub")}</span>
              <strong>
                {t(
                  `${totalActivity} public contributions`,
                  `มีส่วนร่วมสาธารณะ ${totalActivity} ครั้ง`,
                )}
              </strong>
            </div>
            <a
              href="https://github.com/rnnve"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub profile"
            >
              <ExternalLinkIcon size={22} />
            </a>
          </div>
          <div
            className="github-activity-graph"
            aria-label={`${totalActivity} public GitHub contributions during the last forty-two weeks`}
          >
            {cells.map((cell) => (
              <span
                key={cell.key}
                data-level={cell.level}
                tabIndex={0}
                aria-label={`${cell.count} contributions on ${cell.key}`}
              >
                <span role="tooltip">
                  <strong>{cell.count}</strong> contribution
                  {cell.count === 1 ? "" : "s"}
                  <small>
                    {new Intl.DateTimeFormat(
                      language === "th" ? "th-TH" : "en",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      },
                    ).format(new Date(`${cell.key}T00:00:00Z`))}
                  </small>
                </span>
              </span>
            ))}
          </div>
          <div className="github-activity-card__legend">
            <span>
              {t("42 weeks of public activity", "กิจกรรมสาธารณะใน 42 สัปดาห์")}
            </span>
            <span>
              {t("Less", "น้อย")} <i />
              <i />
              <i />
              <i />
              <i /> {t("More", "มาก")}
            </span>
          </div>
        </article>
        <div
          className="github-repo-grid"
          aria-label="Recently updated repositories"
        >
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  className="github-repo-card github-repo-card--loading"
                  key={index}
                />
              ))
            : Array.from({ length: 4 }, (_, index) => {
                const repo = repos[index];
                return repo ? (
                  <a
                    className="github-repo-card"
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    key={repo.url}
                  >
                    <div>
                      <span>
                        {t("Repository", "คลังโค้ด")} {index + 1}/4
                      </span>
                      <ExternalLinkIcon size={16} />
                    </div>
                    <h3>{repo.name}</h3>
                    <p>{repo.description}</p>
                    <footer>
                      <span>{repo.language || "Code"}</span>
                      <span>☆ {repo.stars}</span>
                    </footer>
                  </a>
                ) : (
                  <a
                    className="github-repo-card github-repo-card--empty"
                    href="https://github.com/rnnve?tab=repositories"
                    target="_blank"
                    rel="noreferrer"
                    key={index}
                  >
                    <span>
                      {t("Repository", "คลังโค้ด")} {index + 1}/4
                    </span>
                    <h3>{t("Explore my projects", "สำรวจโปรเจกต์ของเรา")}</h3>
                  </a>
                );
              })}
        </div>
      </div>
    </section>
  );
}
