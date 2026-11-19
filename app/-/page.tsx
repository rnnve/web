import type { Metadata } from "next";
import Desktop from "./desktop";

export const metadata: Metadata = {
  title: "Rynnie OS — Desktop",
  description: "A small desktop, right in your browser.",
  robots: { index: false, follow: false },
};

export default function DesktopPage() {
  return <Desktop />;
}
