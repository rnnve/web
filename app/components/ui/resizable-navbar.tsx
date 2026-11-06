"use client";

import { cn } from "@/app/lib/utils";
import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useId, useRef } from "react";
import { useSiteSettings } from "../settings/site-settings-provider";
import ShapeGrid from "../effects/shape-grid";

function NavbarBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [border-radius:inherit] [background:var(--paper)]"
    >
      <ShapeGrid
        shape="cross"
        lineColor="#cecece"
        speed={0.25}
        interactive={false}
        clickCascade={false}
        fade={0}
      />
    </div>
  );
}
type NavbarProps = {
  children: React.ReactNode;
  className?: string;
};
type NavItemsProps = {
  items: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  activeLink?: string;
  className?: string;
  onItemClick?: (link: string) => void;
};
type MobileNavMenuProps = NavbarProps & {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};
export function Navbar({ children, className }: NavbarProps) {
  return <div className={cn("m3-navbar relative", className)}>{children}</div>;
}
export function NavBody({ children, className }: NavbarProps) {
  return (
    <div
      className={cn(
        "m3-navbar-surface relative isolate [width:1120px] [height:72px] [margin-inline:auto] [max-width:calc(100%_-_32px)] [padding-inline:16px] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:16px] [color:var(--md-sys-color-on-surface)] [background:color-mix(in_srgb,_var(--md-sys-color-surface-container)_55%,_transparent)] [backdrop-filter:blur(24px)] [-webkit-backdrop-filter:blur(24px)] [box-shadow:var(--md-elevation-1)] m3-navbar-desktop hidden [grid-template-columns:minmax(0,_1fr)_auto_minmax(0,_1fr)] items-center justify-between [gap:24px] min-[1024px]:grid [@media(min-width:_1024px)_and_(max-width:_1199px)]:[padding-inline:12px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:12px]",
        className,
      )}
    >
      <NavbarBackground />
      {children}
    </div>
  );
}
export function NavItems({
  items,
  activeLink,
  className,
  onItemClick,
}: NavItemsProps) {
  const { t } = useSiteSettings();
  const moreRef = useRef<HTMLDetailsElement>(null);
  const dropdownId = useId();
  const visibleItems = items.slice(0, 3);
  const overflowItems = items.slice(3);
  const overflowActive = overflowItems.some((item) => item.link === activeLink);
  useEffect(() => {
    const details = moreRef.current;
    if (!details) return;
    details.open = false;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.contains(event.target))
        details.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !details.open) return;
      details.open = false;
      details.querySelector("summary")?.focus();
    };
    const closeOnBlur = (event: FocusEvent) => {
      if (
        event.relatedTarget instanceof Node &&
        !details.contains(event.relatedTarget)
      )
        details.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    details.addEventListener("focusout", closeOnBlur);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      details.removeEventListener("focusout", closeOnBlur);
    };
  }, [activeLink, overflowItems.length]);
  return (
    <div
      className={cn(
        "m3-navbar-items flex items-center justify-center [gap:4px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:2px]",
        className,
      )}
    >
      {visibleItems.map((item) => (
        <Link
          key={item.link}
          href={item.link}
          onClick={() => onItemClick?.(item.link)}
          aria-current={activeLink === item.link ? "page" : undefined}
          className="m3-navbar-link [.m3-navbar-more-menu_&]:flex [.m3-navbar-more-menu_&]:[min-height:48px] [.m3-navbar-desktop:has(.m3-navbar-more)_&]:[padding-inline:12px] [min-height:44px] [padding:0_16px] inline-flex items-center [gap:8px] [border-radius:20px] [color:var(--md-sys-color-on-surface-variant)] [font-size:14px] [font-weight:550] [line-height:20px] [letter-spacing:0.1px] [text-decoration:none] whitespace-nowrap [transition:color_0.2s_var(--md-motion-standard),_background-color_0.2s_var(--md-motion-standard)] [&:hover]:[color:var(--md-sys-color-on-surface)] [&:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&:focus-visible]:[color:var(--md-sys-color-on-surface)] [&:focus-visible]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&[aria-current]]:[color:var(--md-sys-color-on-secondary-container)] [&[aria-current]]:[background:var(--md-sys-color-secondary-container)] [&[aria-current]]:[font-weight:650] [&[aria-current]:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-secondary-container)_8%,_var(--md-sys-color-secondary-container)_)] [.m3-navbar-menu_&]:[width:100%] [.m3-navbar-menu_&]:[min-height:48px] [.m3-navbar-menu_&]:[border-radius:24px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[padding-inline:10px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:6px] motion-reduce:[transition:none]"
        >
          {item.icon && (
            <span
              className="m3-navbar-icon inline-flex [flex-shrink:0] items-center"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          )}
          <span>{item.name}</span>
        </Link>
      ))}
      {overflowItems.length > 0 && (
        <details
          ref={moreRef}
          className="m3-navbar-more relative [&[open]_>_summary]:[color:var(--md-sys-color-on-secondary-container)] [&[open]_>_summary]:[background:var(--md-sys-color-secondary-container)]"
        >
          <summary
            className="m3-navbar-link [.m3-navbar-more-menu_&]:flex [.m3-navbar-more-menu_&]:[min-height:48px] [.m3-navbar-desktop:has(.m3-navbar-more)_&]:[padding-inline:12px] [min-height:44px] [padding:0_16px] inline-flex items-center [gap:8px] [border-radius:20px] [color:var(--md-sys-color-on-surface-variant)] [font-size:14px] [font-weight:550] [line-height:20px] [letter-spacing:0.1px] [text-decoration:none] whitespace-nowrap [transition:color_0.2s_var(--md-motion-standard),_background-color_0.2s_var(--md-motion-standard)] [&:hover]:[color:var(--md-sys-color-on-surface)] [&:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&:focus-visible]:[color:var(--md-sys-color-on-surface)] [&:focus-visible]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&[aria-current]]:[color:var(--md-sys-color-on-secondary-container)] [&[aria-current]]:[background:var(--md-sys-color-secondary-container)] [&[aria-current]]:[font-weight:650] [&[aria-current]:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-secondary-container)_8%,_var(--md-sys-color-secondary-container)_)] [.m3-navbar-menu_&]:[width:100%] [.m3-navbar-menu_&]:[min-height:48px] [.m3-navbar-menu_&]:[border-radius:24px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[padding-inline:10px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:6px] motion-reduce:[transition:none] m3-navbar-more-toggle [list-style:none] cursor-pointer [&::-webkit-details-marker]:hidden [&[data-active]]:[color:var(--md-sys-color-on-secondary-container)] [&[data-active]]:[background:var(--md-sys-color-secondary-container)]"
            aria-controls={dropdownId}
            data-active={overflowActive || undefined}
          >
            <span>{t("More", "เพิ่มเติม")}</span>
            <IconChevronDown size={16} aria-hidden="true" />
          </summary>
          <div
            id={dropdownId}
            className="m3-navbar-more-menu absolute [top:calc(100%_+_14px)] [right:0] [width:max-content] [min-width:180px] [max-height:calc(100dvh_-_128px)] [overflow-y:auto] [overscroll-behavior:contain] [padding:8px] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:20px] [background:var(--md-sys-color-surface-container-high)] [box-shadow:var(--md-elevation-2)]"
          >
            {overflowItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                aria-current={activeLink === item.link ? "page" : undefined}
                className="m3-navbar-link [.m3-navbar-more-menu_&]:flex [.m3-navbar-more-menu_&]:[min-height:48px] [.m3-navbar-desktop:has(.m3-navbar-more)_&]:[padding-inline:12px] [min-height:44px] [padding:0_16px] inline-flex items-center [gap:8px] [border-radius:20px] [color:var(--md-sys-color-on-surface-variant)] [font-size:14px] [font-weight:550] [line-height:20px] [letter-spacing:0.1px] [text-decoration:none] whitespace-nowrap [transition:color_0.2s_var(--md-motion-standard),_background-color_0.2s_var(--md-motion-standard)] [&:hover]:[color:var(--md-sys-color-on-surface)] [&:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&:focus-visible]:[color:var(--md-sys-color-on-surface)] [&:focus-visible]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&[aria-current]]:[color:var(--md-sys-color-on-secondary-container)] [&[aria-current]]:[background:var(--md-sys-color-secondary-container)] [&[aria-current]]:[font-weight:650] [&[aria-current]:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-secondary-container)_8%,_var(--md-sys-color-secondary-container)_)] [.m3-navbar-menu_&]:[width:100%] [.m3-navbar-menu_&]:[min-height:48px] [.m3-navbar-menu_&]:[border-radius:24px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[padding-inline:10px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:6px] motion-reduce:[transition:none]"
                onClick={() => {
                  if (moreRef.current) moreRef.current.open = false;
                  onItemClick?.(item.link);
                }}
              >
                {item.icon && (
                  <span
                    className="m3-navbar-icon inline-flex [flex-shrink:0] items-center"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
export function MobileNav({ children, className }: NavbarProps) {
  return (
    <div
      className={cn(
        "m3-navbar-surface relative isolate [margin-inline:auto] [width:calc(100%_-_32px)] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:16px] [color:var(--md-sys-color-on-surface)] [background:color-mix(in_srgb,_var(--md-sys-color-surface-container)_55%,_transparent)] [backdrop-filter:blur(24px)] [-webkit-backdrop-filter:blur(24px)] [box-shadow:var(--md-elevation-1)] m3-navbar-mobile [min-height:64px] [padding-inline:12px] min-[1024px]:hidden",
        className,
      )}
    >
      <NavbarBackground />
      {children}
    </div>
  );
}
export function MobileNavHeader({ children, className }: NavbarProps) {
  return (
    <div
      className={cn(
        "m3-navbar-mobile-header [min-height:62px] flex items-center justify-between [gap:12px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
export function MobileNavMenu({
  children,
  className,
  isOpen,
  onClose,
  id = "mobile-navigation-menu",
}: MobileNavMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest("[data-navbar-toggle]")
      )
        return;
      if (!menuRef.current?.contains(target)) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          id={id}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: -8,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -8,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.2,
            ease: [0.2, 0, 0, 1],
          }}
          className={cn(
            "m3-navbar-menu absolute [inset-inline:0] [top:calc(100%_+_8px)] [max-height:calc(_100dvh_-_112px_-_env(safe-area-inset-top,_0px)_-_env(safe-area-inset-bottom,_0px)_)] [overflow-y:auto] [overflow-x:hidden] [overscroll-behavior:contain] [padding:12px] flex flex-col [gap:4px] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:var(--md-shape-extra-large)] [color:var(--md-sys-color-on-surface)] [background:var(--md-sys-color-surface-container-high)] [box-shadow:var(--md-elevation-2)]",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  const { t } = useSiteSettings();
  const Icon = isOpen ? IconX : IconMenu2;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        isOpen
          ? t("Close navigation menu", "ปิดเมนูนำทาง")
          : t("Open navigation menu", "เปิดเมนูนำทาง")
      }
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
      data-navbar-toggle
      className="m3-navbar-toggle [&:active]:[opacity:0.85] [width:48px] [height:48px] inline-flex items-center justify-center [border:0] [border-radius:50%] [color:var(--md-sys-color-on-surface-variant)] [background:transparent] [transition:background-color_0.2s_var(--md-motion-standard)] [&:hover]:[color:var(--md-sys-color-on-secondary-container)] [&:hover]:[background:var(--md-sys-color-secondary-container)] [&[aria-expanded='true']]:[color:var(--md-sys-color-on-secondary-container)] [&[aria-expanded='true']]:[background:var(--md-sys-color-secondary-container)] motion-reduce:[transition:none]"
    >
      <Icon size={24} aria-hidden="true" />
    </button>
  );
}
export function NavbarLogo({
  imageSrc = "/pfp/ena1.webp",
}: {
  imageSrc?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Rynnie home"
      className="m3-navbar-logo [justify-self:start] inline-flex [flex-shrink:0] items-center [gap:10px] [border-radius:var(--md-shape-medium)] [color:var(--md-sys-color-on-surface)] [font-size:18px] [font-weight:650] [letter-spacing:-0.4px] [text-decoration:none] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:8px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[font-size:16px]"
    >
      <Image
        src={imageSrc}
        alt=""
        width={36}
        height={36}
        className="m3-navbar-avatar [width:36px] [height:36px] [border:1px_solid_var(--md-sys-color-outline-variant)] [border-radius:50%] [object-fit:cover] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[width:32px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[height:32px]"
      />
      <span>
        Rynnie
        <span className="m3-navbar-brand-dot [color:var(--md-sys-color-primary)]">
          .
        </span>
      </span>
    </Link>
  );
}
export function NavbarButton({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">
)) {
  return (
    <Tag
      href={href || undefined}
      className={cn(
        "m3-navbar-button [.m3-navbar-desktop:has(.m3-navbar-more)_&]:[padding-inline:18px] relative [min-height:44px] [min-width:64px] [padding:0_24px] inline-flex items-center justify-center [gap:8px] [border:0] [border-radius:999px] [font-size:14px] [font-weight:600] [line-height:20px] [letter-spacing:0.1px] text-center [text-decoration:none] whitespace-nowrap [transition:background-color_0.2s_var(--md-motion-standard)] [&[data-variant='primary']]:[color:var(--md-sys-color-on-primary)] [&[data-variant='primary']]:[background:var(--md-sys-color-primary)] [&[data-variant='primary']:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-primary)_8%,_var(--md-sys-color-primary)_)] [&[data-variant='secondary']]:[color:var(--md-sys-color-on-secondary-container)] [&[data-variant='secondary']]:[background:var(--md-sys-color-secondary-container)] [&[data-variant='secondary']:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-secondary-container)_8%,_var(--md-sys-color-secondary-container)_)] [&[data-variant='dark']]:[color:var(--md-sys-color-on-surface)] [&[data-variant='dark']]:[background:var(--md-sys-color-surface-container-highest)] [&:active]:[opacity:0.85] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[padding-inline:14px] motion-reduce:[transition:none]",
        className,
      )}
      data-variant={variant === "gradient" ? "primary" : variant}
      {...props}
    >
      {children}
    </Tag>
  );
}
