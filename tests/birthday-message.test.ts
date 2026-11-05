import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/birthday/route";

function request(message: unknown) {
  return new Request("http://localhost/api/birthday", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

test("birthday wishes use their own webhook and birthday embed title", async (context) => {
  const previous = process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
  process.env.BIRTHDAY_DISCORD_WEBHOOK_URL =
    "https://example.com/birthday-webhook";
  context.after(() => {
    if (previous === undefined) delete process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
    else process.env.BIRTHDAY_DISCORD_WEBHOOK_URL = previous;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  const response = await POST(request("  Happy birthday! @everyone  "));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(
    fetchMock.mock.calls[0].arguments[0],
    "https://example.com/birthday-webhook",
  );
  const options = fetchMock.mock.calls[0].arguments[1] as RequestInit;
  assert.deepEqual(JSON.parse(options.body as string), {
    content: "<@969088519161139270>",
    embeds: [
      {
        title: "New birthday wish",
        description: "Happy birthday! @everyone",
        color: 0x808080,
      },
    ],
    allowed_mentions: { parse: [], users: ["969088519161139270"] },
  });
});

test("invalid birthday payloads never contact the webhook", async (context) => {
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  for (const message of [" ", "x".repeat(1001), null, 42, { text: "Hello" }]) {
    assert.equal((await POST(request(message))).status, 400);
  }
  assert.equal(
    (
      await POST(
        new Request("http://localhost/api/birthday", {
          method: "POST",
          body: "text",
        }),
      )
    ).status,
    415,
  );
  assert.equal((await POST(request("x".repeat(9000)))).status, 413);
  assert.equal(fetchMock.mock.calls.length, 0);
});

test("birthday wishes use the default webhook when the environment override is absent", async (context) => {
  const previous = process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
  delete process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
  context.after(() => {
    if (previous === undefined) delete process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
    else process.env.BIRTHDAY_DISCORD_WEBHOOK_URL = previous;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  assert.equal((await POST(request("Happy birthday"))).status, 200);
  const target = new URL(String(fetchMock.mock.calls[0].arguments[0]));
  assert.equal(target.protocol, "https:");
  assert.equal(target.hostname, "discord.com");
  assert.match(
    target.pathname,
    /^\/api\/webhooks\/1567751021201981500\/[^/]+$/,
  );
});

test("failed default and overridden birthday delivery never report success", async (context) => {
  const previous = process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
  delete process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
  context.after(() => {
    if (previous === undefined) delete process.env.BIRTHDAY_DISCORD_WEBHOOK_URL;
    else process.env.BIRTHDAY_DISCORD_WEBHOOK_URL = previous;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 500 }),
  );
  assert.equal((await POST(request("Happy birthday"))).status, 502);
  assert.equal(fetchMock.mock.calls.length, 1);
  process.env.BIRTHDAY_DISCORD_WEBHOOK_URL =
    "https://example.com/birthday-webhook";
  assert.equal((await POST(request("Happy birthday"))).status, 502);
});
