const MAX_QUESTION_LENGTH = 1000;
const MAX_BODY_BYTES = 8192;
const RECIPIENT_ID = "969088519161139270";
const DEFAULT_WEBHOOK_BASE64 =
  "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTUyOTYwNjI1NjgwODAzODU0My8tN3Y0eG9YcXJPVEFfVUh0VHV0YjdHaGJhbm9hYnhXWTM2YUk4V1pCd0EyaXI1enZCUUh4YVhjM2dqa092Yl93T242SA==";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Invalid request" }, { status: 415 });
  }

  let body: unknown;
  try {
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
      return Response.json({ error: "Request too large" }, { status: 413 });
    }
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return Response.json({ error: "Request too large" }, { status: 413 });
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const question =
    body &&
    typeof body === "object" &&
    "question" in body &&
    typeof body.question === "string"
      ? body.question.trim()
      : "";
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return Response.json({ error: "Invalid question" }, { status: 400 });
  }

  const webhookUrl =
    process.env.ASK_DISCORD_WEBHOOK_URL ||
    Buffer.from(DEFAULT_WEBHOOK_BASE64, "base64").toString("utf8");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `<@${RECIPIENT_ID}>`,
        embeds: [
          {
            title: "New question",
            description: question,
            color: 0x808080,
          },
        ],
        allowed_mentions: { parse: [], users: [RECIPIENT_ID] },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Delivery failed");
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Questions are unavailable" },
      { status: 502 },
    );
  }
}
