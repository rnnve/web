import {
  DISCORD_PROFILE_TTL_MS,
  DISCORD_PROFILE_URL,
} from "@/app/lib/discord-profile";
import { createStatusHandler } from "@/app/lib/status-handler";

export const GET = createStatusHandler({
  freshSeconds: DISCORD_PROFILE_TTL_MS / 1000,
  name: "Discord",
  key: "discord",
  url: DISCORD_PROFILE_URL,
});
