import assert from "node:assert/strict";
import { test } from "node:test";
import { createWindow } from "@mixmark-io/domino";
import { act } from "react";
import WakeGlyph from "../components/ui/background-ascii-wake";

test("the ambient stars follow live accent changes in reduced motion without rebuilding the canvas", async (context) => {
  const browser = createWindow(
    '<html><body><div id="root"></div></body></html>',
  );
  let color = "#ededed";
  let onAccentChange = () => {};
  let attributes: string[] = [];
  let disconnected = false;
  let resizes = 0;
  const ink: string[] = [];
  const canvasContext = {
    fillStyle: "",
    setTransform() {
      resizes++;
    },
    clearRect() {},
    fillText() {
      ink.push(this.fillStyle);
    },
  };
  const createElement = browser.document.createElement.bind(browser.document);
  Object.defineProperty(browser.document, "createElement", {
    value: (name: string) => {
      const element = createElement(name);
      if (name === "canvas") {
        Object.defineProperty(element, "getContext", {
          value: () => canvasContext,
        });
        Object.defineProperty(element, "getBoundingClientRect", {
          value: () => ({ width: 480, height: 480 }),
        });
      }
      return element;
    },
  });
  Object.defineProperty(browser, "matchMedia", {
    value: () => ({ matches: true }),
  });
  const globals = {
    window: browser,
    document: browser.document,
    navigator: { userAgent: "Test" },
    getComputedStyle: () => ({ color, getPropertyValue: () => "monospace" }),
    cancelAnimationFrame() {},
    MutationObserver: class {
      constructor(callback: () => void) {
        onAccentChange = callback;
      }
      observe(_target: unknown, options: MutationObserverInit) {
        attributes = options.attributeFilter ?? [];
      }
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
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(browser.document.getElementById("root")!);
  context.after(async () => {
    await act(async () => root.unmount());
    assert.equal(disconnected, true);
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  await act(async () => root.render(<WakeGlyph globalPointer />));
  assert.ok(
    browser.document
      .querySelector("canvas")
      ?.className.includes("text-[var(--site-accent)]"),
  );
  assert.ok(attributes.includes("style"));
  assert.ok(attributes.includes("class"));
  assert.ok(ink.length > 0, "ambient stars render without pointer movement");
  assert.ok(ink.every((value) => value === "#ededed"));
  ink.length = 0;
  color = "#62b5e5";
  onAccentChange();
  assert.ok(
    ink.length > 0,
    "a static reduced-motion canvas redraws on accent changes",
  );
  assert.ok(ink.every((value) => value === color));
  assert.equal(resizes, 1, "accent changes preserve the existing field");
});
