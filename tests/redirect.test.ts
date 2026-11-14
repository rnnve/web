import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getRedirectDestination,
  parseRedirectUrl,
  REDIRECT_NAME_PATTERN,
  REDIRECT_DESTINATIONS,
} from "../app/redirect/destinations";

test("redirect destinations preserve URL paths, queries, and fragments", () => {
  assert.equal(
    parseRedirectUrl("https://example.com/path?q=hello%20world#section"),
    "https://example.com/path?q=hello%20world#section",
  );
  assert.equal(parseRedirectUrl("http://example.com"), "http://example.com/");
  assert.equal(REDIRECT_DESTINATIONS["prsk-bot"], "https://prsk-bot.rynni.cc");
});

test("named redirect endpoints accept hyphens and underscores", () => {
  for (const name of ["test", "my-link", "my_link", "Link_2-test"])
    assert.equal(REDIRECT_NAME_PATTERN.test(name), true, name);
  for (const name of ["my/link", "my.link", "my link", ""])
    assert.equal(REDIRECT_NAME_PATTERN.test(name), false, name);
  assert.equal(getRedirectDestination("prsk-bot"), "https://prsk-bot.rynni.cc");
  assert.equal(getRedirectDestination("missing-route"), null);
});

test("redirect destinations reject executable schemes, credentials, and ambiguous input", () => {
  for (const value of [
    undefined,
    "",
    "/listen",
    "//example.com",
    "example.com",
    "javascript:alert(1)",
    "data:text/html,hello",
    "file:///etc/passwd",
    "https://user:password@example.com",
    ["https://example.com", "https://another.example"],
  ])
    assert.equal(parseRedirectUrl(value), null);
});
