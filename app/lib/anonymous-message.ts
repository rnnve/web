const MAX_MESSAGE_LENGTH = 1000;
const MAX_BODY_BYTES = 8192;
const RECIPIENT_ID = "969088519161139270";

export function createAnonymousMessageHandler(options: {
  field: "question" | "message";
  title: string;
  getWebhookUrl: () => string | undefined;
  unavailableError: string;
}) {
  return async function POST(request: Request) {
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

    const value =
      body && typeof body === "object"
        ? (body as Record<string, unknown>)[options.field]
        : undefined;
    const message = typeof value === "string" ? value.trim() : "";
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        {
          error:
            options.field === "question"
              ? "Invalid question"
              : "Invalid message",
        },
        { status: 400 },
      );
    }

    const webhookUrl = options.getWebhookUrl();
    if (!webhookUrl) {
      return Response.json(
        { error: options.unavailableError },
        { status: 503 },
      );
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `<@${RECIPIENT_ID}>`,
          embeds: [
            {
              title: options.title,
              description: message,
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
        { error: options.unavailableError },
        { status: 502 },
      );
    }
  };
}
