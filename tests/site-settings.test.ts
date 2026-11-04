import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_SETTINGS, parseSettings } from "../app/lib/site-settings";

test("missing or corrupt preferences restore safe defaults", () => {
  for (const value of [null, "", "{bad", "null", "false", '"en"']) {
    assert.deepEqual(parseSettings(value), DEFAULT_SETTINGS);
  }
});

test("saved Thai preference survives parsing", () => {
  assert.deepEqual(
    parseSettings('{"language":"th","backgroundAnimation":false}'),
    { language: "th" },
  );
});

test("invalid language falls back safely", () => {
  assert.deepEqual(
    parseSettings('{"language":"fr","backgroundAnimation":false}'),
    { language: "en" },
  );
});
