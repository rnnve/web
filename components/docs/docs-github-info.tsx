import { GithubInfo } from "fumadocs-ui/components/github-info";

/** Server wrapper so MDX and the docs shell can share the same repo card. */
export default function DocsGithubInfo({
  owner = "rnnve",
  repo = "web",
  className,
}: {
  owner?: string;
  repo?: string;
  className?: string;
}) {
  return (
    <GithubInfo
      owner={owner}
      repo={repo}
      token={process.env.GITHUB_TOKEN}
      className={className}
    />
  );
}
