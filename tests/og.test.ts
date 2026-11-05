import assert from "node:assert/strict";
import { test } from "node:test";
import { generatePageMetadata, getOGImageUrl } from "../app/lib/og/metadata";
import {
  HOME_CONTENT,
  PUBLIC_PAGES,
  SITE_URL,
  normalizePagePath,
  resolvePageContent,
  type PublicPageRoute,
} from "../app/lib/og/resolver";

test("OG paths reject external URLs, traversal, malformed encodings, and query injection", () => {
  for (const path of [
    "https://example.com",
    "//example.com",
    "/../.env",
    "/%2e%2e/secrets",
    "/%252e%252e/secrets",
    "/ask?token=private",
    "/ask#fragment",
    "/a\\b",
    "/%00",
    "/%zz",
    "/a//b",
    "/" + "x".repeat(1024),
  ]) {
    assert.equal(normalizePagePath(path), null, path);
  }
  assert.equal(normalizePagePath("/birthday/"), "/birthday");
  assert.equal(normalizePagePath("/blog/hello-world"), "/blog/hello-world");
  assert.equal(normalizePagePath("/blog/%E0%B8%97%E0%B8%94"), "/blog/ทด");
});

test("all public pages share their actual titles and descriptions with social metadata", async () => {
  for (const route of PUBLIC_PAGES) {
    const resolved = await resolvePageContent(route.pattern);
    assert.equal(resolved.found, true);
    const metadata = await generatePageMetadata(route.pattern);
    assert.equal(metadata.title, resolved.content.title);
    assert.equal(metadata.description, resolved.content.description);
    assert.equal(metadata.openGraph?.title, resolved.content.title);
    assert.equal(metadata.openGraph?.description, resolved.content.description);
    assert.equal(
      metadata.openGraph?.url,
      new URL(route.pattern, SITE_URL).href,
    );
    assert.ok(metadata.twitter && "card" in metadata.twitter);
    assert.equal(metadata.twitter.card, "summary_large_image");
    const url = new URL(getOGImageUrl(route.pattern));
    assert.equal(url.origin, SITE_URL);
    assert.equal(url.pathname, "/internal/og");
    assert.equal(url.searchParams.get("path"), route.pattern);
    assert.deepEqual(metadata.openGraph?.images, [
      {
        url: url.href,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${resolved.content.title} — ${resolved.content.description}`,
      },
    ]);
    assert.deepEqual(metadata.twitter?.images, [
      {
        url: url.href,
        alt: `${resolved.content.title} — ${resolved.content.description}`,
      },
    ]);
  }
});

test("dynamic route parameters reuse a public content loader and missing records fall back", async () => {
  const records = {
    "example-project": {
      title: "Example project",
      description: "An existing public project record.",
      type: "article" as const,
      tags: ["Next.js", "TypeScript"],
    },
  };
  const routes: PublicPageRoute[] = [
    {
      pattern: "/projects/[slug]",
      load: ({ slug }) => records[slug as keyof typeof records] ?? null,
    },
    {
      pattern: "/projects/featured",
      load: () => ({
        title: "Featured projects",
        description: "The static route wins.",
      }),
    },
  ];
  const result = await resolvePageContent("/projects/example-project", routes);
  assert.equal(result.found, true);
  assert.deepEqual(result.content, records["example-project"]);
  assert.equal(
    (await resolvePageContent("/projects/featured", routes)).content.title,
    "Featured projects",
  );
  assert.deepEqual(await resolvePageContent("/projects/missing", routes), {
    path: "/",
    content: HOME_CONTENT,
    found: false,
  });
});

test("nonexistent and nonpublic routes return the same safe branded fallback", async () => {
  for (const path of [
    "/missing",
    "/api/status",
    "/internal/og",
    "/.env",
    "https://example.com",
  ]) {
    assert.deepEqual(await resolvePageContent(path), {
      path: "/",
      content: HOME_CONTENT,
      found: false,
    });
  }
});

test("failed dynamic content loaders return a safe fallback without their error details", async () => {
  const routes: PublicPageRoute[] = [
    {
      pattern: "/blog/[slug]",
      load: async () => {
        throw new Error("Private data source error");
      },
    },
  ];
  assert.deepEqual(await resolvePageContent("/blog/example", routes), {
    path: "/",
    content: HOME_CONTENT,
    found: false,
  });
});
