import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import PortfolioNavbar from "../app/components/layout/portfolio-navbar";
import { Button } from "../components/ui/button";
import {
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "../components/ui/resizable-navbar";

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
  assert.match(html, /aria-label="Open menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="mobile-navigation"/);
  assert.doesNotMatch(html, /id="mobile-navigation"/);
  assert.ok(html.includes('href="https://github.com/rnnve"'));
  assert.ok(html.includes('href="https://haunt.gg/rnn"'));
});

test("navbar actions keep link and button semantics", () => {
  const link = renderToStaticMarkup(
    <NavbarButton href="/ask">Ask</NavbarButton>,
  );
  assert.match(link, /^<a /);
  assert.match(link, /href="\/ask"/);
  assert.doesNotMatch(link, /<button/);
  const toggle = renderToStaticMarkup(
    <MobileNavToggle
      isOpen
      onClick={() => {}}
      label="Close menu"
      controls="mobile-navigation"
    />,
  );
  assert.match(toggle, /^<button /);
  assert.match(toggle, /type="button"/);
  assert.match(toggle, /aria-expanded="true"/);
  assert.match(toggle, /aria-label="Close menu"/);
  const button = renderToStaticMarkup(
    <NavbarButton as="button" type="button">
      Action
    </NavbarButton>,
  );
  assert.match(button, /^<button /);
  const slottedLink = renderToStaticMarkup(
    <Button asChild>
      <a href="/ask">Ask</a>
    </Button>,
  );
  assert.match(slottedLink, /^<a /);
});

test("mobile navigation exposes its content only while open", () => {
  const menu = (isOpen: boolean) =>
    renderToStaticMarkup(
      <MobileNavMenu id="mobile-navigation" isOpen={isOpen} onClose={() => {}}>
        <a href="/ask">Ask</a>
      </MobileNavMenu>,
    );
  assert.equal(menu(false), "");
  assert.match(menu(true), /id="mobile-navigation"/);
  assert.match(menu(true), /href="\/ask"/);
});
