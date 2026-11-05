import type { MetadataRoute } from "next";

const SITE_URL = "https://rynni.cc";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/birthday`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/listen`, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/ask`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
