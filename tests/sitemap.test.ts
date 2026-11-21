import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSitemap } from "../app/lib/sitemap-entries";
import robots from "../app/robots";
import { generatePageMetadata } from "../app/lib/og/metadata";

const origin = "https://rynni.cc";

test("sitemap, robots, and page canonicals use the serving production host", async () => {
  const entries = buildSitemap(["/docs", "/docs/customization"]);
  assert.deepEqual(
    entries.map(({ url }) => url),
    [
      `${origin}/`,
      `${origin}/developing`,
      `${origin}/birthday`,
      `${origin}/listen`,
      `${origin}/ask`,
      `${origin}/docs`,
      `${origin}/docs/customization`,
    ],
  );
  assert.equal(robots().sitemap, `${origin}/sitemap.xml`);
  for (const { url } of entries.filter(({ url }) => !url.includes("/docs"))) {
    const metadata = await generatePageMetadata(new URL(url).pathname);
    assert.equal(metadata.alternates?.canonical, url);
    assert.equal(metadata.openGraph?.url, url);
  }
});

test("sitemap deduplicates documentation and rejects noncanonical locations", () => {
  const entries = buildSitemap([
    "/docs/customization/",
    "/docs/customization",
    "/docs",
    "https://example.com/docs",
    "//example.com/docs",
    "/docs/../ask",
    "/docs?query=search",
    "/docs#section",
    "/api/search",
    "/newtab",
  ]);
  const urls = entries.map(({ url }) => url);
  assert.equal(new Set(urls).size, urls.length);
  assert.deepEqual(
    urls.filter((url) => url.includes("/docs")),
    [`${origin}/docs`, `${origin}/docs/customization`],
  );
  assert(entries.every(({ url }) => new URL(url).origin === origin));
  assert(!urls.some((url) => /\?|#|\/api\/|\/newtab/.test(url)));
});
