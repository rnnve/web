import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createDocument } from "@mixmark-io/domino";
import { renderToStaticMarkup } from "react-dom/server";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import Home from "../app/home";
import SpotifyWidget from "../app/components/status/spotify-widget";
import usePortfolioStatus from "../app/hooks/use-portfolio-status";
import useTrackLyrics from "../app/hooks/use-track-lyrics";
import { normalizeSpotify } from "../app/lib/spotify";
import type { DiscordProfile } from "../app/lib/status-types";

const { mock } = createRequire(import.meta.url)("bun:test");

test("home removes duplicate social actions and shows Discord display name above username", (context) => {
  const original = usePortfolioStatus;
  let discord: DiscordProfile = {
    username: "handle",
    displayName: "Display Name",
    globalName: "Global Name",
  };
  mock.module("../app/hooks/use-portfolio-status", () => ({
    default: () => ({
      discord,
      spotify: normalizeSpotify(null),
      spotifyLoading: false,
      spotifySyncedAt: 0,
      payload: { errors: {} },
    }),
  }));
  context.after(() =>
    mock.module("../app/hooks/use-portfolio-status", () => ({
      default: original,
    })),
  );
  const page = () =>
    createDocument(
      renderToStaticMarkup(
        <SiteSettingsProvider>
          <Home />
        </SiteSettingsProvider>,
      ),
    );
  const document = page();
  assert.doesNotMatch(document.querySelector("main")!.textContent!, /Hey, I’m/);
  assert.ok(!document.querySelector('[aria-label="Find me online"]'));
  assert.ok(!document.querySelector('a[href="https://github.com/rnnve"]'));
  assert.ok(!document.querySelector('a[href^="https://discord.com/users/"]'));
  const profile = document.querySelector('[aria-label="Discord profile"]')!;
  const music = document.querySelector('[aria-label="Live Spotify status"]')!;
  assert.equal(profile.nextElementSibling?.tagName, "ARTICLE");
  assert.equal(profile.parentElement?.nextElementSibling, music);
  const name = document.querySelector('[aria-label="Discord profile"] strong')!;
  assert.equal(name.textContent, "Display Name");
  assert.equal(name.nextElementSibling?.textContent, "@handle");
  discord = { username: "handle", globalName: "Global Name" };
  assert.equal(
    page().querySelector('[aria-label="Discord profile"] strong')?.textContent,
    "Global Name",
  );
  discord = { username: "handle" };
  assert.equal(
    page().querySelector('[aria-label="Discord profile"] strong')?.textContent,
    "handle",
  );
});

test("lyrics preload and keep highlights for two seconds before clearing long gaps", (context) => {
  const original = useTrackLyrics;
  mock.module("../app/hooks/use-track-lyrics", () => ({
    default: () => ({
      loading: false,
      error: false,
      lyrics: {
        instrumental: false,
        lines: [
          { time: 1000, endTime: 2000, text: "First line" },
          { time: 6000, endTime: 7000, text: "Second line" },
          { time: 11000, endTime: 12000, text: "Third line" },
        ],
      },
    }),
  }));
  context.after(() =>
    mock.module("../app/hooks/use-track-lyrics", () => ({ default: original })),
  );
  const widget = (progress: number) =>
    createDocument(
      renderToStaticMarkup(
        <SiteSettingsProvider>
          <SpotifyWidget
            compact
            spotify={normalizeSpotify({
              isPlaying: true,
              title: "Song",
              artist:
                "An exceptionally long artist name that must remain readable",
              duration: 20000,
              progress,
            })}
          />
        </SiteSettingsProvider>,
      ),
    );
  const before = widget(0);
  assert.match(before.body.textContent!, /First line/);
  assert.match(before.body.textContent!, /Second line/);
  assert.ok(!before.querySelector('p[aria-current="true"]'));
  assert.doesNotMatch(before.body.textContent!, /Listening/);
  const track = before.getElementById("spotify-widget-title")!.parentElement!
    .parentElement!;
  const preview = before.querySelector("p[data-center]")!.parentElement;
  assert.equal(preview?.nextElementSibling, track);
  assert.equal(
    before.querySelector(
      'a[title="An exceptionally long artist name that must remain readable"]',
    )?.textContent,
    "An exceptionally long artist name that must remain readable",
  );
  assert.equal(
    widget(1500).querySelector('p[aria-current="true"]')?.textContent,
    "First line",
  );
  for (const progress of [2000, 2500, 3999]) {
    assert.equal(
      widget(progress).querySelector('p[aria-current="true"]')?.textContent,
      "First line",
    );
  }
  for (const progress of [4000, 5000, 5999, 9000, 10000, 14000, 16000]) {
    const document = widget(progress);
    assert.ok(
      document.querySelector("p[data-center]"),
      `${progress}: preview stays visible`,
    );
    assert.ok(
      !document.querySelector('p[aria-current="true"]'),
      `${progress}: no highlight during silence`,
    );
  }
  assert.equal(
    widget(6000).querySelector('p[aria-current="true"]')?.textContent,
    "Second line",
  );
  assert.equal(
    widget(11000).querySelector('p[aria-current="true"]')?.textContent,
    "Third line",
  );
  assert.equal(
    widget(1250).querySelector('p[aria-current="true"]')?.textContent,
    "First line",
  );
});
