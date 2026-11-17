"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/ui/header-2";

export default function PortfolioNavbar() {
  const pathname = usePathname();
  return <Header key={pathname} />;
}
