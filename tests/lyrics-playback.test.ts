import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lyricsProgress,
  reconcileLyricsPlayback,
} from "../app/lib/lyrics-playback";

const epoch = 1_800_000_000_000;
function playing(progress: number, title = "Song", startedAt?: string) {
  return {
    data: {
      isPlaying: true,
      progressMs: progress,
      startedAt,
      track: { name: title, artist: "Artist", durationMs: 180_000 },
    },
  };
}

test("lyrics clock compensates latency and ignores duplicate samples and timestamp jitter", () => {
  const first = reconcileLyricsPlayback(
    null,
    playing(10_000),
    epoch,
    epoch + 500,
  );
  assert.equal(lyricsProgress(first, epoch + 1000), 11_000);
  const jitter = reconcileLyricsPlayback(
    first,
    playing(10_900),
    epoch + 1000,
    epoch + 1500,
  );
  assert.equal(lyricsProgress(jitter, epoch + 1500), 11_500);
  const duplicate = reconcileLyricsPlayback(
    jitter,
    playing(10_900),
    epoch + 2000,
    epoch + 2500,
  );
  assert.equal(lyricsProgress(duplicate, epoch + 2500), 12_500);
  const stale = reconcileLyricsPlayback(
    duplicate,
    playing(9000),
    epoch,
    epoch + 3000,
  );
  assert.equal(stale, duplicate);
});

test("lyrics clock applies real seeks, song changes, and playback stops", () => {
  const first = reconcileLyricsPlayback(null, playing(30_000), epoch, epoch);
  const backward = reconcileLyricsPlayback(
    first,
    playing(5000),
    epoch + 1000,
    epoch + 1000,
  );
  assert.equal(lyricsProgress(backward, epoch + 1000), 5000);
  const forward = reconcileLyricsPlayback(
    backward,
    playing(90_000),
    epoch + 2000,
    epoch + 2000,
  );
  assert.equal(lyricsProgress(forward, epoch + 2000), 90_000);
  const changed = reconcileLyricsPlayback(
    forward,
    playing(0, "Next"),
    epoch + 3000,
    epoch + 3000,
  );
  assert.equal(lyricsProgress(changed, epoch + 3000), 0);
  const stopped = reconcileLyricsPlayback(
    changed,
    { isPlaying: false },
    epoch + 4000,
    epoch + 4000,
  );
  assert.equal(lyricsProgress(stopped, epoch + 5000), 0);
  assert.equal(lyricsProgress(forward, epoch + 200_000), 180_000);
});

test("precise upstream start time avoids HTTP Date rounding", () => {
  const first = reconcileLyricsPlayback(
    null,
    playing(10_000, "Song", new Date(epoch - 9750).toISOString()),
    epoch,
    epoch + 500,
  );
  assert.equal(lyricsProgress(first, epoch + 500), 10_250);
});
