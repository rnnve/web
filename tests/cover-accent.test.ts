import assert from "node:assert/strict";
import { test } from "node:test";
import {
  accentFromPixels,
  accentFromArtwork,
  coverAccent,
  DEFAULT_SITE_ACCENT,
  interpolateAccent,
  randomAccentPosition,
} from "../app/lib/cover-accent";

function sampleArtwork(
  patches: Array<{ x: number; y: number; color: number[] }>,
) {
  const pixels = new Array(21 * 21).fill([0, 0, 0, 255]).flat();
  for (const { x, y, color } of patches) {
    for (let row = y; row < y + 7; row++) {
      for (let column = x; column < x + 7; column++) {
        pixels.splice((row * 21 + column) * 4, 4, ...color, 255);
      }
    }
  }
  return pixels;
}

test("random selection can choose each of the five positions", () => {
  assert.deepEqual(
    [0, 0.2, 0.4, 0.6, 0.8].map((value) => randomAccentPosition(() => value)),
    [0, 1, 2, 3, 4],
  );
  assert.equal(
    randomAccentPosition(() => 0.99999),
    4,
  );
});

test("artwork samples only the selected corner or center", () => {
  const positions = [
    [14, 0],
    [0, 0],
    [0, 14],
    [14, 14],
    [7, 7],
  ];
  positions.forEach(([x, y], selected) => {
    const pixels = sampleArtwork([{ x, y, color: [40, 220, 100] }]);
    assert.equal(accentFromArtwork(pixels, 21, 21, selected), "#28dc64");
    assert.equal(
      accentFromArtwork(pixels, 21, 21, (selected + 1) % 5),
      DEFAULT_SITE_ACCENT,
    );
  });
});

test("a selected dark patch is used even when another position is brighter", () => {
  const pixels = sampleArtwork([
    { x: 14, y: 0, color: [0, 0, 120] },
    { x: 7, y: 7, color: [40, 220, 100] },
  ]);
  assert.equal(
    accentFromArtwork(pixels, 21, 21, 0),
    accentFromPixels([0, 0, 120, 255]),
  );
  assert.equal(accentFromArtwork(pixels, 21, 21, 4), "#28dc64");
});

test("black artwork and invalid image dimensions use the default accent", () => {
  assert.equal(
    accentFromArtwork(sampleArtwork([]), 21, 21),
    DEFAULT_SITE_ACCENT,
  );
  assert.equal(accentFromArtwork([], 0, 0), DEFAULT_SITE_ACCENT);
  assert.equal(
    accentFromArtwork([255, 0, 0, 255], 21, 21),
    DEFAULT_SITE_ACCENT,
  );
});

test("accent fades interpolate colors and clamp their endpoints", () => {
  assert.equal(interpolateAccent("#000000", "#ffffff", 0.5), "#808080");
  assert.equal(interpolateAccent("#28dc64", "#64b4fa", 0), "#28dc64");
  assert.equal(interpolateAccent("#28dc64", "#64b4fa", 2), "#64b4fa");
  assert.equal(
    interpolateAccent("#28dc64", DEFAULT_SITE_ACCENT, 1),
    DEFAULT_SITE_ACCENT,
  );
});

test("unreadable covers safely fall back and repeated covers share extraction", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async () => {
    throw new Error("Image unavailable");
  });
  const first = coverAccent("https://example.com/unreadable-test-cover");
  const second = coverAccent("https://example.com/unreadable-test-cover");
  assert.equal(first, second);
  assert.equal(await first, DEFAULT_SITE_ACCENT);
  assert.equal(fetchMock.mock.calls.length, 1);
  await coverAccent("https://example.com/unreadable-test-cover");
  assert.equal(fetchMock.mock.calls.length, 2);
});

test("black and nearly black covers use the default white accent", () => {
  for (const value of [0, 12, 32, 47])
    assert.equal(
      accentFromPixels([value, value, value, 255]),
      DEFAULT_SITE_ACCENT,
    );
});

test("empty and transparent artwork uses the default accent", () => {
  assert.equal(accentFromPixels([]), DEFAULT_SITE_ACCENT);
  assert.equal(accentFromPixels([255, 0, 0, 0]), DEFAULT_SITE_ACCENT);
});

test("meaningful colored regions win over neutral borders and shadows", () => {
  const pixels = [40, 220, 100, 255, 40, 220, 100, 255, 240, 20, 50, 255];
  assert.equal(accentFromPixels(pixels), "#28dc64");
  assert.equal(
    accentFromPixels([0, 0, 0, 255, 0, 0, 0, 255, 40, 220, 100, 255]),
    "#28dc64",
  );
  assert.equal(
    accentFromPixels([
      240, 240, 240, 255, 240, 240, 240, 255, 40, 220, 100, 255,
    ]),
    "#28dc64",
  );
});

test("tiny isolated color specks do not color an otherwise black cover", () => {
  const pixels = new Array(200).fill([0, 0, 0, 255]).flat();
  pixels.push(40, 220, 100, 255);
  assert.equal(accentFromPixels(pixels), DEFAULT_SITE_ACCENT);
});

test("dark saturated cover colors retain their hue and become legible", () => {
  const accent = accentFromPixels([0, 0, 120, 255]);
  const channels = accent
    .slice(1)
    .match(/../g)!
    .map((value) => parseInt(value, 16));
  assert.ok(channels[2] > channels[0]);
  const luminance = (rgb: number[]) =>
    rgb
      .map((value) => {
        const v = value / 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      })
      .reduce(
        (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
        0,
      );
  assert.ok(
    (luminance(channels) + 0.05) / (luminance([18, 18, 18]) + 0.05) >= 4.5,
  );
});
