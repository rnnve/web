import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeSpotify, spotifyPageUrl } from "../app/lib/spotify";
import { normalizeRepos, activityCells } from "../app/lib/github";
import { createStatusHandler } from "../app/lib/status-handler";
import { GET as getSpotifyStatus } from "../app/api/status/spotify/route";

test("Spotify handles absent or malformed data with an idle view", () => {
  for (const input of [null, undefined, [], "unexpected"]) {
    const view = normalizeSpotify(input);
    assert.equal(view.isPlaying, false);
    assert.equal(view.title, "Nothing is playing");
    assert.equal(view.artist, "");
    assert.equal(view.progress, 0);
    assert.equal(view.duration, 0);
  }
});

test("Spotify supports nested tracks and mixed artist formats", () => {
  assert.deepEqual(
    normalizeSpotify({
      is_playing: true,
      progress_ms: 15_000,
      item: {
        name: "Track",
        duration_ms: 180_000,
        artists: [{ name: "First" }, "Second", null],
        album: {
          name: "Album",
          images: [{ url: "https://example.com/art.webp" }],
        },
        external_urls: { spotify: "https://example.com/song" },
      },
    }),
    {
      isPlaying: true,
      title: "Track",
      artist: "First, Second",
      primaryArtist: "First",
      album: "Album",
      artwork: "https://example.com/art.webp",
      progress: 15_000,
      duration: 180_000,
      url: "https://example.com/song",
      device: null,
    },
  );
});

test("Spotify supports the v2 response envelope and playback device", () => {
  assert.deepEqual(
    normalizeSpotify({
      success: true,
      data: {
        isPlaying: true,
        progressMs: 15_000,
        track: {
          name: "Track",
          artist: "Artist",
          album: "Album",
          cover: "https://example.com/cover.webp",
          durationMs: 180_000,
          url: "https://open.spotify.com/track/example",
        },
        device: { name: "iPad", type: "Tablet", volumePercent: 100 },
      },
    }),
    {
      isPlaying: true,
      title: "Track",
      artist: "Artist",
      primaryArtist: "Artist",
      album: "Album",
      artwork: "https://example.com/cover.webp",
      progress: 15_000,
      duration: 180_000,
      url: "https://open.spotify.com/track/example",
      device: { name: "iPad", type: "Tablet" },
    },
  );
});

test("Spotify preserves provider key priority and ignores non-finite progress", () => {
  const view = normalizeSpotify({
    playing: true,
    track: { title: "Preferred", duration: 100 },
    item: { name: "Other" },
    artist: "Artist",
    albumImageUrl: "preferred.webp",
    artwork: "other.webp",
    progressMs: Infinity,
    progress_ms: 20,
  });
  assert.equal(view.title, "Preferred");
  assert.equal(view.artist, "Artist");
  assert.equal(view.artwork, "preferred.webp");
  assert.equal(view.progress, 20);
});

test("Spotify display uses the first artist without changing lyrics metadata", () => {
  const view = normalizeSpotify({
    isPlaying: true,
    track: {
      name: "Song",
      artists: [{ name: "Tyler, The Creator" }, { name: "Featured artist" }],
    },
  });
  assert.equal(view.primaryArtist, "Tyler, The Creator");
  assert.equal(view.artist, "Tyler, The Creator, Featured artist");
  const japanese = normalizeSpotify({
    isPlaying: true,
    track: { artist: "25時、ナイトコードで。, 初音ミク" },
  });
  assert.equal(japanese.primaryArtist, "25時、ナイトコードで。");
});

test("Spotify keeps the first artist's canonical link or derives it from an ID", () => {
  const linked = normalizeSpotify({
    isPlaying: true,
    track: {
      artists: [
        {
          name: "First",
          external_urls: { spotify: "https://open.spotify.com/artist/first" },
        },
        { name: "Second", id: "second" },
      ],
    },
  });
  assert.equal(
    linked.primaryArtistUrl,
    "https://open.spotify.com/artist/first",
  );
  const identified = normalizeSpotify({
    isPlaying: true,
    track: { artists: [{ name: "First", id: "first" }] },
  });
  assert.equal(
    identified.primaryArtistUrl,
    "https://open.spotify.com/artist/first",
  );
});

