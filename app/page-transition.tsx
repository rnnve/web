"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./components/loading-screen";

const FADE_AFTER = 1_200;
const REMOVE_AFTER = 1_650;

function TransitionFrame({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");

  useLayoutEffect(() => {
    const root = document.documentElement;
    const existingStartedAt = Number(root.dataset.pageLoadingStartedAt);
    const startedAt = Number.isFinite(existingStartedAt) && existingStartedAt > 0 ? existingStartedAt : Date.now();
    const elapsed = Date.now() - startedAt;

    root.dataset.pageLoading = "true";
    root.dataset.pageLoadingStartedAt = String(startedAt);

    const phaseTimer = window.setTimeout(() => setPhase(elapsed >= FADE_AFTER ? "fading" : "visible"), 0);
    const fadeTimer = window.setTimeout(() => setPhase("fading"), Math.max(0, FADE_AFTER - elapsed));
    const removeTimer = window.setTimeout(() => {
      setPhase("hidden");
      delete root.dataset.pageLoading;
      delete root.dataset.pageLoadingStartedAt;
    }, Math.max(0, REMOVE_AFTER - elapsed));

    return () => {
      window.clearTimeout(phaseTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [pathname]);

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
  return <TransitionFrame pathname={pathname}>{children}</TransitionFrame>;
}
