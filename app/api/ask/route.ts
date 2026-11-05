import { createAnonymousMessageHandler } from "@/app/lib/anonymous-message";

const DEFAULT_WEBHOOK_BASE64 =
  "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTUyOTYwNjI1NjgwODAzODU0My8tN3Y0eG9YcXJPVEFfVUh0VHV0YjdHaGJhbm9hYnhXWTM2YUk4V1pCd0EyaXI1enZCUUh4YVhjM2dqa092Yl93T242SA==";

export const POST = createAnonymousMessageHandler({
  field: "question",
  title: "New question",
  getWebhookUrl: () =>
    process.env.ASK_DISCORD_WEBHOOK_URL ||
    Buffer.from(DEFAULT_WEBHOOK_BASE64, "base64").toString("utf8"),
  unavailableError: "Questions are unavailable",
});
