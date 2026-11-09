import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchLrcRedLyrics, selectLrcRedMatch } from "../app/lib/lrc-red";
import { GET } from "../app/api/lyrics/route";

const isrc = "USUM71210662";
const hit = {
  isrc,
  title: "Clarity (feat. Foxes)",
  artist: "Zedd",
  album: "Clarity",
  duration: 271.427,
};
const signature = {
  title: "Clarity",
  artist: "Zedd, Foxes",
  album: "Clarity",
  duration: 271,
};

test("lrc.red matches the recording without accepting covers, remixes, or different durations", () => {
  assert.equal(selectLrcRedMatch({ hits: [hit] }, signature), isrc);
  for (const replacement of [
    { artist: "Another artist" },
    { title: "Clarity [Remix]" },
    { duration: 260 },
    { isrc: "../../path" },
  ]) {
    assert.equal(
      selectLrcRedMatch({ hits: [{ ...hit, ...replacement }] }, signature),
      null,
    );
  }
  const otherRelease = { ...hit, isrc: "AUEI11300025", album: "Other album" };
  assert.equal(
    selectLrcRedMatch({ hits: [otherRelease, hit] }, signature),
    isrc,
  );
  assert.equal(selectLrcRedMatch({ unexpected: true }, signature), null);
});

test("lookup order is Spicy Lyrics, lrc.red, then LRCLIB, with identified requests and rate-limit cooldown", async (context) => {
  const savedEmail = process.env.LRC_RED_CONTACT_EMAIL;
  const savedKey = process.env.SPICYLYRICS_API_KEY;
  process.env.LRC_RED_CONTACT_EMAIL = "contact@example.com";
  process.env.SPICYLYRICS_API_KEY = "test-server-secret";
  const urls: string[] = [];
  let mode: "spicy" | "red" | "missing" | "malformed" | "offline" | "limited" =
    "spicy";
  const mock = context.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request) => {
      const url = String(input);
      urls.push(url);
      if (url.startsWith("https://api.spicylyrics.org/")) {
        return mode === "spicy"
          ? Response.json({
              Body: {
                id: "1QV6tiMFM6fSOKOGLMHYYg",
                Type: "Static",
                source: "spotify",
                Lines: [{ Text: "Spicy words" }],
              },
            })
          : new Response(null, { status: 404 });
      }
      if (url.startsWith("https://lrc.red/")) {
        if (mode === "offline") throw new Error("offline");
        if (mode === "limited")
          return new Response("busy", {
            status: 429,
            headers: { "Retry-After": "120" },
          });
        if (url.includes("search.json"))
          return Response.json({ hits: mode === "missing" ? [] : [hit] });
        return new Response(
          mode === "malformed"
            ? "No timed lyrics"
            : "[00:01.00]First line\n[00:03.00]Second line",
        );
      }
      return Response.json({
        id: 1,
        instrumental: false,
        plainLyrics: "LRCLIB fallback",
      });
    },
  );
  const request = () =>
    new Request(
      "https://example.com/api/lyrics?track_name=Clarity&artist_name=Zedd%2C%20Foxes&album_name=Clarity&duration=271&spotify_id=1QV6tiMFM6fSOKOGLMHYYg",
    );
  try {
    assert.equal(
      (await (await GET(request())).json()).lyrics.source,
      "spotify",
    );
    assert.equal(
      urls.length,
      1,
      "successful Spicy Lyrics skips both fallbacks",
    );
    urls.length = 0;
    mode = "red";
    const red = await (await GET(request())).json();
    assert.equal(red.lyrics.source, "lrc_red");
    assert.equal(red.lyrics.id, isrc);
    assert.equal(
      red.lyrics.syncedLyrics,
      "[00:01.00]First line\n[00:03.00]Second line",
    );
    assert.deepEqual(
      urls.map((url) => new URL(url).hostname),
      ["api.spicylyrics.org", "lrc.red", "lrc.red"],
    );
    assert.equal(new URL(urls[1]).searchParams.get("q"), "Clarity Zedd");
    for (const call of mock.mock.calls) {
      const [input, options] = call.arguments as unknown as [
        string,
        RequestInit,
      ];
      if (!input.startsWith("https://lrc.red/")) continue;
      const headers = new Headers(options.headers);
      assert.match(
        headers.get("User-Agent") ?? "",
        /RynLyrics.*https:\/\/rynni.cc.*contact@example.com/,
      );
      assert.equal(
        headers.has("Authorization"),
        false,
        "Spicy Lyrics key is never forwarded",
      );
    }
    for (const failure of [
      "missing",
      "malformed",
      "offline",
      "limited",
    ] as const) {
      mode = failure;
      urls.length = 0;
      assert.equal(
        (await (await GET(request())).json()).lyrics.plainLyrics,
        "LRCLIB fallback",
      );
      assert.equal(new URL(urls[0]).hostname, "api.spicylyrics.org");
      assert.equal(new URL(urls[1]).hostname, "lrc.red");
      assert.equal(new URL(urls.at(-1)!).hostname, "lrclib.net");
    }
    urls.length = 0;
    await GET(request());
    assert.deepEqual(
      urls.map((url) => new URL(url).hostname),
      ["api.spicylyrics.org", "lrclib.net"],
      "cooldown skips lrc.red without blocking LRCLIB",
    );
    delete process.env.LRC_RED_CONTACT_EMAIL;
    urls.length = 0;
    assert.equal(await fetchLrcRedLyrics(signature), null);
    assert.equal(urls.length, 0);
  } finally {
    if (savedEmail === undefined) delete process.env.LRC_RED_CONTACT_EMAIL;
    else process.env.LRC_RED_CONTACT_EMAIL = savedEmail;
    if (savedKey === undefined) delete process.env.SPICYLYRICS_API_KEY;
    else process.env.SPICYLYRICS_API_KEY = savedKey;
  }
});
