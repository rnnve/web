import type { Metadata } from "next";
import StatusDashboard from "./status-dashboard";

export const metadata: Metadata = {
  title: "Live Status — Ryn",
  description: "Live Discord presence and Spotify listening status.",
};

export default function TestPage() {
  return <StatusDashboard />;
}
