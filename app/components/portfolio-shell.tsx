"use client";

import type { ReactNode } from "react";
import "@fontsource-variable/google-sans";
import PageTransition from "../page-transition";
import CursorEffects from "./cursor-effects";
import SiteBackground from "./site-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "./site-settings-provider";
import ExternalLinkConfirmation from "./external-link-confirmation";
import "../styles/loading.css";
import "../styles/external-link-confirmation.css";
import "../styles/material-theme.css";

export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <link rel="preload" as="image" href="/loading.webp" />
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
  );
}
