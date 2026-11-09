import type { Metadata } from "next";
import SiteSettingsProvider from "../components/settings/site-settings-provider";

export const metadata: Metadata = {
  title: "Redirecting · Rynnie",
  robots: { index: false, follow: false },
};

export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteSettingsProvider>{children}</SiteSettingsProvider>;
}
