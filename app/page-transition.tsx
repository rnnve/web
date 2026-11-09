"use client";

import { createContext, useContext } from "react";
import { MotionConfig } from "motion/react";

const PageReadyContext = createContext(true);

export function usePageReady() {
  return useContext(PageReadyContext);
}

export default function PageTransition({
  children,
  effects,
  persistent,
}: {
  children: React.ReactNode;
  effects?: React.ReactNode;
  persistent?: React.ReactNode;
}) {
  return (
    <PageReadyContext.Provider value>
      <MotionConfig reducedMotion="user">
        {effects}
        {persistent}
        <div className="page-transition-content relative [z-index:1] [min-height:100svh]">
          {children}
        </div>
      </MotionConfig>
    </PageReadyContext.Provider>
  );
}
