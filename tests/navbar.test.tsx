import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import { Header } from "../components/ui/header-2";
import { Button } from "../components/ui/button";
import { MenuToggleIcon } from "../components/ui/menu-toggle-icon";

test("header preserves portfolio routes, language hashes, and the active page", () => {
  const html = renderToStaticMarkup(
    <PathnameContext.Provider value="/developing">
      <SiteSettingsProvider>
        <Header />
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
  assert.match(html, /aria-label="Open menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="mobile-navigation"/);
  assert.match(html, /<dialog[^>]*id="mobile-navigation"/);
  assert.doesNotMatch(html, /<dialog[^>]*\sopen(?:=|\s|>)/);
  assert.ok(html.includes('href="https://github.com/rnnve"'));
  assert.ok(html.includes('href="https://haunt.gg/rnn"'));
});

test("slotted buttons remain links and the menu icon reflects its state", () => {
  const link = renderToStaticMarkup(
    <Button asChild variant="outline">
      <a href="/ask">Ask</a>
    </Button>,
  );
  assert.match(link, /^<a /);
  assert.match(link, /href="\/ask"/);
  assert.doesNotMatch(link, /<button/);
  const closed = renderToStaticMarkup(<MenuToggleIcon open={false} />);
  const open = renderToStaticMarkup(<MenuToggleIcon open />);
  assert.doesNotMatch(closed, /rotate\(/);
  assert.match(open, /rotate\(45deg\)/);
  assert.match(open, /rotate\(-45deg\)/);
});
