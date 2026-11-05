import { generatePageMetadata } from "../lib/og/metadata";
import ListenDashboard from "./listen-dashboard";
export async function generateMetadata() {
  return {
    ...(await generatePageMetadata("/listen")),
    alternates: { canonical: "https://rynni.cc/listen" },
  };
}
export default function ListenPage() {
  return <ListenDashboard />;
}
