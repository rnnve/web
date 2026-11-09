import assert from "node:assert/strict";
import { test } from "node:test";
import { activeLyricIndex, parseSyncedLyrics } from "../app/lib/lyrics";
import { GET } from "../app/api/lyrics/route";

test("LRC supports fractions, repeated timestamps, offsets, and silent intervals", () => {
  const lines = parseSyncedLyrics(
    "[ar:Artist]\n[offset:100]\n[00:03.123]Last\n[00:01.2][00:02.34]Repeated\n[00:02.50]\n[00:99.00]Invalid",
  );
  assert.deepEqual(lines, [
    { time: 1100, text: "Repeated" },
    { time: 2240, text: "Repeated" },
    { time: 2400, text: "" },
    { time: 3023, text: "Last" },
  ]);
  assert.equal(activeLyricIndex(lines, 1099), -1);
  assert.equal(activeLyricIndex(lines, 1100), 0);
  assert.equal(activeLyricIndex(lines, 2500), 2);
  assert.equal(activeLyricIndex(lines, 3100), 3);
  // Seeking backward selects the earlier line again.
  assert.equal(activeLyricIndex(lines, 1500), 0);
  assert.deepEqual(parseSyncedLyrics("Plain lyrics\n[ti:Title]"), []);
  assert.equal(activeLyricIndex([], 0), -1);
});

test("Lyrics endpoint validates input before contacting LRCLIB", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );
  for (const query of [
    "",
    "track_name=Song",
    "track_name=Song&artist_name=Artist&duration=NaN",
    "track_name=Song&artist_name=Artist&duration=0",
    "track_name=Song&artist_name=Artist&duration=3601",
  ]) {
    const result = await GET(
      new Request(`https://example.com/api/lyrics?${query}`),
    );
    assert.equal(result.status, 400);
  }
  assert.equal(mock.mock.calls.length, 0);
});

test("Lyrics endpoint sends the track signature and identifies the client", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({
      id: 1,
      instrumental: false,
      plainLyrics: "Words",
      syncedLyrics: "[00:01.00]Words",
      lyricsfile: "unused",
    }),
  );
  const result = await GET(
    new Request(
      "https://example.com/api/lyrics?track_name=Song&artist_name=Artist&album_name=Album&duration=180",
    ),
  );
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), {
    lyrics: {
      id: 1,
      instrumental: false,
      plainLyrics: "Words",
      syncedLyrics: "[00:01.00]Words",
    },
  });
  const call = mock.mock.calls[0].arguments as unknown as [
    string,
    RequestInit & { next: { revalidate: number } },
  ];
  const url = new URL(call[0]);
  assert.equal(url.origin, "https://lrclib.net");
  assert.equal(url.searchParams.get("duration"), "180");
  assert.equal(url.searchParams.get("album_name"), "Album");
  assert.match(
    new Headers(call[1].headers).get("User-Agent") ?? "",
    /RynLyrics/,
  );
  assert.equal(call[1].next.revalidate, 86400);
});

test("Lyrics endpoint handles missing, instrumental, throttled, and malformed records", async (context) => {
  const mock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 404 }),
  );
  const request = () =>
    new Request(
      "https://example.com/api/lyrics?track_name=Song&artist_name=Artist",
    );
  assert.deepEqual(await (await GET(request())).json(), { lyrics: null });
  mock.mock.mockImplementation(async () =>
    Response.json({ id: 2, instrumental: true }),
  );
  assert.deepEqual(await (await GET(request())).json(), {
    lyrics: {
      id: 2,
      instrumental: true,
      plainLyrics: null,
      syncedLyrics: null,
    },
  });
  for (const status of [429, 503]) {
    mock.mock.mockImplementation(
      async () =>
        new Response("busy", { status, headers: { "Retry-After": "120" } }),
    );
    const response = await GET(request());
    assert.equal(response.status, status);
    assert.equal(response.headers.get("Retry-After"), "120");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
  mock.mock.mockImplementation(async () => Response.json({ unexpected: true }));
  assert.equal((await GET(request())).status, 502);
  mock.mock.mockImplementation(async () => {
    throw new Error("offline");
  });
  assert.equal((await GET(request())).status, 502);
});
