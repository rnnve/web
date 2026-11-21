import assert from "node:assert/strict";
import { test } from "node:test";
import { createWindow } from "@mixmark-io/domino";
import { act } from "react";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import PortfolioNavbar from "../app/components/layout/portfolio-navbar";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import ShapeGrid from "../app/components/effects/ShapeGrid";
import { createRequire } from "node:module";

const { mock } = createRequire(import.meta.url)("bun:test");
import { SETTINGS_KEY } from "../app/lib/site-settings";

test("language controls, locale preferences, and ShapeGrid hover colors follow the site accent", async (context) => {
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
      Object.defineProperty(element, "getBoundingClientRect", {
        value: () => ({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 32,
          bottom: 32,
          width: 32,
          height: 32,
        }),
      });
      if (name === "canvas")
        Object.defineProperty(element, "getContext", { value: () => null });
      return element;
    },
  });
  let accentChanged = () => {};
  let disconnected = false;
  const globals = {
    window: browser,
    document: browser.document,
    navigator,
    Event: browser.Event,
    getComputedStyle: (element: HTMLElement) => element.style,
    MutationObserver: class {
      constructor(callback: () => void) {
        accentChanged = callback;
      }
      observe() {}
      disconnect() {
        disconnected = true;
      }
    },
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
  const originalShapeGrid = ShapeGrid;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(browser.document.getElementById("root")!);
  context.after(async () => {
    await act(async () => root.unmount());
    mock.module("../app/components/effects/ShapeGrid", () => ({
      default: originalShapeGrid,
    }));
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  await act(async () =>
    root.render(
      <SiteSettingsProvider>
        <PathnameContext.Provider value="/">
          <PortfolioNavbar />
        </PathnameContext.Provider>
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
  const toggle = browser.document.querySelector<HTMLButtonElement>(
    'button[aria-controls="site-language-controls"]',
  )!;
  const panel = browser.document.getElementById("site-language-controls")!;
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(panel.hidden, true);
  await act(async () => toggle.click());
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(panel.hidden, false);
  await act(async () => toggle.click());
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(panel.hidden, true);
  await act(async () => toggle.click());
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
  mock.module("../app/components/effects/ShapeGrid", () => ({
    default: ({
      hoverColor,
      hoverFillColor,
    }: {
      hoverColor: string;
      hoverFillColor: string;
    }) => <div data-palette={JSON.stringify([hoverColor, hoverFillColor])} />,
  }));
  const { default: SiteBackground } =
    await import("../app/components/layout/site-background");
  await act(async () => root.render(<SiteBackground />));
  const palette = () =>
    JSON.parse(
      browser.document
        .querySelector("[data-palette]")!
        .getAttribute("data-palette")!,
    );
  assert.deepEqual(palette(), ["#ededed", "#ededed"]);
  await act(async () => {
    browser.document.documentElement.style.setProperty(
      "--site-accent",
      "#ff0000",
    );
    accentChanged();
  });
  assert.deepEqual(palette(), ["#ff0000", "#ff0000"]);
  await act(async () => {
    browser.document.documentElement.style.removeProperty("--site-accent");
    accentChanged();
  });
  assert.deepEqual(palette(), ["#ededed", "#ededed"]);
  await act(async () => root.render(null));
  assert.equal(
    disconnected,
    true,
    "accent observer is disconnected on unmount",
  );
});
