import type { MetadataRoute } from "next";
import { source } from "./lib/docs-source";
import { buildSitemap } from "./lib/sitemap-entries";

// Next.js serializes this metadata route to /sitemap.xml and caches it at build time.
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(source.getPages().map((page) => page.url));
}
