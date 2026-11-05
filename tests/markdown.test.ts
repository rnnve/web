import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { htmlToMarkdown, prefersMarkdown, readHtml } from "../app/lib/markdown";
import { proxy } from "../proxy";

test("Markdown negotiation requires an explicit acceptable media type", () => {
  for (const accept of [
    null,
    "",
    "*/*",
    "text/html,application/xhtml+xml,*/*;q=0.8",
    "text/markdown;q=0",
    "text/markdown;q=0.3,text/html;q=0.9",
    "text/markdown;q=invalid",
  ]) {
    assert.equal(prefersMarkdown(accept), false, String(accept));
  }
  for (const accept of [
    "text/markdown",
    "text/markdown, text/html",
    "TEXT/MARKDOWN; charset=utf-8",
    "text/html;q=0.5,text/markdown;q=1",
  ]) {
    assert.equal(prefersMarkdown(accept), true, accept);
  }
});

const html = `<!doctype html><html><head><title>A page</title><meta name="description" content="A useful description"><script>secretPayload()</script></head><body><header>Navigation</header><div class="global-loader">Loading</div><div class="page-transition-content" aria-hidden="true"><main><header><h1>Welcome <span aria-hidden="true">duplicate letters</span></h1></header><p>A <strong>useful</strong> page with a <a href="/ask">question form</a>.</p><form><label>Private form UI</label></form><p><code>example()</code></p><script>hydrationSecret()</script><svg><text>Icon noise</text></svg></main></div><footer>Footer noise</footer></body></html>`;

test("conversion extracts real main content, metadata, formatting, and links", () => {
  const markdown = htmlToMarkdown(html, "https://example.com/");
  assert.match(markdown, /title: "A page"/);
  assert.match(markdown, /description: "A useful description"/);
  assert.match(markdown, /# Welcome/);
  assert.match(markdown, /\*\*useful\*\*/);
  assert.match(markdown, /\[question form\]\(<https:\/\/example.com\/ask>\)/);
  assert.match(markdown, /`example\(\)`/);
  assert.doesNotMatch(
    markdown,
    /Navigation|Loading|duplicate letters|Private form UI|secretPayload|hydrationSecret|Icon noise|Footer noise|<script/,
  );
});

test("browser and React navigation requests bypass conversion", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not fetch");
  });
  const requests: Record<string, string>[] = [
    { accept: "text/html" },
    { accept: "*/*" },
    { accept: "text/markdown", rsc: "1" },
    { accept: "text/markdown", "next-router-prefetch": "1" },
  ];
  for (const headers of requests) {
    const response = await proxy(
      new NextRequest("https://example.com/", { headers }),
    );
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
  const flight = await proxy(
    new NextRequest("https://example.com/?_rsc=flight", {
      headers: { accept: "text/markdown" },
    }),
  );
  assert.equal(flight.headers.get("x-middleware-next"), "1");
  assert.equal(fetchMock.mock.calls.length, 0);
});

test("Markdown responses fetch HTML once, isolate caches, and omit stale entity headers", async (context) => {
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async (_url: unknown, options?: RequestInit) => {
      assert.equal(new Headers(options?.headers).get("accept"), "text/html");
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          Vary: "RSC",
          "Content-Length": "10000",
          ETag: '"old-html"',
          "Content-Security-Policy": "default-src 'self'",
        },
      });
    },
  );
  const response = await proxy(
    new NextRequest("https://example.com/", {
      headers: { accept: "text/markdown" },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("content-type"),
    "text/markdown; charset=utf-8",
  );
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("vary"), "RSC, Accept");
  assert.equal(
    response.headers.get("content-security-policy"),
    "default-src 'self'",
  );
  assert.equal(response.headers.get("etag"), null);
  assert.equal(response.headers.get("content-length"), null);
  assert.match(await response.text(), /# Welcome/);
  assert.equal(fetchMock.mock.calls.length, 1);
});

test("HEAD negotiates Markdown without returning a body", async (context) => {
  context.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(html, { headers: { "Content-Type": "text/html" } }),
  );
  const response = await proxy(
    new NextRequest("https://example.com/", {
      method: "HEAD",
      headers: { accept: "text/markdown" },
    }),
  );
  assert.equal(
    response.headers.get("content-type"),
    "text/markdown; charset=utf-8",
  );
  assert.equal(await response.text(), "");
});

test("conversion failure and non-HTML responses fall back to the original route", async (context) => {
  context.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("{}", { headers: { "Content-Type": "application/json" } }),
  );
  const response = await proxy(
    new NextRequest("https://example.com/", {
      headers: { accept: "text/markdown" },
    }),
  );
  assert.equal(response.headers.get("x-middleware-next"), "1");
});

test("HTML conversion input is bounded", async () => {
  await assert.rejects(
    readHtml(new Response("x".repeat(6 * 1024 * 1024 + 1))),
    /limit exceeded/,
  );
});
