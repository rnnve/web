import type { MetadataRoute } from "next";

const SITE_URL = "https://rynni.cc";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/loading`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
