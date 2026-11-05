import Home from "./home";
import { generatePageMetadata } from "./lib/og/metadata";

export function generateMetadata() {
  return generatePageMetadata("/");
}

export default function HomePage() {
  return <Home />;
}
