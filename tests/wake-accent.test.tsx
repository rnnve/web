import assert from "node:assert/strict";
import { test } from "node:test";
import { createWindow } from "@mixmark-io/domino";
import { act } from "react";
import WakeGlyph from "../components/ui/background-ascii-wake";

for (const reduced of [true, false]) {
  test(`the stars and pointer trail follow the accent with reduced motion ${reduced}`, async (context) => {
    const browser = createWindow(
      '<html><body><div id="root"></div></body></html>',
    );
    let color = "#ededed";
    let onAccentChange = () => {};
    let attributes: string[] = [];
    let disconnected = false;
    let resizes = 0;
    const ink: string[] = [];
    const cells = new Map<string, string>();
    let frame: FrameRequestCallback = () => {};
    const canvasContext = {
      fillStyle: "",
      setTransform() {
        resizes++;
      },
      clearRect() {
        cells.clear();
      },
      fillText(text: string, x: number, y: number) {
        ink.push(this.fillStyle);
        cells.set(`${x},${y}`, text);
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
            value: () => ({ left: 0, top: 0, width: 480, height: 480 }),
          });
        }
        return element;
      },
    });
    Object.defineProperty(browser, "matchMedia", {
      value: () => ({ matches: reduced }),
    });
    const globals = {
      window: browser,
      document: browser.document,
      navigator: { userAgent: "Test" },
      getComputedStyle: () => ({ color, getPropertyValue: () => "monospace" }),
      requestAnimationFrame(callback: FrameRequestCallback) {
        frame = callback;
        return 1;
      },
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
    if (!reduced) frame(1000);
    const ambient = new Map(cells);
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
    if (!reduced) frame(1016);
    assert.ok(ink.length > 0, "the canvas redraws on accent changes");
    assert.ok(ink.every((value) => value === color));
    assert.equal(resizes, 1, "accent changes preserve the existing field");
    const move = (x: number) => {
      const event = new browser.Event("pointermove", { bubbles: true });
      Object.defineProperties(event, {
        clientX: { value: x },
        clientY: { value: 120 },
      });
      browser.dispatchEvent(event);
    };
    move(12);
    move(240);
    if (reduced) {
      assert.deepEqual(
        cells,
        ambient,
        "reduced motion keeps only ambient stars",
      );
    } else {
      frame(1032);
      const trailCells = () =>
        [...cells].filter(([key, value]) => {
          const [x, y] = key.split(",").map(Number);
          return (
            x >= 48 &&
            x <= 240 &&
            y >= 102 &&
            y <= 138 &&
            ambient.get(key) !== value
          );
        });
      assert.ok(
        trailCells().length > 10,
        "fast movement along grid boundaries must produce a continuous visible trail",
      );
      for (let time = 1048; time <= 1128; time += 16) frame(time);
      assert.ok(
        trailCells().length > 0,
        "the trail lasts long enough to be seen",
      );
      for (let time = 1144; time <= 3144; time += 16) frame(time);
      assert.deepEqual(
        cells,
        ambient,
        "the trail fades back to the original stars",
      );
    }
  });
}
