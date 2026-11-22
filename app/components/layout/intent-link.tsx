"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/** Warm a destination when the visitor approaches it, rather than every visible page. */
export default function IntentLink({
  onPointerEnter,
  onFocus,
  onTouchStart,
  prefetch,
  ...props
}: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={prefetch === undefined ? (intent ? null : false) : prefetch}
      onPointerEnter={(event) => {
        setIntent(true);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
    />
  );
}
