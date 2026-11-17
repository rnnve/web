import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import PortfolioNavbar from "../app/components/layout/portfolio-navbar";
import { Button } from "../components/ui/button";

test("header preserves portfolio routes, language hashes, and the active page", () => {
  const html = renderToStaticMarkup(
    <PathnameContext.Provider value="/developing">
      <SiteSettingsProvider>
        <PortfolioNavbar />
      </SiteSettingsProvider>
    </PathnameContext.Provider>,
  );
  for (const path of ["/", "/developing", "/listen", "/birthday", "/ask"]) {
    assert.ok(html.includes(`href="${path}#en"`));
  }
  assert.match(
    html,
    /aria-current="page"[^>]*href="\/developing#en"|href="\/developing#en"[^>]*aria-current="page"/,
  );
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-label="Developing"/);
  assert.match(html, /--active-index:1/);
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
