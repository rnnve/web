"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "../settings/site-settings-provider";
import ExternalLinkIcon from "../ui/external-link-icon";
type PendingLink = {
  href: string;
  target: string;
  displayUrl: string;
};
export default function ExternalLinkConfirmation() {
  const { t } = useSiteSettings();
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
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
  useEffect(() => {
    if (!pendingLink) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingLink(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingLink]);
  if (!pendingLink) return null;
  const continueToDestination = () => {
    const { href, target } = pendingLink;
    setPendingLink(null);
    if (target === "_blank") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(href);
    }
  };
  return (
    <div
      className="external-confirmation [background:color-mix(in_srgb,_var(--page-background)_38%,_transparent)] [backdrop-filter:blur(18px)_saturate(125%)] [-webkit-backdrop-filter:none] fixed [inset:0] [z-index:12000] grid [place-items:center] [padding:22px] [animation:external-backdrop-in_0.24s_ease_both] max-[481px]:[padding:max(14px,_env(safe-area-inset-top))_14px_max(14px,_env(safe-area-inset-bottom))]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setPendingLink(null);
      }}
    >
      <section
        className="external-confirmation__modal [border:1px_solid_color-mix(in_srgb,_var(--accent)_28%,_var(--border))] [border-radius:24px_24px_10px_24px] [background:color-mix(in_srgb,_var(--surface-panel)_78%,_transparent)] [box-shadow:inset_0_1px_0_color-mix(in_srgb,_white_12%,_transparent),_0_28px_80px_color-mix(in_srgb,_var(--shadow)_90%,_transparent)] [backdrop-filter:blur(30px)_saturate(145%)] [-webkit-backdrop-filter:none] [width:min(440px,_100%)] [padding:30px] [color:var(--text)] [animation:external-modal-in_0.34s_var(--ease)_both] [&_h2]:[margin:0] [&_h2]:[font-size:clamp(29px,_6vw,_38px)] [&_h2]:[line-height:1] [&_h2]:[letter-spacing:-1.6px] [&_>_p:not(.external-confirmation\\_\\_eyebrow)]:[margin:15px_0_0] [&_>_p:not(.external-confirmation\\_\\_eyebrow)]:[color:var(--text-muted)] [&_>_p:not(.external-confirmation\\_\\_eyebrow)]:[font-size:13px] [&_>_p:not(.external-confirmation\\_\\_eyebrow)]:[line-height:1.65] max-[481px]:[max-height:calc(100dvh_-_28px)] max-[481px]:[overflow-y:auto] max-[481px]:[padding:22px] max-[481px]:[border-radius:20px_20px_8px_20px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-confirmation-title"
        aria-describedby="external-confirmation-description"
      >
        <div className="external-confirmation__icon [border-radius:15px_15px_6px_15px] [color:var(--page-background)] [background:linear-gradient(145deg,_var(--accent),_var(--accent))] [box-shadow:0_10px_24px_color-mix(in_srgb,_var(--accent)_28%,_transparent)] [width:48px] [height:48px] grid [place-items:center] [font-size:23px] [font-weight:900]">
          <ExternalLinkIcon size={25} />
        </div>
        <p className="external-confirmation__eyebrow [color:var(--accent)] [letter-spacing:1.4px] uppercase [margin:24px_0_8px] [font-size:9px] [font-weight:900]">
          {t("External destination", "ลิงก์ภายนอก")}
        </p>
        <h2 id="external-confirmation-title">
          {t("Leave this website?", "ออกจากเว็บไซต์นี้หรือไม่?")}
        </h2>
        <p id="external-confirmation-description">
          {t(
            "You’re about to visit a website outside of Ryn’s personal site.",
            "คุณกำลังจะไปยังเว็บไซต์ภายนอกเว็บไซต์ส่วนตัวของ Ryn",
          )}
        </p>
        <div className="external-confirmation__destination [border-radius:14px_14px_6px_14px] [border-color:var(--border)] [background:color-mix(in_srgb,_var(--accent-subtle)_30%,_transparent)] [margin-top:22px] [padding:13px_15px] flex items-center justify-between [gap:16px] [border:1px_solid_color-mix(in_srgb,_var(--accent)_20%,_var(--border))] [&_span]:[color:var(--text-muted)] [&_span]:[font-size:9px] [&_span]:uppercase [&_span]:[letter-spacing:0.7px] [&_strong]:[min-width:0] [&_strong]:[font-size:11px] [&_strong]:[line-height:1.45] [&_strong]:text-right [&_strong]:[overflow-wrap:anywhere]">
          <span>{t("Continue to", "ไปยัง")}</span>
          <strong>{pendingLink.displayUrl}</strong>
        </div>
        <div className="external-confirmation__actions [&_button]:[border-radius:14px] [&_button]:[min-height:48px] [&_button]:[font-size:11px] [&_button]:[font-weight:900] [&_button]:cursor-pointer [&_button]:[transition:transform_0.22s_var(--ease),_background_0.2s] [margin-top:24px] grid [grid-template-columns:1fr_1fr] [gap:10px] [&_button:hover]:[transform:translateY(-2px)] max-[481px]:[grid-template-columns:1fr]">
          <button
            ref={cancelRef}
            type="button"
            className="external-confirmation__cancel [border-color:var(--text-faint)] [background:color-mix(in_srgb,_var(--surface-panel)_62%,_transparent)] [border:1px_solid_var(--border)] [color:var(--text)] [&:hover]:[background:var(--surface-sunken)]"
            onClick={() => setPendingLink(null)}
          >
            {t("Stay here", "อยู่ที่นี่")}
          </button>
          <button
            type="button"
            className="external-confirmation__continue [color:var(--page-background)] [background:var(--accent)] flex items-center justify-center [gap:9px] [border:0] [&:hover]:[background:var(--accent)]"
            onClick={continueToDestination}
          >
            {t("Continue", "ดำเนินการต่อ")} <ExternalLinkIcon size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
