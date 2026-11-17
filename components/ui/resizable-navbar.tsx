"use client";

import { cn } from "@/app/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import React, { useEffect, useId, useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps extends NavbarProps {
  visible?: boolean;
}

interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
  activeLink?: string;
}

interface MobileNavMenuProps extends NavbarProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => setVisible(latest > 100));

  return (
    <motion.header
      className={cn(
        "portfolio-navbar-root fixed inset-x-0 top-[calc(1rem+env(safe-area-inset-top))] z-50 w-full",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.header>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? "var(--glass-shadow)" : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 200, damping: 50 }
      }
      style={{ minWidth: "800px" }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex",
        visible ? "bg-background/80" : "bg-transparent",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({
  items,
  className,
  onItemClick,
  activeLink,
}: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <motion.div
        onMouseLeave={() => setHovered(null)}
        className={cn(
          "pointer-events-none absolute inset-0 hidden flex-1 flex-row items-center justify-center gap-1 text-sm font-medium lg:flex",
          className,
        )}
      >
        {items.map((item, idx) => (
          <Link
            onMouseEnter={() => setHovered(idx)}
            onFocus={() => setHovered(idx)}
            onBlur={() => setHovered(null)}
            onClick={onItemClick}
            className="pointer-events-auto relative rounded-full px-3 py-2 text-muted-foreground aria-[current=page]:text-foreground"
            key={item.link}
            href={item.link}
            aria-current={activeLink === item.link ? "page" : undefined}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-accent"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </Link>
        ))}
      </motion.div>
    </LayoutGroup>
  );
};

export const MobileNav = ({ children, className, visible }: NavBodyProps) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible ? "var(--glass-shadow)" : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 200, damping: 50 }
      }
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between py-2 lg:hidden",
        visible ? "bg-background/80" : "bg-transparent",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: NavbarProps) => (
  <div
    className={cn(
      "flex w-full flex-row items-center justify-between",
      className,
    )}
  >
    {children}
  </div>
);

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
  id,
}: MobileNavMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!isOpen) return;
    const toggle = document.querySelector<HTMLButtonElement>(
      `button[aria-controls="${id}"]`,
    );
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        toggle?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !ref.current?.contains(event.target) &&
        !toggle?.contains(event.target)
      )
        onClose();
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) onClose();
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", closeOnDesktop);
    closeOnDesktop();
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen, onClose, id]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          id={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
          onBlur={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              !event.currentTarget.contains(event.relatedTarget)
            )
              onClose();
          }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex max-h-[calc(100dvh-9rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full flex-col items-start justify-start gap-4 overflow-y-auto rounded-lg border border-border bg-background px-4 py-8 text-foreground shadow-xl",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
  label,
  controls,
}: {
  isOpen: boolean;
  onClick: () => void;
  label: string;
  controls: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-expanded={isOpen}
    aria-controls={controls}
    className="relative z-20 flex size-10 items-center justify-center rounded-full text-foreground hover:bg-accent"
  >
    {isOpen ? <IconX aria-hidden="true" /> : <IconMenu2 aria-hidden="true" />}
  </button>
);

export const NavbarLogo = ({
  href = "/",
  label = "Ryn — home",
}: {
  href?: string;
  label?: string;
}) => (
  <Link
    href={href}
    aria-label={label}
    className="relative z-20 mr-4 flex items-center px-2 py-1 text-xl font-semibold tracking-tight text-foreground"
  >
    ryn<span className="text-primary">.</span>
  </Link>
);

export const NavbarButton = ({
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
)) => {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-sm",
    secondary: "bg-transparent text-foreground shadow-none",
    dark: "bg-black text-white shadow-sm",
    gradient: "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-sm",
  };
  return (
    <Tag
      href={href || undefined}
      className={cn(
        "relative z-20 inline-block cursor-pointer rounded-md px-4 py-2 text-center text-sm font-bold transition duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
