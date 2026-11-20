"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function SiteCornerControls() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (pathname === "/-") return null;

  const onDocs = pathname === "/docs" || pathname.startsWith("/docs/");
  // SSR / first paint assume dark (site default) until the client resolves theme.
  const isDark = !isClient || resolvedTheme !== "light";

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[80] flex flex-col gap-2 sm:right-5 sm:bottom-5"
      style={{
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}
    >
      <div className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-md backdrop-blur-xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                isDark ? "Switch to light theme" : "Switch to dark theme"
              }
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <HugeiconsIcon
                icon={isDark ? Sun01Icon : Moon01Icon}
                size={18}
                strokeWidth={1.8}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isDark ? "Light theme" : "Dark theme"}
          </TooltipContent>
        </Tooltip>

        {!onDocs ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/docs" aria-label="Open documentation">
                  <HugeiconsIcon
                    icon={BookOpen01Icon}
                    size={18}
                    strokeWidth={1.8}
                  />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Docs</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}
