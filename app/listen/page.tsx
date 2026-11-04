import type { Metadata } from "next";
import ListenDashboard from "./listen-dashboard";
import "../styles/listening-widget.css";

export const metadata: Metadata = {
  title: "Listening · Rynnie",
  description: "A little look at what Rynnie has been listening to.",
  alternates: { canonical: "https://rynni.cc/listen" },
};

export default function ListenPage() {
  return <ListenDashboard />;
}
