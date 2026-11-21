import assert from "node:assert/strict";
import { test } from "node:test";
import { selectLyricsMatch, lyricsKey } from "../app/lib/lyrics-match";
import { GET } from "../app/api/lyrics/route";

const record = {
  id: 123,
  trackName: "รักเธอ",
  artistName: "ศิลปิน",
  albumName: "Single",
  duration: 180,
  instrumental: false,
  plainLyrics: "รักเธอเสมอ",
  syncedLyrics: "[00:01.00]รักเธอเสมอ",
};

test("multilingual matching preserves Thai marks and accepts bilingual titles and Unicode forms", () => {
  const signature = {
    title: "รักเธอ (Love You)",
    artist: "ศิลปิน, Guest",
    album: "Other release",
    duration: 181,
  };
  assert.equal(selectLyricsMatch([record], signature)?.id, 123);
  assert.equal(lyricsKey("Ｃａｆé"), lyricsKey("Cafe\u0301"));
  assert.notEqual(lyricsKey("มา"), lyricsKey("ม้า"));
  assert.equal(
    selectLyricsMatch(
      [{ ...record, trackName: "夜に駆ける", artistName: "YOASOBI" }],
      {
        title: "夜に駆ける (Yoru ni Kakeru)",
        artist: "YOASOBI",
        duration: 180,
      },
    )?.id,
    123,
  );
});

test("search rejects wrong artists, versions, durations, and empty lyrics", () => {
  const signature = { title: "รักเธอ", artist: "ศิลปิน", duration: 180 };
  for (const changed of [
    { artistName: "Cover Artist" },
    { trackName: "รักเธอ (Remix)" },
    { duration: 190 },
    { plainLyrics: null, syncedLyrics: null },
  ])
    assert.equal(
      selectLyricsMatch([{ ...record, ...changed }], signature),
      null,
    );
  assert.equal(
    selectLyricsMatch(
      [{ ...record, id: 1, syncedLyrics: null }, record],
      signature,
    )?.id,
    123,
  );
});

test("endpoint searches after missing or empty exact lyrics and keeps original Thai text", async (context) => {
  const savedEmail = process.env.LRC_RED_CONTACT_EMAIL;
  delete process.env.LRC_RED_CONTACT_EMAIL;
  context.after(() => {
    if (savedEmail === undefined) delete process.env.LRC_RED_CONTACT_EMAIL;
    else process.env.LRC_RED_CONTACT_EMAIL = savedEmail;
  });
  let empty = false;
  const urls: URL[] = [];
  context.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request) => {
      const url = new URL(String(input));
      urls.push(url);
      if (url.pathname === "/api/get")
        return empty
          ? Response.json({ ...record, plainLyrics: null, syncedLyrics: null })
          : new Response(null, { status: 404 });
      assert.equal(url.searchParams.has("album_name"), false);
      assert.equal(url.searchParams.get("track_name"), "รักเธอ");
      return Response.json([record]);
    },
  );
  const params = new URLSearchParams({
    track_name: "รักเธอ (Love You)",
    artist_name: "ศิลปิน, Guest",
    album_name: "Different album",
    duration: "180",
  });
  for (empty of [false, true]) {
    const response = await GET(
      new Request(`https://example.com/api/lyrics?${params}`),
    );
    assert.equal(response.status, 200);
    const { lyrics } = await response.json();
    assert.equal(lyrics.syncedLyrics, record.syncedLyrics);
    assert.equal(lyrics.source, "lrclib");
  }
  assert.equal(urls.length, 4);
});

test("search throttling stops further lookups and preserves Retry-After", async (context) => {
  const saved = process.env.LRC_RED_CONTACT_EMAIL;
  delete process.env.LRC_RED_CONTACT_EMAIL;
  context.after(() => {
    if (saved === undefined) delete process.env.LRC_RED_CONTACT_EMAIL;
    else process.env.LRC_RED_CONTACT_EMAIL = saved;
  });
  const mock = context.mock.method(
    globalThis,
    "fetch",
    async (input: string | URL | Request) =>
      String(input).includes("/api/get?")
        ? new Response(null, { status: 404 })
        : new Response(null, { status: 429, headers: { "Retry-After": "90" } }),
  );
  const response = await GET(
    new Request(
      "https://example.com/api/lyrics?track_name=Song&artist_name=Artist",
    ),
  );
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "90");
  assert.equal(mock.mock.calls.length, 2);
});
