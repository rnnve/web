import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLyricsRequester,
  LyricsRequestError,
} from "../app/lib/lyrics-request";

test("overlapping lyric views share a request and cached track data", async (context) => {
  const lyrics = {
    id: 1,
    instrumental: false,
    plainLyrics: "Words",
    syncedLyrics: null,
  };
  const mock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ lyrics }),
  );
  const request = createLyricsRequester();
  const first = request("track_name=Song");
  const second = request("track_name=Song");
  assert.equal(first, second);
  assert.deepEqual(await first, lyrics);
  assert.deepEqual(await request("track_name=Song"), lyrics);
  assert.equal(mock.mock.calls.length, 1);
});

test("missing lyrics expire and rate limits block subsequent requests until Retry-After", async (context) => {
  let now = 1_800_000_000_000;
  context.mock.method(Date, "now", () => now);
  const mock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ lyrics: null }),
  );
  const request = createLyricsRequester();
  assert.equal(await request("missing"), null);
  await request("missing");
  assert.equal(mock.mock.calls.length, 1);
  now += 300_001;
  await request("missing");
  assert.equal(mock.mock.calls.length, 2);
  mock.mock.mockImplementation(
    async () =>
      new Response("busy", { status: 429, headers: { "Retry-After": "120" } }),
  );
  await assert.rejects(
    request("limited"),
    (error) =>
      error instanceof LyricsRequestError && error.retryAt >= now + 120_000,
  );
  const count = mock.mock.calls.length;
  await assert.rejects(request("different song"), LyricsRequestError);
  assert.equal(mock.mock.calls.length, count);
  now += 160_000;
  mock.mock.mockImplementation(async () => Response.json({ lyrics: null }));
  assert.equal(await request("limited"), null);
});
