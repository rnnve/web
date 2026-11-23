"use client";

import { useEffect, useState, type ReactNode } from "react";
import type * as PageTree from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { resolveDocsReturn } from "@/app/lib/docs-return";

export default function DocsShell({
  tree,
  children,
}: {
  tree: PageTree.Root;
  children: ReactNode;
}) {
  const [backHref, setBackHref] = useState("/");

  useEffect(() => {
    setBackHref(
      resolveDocsReturn(document.referrer, window.location.origin, "/"),
    );
  }, []);

  return (
    <DocsLayout
      tree={tree}
      nav={{ title: "Rynnie / Docs", url: "/docs" }}
      themeSwitch={{ enabled: false }}
      links={[
        { text: "← Back", url: backHref, on: "nav" },
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
