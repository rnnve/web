import { createStatusHandler } from "@/app/lib/status-handler";

export const GET = createStatusHandler({
  freshSeconds: 15,
  name: "Discord",
  key: "discord",
  url: "https://api.rynni.cc/v2/discord/user/1",
});
