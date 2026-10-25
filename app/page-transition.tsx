"use client";

import { useLayoutEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";

const FADE_AFTER = 1_200;
const REMOVE_AFTER = 1_650;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.pageLoading = "true";

    const fadeTimer = window.setTimeout(() => setPhase("fading"), FADE_AFTER);
    const removeTimer = window.setTimeout(() => {
      setPhase("hidden");
      delete root.dataset.pageLoading;
    }, REMOVE_AFTER);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
      delete root.dataset.pageLoading;
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
