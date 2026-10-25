import type { Metadata, Viewport } from "next";
import "@fontsource-variable/google-sans-flex";
import PageTransition from "./page-transition";
import CursorEffects from "./components/cursor-effects";
import ExternalLinkConfirmation from "./components/external-link-confirmation";
import ShardBackground from "./components/shard-background";
import favicon from "./icon.webp";
import "./globals.css";
import "./styles/navbar-collapse.css";
import "./styles/loading.css";
import "./styles/cursor-effects.css";
import "./styles/external-link-confirmation.css";
import "./styles/shard-background.css";
import "./styles/material-theme.css";

export const metadata: Metadata = {
  title: "rynnie",
  description: "Ryn's personal site.",
  icons: {
    icon: [{ url: favicon.src, type: "image/webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d050a",
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
    >
      <head><link rel="preload" as="image" href="/loading.webp" /></head>
      <body>
        <CursorEffects />
        <ExternalLinkConfirmation />
        <ShardBackground />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
