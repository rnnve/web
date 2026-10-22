"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./components/loading-screen";

function LoadingOverlay() {
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), 1_200);
    const removeTimer = window.setTimeout(() => setMounted(false), 1_750);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!mounted) return null;

  return <LoadingScreen overlay fading={fading} />;
}

function TransitionFrame({ children }: { children: React.ReactNode }) {
  const [timedBlocked, setTimedBlocked] = useState(true);

  useEffect(() => {
    const unblockTimer = window.setTimeout(() => setTimedBlocked(false), 1_750);
    return () => window.clearTimeout(unblockTimer);
  }, []);

  return (
    <>
      <LoadingOverlay />
      <div className="page-transition-content" inert={timedBlocked ? true : undefined} aria-hidden={timedBlocked || undefined}>
        {children}
      </div>
    </>
  );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <TransitionFrame key={pathname}>{children}</TransitionFrame>;
}
