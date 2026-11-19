import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/api/status/github/route";

test("GitHub route requests the current year without sending credentials to the calendar service", async (context) => {
  const calls: { url: string; headers: Headers }[] = [];
  context.mock.method(
    globalThis,
    "fetch",
    async (url: string, options: RequestInit) => {
      calls.push({ url, headers: new Headers(options.headers) });
      return Response.json(
        url.includes("contributions-api")
          ? {
              contributions: [
                {
                  date: `${new Date().getUTCFullYear()}-01-01`,
                  count: 3,
                  level: 2,
                },
              ],
            }
          : [],
      );
    },
  );
  const response = await GET();
  const body = await response.json();
  assert.equal(body.year, new Date().getUTCFullYear());
  assert.equal(body.contributions[0].count, 3);
  const calendar = calls.find((call) =>
    call.url.includes("contributions-api"),
  )!;
  assert.ok(calendar.url.endsWith(`?y=${body.year}`));
  assert.equal(calendar.headers.has("Authorization"), false);
  assert.match(response.headers.get("Cache-Control")!, /s-maxage=60/);
});

test("A failed calendar stays unavailable while repositories remain usable", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: string) => {
    if (url.includes("contributions-api")) throw new Error("Offline");
    return Response.json([{ name: "web" }]);
  });
  const response = await GET();
  const body = await response.json();
  assert.equal(body.contributions, null);
  assert.equal(body.repos[0].name, "web");
  assert.match(response.headers.get("Cache-Control")!, /no-store/);
});

test("Malformed contribution responses cannot appear as an empty successful calendar", async (context) => {
  context.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "Invalid data" }),
  );
  assert.equal((await (await GET()).json()).contributions, null);
});
