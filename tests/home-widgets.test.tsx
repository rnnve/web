import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createDocument } from "@mixmark-io/domino";
import { renderToStaticMarkup } from "react-dom/server";
import SiteSettingsProvider from "../app/components/settings/site-settings-provider";
import AgeCalculator from "../app/components/home/age-calculator";
import Home from "../app/home";
import { BIRTH_DATE } from "../app/lib/birthday";
import PortfolioNavbar from "../app/components/layout/portfolio-navbar";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import SpotifyWidget, {
  fittedLyricSize,
} from "../app/components/status/spotify-widget";
import usePortfolioStatus from "../app/hooks/use-portfolio-status";
import useTrackLyrics from "../app/hooks/use-track-lyrics";
import { normalizeSpotify } from "../app/lib/spotify";
import type { DiscordProfile } from "../app/lib/status-types";

const { mock } = createRequire(import.meta.url)("bun:test");

test("the age is calculated in the first render", () => {
  const document = createDocument(
    renderToStaticMarkup(<AgeCalculator birthDate={BIRTH_DATE} />),
  );
  const integer = document.querySelector(".age-calculator__integer")?.textContent;
  const precise = document.querySelector("[role='tooltip']")?.textContent;
  assert.match(integer ?? "", /^[1-9]\d*$/);
  assert.match(precise ?? "", /^[1-9]\d*\.\d{8}$/);
  assert.equal(precise?.split(".")[0], integer);
});

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
      spotify: normalizeSpotify({
        isPlaying: true,
        title: "Song",
        artist: "Artist",
      }),
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
  const about = document.querySelector("article")!;
  assert.equal(about.nextElementSibling?.firstElementChild, profile);
  assert.equal(
    profile.nextElementSibling?.getAttribute("aria-label"),
    "Live Spotify status",
  );

  const name = document.querySelector('[aria-label="Discord profile"] strong')!;
  assert.equal(name.textContent, "Display Name");
  assert.equal(name.nextElementSibling?.textContent, "@handle");
  const navigation = createDocument(
    renderToStaticMarkup(
      <PathnameContext.Provider value="/">
        <SiteSettingsProvider>
          <PortfolioNavbar />
        </SiteSettingsProvider>
      </PathnameContext.Provider>,
    ),
  );
  assert.equal(
    navigation.querySelector('[aria-label="Live Spotify status"]'),
    undefined,
  );
  assert.equal(
    navigation.querySelector('[aria-label="Social links"]')?.parentElement
      ?.parentElement?.tagName,
    "HEADER",
  );
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

test("long lyrics shrink to stay on one line", () => {
  assert.equal(fittedLyricSize(120, 240, 14), 14);
  assert.equal(fittedLyricSize(280, 200, 14), 10);
  assert.equal(fittedLyricSize(900, 80, 14), 8);
  assert.equal(fittedLyricSize(40, 0, 14), 14);
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
  assert.equal(track.nextElementSibling, preview);
  assert.equal(
    track.lastElementChild?.querySelector("svg")?.getAttribute("aria-hidden"),
    "true",
  );
  const during = widget(6500);
  assert.deepEqual(
    Array.from(during.querySelectorAll("p[title]")).map(
      (line) => line.textContent,
    ),
    ["First line", "Second line", "Third line"],
  );
  assert.equal(
    during.querySelector('p[aria-current="true"]')?.textContent,
    "Second line",
  );
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
