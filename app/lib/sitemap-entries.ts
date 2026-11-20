import type { MetadataRoute } from "next";
import { normalizePagePath, PUBLIC_PAGES, SITE_URL } from "./og/resolver";

/** Keep sitemap entries on the canonical host and omit aliases and utility routes. */
export function buildSitemap(
  documentationPaths: readonly string[],
): MetadataRoute.Sitemap {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const { pattern, sitemap: options } of PUBLIC_PAGES) {
    if (!options || pattern.includes("[")) continue;
    const url = new URL(pattern, SITE_URL).href;
    entries.set(url, { url, ...options });
  }

  for (const pathname of [...documentationPaths].sort()) {
    const path = normalizePagePath(pathname);
    if (!path || (path !== "/docs" && !path.startsWith("/docs/"))) continue;
    const url = new URL(path, SITE_URL).href;
    entries.set(url, { url, changeFrequency: "monthly", priority: 0.4 });
  }

  return [...entries.values()];
}
