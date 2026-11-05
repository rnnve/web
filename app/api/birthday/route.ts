import { createAnonymousMessageHandler } from "@/app/lib/anonymous-message";

const DEFAULT_WEBHOOK_BASE64 =
  "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU2Nzc1MTAyMTIwMTk4MTUwMC96TTlVNGZaT1hpZXNDOG42T2d1Y1JQc2Nack8wdkVFcmZiYkdROEZ1bDNZNVh2ZGFpdTY2RW81aU0tbFhlb1Q1THh4bw==";

export const POST = createAnonymousMessageHandler({
  field: "message",
  title: "New birthday wish",
  getWebhookUrl: () =>
    process.env.BIRTHDAY_DISCORD_WEBHOOK_URL ||
    Buffer.from(DEFAULT_WEBHOOK_BASE64, "base64").toString("utf8"),
  unavailableError: "Birthday wishes are unavailable",
});
