import type { Metadata, Viewport } from "next";
import NewTab from "./new-tab";
import styles from "./new-tab.module.css";

export const metadata: Metadata = {
  title: "New tab",
  description: "A quiet place to start. Your time, search, and favorite links.",
  robots: { index: false, follow: false },
  icons: { icon: { url: "/newtab.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  themeColor: "#141417",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function NewTabPage() {
  return (
    <main className={styles.page}>
      <NewTab />
    </main>
  );
}
