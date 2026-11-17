"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/app/lib/utils";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { useSiteSettings } from "@/app/components/settings/site-settings-provider";

export function Header() {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const scrolled = useScroll(10);
  const pathname = usePathname();
  const { t, language } = useSiteSettings();
  const links = [
    { label: t("Home", "หน้าแรก"), href: "/" },
    { label: t("Developing", "งานพัฒนา"), href: "/developing" },
    { label: t("Listening", "เพลงที่ฟัง"), href: "/listen" },
    { label: t("Birthday", "วันเกิด"), href: "/birthday" },
    { label: t("Ask", "ถามเรา"), href: "/ask" },
  ];

  // Release the menu's scroll lock before the external-link dialog takes over.
  React.useLayoutEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    closeOnDesktop();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const navigation = links.map((link) => (
    <Link
      key={link.href}
      className={buttonVariants({
        variant: "ghost",
        size: "sm",
        className:
          "justify-start aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground",
      })}
      href={`${link.href}#${language}`}
      aria-current={pathname === link.href ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {link.label}
    </Link>
  ));

  const socialLinks = (
    <>
      <Button asChild variant="outline">
        <a
          href="https://github.com/rnnve"
          target="_blank"
          rel="noreferrer"
          aria-label={t(
            "GitHub (opens in a new tab)",
            "GitHub (เปิดในแท็บใหม่)",
          )}
          onClick={() => setOpen(false)}
        >
          GitHub
        </a>
      </Button>
      <Button asChild>
        <a
          href="https://haunt.gg/rnn"
          target="_blank"
          rel="noreferrer"
          aria-label={t(
            "Socials (opens in a new tab)",
            "โซเชียล (เปิดในแท็บใหม่)",
          )}
          onClick={() => setOpen(false)}
        >
          {t("Socials", "โซเชียล")}
        </a>
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "portfolio-navbar-root fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent bg-background/90 pt-[env(safe-area-inset-top)] text-foreground backdrop-blur-lg md:rounded-md md:border md:transition-all md:ease-out motion-reduce:transition-none",
        scrolled &&
          !open &&
          "border-border bg-background/95 supports-[backdrop-filter]:bg-background/50 md:top-4 md:max-w-4xl md:shadow",
      )}
    >
      <nav
        aria-label={t("Primary navigation", "เมนูหลัก")}
        className={cn(
          "flex h-14 w-full items-center justify-between gap-3 px-4 md:h-12 md:transition-all md:ease-out",
          scrolled && "md:px-2",
        )}
      >
        <Link
          href={`/#${language}`}
          aria-label={t("Ryn — home", "Ryn — หน้าแรก")}
          className="text-xl font-semibold tracking-tight"
        >
          ryn<span className="text-primary">.</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {navigation}
          <div className="ml-2 flex gap-2">{socialLinks}</div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => setOpen(true)}
          className="md:hidden"
          aria-label={t("Open menu", "เปิดเมนู")}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
        >
          <MenuToggleIcon open={open} duration={300} />
        </Button>
      </nav>
      <dialog
        ref={dialogRef}
        id="mobile-navigation"
        aria-label={t("Navigation menu", "เมนูนำทาง")}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-background/95 p-0 text-foreground backdrop-blur-lg backdrop:bg-background/50 md:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center justify-between border-b border-border px-4 pt-[env(safe-area-inset-top)]">
            <span className="text-xl font-semibold tracking-tight">ryn.</span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setOpen(false)}
              aria-label={t("Close menu", "ปิดเมนู")}
            >
              <MenuToggleIcon open duration={300} />
            </Button>
          </div>
          <nav
            aria-label={t("Primary navigation", "เมนูหลัก")}
            className="flex flex-1 flex-col justify-between gap-8 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="grid gap-2">{navigation}</div>
            <div className="flex flex-col gap-2">{socialLinks}</div>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
