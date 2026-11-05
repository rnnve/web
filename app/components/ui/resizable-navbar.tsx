"use client";

import { cn } from "@/app/lib/utils";
import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useId, useRef, useState } from "react";
import { useSiteSettings } from "../site-settings-provider";
import "@/app/styles/material-navbar.css";

type NavbarProps = {
  children: React.ReactNode;
  className?: string;
};

type NavSurfaceProps = NavbarProps & { visible?: boolean };

type NavItemsProps = {
  items: { name: string; link: string; icon?: React.ReactNode }[];
  activeLink?: string;
  className?: string;
  onItemClick?: (link: string) => void;
};

type MobileNavMenuProps = NavbarProps & {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};

const resizeTransition = {
  type: "spring",
  stiffness: 200,
  damping: 50,
} as const;

export function Navbar({ children, className }: NavbarProps) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setVisible(latest > 100));

  return (
    <div className={cn("m3-navbar", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </div>
  );
}

export function NavBody({ children, className, visible }: NavSurfaceProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ width: visible ? 1040 : 1120, height: visible ? 64 : 72 }}
      transition={reduceMotion ? { duration: 0 } : resizeTransition}
      data-elevated={visible || undefined}
      className={cn("m3-navbar-surface m3-navbar-desktop", className)}
    >
      {children}
    </motion.div>
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
    <div className={cn("m3-navbar-items", className)}>
      {visibleItems.map((item) => (
        <Link
          key={item.link}
          href={item.link}
          onClick={() => onItemClick?.(item.link)}
          aria-current={activeLink === item.link ? "page" : undefined}
          className="m3-navbar-link"
        >
          {item.icon && (
            <span className="m3-navbar-icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span>{item.name}</span>
        </Link>
      ))}
      {overflowItems.length > 0 && (
        <details ref={moreRef} className="m3-navbar-more">
          <summary
            className="m3-navbar-link m3-navbar-more-toggle"
            aria-controls={dropdownId}
            data-active={overflowActive || undefined}
          >
            <span>{t("More", "เพิ่มเติม")}</span>
            <IconChevronDown size={16} aria-hidden="true" />
          </summary>
          <div id={dropdownId} className="m3-navbar-more-menu">
            {overflowItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                aria-current={activeLink === item.link ? "page" : undefined}
                className="m3-navbar-link"
                onClick={() => {
                  if (moreRef.current) moreRef.current.open = false;
                  onItemClick?.(item.link);
                }}
              >
                {item.icon && (
                  <span className="m3-navbar-icon" aria-hidden="true">
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

export function MobileNav({ children, className, visible }: NavSurfaceProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ width: visible ? "92%" : "100%" }}
      transition={reduceMotion ? { duration: 0 } : resizeTransition}
      data-elevated={visible || undefined}
      className={cn("m3-navbar-surface m3-navbar-mobile", className)}
    >
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({ children, className }: NavbarProps) {
  return (
    <div className={cn("m3-navbar-mobile-header", className)}>{children}</div>
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
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: reduceMotion ? 0 : 0.2,
            ease: [0.2, 0, 0, 1],
          }}
          className={cn("m3-navbar-menu", className)}
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
      className="m3-navbar-toggle"
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
    <Link href="/" aria-label="Rynnie home" className="m3-navbar-logo">
      <Image
        src={imageSrc}
        alt=""
        width={36}
        height={36}
        className="m3-navbar-avatar"
      />
      <span>
        Rynnie<span className="m3-navbar-brand-dot">.</span>
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
      className={cn("m3-navbar-button", className)}
      data-variant={variant === "gradient" ? "primary" : variant}
      {...props}
    >
      {children}
    </Tag>
  );
}
