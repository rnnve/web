import assert from "node:assert/strict";
import { test } from "node:test";
import { createDocument } from "@mixmark-io/domino";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import PortfolioNavbar from "../app/components/layout/portfolio-navbar";
import { Button } from "../components/ui/button";

test("header preserves portfolio routes without language hashes and the active page", () => {
  const html = renderToStaticMarkup(
    <PathnameContext.Provider value="/developing">
      <SiteSettingsProvider>
        <PortfolioNavbar />
      </SiteSettingsProvider>
    </PathnameContext.Provider>,
  );
  for (const path of ["/", "/developing", "/listen", "/birthday", "/ask"]) {
    assert.ok(html.includes(`href="${path}"`));
  }
  assert.match(
    html,
    /aria-current="page"[^>]*href="\/developing"|href="\/developing"[^>]*aria-current="page"/,
  );
  assert.doesNotMatch(html, /href="[^"]*#(?:en|th)"/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-label="Developing"/);
  const active = createDocument(html).querySelector('a[aria-current="page"]');
  assert.equal(
    active?.querySelector("[data-current-page]")?.textContent,
    "Developing",
  );
  assert.equal(
    createDocument(html).querySelectorAll("[data-current-page]").length,
    1,
  );
  const document = createDocument(html);
  const socials = document.querySelector('[aria-label="Social links"]')!;
  assert.equal(socials.children.length, 6);
  assert.ok(
    socials.querySelector('a[href="https://www.last.fm/user/iqrfumi"]'),
  );
  for (const name of [
    "Discord",
    "GitHub",
    "Last.fm",
    "Instagram",
    "NameMC",
    "Mail",
  ]) {
    assert.ok(socials.querySelector(`[aria-label^="${name} "]`));
  }
  assert.ok(
    document.querySelector(
      'button[aria-controls="site-language-controls"][aria-expanded="true"]',
    ),
  );
  assert.ok(html.includes('href="https://github.com/rnnve"'));
  assert.ok(html.includes('href="https://haunt.gg/rnn"'));
});

test("shared buttons continue to support links", () => {
  const link = renderToStaticMarkup(
    <Button asChild>
      <a href="/ask">Ask</a>
    </Button>,
  );
  assert.match(link, /^<a /);
  assert.match(link, /href="\/ask"/);
  assert.doesNotMatch(link, /<button/);
});

test("the top navigation shows the home page label on the root route", () => {
  const html = renderToStaticMarkup(
    <PathnameContext.Provider value="/">
      <SiteSettingsProvider>
        <PortfolioNavbar />
      </SiteSettingsProvider>
    </PathnameContext.Provider>,
  );
  const active = createDocument(html).querySelector('a[aria-current="page"]');
  assert.equal(active?.getAttribute("href"), "/");
  assert.equal(
    active?.querySelector("[data-current-page]")?.textContent,
    "Home",
  );
});
