import { createAnonymousMessageHandler } from "@/app/lib/anonymous-message";

export const POST = createAnonymousMessageHandler({
  field: "message",
  title: "New birthday wish",
  getWebhookUrl: () => process.env.BIRTHDAY_DISCORD_WEBHOOK_URL,
  unavailableError: "Birthday wishes are unavailable",
});
