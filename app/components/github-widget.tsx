"use client";

import { StatusIcon } from "./status-icon";
import type { GitHubView } from "@/app/lib/status-types";

const toExternalUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export default function GitHubWidget({
  github,
  error,
}: {
  github: GitHubView;
  error?: string | null;
}) {
  return (
    <section className="glassCard githubCard" aria-labelledby="github-title">
      <div className="githubProfile">
        <div
          className="githubAvatar"
          style={
            github.avatarUrl
              ? { backgroundImage: `url(${github.avatarUrl})` }
              : undefined
          }
        >
          {!github.avatarUrl && <StatusIcon name="github" size={34} />}
        </div>
        <div className="githubIdentity">
          <p>
            <StatusIcon name="github" size={15} />
            GitHub profile
          </p>
          <h2 id="github-title">{github.name}</h2>
          <span>@{github.login}</span>
        </div>
      </div>
      <div className="githubContent">
        <p className="githubBio">{github.bio}</p>
        <div className="githubMeta">
          {github.location && (
            <span>
              <StatusIcon name="pin" size={13} />
              {github.location}
            </span>
          )}
          {github.blog && (
            <a
              href={toExternalUrl(github.blog)}
              target="_blank"
              rel="noreferrer"
            >
              {github.blog.replace(/^https?:\/\//, "")}
            </a>
          )}
          {github.joinedAt && (
            <span>
              Joined{" "}
              {new Date(github.joinedAt).toLocaleDateString("en", {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
      <div className="githubStats" aria-label="GitHub profile statistics">
        <div>
          <strong>{github.repositories}</strong>
          <span>Repositories</span>
        </div>
        <div>
          <strong>{github.followers}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{github.following}</strong>
          <span>Following</span>
        </div>
      </div>
      <a
        className="githubLink"
        href={github.profileUrl}
        target="_blank"
        rel="noreferrer"
      >
        View GitHub <StatusIcon name="arrow" size={17} />
      </a>
      {error && <p className="errorText">{error}</p>}
    </section>
  );
}