test("Spotify links prefer canonical destinations and search when links are missing", () => {
  assert.equal(
    spotifyPageUrl("https://open.spotify.com/track/song", "Song"),
    "https://open.spotify.com/track/song",
  );
  for (const url of [
    undefined,
    "",
    "javascript:alert(1)",
    "https://example.com/song",
  ])
    assert.equal(
      spotifyPageUrl(url, "First artist"),
      "https://open.spotify.com/search/First%20artist",
    );
});

test("Repository selection follows configured order, excluding forks and invalid entries", () => {
  const repos = normalizeRepos([
    null,
    { name: "api", fork: true },
    { name: "unlisted" },
    { name: "WEB", stargazers_count: 3 },
    { name: "rnnve", description: "Profile" },
  ]);
  assert.deepEqual(
    repos.map((repo) => repo.name),
    ["rnnve", "WEB"],
  );
  assert.equal(repos[1].stars, 3);
  assert.deepEqual(normalizeRepos(null), []);
});

test("Contribution calendar uses the current UTC year with aligned week columns", () => {
  const now = new Date("2026-11-19T00:00:00Z");
  const cells = activityCells(
    [
      { date: "2026-01-01", count: 5, level: 3 },
      { date: "2025-12-31", count: 100, level: 4 },
      { date: "2026-12-31", count: 100, level: 4 },
      { date: "2026-05-01", count: -2, level: 1 },
      null,
      {},
    ],
    now,
  );
  assert.equal(cells.length % 7, 0);
  assert.equal(new Date(cells[0].key).getUTCDay(), 0);
  assert.equal(cells.filter((cell) => cell.inYear).length, 365);
  assert.equal(cells.find((cell) => cell.key === "2026-01-01")?.count, 5);
  assert.equal(cells.find((cell) => cell.key === "2026-01-01")?.level, 4);
  assert.equal(cells.find((cell) => cell.key === "2026-12-31")?.future, true);
  assert.equal(
    cells.reduce((sum, cell) => sum + cell.count, 0),
    5,
  );
});

test("Contribution colors follow daily counts even when provider levels are identical", () => {
  const cells = activityCells(
    [1, 3, 5, 8].map((count, index) => ({
      date: `2026-01-0${index + 1}`,
      count,
      level: 0,
    })),
    new Date("2026-11-19T00:00:00Z"),
  );
  assert.deepEqual(
    cells.filter((cell) => cell.count > 0).map((cell) => cell.level),
    [1, 2, 3, 4],
  );
  assert.ok(
    cells.filter((cell) => cell.count === 0).every((cell) => cell.level === 0),
  );
});

test("Contribution calendar handles leap years and New Year without carrying old data", () => {
  const leap = activityCells(null, new Date("2024-12-31T23:59:59Z"));
  assert.equal(leap.filter((cell) => cell.inYear).length, 366);
  assert.ok(leap.some((cell) => cell.key === "2024-02-29"));
  const next = activityCells(
    [{ date: "2024-12-31", count: 10, level: 4 }],
    new Date("2025-01-01T00:00:00Z"),
  );
  assert.equal(next.filter((cell) => cell.inYear).length, 365);
  assert.equal(next.find((cell) => cell.inYear)?.key, "2025-01-01");
  assert.equal(
    next.reduce((sum, cell) => sum + cell.count, 0),
    0,
  );
});

