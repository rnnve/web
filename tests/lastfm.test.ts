import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LISTEN_PERIODS,
  normalizeListenData,
  parseListenPeriod,
} from "../app/lib/lastfm";

test("listening periods are allowlisted and default to seven days", () => {
  for (const period of LISTEN_PERIODS)
    assert.equal(parseListenPeriod(period), period);
  assert.equal(parseListenPeriod("weekly"), "7day");
  assert.equal(parseListenPeriod(null), "7day");
});

test("normalizes Last.fm current, recent, ranked and profile data", () => {
  const wrap = (data: unknown) => ({ success: true, data });
  const track = {
    name: "Song",
    artist: "Artist",
    image: { extraLarge: "https://example.com/cover.jpg" },
    url: "https://www.last.fm/music/example",
    date: { uts: 100 },
    nowPlaying: false,
  };
  const result = normalizeListenData({
    current: wrap({ nowPlaying: true, track }),
    recent: wrap({ tracks: [track, null] }),
    topTracks: wrap({ tracks: [{ ...track, playcount: 4 }] }),
    topArtists: wrap({ artists: [{ name: "Artist", playcount: 8 }] }),
    profile: wrap({
      username: "user",
      playcount: 10,
      url: "https://www.last.fm/user/user",
    }),
  });
  assert.equal(result.current?.nowPlaying, true);
  assert.equal(result.recent[0].timestamp, 100);
  assert.equal(result.recent.length, 1);
  assert.equal(result.topTracks[0].plays, 4);
  assert.equal(result.topArtists[0].name, "Artist");
  assert.equal(result.profile?.playcount, 10);
  assert.deepEqual(result.unavailable, []);
});

test("handles unavailable endpoints and unsafe URLs", () => {
  const result = normalizeListenData({
    current: null,
    recent: {
      success: true,
      data: {
        tracks: [
          {
            name: "Song",
            url: "javascript:alert(1)",
            image: { large: "http://example.com/a" },
          },
        ],
      },
    },
    topTracks: { success: false },
    topArtists: null,
    profile: null,
  });
  assert.equal(result.current, null);
  assert.equal(result.recent[0].url, "");
  assert.equal(result.recent[0].image, "");
  assert.deepEqual(result.unavailable, [
    "current",
    "topTracks",
    "topArtists",
    "profile",
  ]);
});
