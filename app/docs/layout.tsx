import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import DocsShell from "../../components/docs/docs-shell";
import { source } from "../lib/docs-source";
import "./docs.css";

export default function DocumentationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <DocsShell tree={source.getPageTree()}>{children}</DocsShell>
    </RootProvider>
  );
}
