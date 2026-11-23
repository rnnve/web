import Link from "next/link";
import { Button } from "@/components/ui/button";
import DocsEntryLink from "@/components/docs/docs-entry-link";

export default function NotFoundView({
  title = "Page not found",
  description = "That route doesn’t exist, or it moved. Head home or browse the docs.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--surface-hover),transparent_55%),radial-gradient(ellipse_at_bottom_right,var(--accent-subtle),transparent_45%)]"
      />
      <div className="relative z-[1] w-full max-w-lg text-center">
        <p className="mb-3 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <DocsEntryLink>Open docs</DocsEntryLink>
          </Button>
        </div>
      </div>
    </main>
  );
}
