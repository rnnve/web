import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_SETTINGS,
  detectLanguage,
  languageFromHash,
  parseSettings,
} from "../app/lib/site-settings";

test("missing or corrupt preferences restore safe defaults", () => {
  assert.equal(DEFAULT_SETTINGS.language, "en");
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

test("explicit saved English preferences are preserved", () => {
  assert.deepEqual(parseSettings('{"language":"en"}'), { language: "en" });
  assert.deepEqual(parseSettings("{}"), { language: "en" });
});

test("language hashes accept Thai and English without consuming section anchors", () => {
  for (const hash of ["#th", "#TH", "#lang=th", "#%74h"])
    assert.equal(languageFromHash(hash), "th");
  for (const hash of ["#en", "#EN", "#lang=en"])
    assert.equal(languageFromHash(hash), "en");
  for (const hash of [
    "",
    "#more",
    "#developer",
    "#fr",
    "#lang=fr",
    "#%bad",
    "#en<script>",
  ])
    assert.equal(languageFromHash(hash), null);
});

test("browser locales select the first supported language and fall back to English", () => {
  assert.equal(detectLanguage(["th-TH", "en-US"]), "th");
  assert.equal(detectLanguage(["en-GB", "th"]), "en");
  assert.equal(detectLanguage(["ja-JP", "TH-th", "en"]), "th");
  assert.equal(detectLanguage(["ja-JP", "fr"]), "en");
  assert.equal(detectLanguage([]), "en");
});

test("explicit choices override locale detection; missing or corrupt choices use the locale", () => {
  assert.deepEqual(parseSettings('{"language":"en"}', "th"), {
    language: "en",
  });
  assert.deepEqual(parseSettings('{"language":"th"}', "en"), {
    language: "th",
  });
  for (const value of [
    null,
    "",
    "{bad",
    "null",
    "false",
    "{}",
    '{"language":"fr"}',
  ]) {
    assert.deepEqual(parseSettings(value, "th"), { language: "th" });
  }
});
