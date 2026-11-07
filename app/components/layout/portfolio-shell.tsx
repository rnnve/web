"use client";

import type { ReactNode } from "react";
import "@fontsource-variable/google-sans";
import PageTransition from "../../page-transition";
import SiteBackground from "./site-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "../settings/site-settings-provider";
import ExternalLinkConfirmation from "../feedback/external-link-confirmation";
export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <ExternalLinkConfirmation />
      <PageTransition
        effects={<SiteBackground />}
        persistent={<PortfolioNavbar />}
      >
        {children}
      </PageTransition>
    </SiteSettingsProvider>
  );
}
