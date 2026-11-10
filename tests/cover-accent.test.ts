import assert from "node:assert/strict";
import { test } from "node:test";
import {
  accentFromPixels,
  coverAccent,
  DEFAULT_SITE_ACCENT,
  interpolateAccent,
} from "../app/lib/cover-accent";

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

test("the dominant region wins over smaller contrasting details", () => {
  const pixels = [40, 220, 100, 255, 40, 220, 100, 255, 240, 20, 50, 255];
  assert.equal(accentFromPixels(pixels), "#28dc64");
  assert.equal(
    accentFromPixels([0, 0, 0, 255, 0, 0, 0, 255, 40, 220, 100, 255]),
    DEFAULT_SITE_ACCENT,
  );
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
