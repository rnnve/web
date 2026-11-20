"use client";

import WakeGlyph from "@/components/ui/background-ascii-wake";

export default function SiteWakeBackground() {
  return (
    <div
      className="site-background pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
      aria-hidden="true"
    >
      <WakeGlyph globalPointer className="absolute inset-0" />
    </div>
  );
}
