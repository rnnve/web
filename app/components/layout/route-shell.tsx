"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Standalone routes never import the portfolio's animations or widgets.
const PortfolioShell = dynamic(() => import("./portfolio-shell"));

export default function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const standalone =
    pathname === "/docs" ||
    pathname.startsWith("/docs/") ||
    pathname === "/_nf" ||
    pathname === "/nf" ||
    pathname === "/newtab" ||
    pathname === "/nt" ||
    pathname === "/redirect" ||
    pathname.startsWith("/redirect/") ||
    pathname === "/r" ||
    pathname.startsWith("/r/");

  return standalone ? children : <PortfolioShell>{children}</PortfolioShell>;
}
