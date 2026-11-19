import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "../lib/docs-source";
import "./docs.css";

export default function DocumentationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <DocsLayout
        tree={source.getPageTree()}
        nav={{ title: "Rynnie / Docs", url: "/docs" }}
        themeSwitch={{ enabled: false }}
        links={[
          { text: "Website", url: "/" },
          { text: "Desktop", url: "/-" },
          {
            text: "GitHub",
            url: "https://github.com/rnnve/web",
            external: true,
          },
        ]}
        containerProps={{ className: "docs-root" }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
