import type { Metadata, Viewport } from "next";
import "@fontsource-variable/google-sans";
import PageTransition from "./page-transition";
import CursorEffects from "./components/cursor-effects";
import SiteBackground from "./components/site-background";
import PortfolioNavbar from "./components/portfolio-navbar";
import SiteSettingsProvider from "./components/site-settings-provider";
import ExternalLinkConfirmation from "./components/external-link-confirmation";
import favicon from "./icon.webp";
import "./globals.css";
import "./styles/loading.css";
import "./styles/external-link-confirmation.css";
import "./styles/material-theme.css";

export const metadata: Metadata = {
  title: "rynnie",
  description: "Ryn's personal site.",
  icons: {
    icon: [{ url: favicon.src, type: "image/webp" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
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
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preload" as="image" href="/loading.webp" />
      </head>
      <body>
        <SiteSettingsProvider>
          <ExternalLinkConfirmation />
          <PageTransition
            effects={
              <>
                <SiteBackground />
                <CursorEffects />
              </>
            }
          >
            <PortfolioNavbar />
            {children}
          </PageTransition>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
