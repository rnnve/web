import { createStatusHandler } from "@/app/lib/status-handler";

export const GET = createStatusHandler({
  freshSeconds: 0,
  name: "Spotify",
  key: "spotify",
  url: "https://api.rynni.cc/api/v2/spotify",
});
