"use client";

import { useEffect, useState } from "react";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSiteSettings } from "../settings/site-settings-provider";

type PendingLink = {
  href: string;
  target: string;
  displayUrl: string;
};

export default function ExternalLinkConfirmation() {
  const { t } = useSiteSettings();
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);

  useEffect(() => {
    const handleExternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.dataset.skipExternalConfirmation === "true"
      )
        return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        !["http:", "https:"].includes(destination.protocol) ||
        destination.origin === window.location.origin
      )
        return;
      event.preventDefault();
      setPendingLink({
        href: destination.href,
        target: anchor.target,
        displayUrl: destination.href.replace(/^https?:\/\//, ""),
      });
    };
    document.addEventListener("click", handleExternalLink);
    return () => document.removeEventListener("click", handleExternalLink);
  }, []);

  const continueToDestination = () => {
    if (!pendingLink) return;
    const { href, target } = pendingLink;
    setPendingLink(null);
    if (target === "_blank") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(href);
    }
  };

  return (
    <Dialog
      open={pendingLink !== null}
      onOpenChange={(open) => {
        if (!open) setPendingLink(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <IconArrowUpRight size={16} aria-hidden="true" />
          </span>
          <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {t("External destination", "ลิงก์ภายนอก")}
          </p>
          <DialogTitle>
            {t("Leave this website?", "ออกจากเว็บไซต์นี้หรือไม่?")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "You’re about to visit a website outside of Ryn’s personal site.",
              "คุณกำลังจะไปยังเว็บไซต์ภายนอกเว็บไซต์ส่วนตัวของ Ryn",
            )}
          </DialogDescription>
        </DialogHeader>
        {pendingLink && (
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-3 py-2">
            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
              {t("Continue to", "ไปยัง")}
            </span>
            <strong className="min-w-0 text-right text-xs font-medium break-all">
              {pendingLink.displayUrl}
            </strong>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPendingLink(null)}
          >
            {t("Stay here", "อยู่ที่นี่")}
          </Button>
          <Button type="button" onClick={continueToDestination}>
            {t("Continue", "ดำเนินการต่อ")}
            <IconArrowUpRight size={16} aria-hidden="true" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
