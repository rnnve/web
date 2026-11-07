"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

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
  const pathname = usePathname();

  return (
    <PageReadyContext.Provider value>
      <MotionConfig reducedMotion="user">
        {effects}
        {persistent}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            className="page-transition-content relative [z-index:1] [min-height:100svh]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              opacity: { duration: 0.18, ease: "easeOut" },
              y: { duration: 0.24, ease: [0.2, 0, 0, 1] },
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    </PageReadyContext.Provider>
  );
}
