"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ViewTransition, type ReactNode } from "react";
import "./mode-transition.css";

// Standalone routes never import the portfolio's animations or widgets.
const PortfolioShell = dynamic(() => import("./portfolio-shell"));

export default function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const desktop = pathname === "/-";
  const standalone =
    desktop ||
    pathname === "/docs" ||
    pathname.startsWith("/docs/") ||
    pathname === "/newtab" ||
    pathname === "/nt" ||
    pathname === "/redirect" ||
    pathname.startsWith("/redirect/") ||
    pathname === "/r" ||
    pathname.startsWith("/r/");

  // The key changes only when switching modes, so normal site routes stay instant.
  return (
    <ViewTransition
      key={desktop ? "desktop" : "site"}
      default="none"
      enter={desktop ? "mode-to-desktop" : "mode-to-site"}
      exit={desktop ? "mode-to-site" : "mode-to-desktop"}
    >
      <div data-mode-surface={desktop ? "desktop" : "site"}>
        {standalone ? children : <PortfolioShell>{children}</PortfolioShell>}
      </div>
    </ViewTransition>
  );
}
