import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearListenSnapshots,
  loadListenSnapshot,
  readListenSnapshot,
} from "../app/lib/listen-cache";
const data = {
  current: null,
  recent: [],
  topTracks: [],
  topArtists: [],
  profile: null,
  unavailable: [],
};

test("Listening loads once per period, deduplicates mounts and refreshes explicitly", async (context) => {
  clearListenSnapshots();
  let finish!: (response: Response) => void;
  const upstream = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const fetch = context.mock.method(globalThis, "fetch", () => upstream);
  const one = loadListenSnapshot("/api/listen?period=7day");
  const two = loadListenSnapshot("/api/listen?period=7day");
  assert.equal(one, two);
  finish(Response.json(data));
  await one;
  await loadListenSnapshot("/api/listen?period=7day");
  assert.equal(fetch.mock.calls.length, 1);
  clearListenSnapshots();
  fetch.mock.mockImplementation(async () => Response.json(data));
  await loadListenSnapshot("/api/listen?period=7day");
  assert.equal(fetch.mock.calls.length, 2);
  clearListenSnapshots();
});

test("Listening restores a tab snapshot without a fetch and retries failed requests", async (context) => {
  const previous = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  const entries = new Map([["ryn:listen:v1:/restored", JSON.stringify(data)]]);
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
      removeItem: (key: string) => entries.delete(key),
      key: (index: number) => [...entries.keys()][index] ?? null,
      get length() {
        return entries.size;
      },
    },
  });
  context.after(() => {
    clearListenSnapshots();
    if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  });
  const fetch = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  );
  assert.deepEqual(await loadListenSnapshot("/restored"), data);
  assert.equal(fetch.mock.calls.length, 0);
  await assert.rejects(loadListenSnapshot("/failed"));
  assert.equal(readListenSnapshot("/failed"), null);
  fetch.mock.mockImplementation(async () => Response.json(data));
  assert.deepEqual(await loadListenSnapshot("/failed"), data);
  clearListenSnapshots();
  assert.equal(entries.size, 0);
});
