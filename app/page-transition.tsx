"use client";

import { createContext, useContext, useEffect, useState } from "react";
import LoadingScreen from "./components/feedback/loading-screen";
const PageReadyContext = createContext(false);
export function usePageReady() {
  return useContext(PageReadyContext);
}
export default function PageTransition({
  children,
  effects,
  durationMs = 1_500,
  onComplete,
}: {
  children: React.ReactNode;
  effects?: React.ReactNode;
  durationMs?: number;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">(
    "visible",
  );
  const blocked = phase !== "hidden";
  useEffect(() => {
    let finish: ReturnType<typeof setTimeout>;
    const show = setTimeout(() => {
      setPhase("fading");
      finish = setTimeout(() => {
        setPhase("hidden");
        onComplete?.();
      }, 180);
    }, durationMs);
    return () => {
      clearTimeout(show);
      clearTimeout(finish);
    };
  }, [durationMs, onComplete]);
  return (
    <PageReadyContext.Provider value={!blocked}>
      {effects}
      {blocked && (
        <LoadingScreen
          overlay
          fading={phase === "fading"}
          durationMs={durationMs}
        />
      )}
      <div
        className="page-transition-content relative [z-index:1] [min-height:100svh]"
        inert={blocked || undefined}
        aria-hidden={blocked || undefined}
      >
        {children}
      </div>
    </PageReadyContext.Provider>
  );
}
