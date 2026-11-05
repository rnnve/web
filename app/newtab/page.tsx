import { generatePageMetadata } from "../lib/og/metadata";
import type { Viewport } from "next";
import NewTab from "./new-tab";
import styles from "./new-tab.styles";
export async function generateMetadata() {
  return {
    ...(await generatePageMetadata("/newtab")),
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: {
        url: "/newtab.svg",
        type: "image/svg+xml",
      },
    },
  };
}
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
