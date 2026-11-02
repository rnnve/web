import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_SETTINGS, parseSettings } from "../app/lib/site-settings";

test("missing or corrupt preferences restore safe defaults", () => {
  for (const value of [null, "", "{bad", "null", "false", '"en"']) {
    assert.deepEqual(parseSettings(value), DEFAULT_SETTINGS);
  }
});

test("saved Thai and disabled animation preferences survive parsing", () => {
  assert.deepEqual(
    parseSettings('{"language":"th","backgroundAnimation":false}'),
    {
      language: "th",
      backgroundAnimation: false,
    },
  );
});

test("invalid fields fall back independently without discarding valid preferences", () => {
  assert.deepEqual(
    parseSettings('{"language":"fr","backgroundAnimation":false}'),
    {
      language: "en",
      backgroundAnimation: false,
    },
  );
  assert.deepEqual(
    parseSettings('{"language":"th","backgroundAnimation":"false"}'),
    {
      language: "th",
      backgroundAnimation: true,
    },
  );
});
