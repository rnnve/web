import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
  activeLyricIndex,
  lyricsQuery,
  parseSyncedLyrics,
  preparePreviewLyrics,
} from "../app/lib/lyrics";
import { normalizeSpotify } from "../app/lib/spotify";
import { GET } from "../app/api/lyrics/route";

function isolateLrclib(context: TestContext) {
  const saved = process.env.LRC_RED_CONTACT_EMAIL;
  delete process.env.LRC_RED_CONTACT_EMAIL;
  context.after(() => {
    if (saved === undefined) delete process.env.LRC_RED_CONTACT_EMAIL;
    else process.env.LRC_RED_CONTACT_EMAIL = saved;
  });
}

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

test("the preview preserves vocal end times and clears highlights in silent gaps", () => {
  const lines = preparePreviewLyrics([
    { time: 1000, endTime: 1500, text: "♪ First" },
    { time: 2000, text: "🎶" },
    { time: 3000, text: "" },
    { time: 4000, endTime: 4500, text: "Second ♫" },
  ]);
  const current = (ms: number) => lines[activeLyricIndex(lines, ms)]?.text;
  assert.equal(current(999), undefined);
  assert.equal(current(1000), "First");
  assert.equal(current(1499), "First");
  assert.equal(current(1500), undefined);
  assert.equal(current(3999), undefined);
  assert.equal(current(4000), "Second");
  assert.equal(current(4499), "Second");
  assert.equal(current(4500), undefined);
  assert.equal(current(8000), undefined);
  assert.equal(current(2000), undefined);
  assert.equal(current(1250), "First");
  assert.equal(lines[0].endTime, 1500);
});

test("the widget and full viewer use the same track signature without playback progress", () => {
  const track = normalizeSpotify({
    isPlaying: true,
    title: "Song",
    artist: "Artist",
    album: "Album",
    duration: 180_000,
    url: "https://open.spotify.com/track/1QV6tiMFM6fSOKOGLMHYYg",
    progress: 1000,
  });
  const query = lyricsQuery(track);
  assert.equal(lyricsQuery({ ...track, progress: 10_000 }), query);
  assert.equal(
    new URLSearchParams(query).get("spotify_id"),
    "1QV6tiMFM6fSOKOGLMHYYg",
  );
  assert.equal(new URLSearchParams(query).get("duration"), "180");
  assert.equal(lyricsQuery({ ...track, isPlaying: false }), "");
});

test("Lyrics endpoint validates input before contacting LRCLIB", async (context) => {
  isolateLrclib(context);
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
  isolateLrclib(context);
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
      source: "lrclib",
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
  isolateLrclib(context);
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
      source: "lrclib",
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

test("blank LRC markers end the preceding preview line without highlighting the silence", () => {
  const lines = preparePreviewLyrics(
    parseSyncedLyrics("[00:01.00]First\n[00:02.00]♫\n[00:04.00]Second"),
  );
  assert.equal(lines[0].endTime, 2000);
  assert.equal(activeLyricIndex(lines, 1999), 0);
  assert.equal(activeLyricIndex(lines, 2000), -1);
  assert.equal(activeLyricIndex(lines, 3999), -1);
  assert.equal(activeLyricIndex(lines, 4000), 1);
});

test("highlight grace lasts two seconds but never delays the next line", () => {
  const lines = [
    { time: 1000, endTime: 2000, text: "First" },
    { time: 6000, endTime: 7000, text: "Second" },
    { time: 8000, endTime: 8500, text: "Third" },
  ];
  assert.equal(activeLyricIndex(lines, 999, 2000), -1);
  assert.equal(activeLyricIndex(lines, 2000, 2000), 0);
  assert.equal(activeLyricIndex(lines, 3999, 2000), 0);
  assert.equal(activeLyricIndex(lines, 4000, 2000), -1);
  assert.equal(activeLyricIndex(lines, 5999, 2000), -1);
  assert.equal(activeLyricIndex(lines, 6000, 2000), 1);
  assert.equal(activeLyricIndex(lines, 7999, 2000), 1);
  assert.equal(activeLyricIndex(lines, 8000, 2000), 2);
  assert.equal(activeLyricIndex(lines, 10499, 2000), 2);
  assert.equal(activeLyricIndex(lines, 10500, 2000), -1);
  assert.equal(activeLyricIndex(lines, 1250, 2000), 0);
});
