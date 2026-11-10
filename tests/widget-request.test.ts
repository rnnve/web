import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
  readWidgetSnapshot,
  requestWidget,
  subscribeWidget,
} from "../app/lib/widget-request";

function installStorage(context: TestContext) {
  const entries = new Map<string, string>();
  context.mock.method(globalThis, "fetch", async () => Response.json({}));
  const previous = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });
  context.after(() => {
    if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  });
  return entries;
}

test("shared widget results reach subscribers and stop after unsubscribe", async (context) => {
  installStorage(context);
  const received: unknown[] = [];
  const unsubscribe = subscribeWidget("/test/subscribed", (data) =>
    received.push(data),
  );
  await requestWidget("/test/other");
  assert.equal(received.length, 0);
  await requestWidget("/test/subscribed");
  assert.deepEqual(received, [{}]);
  unsubscribe();
  await requestWidget("/test/subscribed");
  assert.equal(received.length, 1);
});

test("Overlapping browser loads share a request and save a return-visit snapshot", async (context) => {
  installStorage(context);
  let finish!: (response: Response) => void;
  const upstream = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const fetchMock = context.mock.method(globalThis, "fetch", () => upstream);
  const first = requestWidget("/test/widget");
  const second = requestWidget("/test/widget");
  assert.equal(first, second);
  assert.equal(fetchMock.mock.calls.length, 1);
  finish(Response.json({ discord: { username: "example" } }));
  await Promise.all([first, second]);
  assert.deepEqual(readWidgetSnapshot("/test/widget"), {
    discord: { username: "example" },
  });
});

test("Snapshot restore rejects expired and malformed storage", (context) => {
  const entries = installStorage(context);
  entries.set(
    "ryn:widget:/expired",
    JSON.stringify({ data: {}, savedAt: Date.now() - 300_001 }),
  );
  entries.set("ryn:widget:/malformed", "bad json");
  assert.equal(readWidgetSnapshot("/expired"), null);
  assert.equal(readWidgetSnapshot("/malformed"), null);
  assert.equal(readWidgetSnapshot("/absent"), null);
});

test("Errors preserve the snapshot and a failed request can be retried", async (context) => {
  const entries = installStorage(context);
  entries.set(
    "ryn:widget:/test/errors",
    JSON.stringify({ data: { discord: "saved" }, savedAt: Date.now() }),
  );
  const fetchMock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ discord: null, error: "unavailable" }),
  );
  await requestWidget("/test/errors");
  assert.deepEqual(readWidgetSnapshot("/test/errors"), { discord: "saved" });
  fetchMock.mock.mockImplementation(
    async () => new Response(null, { status: 500 }),
  );
  await assert.rejects(requestWidget("/test/errors"));
  fetchMock.mock.mockImplementation(async () =>
    Response.json({ discord: "recovered" }),
  );
  await requestWidget("/test/errors");
  assert.deepEqual(readWidgetSnapshot("/test/errors"), {
    discord: "recovered",
  });
});

test("Live browser requests bypass caching while sharing in-flight polls", async (context) => {
  installStorage(context);
  let finish!: (response: Response) => void;
  const upstream = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const fetchMock = context.mock.method(globalThis, "fetch", () => upstream);
  const first = requestWidget("/test/live-spotify", { cache: "no-store" });
  const overlapping = requestWidget("/test/live-spotify", {
    cache: "no-store",
  });
  assert.equal(first, overlapping);
  assert.equal(fetchMock.mock.calls.length, 1);
  assert.equal(fetchMock.mock.calls[0].arguments[1]?.cache, "no-store");
  finish(Response.json({ spotify: { title: "First song" } }));
  await first;

  fetchMock.mock.mockImplementation(async () =>
    Response.json({ spotify: { title: "Next song" } }),
  );
  const next = await requestWidget<{ spotify: { title: string } }>(
    "/test/live-spotify",
    { cache: "no-store" },
  );
  assert.equal(fetchMock.mock.calls.length, 2);
  assert.equal(next.spotify.title, "Next song");
});
