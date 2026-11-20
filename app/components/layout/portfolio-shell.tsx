"use client";

import type { ReactNode } from "react";
import PageTransition from "../../page-transition";
import SiteWakeBackground from "./site-wake-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "../settings/site-settings-provider";
import ExternalLinkConfirmation from "../feedback/external-link-confirmation";
import styles from "./portfolio-navbar.module.css";
import SpotifyAccent from "./spotify-accent";
export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <SpotifyAccent />
      <ExternalLinkConfirmation />
      <div className={styles.content}>
        <PageTransition
          effects={<SiteWakeBackground />}
          persistent={<PortfolioNavbar />}
        >
          {children}
        </PageTransition>
      </div>
    </SiteSettingsProvider>
  );
}
