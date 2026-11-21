import assert from "node:assert/strict";
import { test } from "node:test";
import { createWindow } from "@mixmark-io/domino";
import { act } from "react";
import ShapeGrid from "../app/components/effects/ShapeGrid";

test("ShapeGrid paints hover borders and fills in the accent and updates without replacing its canvas", async (context) => {
  const browser = createWindow(
    '<html><body><div id="root"></div></body></html>',
  );
  let frame: FrameRequestCallback = () => {};
  const strokes: string[] = [];
  const fills: string[] = [];
  const ctx = {
    strokeStyle: "",
    fillStyle: "",
    setTransform() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    rect() {},
    stroke() {
      strokes.push(this.strokeStyle);
    },
    fill() {
      fills.push(this.fillStyle);
    },
  };
  const createElement = browser.document.createElement.bind(browser.document);
  Object.defineProperty(browser.document, "createElement", {
    value: (name: string) => {
      const element = createElement(name);
      Object.defineProperties(element, {
        clientWidth: { value: 320 },
        clientHeight: { value: 240 },
        getBoundingClientRect: {
          value: () => ({ left: 0, top: 0, width: 320, height: 240 }),
        },
      });
      if (name === "canvas")
        Object.defineProperty(element, "getContext", { value: () => ctx });
      return element;
    },
  });
  Object.defineProperty(browser, "matchMedia", {
    value: () => ({ matches: false }),
  });
  let disconnected = 0;
  const globals = {
    window: browser,
    document: browser.document,
    navigator: { userAgent: "Test" },
    requestAnimationFrame(callback: FrameRequestCallback) {
      frame = callback;
      return 1;
    },
    cancelAnimationFrame() {},
    ResizeObserver: class {
      observe() {}
      disconnect() {
        disconnected++;
      }
    },
    IntersectionObserver: class {
      observe() {}
      disconnect() {
        disconnected++;
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
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    assert.equal(disconnected, 2, "both canvas observers are released");
  });
  const render = (color: string) =>
    root.render(
      <ShapeGrid
        shape="square"
        hoverColor={color}
        hoverFillColor={color}
        intro={false}
        direction="none"
        twinkle={0}
        glow={0}
        fade={0}
      />,
    );
  await act(async () => render("#62b5e5"));
  const canvas = browser.document.querySelector("canvas");
  frame(1000);
  assert.equal(fills.length, 0, "the resting grid has no hover fills");
  const event = new browser.Event("pointermove");
  Object.defineProperties(event, {
    clientX: { value: 160 },
    clientY: { value: 120 },
  });
  browser.dispatchEvent(event);
  for (let time = 1016; time < 1320; time += 16) frame(time);
  assert.ok(
    strokes.includes("#62b5e5"),
    "pointer movement highlights cell borders",
  );
  assert.ok(
    fills.includes("#62b5e5"),
    "pointer movement fills cells with the same accent",
  );
  strokes.length = 0;
  fills.length = 0;
  await act(async () => render("#e4405f"));
  assert.equal(browser.document.querySelector("canvas"), canvas);
  assert.ok(strokes.includes("#e4405f"));
  assert.ok(fills.includes("#e4405f"));
});
