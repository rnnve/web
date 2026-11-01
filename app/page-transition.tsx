"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import LoadingScreen from "./components/loading-screen";

const FADE_AFTER = 1_200;
const FADE_DURATION = 450;

const PageReadyContext = createContext(false);

export function usePageReady() {
  return useContext(PageReadyContext);
}

export default function PageTransition({
  children,
  effects,
}: {
  children: React.ReactNode;
  effects?: React.ReactNode;
}) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">(
    "visible",
  );

  const blocked = phase !== "hidden";

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (blocked) root.dataset.pageLoading = "true";
    else delete root.dataset.pageLoading;
    return () => {
      delete root.dataset.pageLoading;
    };
  }, [blocked]);

  // Start each timer after its phase commits so a busy first frame cannot
  // consume the fade duration before the fade has actually begun.
  useEffect(() => {
    if (phase === "hidden") return;
    const timer = window.setTimeout(
      () => setPhase(phase === "visible" ? "fading" : "hidden"),
      phase === "visible" ? FADE_AFTER : FADE_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <PageReadyContext.Provider value={!blocked}>
      {effects}
      {blocked && <LoadingScreen overlay fading={phase === "fading"} />}
      <div
        className="page-transition-content"
        inert={blocked ? true : undefined}
        aria-hidden={blocked || undefined}
      >
        {children}
      </div>
    </PageReadyContext.Provider>
  );
}
