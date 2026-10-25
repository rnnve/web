"use client";

import { useEffect, useRef, useState } from "react";
import ExternalLinkIcon from "./external-link-icon";

type PendingLink = {
  href: string;
  target: string;
  displayUrl: string;
};

export default function ExternalLinkConfirmation() {
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleExternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || anchor.dataset.skipExternalConfirmation === "true") return;

      const destination = new URL(anchor.href, window.location.href);
      if (!['http:', 'https:'].includes(destination.protocol) || destination.origin === window.location.origin) return;

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
    <div className="external-confirmation" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingLink(null); }}>
      <section className="external-confirmation__modal" role="dialog" aria-modal="true" aria-labelledby="external-confirmation-title" aria-describedby="external-confirmation-description">
        <div className="external-confirmation__icon"><ExternalLinkIcon size={25}/></div>
        <p className="external-confirmation__eyebrow">External destination</p>
        <h2 id="external-confirmation-title">Leave this website?</h2>
        <p id="external-confirmation-description">You&apos;re about to visit a website outside of Ryn&apos;s personal site.</p>
        <div className="external-confirmation__destination"><span>Continue to</span><strong>{pendingLink.displayUrl}</strong></div>
        <div className="external-confirmation__actions">
          <button ref={cancelRef} type="button" className="external-confirmation__cancel" onClick={() => setPendingLink(null)}>Stay here</button>
          <button type="button" className="external-confirmation__continue" onClick={continueToDestination}>Continue <ExternalLinkIcon size={16}/></button>
        </div>
      </section>
    </div>
  );
}
