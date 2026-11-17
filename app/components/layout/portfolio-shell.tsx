"use client";

import type { ReactNode } from "react";
import PageTransition from "../../page-transition";
import SiteBackground from "./site-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "../settings/site-settings-provider";
import ExternalLinkConfirmation from "../feedback/external-link-confirmation";
import styles from "./portfolio-navbar.module.css";
import LanguageSwitcher from "../settings/language-switcher";
import SpotifyAccent from "./spotify-accent";
export default function PortfolioShell({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <SpotifyAccent />
      <ExternalLinkConfirmation />
      <div className={styles.content}>
        <PageTransition
          effects={<SiteBackground />}
          persistent={
            <>
              <PortfolioNavbar />
              <LanguageSwitcher />
            </>
          }
        >
          {children}
        </PageTransition>
      </div>
    </SiteSettingsProvider>
  );
}
