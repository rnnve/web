"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { rememberDocsReturn } from "@/app/lib/docs-return";

export default function DocsEntryLink({
  children,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Link
      href="/docs"
      {...props}
      onClick={(event) => {
        rememberDocsReturn(`${pathname}${window.location.search}`);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
