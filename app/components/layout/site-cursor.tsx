"use client";

import { usePathname } from "next/navigation";
import TargetCursor from "../effects/TargetCursor";

const TARGETS =
  "a, button, summary, input, textarea, select, [role='button'], [role='link']";

export default function SiteCursor() {
  const pathname = usePathname();
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return null;

  return (
    <TargetCursor
      targetSelector={TARGETS}
      spinDuration={2}
      hideDefaultCursor
      parallaxOn={false}
      cornerSize={10}
      thickness={2}
      dotSize={5}
      blendMode="exclusion"
    />
  );
}
