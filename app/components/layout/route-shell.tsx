"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Standalone routes never import the portfolio's animations or widgets.
const PortfolioShell = dynamic(() => import("./portfolio-shell"));

export default function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/-" || pathname === "/newtab" || pathname === "/nt")
    return children;
  if (
    pathname === "/redirect" ||
    pathname.startsWith("/redirect/") ||
    pathname === "/r" ||
    pathname.startsWith("/r/")
  )
    return children;
  return <PortfolioShell>{children}</PortfolioShell>;
}
