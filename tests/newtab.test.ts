import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_PREFERENCES,
  isSafeShortcut,
  parsePreferences,
} from "../app/newtab/preferences";

test("new-tab preferences recover from missing or corrupt storage", () => {
  for (const value of [null, "", "{broken", "null", "42"]) {
    assert.deepEqual(parsePreferences(value), DEFAULT_PREFERENCES);
  }
});

test("shortcuts reject executable URLs and credentials", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "//example.com",
    "/\\example.com",
    "https://user:password@example.com",
  ]) {
    assert.equal(isSafeShortcut(url), false, url);
  }
  for (const url of [
    "/",
    "/listen",
    "https://example.com",
    "http://localhost:3001/",
  ]) {
    assert.equal(isSafeShortcut(url), true, url);
  }
});

test("saved search engine and custom shortcuts survive parsing", () => {
  const preferences = {
    engine: "duckduckgo",
    shortcuts: [{ name: "Docs", url: "https://example.com/docs" }],
  };
  assert.deepEqual(parsePreferences(JSON.stringify(preferences)), preferences);
  assert.deepEqual(parsePreferences('{"shortcuts":[]}').shortcuts, []);
});

test("invalid stored entries are removed and unsupported engines use Google", () => {
  const parsed = parsePreferences(
    JSON.stringify({
      engine: "toString",
      shortcuts: [
        null,
        { name: "", url: "/" },
        { name: "Unsafe", url: "javascript:alert(1)" },
        { name: "Home", url: "/" },
      ],
    }),
  );
  assert.equal(parsed.engine, "google");
  assert.deepEqual(parsed.shortcuts, [{ name: "Home", url: "/" }]);
  assert.equal(
    parsePreferences(
      JSON.stringify({
        shortcuts: Array.from({ length: 20 }, () => ({
          name: "Site",
          url: "https://example.com",
        })),
      }),
    ).shortcuts.length,
    8,
  );
});
