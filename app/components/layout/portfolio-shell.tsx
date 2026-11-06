"use client";

import { useCallback, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import "@fontsource-variable/google-sans";
import PageTransition from "../../page-transition";
import SiteBackground from "./site-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "../settings/site-settings-provider";
import ExternalLinkConfirmation from "../feedback/external-link-confirmation";
export default function PortfolioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [initialVisitComplete, setInitialVisitComplete] = useState(false);
  const handleLoadingComplete = useCallback(() => {
    setInitialVisitComplete(true);
  }, []);

  return (
    <SiteSettingsProvider>
      <link rel="preload" as="image" href="/loading.webp" />
      <ExternalLinkConfirmation />
      <PageTransition
        key={pathname}
        effects={<SiteBackground />}
        durationMs={initialVisitComplete ? 1_000 : 1_500}
        onComplete={handleLoadingComplete}
      >
        <PortfolioNavbar />
        {children}
      </PageTransition>
    </SiteSettingsProvider>
  );
}
