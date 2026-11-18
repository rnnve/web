import Home from "./home";
import { loadDiscordProfile } from "./lib/discord-profile";
import { generatePageMetadata } from "./lib/og/metadata";

export function generateMetadata() {
  return generatePageMetadata("/");
}

export default async function HomePage() {
  const discord = await loadDiscordProfile();
  return (
    <Home
      initialDiscord={discord?.profile ?? null}
      discordUpdatedAt={discord?.updatedAt ?? 0}
    />
  );
}
