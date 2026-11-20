"use client";

import type { ReactNode } from "react";
import type * as PageTree from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

export default function DocsShell({
  tree,
  children,
}: {
  tree: PageTree.Root;
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
      ]}
      containerProps={{ className: "docs-root" }}
    >
      {children}
    </DocsLayout>
  );
}
