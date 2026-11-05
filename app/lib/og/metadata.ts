import type { Metadata } from "next";
import { resolvePageContent, SITE_NAME, SITE_URL } from "./resolver";

export function getOGImageUrl(path: string): string {
  const url = new URL("/internal/og", SITE_URL);
  url.searchParams.set("path", path);
  return url.href;
}

export async function generatePageMetadata(
  pathname: string,
): Promise<Metadata> {
  const { path, content } = await resolvePageContent(pathname);
  const image = {
    url: getOGImageUrl(path),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: `${content.title} — ${content.description}`,
  };
  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: content.type ?? "website",
      siteName: SITE_NAME,
      url: new URL(path, SITE_URL).href,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}
