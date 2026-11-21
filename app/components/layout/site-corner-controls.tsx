"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SiteCornerControls() {
  const pathname = usePathname();

  if (
    pathname === "/-" ||
    pathname === "/docs" ||
    pathname.startsWith("/docs/")
  )
    return null;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[80] hidden flex-col gap-2 sm:right-5 sm:bottom-5 md:flex"
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}
    >
      <div className="pointer-events-auto flex flex-row items-center gap-1 rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-md backdrop-blur-xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/-" aria-label="Open desktop">
                <HugeiconsIcon
                  icon={ComputerIcon}
                  size={16}
                  strokeWidth={1.8}
                />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Desktop</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
