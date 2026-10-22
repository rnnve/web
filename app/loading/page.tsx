import type { Metadata } from "next";
import LoadingScreen from "../components/loading-screen";

export const metadata: Metadata = {
  title: "Loading · Rynni",
  description: "A purple, glassmorphic loading animation.",
};

export default function LoadingPage() {
  return <LoadingScreen />;
}
