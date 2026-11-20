import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import {
  DISCORD_PROFILE_TTL_MS,
  isDiscordProfileFresh,
  loadDiscordProfile,
  normalizeDiscord,
} from "../app/lib/discord-profile";
import {
  clearDiscordProfileCache,
  getDiscordProfileSnapshot,
  rememberDiscordProfile,
  subscribeDiscordProfile,
} from "../app/lib/discord-profile-cache";



function installStorage(context: TestContext) {
  const entries = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    },
  });
  context.after(() => {
    clearDiscordProfileCache();
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else Reflect.deleteProperty(globalThis, "localStorage");
  });
  clearDiscordProfileCache();
  return entries;
}

const profile = {
  username: "hn3yy",
  displayName: "Hanami",
  globalName: "Hanami",
  avatar: "https://cdn.discordapp.com/avatars/1/a.webp",
  status: "dnd",
};

test("discord profiles normalize the live and status-route envelopes", () => {
  assert.deepEqual(
    normalizeDiscord({ success: true, data: profile }),
    profile,
  );
  assert.deepEqual(
    normalizeDiscord({ discord: { success: true, data: profile } }),
    profile,
  );
  assert.equal(normalizeDiscord({ success: false }), null);
  assert.equal(isDiscordProfileFresh(Date.now() - DISCORD_PROFILE_TTL_MS), false);
  assert.equal(isDiscordProfileFresh(Date.now() - 1_000), true);
});

test("a stored profile renders immediately and refreshes once a day", async (context) => {
  const entries = installStorage(context);
  const fetchMock = context.mock.method(globalThis, "fetch", async () =>
    Response.json({ discord: { data: profile }, updatedAt: Date.now() }),
  );
  entries.set(
    "ryn:discord-profile",
    JSON.stringify({ profile, savedAt: Date.now() - 60_000 }),
  );
  assert.equal(getDiscordProfileSnapshot()?.displayName, "Hanami");
  const unsubscribe = subscribeDiscordProfile(() => {});
  assert.equal(fetchMock.mock.calls.length, 0);
  unsubscribe();

  clearDiscordProfileCache();
  entries.set(
    "ryn:discord-profile",
    JSON.stringify({
      profile: { ...profile, displayName: "Old" },
      savedAt: Date.now() - DISCORD_PROFILE_TTL_MS - 1_000,
    }),
  );
  assert.equal(getDiscordProfileSnapshot()?.displayName, "Old");
  let seen = "";
  const stop = subscribeDiscordProfile(() => {
    seen = getDiscordProfileSnapshot()?.displayName ?? "";
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(fetchMock.mock.calls.length, 1);
  assert.equal(fetchMock.mock.calls[0].arguments[0], "/api/status");
  assert.equal(seen, "Hanami");
  assert.equal(getDiscordProfileSnapshot()?.displayName, "Hanami");
  stop();

  clearDiscordProfileCache();
  fetchMock.mock.mockImplementation(async () => {
    throw new Error("offline");
  });
  entries.set(
    "ryn:discord-profile",
    JSON.stringify({
      profile,
      savedAt: Date.now() - DISCORD_PROFILE_TTL_MS - 1_000,
    }),
  );
  getDiscordProfileSnapshot();
  const again = subscribeDiscordProfile(() => {});
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(getDiscordProfileSnapshot()?.username, "hn3yy");
  again();
});

test("server profile is kept for a day without another request", async (context) => {
  installStorage(context);
  const fetchMock = context.mock.method(globalThis, "fetch", async () => {
    throw new Error("should not fetch");
  });
  rememberDiscordProfile(profile, Date.now());
  const unsubscribe = subscribeDiscordProfile(() => {});
  assert.equal(fetchMock.mock.calls.length, 0);
  assert.equal(getDiscordProfileSnapshot()?.displayName, "Hanami");
  unsubscribe();
});

test("upstream profile load keeps the response time", async (context) => {
  context.mock.method(globalThis, "fetch", async () =>
    Response.json(
      { success: true, data: profile },
      { headers: { date: "Tue, 18 Nov 2025 00:00:00 GMT" } },
    ),
  );
  context.after(() => clearDiscordProfileCache());
  const loaded = await loadDiscordProfile();
  assert.equal(loaded?.profile.username, "hn3yy");
  assert.equal(
    loaded?.updatedAt,
    Date.parse("Tue, 18 Nov 2025 00:00:00 GMT"),
  );
});
