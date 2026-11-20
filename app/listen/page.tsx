import { generatePageMetadata } from "../lib/og/metadata";
import ListenDashboard from "./listen-dashboard";
export function generateMetadata() {
  return generatePageMetadata("/listen");
}
export default function ListenPage() {
  return <ListenDashboard />;
}
