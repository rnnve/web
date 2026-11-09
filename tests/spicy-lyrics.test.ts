import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeSpicyLyrics } from "../app/lib/spicy-lyrics";
import { activeLyricIndex, spotifyTrackId } from "../app/lib/lyrics";
import { GET } from "../app/api/lyrics/route";

const id = "1QV6tiMFM6fSOKOGLMHYYg";
const lineResponse = {
  Body: {
    id,
    Type: "Line",
    source: "spotify",
    Content: [{ Type: "Vocal", Text: "A line", StartTime: 1.25, EndTime: 2.5 }],
  },
};

test("Spicy Lyrics handles line, syllable, and static schemas and provider credits", () => {
  const line = normalizeSpicyLyrics(lineResponse)!;
  assert.deepEqual(line.lines, [{ time: 1250, endTime: 2500, text: "A line" }]);
  assert.equal(line.source, "spotify");
  assert.equal(line.contributors, undefined);
  assert.equal(activeLyricIndex(line.lines!, 1250), 0);
  assert.equal(activeLyricIndex(line.lines!, 2500), -1);
  const syllable = normalizeSpicyLyrics({
    Body: {
      id,
      Type: "Syllable",
      source: "spicy_lyrics",
      UploadAttribution: {
        Uploader: {
          username: "Uploader",
          url: "https://spicylyrics.org/uid/123",
        },
        Maker: { username: "Maker", url: "javascript:alert(1)" },
      },
      Content: [
        {
          Type: "Vocal",
          Lead: {
            StartTime: 1,
            EndTime: 3,
            Syllables: [
              { Text: "Hel", IsPartOfWord: true },
              { Text: "lo", IsPartOfWord: false },
              { Text: "world" },
            ],
          },
          Background: [{ Syllables: [{ Text: "echo" }] }],
        },
      ],
    },
  })!;
  assert.equal(syllable.plainLyrics, "Hello world (echo)");
  assert.deepEqual(syllable.contributors, [
    {
      role: "uploader",
      name: "Uploader",
      url: "https://spicylyrics.org/uid/123",
    },
    { role: "maker", name: "Maker" },
  ]);
  const plain = normalizeSpicyLyrics({
    Body: {
      id,
      Type: "Static",
      source: "apple_music",
      Lines: [{ Text: "Plain" }, { Text: "words" }],
    },
  })!;
  assert.equal(plain.plainLyrics, "Plain\nwords");
  assert.deepEqual(plain.lines, []);
  assert.equal(
    normalizeSpicyLyrics({
      Body: { ...lineResponse.Body, source: "spicy_lyrics" },
    }),
    null,
  );
  assert.equal(
    normalizeSpicyLyrics({ Body: { ...lineResponse.Body, Content: [] } }),
    null,
  );
  assert.equal(normalizeSpicyLyrics({ unexpected: true }), null);
});

test("Spotify IDs are extracted only from valid track URLs", () => {
  assert.equal(
    spotifyTrackId(`https://open.spotify.com/track/${id}?si=test`),
    id,
  );
  assert.equal(
    spotifyTrackId(`https://open.spotify.com/intl-th/track/${id}`),
    id,
  );
  assert.equal(spotifyTrackId(`https://example.com/track/${id}`), null);
  assert.equal(spotifyTrackId("https://open.spotify.com/track/short"), null);
});

test("lyrics route uses server-side Spicy Lyrics authentication and falls back to LRCLIB", async (context) => {
  // Keep this test's cooldown in the past once the mock clock is restored.
  const testTime = Date.now() - 300_000;
  context.mock.method(Date, "now", () => testTime);
  const savedKey = process.env.SPICYLYRICS_API_KEY;
  const savedContact = process.env.LRC_RED_CONTACT_EMAIL;
  delete process.env.LRC_RED_CONTACT_EMAIL;
  process.env.SPICYLYRICS_API_KEY = "test-server-secret";
  const request = () =>
    new Request(
      `https://example.com/api/lyrics?track_name=Song&artist_name=Artist&spotify_id=${id}`,
    );
  const mock = context.mock.method(globalThis, "fetch", async () =>
    Response.json(lineResponse),
  );
  try {
    const response = await GET(request());
    assert.equal((await response.json()).lyrics.source, "spotify");
    const call = mock.mock.calls[0].arguments as unknown as [
      string,
      RequestInit,
    ];
    assert.equal(call[0], `https://api.spicylyrics.org/v1/lyrics/${id}`);
    assert.equal(
      new Headers(call[1].headers).get("Authorization"),
      "Bearer test-server-secret",
    );
    mock.mock.mockImplementation(async (input: string | URL | Request) => {
      if (String(input).startsWith("https://api.spicylyrics.org"))
        return new Response(null, { status: 404 });
      return Response.json({
        id: 3,
        instrumental: false,
        plainLyrics: "Fallback",
      });
    });
    const fallback = await GET(request());
    assert.equal((await fallback.json()).lyrics.plainLyrics, "Fallback");
    const lastCall = mock.mock.calls.at(-1)!.arguments as unknown as [
      string,
      RequestInit,
    ];
    assert.equal(new Headers(lastCall[1].headers).has("Authorization"), false);
    assert.equal(
      (
        await GET(
          new Request(
            "https://example.com/api/lyrics?track_name=Song&artist_name=Artist&spotify_id=invalid",
          ),
        )
      ).status,
      400,
    );
    mock.mock.mockImplementation(async (input: string | URL | Request) => {
      if (String(input).startsWith("https://api.spicylyrics.org"))
        return new Response(null, {
          status: 429,
          headers: { "Retry-After": "120" },
        });
      return Response.json({
        id: 3,
        instrumental: false,
        plainLyrics: "Fallback",
      });
    });
    await GET(request());
    const before = mock.mock.calls.length;
    await GET(request());
    assert.equal(
      mock.mock.calls.length,
      before + 1,
      "provider cooldown still allows LRCLIB fallback",
    );
    delete process.env.SPICYLYRICS_API_KEY;
    const unconfigured = await GET(request());
    assert.equal((await unconfigured.json()).lyrics.plainLyrics, "Fallback");
  } finally {
    if (savedContact === undefined) delete process.env.LRC_RED_CONTACT_EMAIL;
    else process.env.LRC_RED_CONTACT_EMAIL = savedContact;
    if (savedKey === undefined) delete process.env.SPICYLYRICS_API_KEY;
    else process.env.SPICYLYRICS_API_KEY = savedKey;
  }
});
