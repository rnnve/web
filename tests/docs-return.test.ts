import assert from "node:assert/strict";
import { test } from "node:test";
import {
  readDocsReturn,
  rememberDocsReturn,
  resolveDocsReturn,
} from "../app/lib/docs-return";

test("docs return ignores docs paths and unsafe values", () => {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  rememberDocsReturn("/docs");
  rememberDocsReturn("/docs/intro");
  rememberDocsReturn("//evil.example");
  rememberDocsReturn("https://example.com/");
  assert.equal(readDocsReturn("/"), "/");
  rememberDocsReturn("/listen");
  assert.equal(readDocsReturn("/"), "/listen");
  rememberDocsReturn("/ask?from=nav");
  assert.equal(readDocsReturn("/"), "/ask?from=nav");
});

test("docs return prefers the saved path then a same-origin referrer", () => {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  assert.equal(
    resolveDocsReturn(
      "https://rynnie.cc/developing",
      "https://rynnie.cc",
      "/",
    ),
    "/developing",
  );
  rememberDocsReturn("/birthday");
  assert.equal(
    resolveDocsReturn(
      "https://rynnie.cc/developing",
      "https://rynnie.cc",
      "/",
    ),
    "/birthday",
  );
  assert.equal(
    resolveDocsReturn("https://other.test/listen", "https://rynnie.cc", "/"),
    "/birthday",
  );
});
