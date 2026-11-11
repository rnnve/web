import type { MetadataRoute } from "next";
import { PUBLIC_PAGES, SITE_URL } from "./lib/og/resolver";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.flatMap(({ pattern, sitemap }) =>
    sitemap && !pattern.includes("[")
      ? [{ url: new URL(pattern, SITE_URL).href, ...sitemap }]
      : [],
  );
}
