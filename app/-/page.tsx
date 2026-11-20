import type { Metadata } from "next";
import SiteSettingsProvider from "../components/settings/site-settings-provider";
import SpotifyAccent from "../components/layout/spotify-accent";
import Desktop from "./desktop";

export const metadata: Metadata = {
  title: "Rynnie OS — Desktop",
  description: "A small desktop, right in your browser.",
  robots: { index: false, follow: false },
};

export default function DesktopPage() {
  return (
    <SiteSettingsProvider>
      <SpotifyAccent />
      <Desktop />
    </SiteSettingsProvider>
  );
}
