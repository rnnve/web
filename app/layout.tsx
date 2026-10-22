import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import PageTransition from "./page-transition";
import CursorEffects from "./components/cursor-effects";
import ExternalLinkConfirmation from "./components/external-link-confirmation";
import ShardBackground from "./components/shard-background";
import "./globals.css";
import "./navbar-collapse.css";
import "./loading/loading.css";
import "./cursor-effects.css";
import "./external-link-confirmation.css";
import "./shard-background.css";

export const metadata: Metadata = {
  title: "Ryn — Product designer & creative developer",
  description: "Independent product designer and creative developer shaping useful ideas into expressive digital experiences.",
};

export const viewport: Viewport = {
  themeColor: "#08130e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 2,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={GeistSans.className}>
        <CursorEffects />
        <ExternalLinkConfirmation />
        <ShardBackground />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
