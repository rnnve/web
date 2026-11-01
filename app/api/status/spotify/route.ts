import { createStatusHandler } from "@/app/lib/status-handler";

export const GET = createStatusHandler({
  freshSeconds: 0,
  name: "Spotify",
  key: "spotify",
  url: "https://sptf.rynni.cc/api/spotify",
});
