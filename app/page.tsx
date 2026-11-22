import Home from "./home";
import { loadDiscordProfile } from "./lib/discord-profile";
import { generatePageMetadata } from "./lib/og/metadata";

export function generateMetadata() {
  return generatePageMetadata("/");
}

export default function HomePage() {
  // eslint-disable-next-line react-hooks/purity -- Serialize one server clock snapshot for deterministic client hydration.
  const initialNow = Date.now();
  return <Home initialNow={initialNow} profile={loadDiscordProfile()} />;
}
