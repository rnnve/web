import assert from "node:assert/strict";
import { test } from "node:test";
import { POST } from "../app/api/ask/route";

function request(body: unknown) {
  return new Request("http://localhost/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("valid questions are delivered anonymously with only the requested mention enabled", async (context) => {
  const previous = process.env.ASK_DISCORD_WEBHOOK_URL;
  process.env.ASK_DISCORD_WEBHOOK_URL = "https://example.com/webhook";
  context.after(() => {
    if (previous === undefined) delete process.env.ASK_DISCORD_WEBHOOK_URL;
    else process.env.ASK_DISCORD_WEBHOOK_URL = previous;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  const response = await POST(request({ question: "  Hello @everyone  " }));
  assert.equal(response.status, 200);
  const options = fetchMock.mock.calls[0].arguments[1] as RequestInit;
  assert.equal(
    fetchMock.mock.calls[0].arguments[0],
    "https://example.com/webhook",
  );
  assert.deepEqual(JSON.parse(options.body as string), {
    content: "<@969088519161139270>",
    embeds: [
      {
        title: "New question",
        description: "Hello @everyone",
        color: 0x808080,
      },
    ],
    allowed_mentions: { parse: [], users: ["969088519161139270"] },
  });
});

test("uses a configured fallback when the environment variable is absent", async (context) => {
  const previous = process.env.ASK_DISCORD_WEBHOOK_URL;
  delete process.env.ASK_DISCORD_WEBHOOK_URL;
  context.after(() => {
    if (previous === undefined) delete process.env.ASK_DISCORD_WEBHOOK_URL;
    else process.env.ASK_DISCORD_WEBHOOK_URL = previous;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 204 }),
  );
  assert.equal((await POST(request({ question: "Hello" }))).status, 200);
  const target = new URL(String(fetchMock.mock.calls[0].arguments[0]));
  assert.equal(target.protocol, "https:");
  assert.equal(target.hostname, "discord.com");
  assert.match(target.pathname, /^\/api\/webhooks\/\d+\/[^/]+$/);
});

test("invalid questions and failed delivery never report success", async (context) => {
  const previous = process.env.ASK_DISCORD_WEBHOOK_URL;
  process.env.ASK_DISCORD_WEBHOOK_URL = "https://example.com/webhook";
  context.after(() => {
    if (previous === undefined) delete process.env.ASK_DISCORD_WEBHOOK_URL;
    else process.env.ASK_DISCORD_WEBHOOK_URL = previous;
  });
  const fetchMock = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 500 }),
  );
  assert.equal((await POST(request({ question: " " }))).status, 400);
  assert.equal(
    (await POST(request({ question: "x".repeat(1001) }))).status,
    400,
  );
  assert.equal(fetchMock.mock.calls.length, 0);
  assert.equal((await POST(request({ question: "Hello" }))).status, 502);
});
