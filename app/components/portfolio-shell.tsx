"use client";

import type { ReactNode } from "react";
import "@fontsource-variable/google-sans";
import PageTransition from "../page-transition";
import SiteBackground from "./site-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "./site-settings-provider";
import ExternalLinkConfirmation from "./external-link-confirmation";
export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <link rel="preload" as="image" href="/loading.webp" />
      <ExternalLinkConfirmation />
      <PageTransition effects={<SiteBackground />}>
        <PortfolioNavbar />
        {children}
      </PageTransition>
    </SiteSettingsProvider>
  );
}
