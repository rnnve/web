"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./components/loading-screen";

function TransitionFrame({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");

  useLayoutEffect(() => {
    document.documentElement.dataset.pageLoading = "true";
    const fadeTimer = window.setTimeout(() => setPhase("fading"), 1_200);
    const removeTimer = window.setTimeout(() => {
      setPhase("hidden");
      delete document.documentElement.dataset.pageLoading;
    }, 1_650);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
      delete document.documentElement.dataset.pageLoading;
    };
  }, []);

  const blocked = phase !== "hidden";
  return (
    <>
      {blocked && <LoadingScreen overlay fading={phase === "fading"} />}
      <div className="page-transition-content" inert={blocked ? true : undefined} aria-hidden={blocked || undefined}>
        {children}
      </div>
    </>
  );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <TransitionFrame key={pathname}>{children}</TransitionFrame>;
}
