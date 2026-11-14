import Developing from "./developing";
import { generatePageMetadata } from "../lib/og/metadata";

export function generateMetadata() {
  return generatePageMetadata("/developing");
}

export default function DevelopingPage() {
  return <Developing />;
}
