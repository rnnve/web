"use client";

import type { ReactNode } from "react";
import type * as PageTree from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import DocsBranchedNav from "./docs-branched-nav";

function HiddenTreeNode() {
  return null;
}

export default function DocsShell({
  tree,
  githubInfo,
  children,
}: {
  tree: PageTree.Root;
  githubInfo?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DocsLayout
      tree={tree}
      nav={{ title: "Rynnie / Docs", url: "/docs" }}
      themeSwitch={{ enabled: false }}
      links={[
        { text: "Website", url: "/", on: "nav" },
        {
          text: "GitHub",
          url: "https://github.com/rnnve/web",
          external: true,
          on: "nav",
        },
        ...(githubInfo
          ? [
              {
                type: "custom" as const,
                children: githubInfo,
                on: "menu" as const,
              },
            ]
          : []),
      ]}
      sidebar={{
        banner: <DocsBranchedNav />,
        footer: githubInfo ? (
          <div className="mt-2 empty:hidden">{githubInfo}</div>
        ) : undefined,
        components: {
          Item: HiddenTreeNode,
          Folder: HiddenTreeNode,
          Separator: HiddenTreeNode,
        },
      }}
      containerProps={{ className: "docs-root" }}
    >
      {children}
    </DocsLayout>
  );
}
