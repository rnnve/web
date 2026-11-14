"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// The new-tab route never imports the portfolio's animations or widgets.
const PortfolioShell = dynamic(() => import("./portfolio-shell"));

export default function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/newtab" || pathname === "/nt") return children;
  if (
    pathname === "/redirect" ||
    pathname.startsWith("/redirect/") ||
    pathname === "/r" ||
    pathname.startsWith("/r/")
  )
    return children;
  return <PortfolioShell>{children}</PortfolioShell>;
}
