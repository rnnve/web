import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeSpotify } from "../app/lib/spotify";
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
      album: "Album",
      artwork: "https://example.com/art.webp",
      progress: 15_000,
      duration: 180_000,
      url: "https://example.com/song",
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

test("Activity graph aggregates event weights into 42 weeks", () => {
  const empty = activityCells(null);
  const day = empty[100].key;
  const cells = activityCells([
    { created_at: `${day}T12:00:00Z`, type: "PushEvent", payload: { size: 3 } },
    { created_at: `${day}T13:00:00Z`, type: "PushEvent", payload: { size: 0 } },
    { created_at: `${day}T14:00:00Z`, type: "WatchEvent" },
    null,
    {},
  ]);
  assert.equal(cells.length, 42 * 7);
  assert.deepEqual(cells[100], { key: day, count: 5, level: 3 });
  assert.equal(
    cells.reduce((sum, cell) => sum + cell.count, 0),
    5,
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
    });
  }
});
