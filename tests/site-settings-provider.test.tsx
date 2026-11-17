import assert from "node:assert/strict";
import { test } from "node:test";
import { createWindow } from "@mixmark-io/domino";
import { act } from "react";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import LanguageSwitcher from "../app/components/settings/language-switcher";
import LetterGlitch from "../app/components/effects/letter-glitch";
import { SETTINGS_KEY } from "../app/lib/site-settings";

test("locale detection, manual switching, and legacy URL cleanup work without WebGL", async (context) => {
  const browser = createWindow(
    '<!doctype html><html><body><div id="root"></div></body></html>',
  );
  const url = new URL("https://example.test/ask?source=test#th");
  const entries = new Map<string, string>();
  const navigator = {
    userAgent: "Test",
    languages: ["th-TH", "en-US"],
    language: "th-TH",
  };
  Object.defineProperty(browser, "location", { value: url });
  Object.defineProperty(browser, "history", {
    value: {
      state: { preserved: true },
      replaceState: (_state: unknown, _title: string, path: string) => {
        url.href = new URL(path, url).href;
      },
    },
  });
  Object.defineProperty(browser, "localStorage", {
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });
  const createElement = browser.document.createElement.bind(browser.document);
  Object.defineProperty(browser.document, "createElement", {
    value: (name: string) => {
      const element = createElement(name);
      if (name === "canvas")
        Object.defineProperty(element, "getContext", { value: () => null });
      return element;
    },
  });
  const globals = {
    window: browser,
    document: browser.document,
    navigator,
    Event: browser.Event,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previous = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, { configurable: true, value });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(browser.document.getElementById("root")!);
  context.after(async () => {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  await act(async () =>
    root.render(
      <SiteSettingsProvider>
        <LanguageSwitcher />
        <LetterGlitch />
      </SiteSettingsProvider>,
    ),
  );
  assert.equal(browser.document.documentElement.lang, "th");
  assert.equal(url.href, "https://example.test/ask?source=test");
  assert.equal(
    entries.has(SETTINGS_KEY),
    false,
    "automatic selection must not become an explicit preference",
  );
  assert.ok(browser.document.querySelector('canvas[aria-hidden="true"]'));
  const english = browser.document.querySelector('button[lang="en"]')!;
  await act(async () => {
    (english as HTMLButtonElement).click();
  });
  assert.equal(browser.document.documentElement.lang, "en");
  assert.equal(english.getAttribute("aria-pressed"), "true");
  assert.equal(JSON.parse(entries.get(SETTINGS_KEY)!).language, "en");
  assert.equal(url.hash, "");
  await act(async () => {
    browser.dispatchEvent(new browser.Event("languagechange"));
  });
  assert.equal(
    browser.document.documentElement.lang,
    "en",
    "manual selection overrides the browser locale",
  );
  const thai = browser.document.querySelector('button[lang="th"]')!;
  await act(async () => {
    (thai as HTMLButtonElement).click();
  });
  assert.equal(browser.document.documentElement.lang, "th");
  assert.equal(JSON.parse(entries.get(SETTINGS_KEY)!).language, "th");
  entries.clear();
  url.hash = "#work";
  await act(async () => {
    browser.dispatchEvent(new browser.Event("languagechange"));
  });
  assert.equal(browser.document.documentElement.lang, "th");
  assert.equal(url.hash, "#work", "section anchors are preserved");
});