test("Status handlers cache successes and keep service fallbacks separate", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ username: "example" }),
  );
  context.mock.method(console, "error", () => {});
  const discord = createStatusHandler({
    name: "Discord",
    key: "discord",
    url: "https://example.com/discord",
    freshSeconds: 15,
  });
  const spotify = createStatusHandler({
    name: "Spotify",
    key: "spotify",
    url: "https://example.com/spotify",
    freshSeconds: 5,
  });

  const success = await discord();
  assert.match(success.headers.get("Cache-Control") ?? "", /s-maxage=15/);
  assert.deepEqual((await success.json()).discord, { username: "example" });
  const options = fetchMock.mock.calls[0].arguments[1] as RequestInit & {
    next: { revalidate: number };
  };
  assert.equal(options.cache, "force-cache");
  assert.equal(options.next.revalidate, 15);

  fetchMock.mock.mockImplementation(async () => {
    throw new Error("offline");
  });
  const fallbackResponse = await discord();
  assert.equal(
    fallbackResponse.headers.get("Cache-Control"),
    "no-store, max-age=0",
  );
  const fallback = await fallbackResponse.json();
  assert.deepEqual(fallback.discord, { username: "example" });
  assert.equal(fallback.error, null);

  const unavailable = await (await spotify()).json();
  assert.equal(unavailable.spotify, null);
  assert.equal(unavailable.error, "Spotify status is temporarily unavailable");
  // Failed upstream requests are no longer retried on the response path.
  assert.equal(fetchMock.mock.calls.length, 3);
});

test("Concurrent status requests share one upstream request", async (context) => {
  let finish!: (response: Response) => void;
  const upstream = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  const fetchMock = context.mock.method(globalThis, "fetch", () => upstream);
  const handler = createStatusHandler({
    name: "Spotify",
    key: "spotify",
    url: "https://example.com/spotify",
    freshSeconds: 5,
  });
  const first = handler();
  const second = handler();
  assert.equal(fetchMock.mock.calls.length, 1);
  finish(Response.json({ playing: true }));
  const responses = await Promise.all([first, second]);
  assert.deepEqual(await responses[0].json(), await responses[1].json());
});

test("A null upstream value does not overwrite the previous fallback", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ playing: true }),
  );
  context.mock.method(console, "error", () => {});
  const handler = createStatusHandler({
    name: "Spotify",
    key: "spotify",
    freshSeconds: 5,
    url: "https://example.com/spotify",
  });
  await handler();
  fetchMock.mock.mockImplementation(async () => Response.json(null));
  assert.equal((await (await handler()).json()).spotify, null);
  fetchMock.mock.mockImplementation(async () => {
    throw new Error("offline");
  });
  assert.deepEqual((await (await handler()).json()).spotify, { playing: true });
});

test("Live Spotify responses pick up each song change without data or CDN caching", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ isPlaying: true, title: "First song" }),
  );
  const handler = getSpotifyStatus;
  const first = await handler();
  assert.equal((await first.json()).spotify.title, "First song");
  fetchMock.mock.mockImplementation(async () =>
    Response.json({ isPlaying: true, title: "Next song" }),
  );
  const next = await handler();
  assert.equal((await next.json()).spotify.title, "Next song");
  assert.equal(next.headers.get("Cache-Control"), "no-store, max-age=0");
  assert.equal(fetchMock.mock.calls.length, 2);
  for (const call of fetchMock.mock.calls) {
    const options = call.arguments[1] as RequestInit & { next?: unknown };
    assert.equal(options.cache, "no-store");
    assert.equal(options.next, undefined);
    assert.equal(new Headers(options.headers).get("Cache-Control"), "no-cache");
    assert.equal(call.arguments[0], "https://api.rynni.cc/api/v2/spotify");
  }
});

test("Paused Spotify responses clear the previous track's details", () => {
  for (const playbackState of [
    { isPlaying: false },
    { is_playing: false },
    { playing: false },
  ]) {
    const view = normalizeSpotify({
      ...playbackState,
      track: {
        name: "Previous song",
        artists: [{ name: "Previous artist" }],
        duration_ms: 180_000,
        album: { images: [{ url: "old-artwork.webp" }] },
      },
      progress_ms: 45_000,
    });
    assert.deepEqual(view, {
      isPlaying: false,
      title: "Nothing is playing",
      artist: "",
      album: "",
      artwork: "",
      progress: 0,
      duration: 0,
      url: "",
      device: null,
    });
  }
});
