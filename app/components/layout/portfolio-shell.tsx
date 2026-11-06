"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import "@fontsource-variable/google-sans";
import PageTransition from "../../page-transition";
import SiteBackground from "./site-background";
import PortfolioNavbar from "./portfolio-navbar";
import SiteSettingsProvider from "../settings/site-settings-provider";
import ExternalLinkConfirmation from "../feedback/external-link-confirmation";
export default function PortfolioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <SiteSettingsProvider>
      <link rel="preload" as="image" href="/loading.webp" />
      <ExternalLinkConfirmation />
      <PageTransition key={pathname} effects={<SiteBackground />}>
        <PortfolioNavbar />
        {children}
      </PageTransition>
    </SiteSettingsProvider>
  );
}
