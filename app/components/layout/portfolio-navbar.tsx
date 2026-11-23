"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  IconHomeFilled,
  IconCake,
  IconMusic,
  IconMailFilled,
  IconLanguage,
  IconLink,
  IconCode,
  IconBook,
} from "@tabler/icons-react";
import Link from "./intent-link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSiteSettings } from "../settings/site-settings-provider";
import { usePageReady } from "../../page-transition";
import LanguageSwitcher from "../settings/language-switcher";
import SocialLinks from "./social-links";
import { rememberDocsReturn } from "../../lib/docs-return";
import styles from "./portfolio-navbar.module.css";

const AnimatedLink = motion.create(Link);

export default function PortfolioNavbar() {
  const { t } = useSiteSettings();
  const layoutId = useId();
  const reducedMotion = useReducedMotion();
  const transition = {
    duration: reducedMotion ? 0 : 0.16,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const [languageVisible, setLanguageVisible] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const languageButton = useRef<HTMLButtonElement>(null);
  const pageReady = usePageReady();
  const pathname = usePathname();
  useEffect(() => {
    if (!languageVisible) return;
    const dismiss = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node))
        setLanguageVisible(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLanguageVisible(false);
        languageButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [languageVisible]);
  const navItems = [
    { name: t("Home", "หน้าแรก"), href: "/", icon: IconHomeFilled },
    { name: t("Developing", "งานพัฒนา"), href: "/developing", icon: IconCode },
    { name: t("Listening", "เพลงที่ฟัง"), href: "/listen", icon: IconMusic },
    { name: t("Birthday", "วันเกิด"), href: "/birthday", icon: IconCake },
    { name: t("Ask", "ถามเรา"), href: "/ask", icon: IconMailFilled },
  ];
  return (
    <TooltipProvider delayDuration={250}>
      <header
        className={`portfolio-navbar-root ${styles.position}`}
        inert={!pageReady || undefined}
        aria-hidden={!pageReady || undefined}
      >
        <div className={styles.navigationGroup} ref={group}>
          <LayoutGroup id={layoutId}>
            <motion.nav
              layout
              transition={transition}
              className={styles.rail}
              aria-label={t("Primary navigation", "เมนูหลัก")}
            >
              {navItems.map(({ name, href, icon: Icon }) => (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" asChild>
                      <AnimatedLink
                        layout
                        transition={transition}
                        href={href}
                        prefetch
                        className={styles.item}
                        aria-label={name}
                        aria-current={pathname === href ? "page" : undefined}
                        onClick={() => setLanguageVisible(false)}
                      >
                        {pathname === href && (
                          <motion.span
                            layoutId="active-page"
                            transition={transition}
                            className={styles.activeHighlight}
                            data-active-highlight
                            aria-hidden="true"
                          />
                        )}
                        <motion.span
                          layout="position"
                          transition={transition}
                          className={styles.icon}
                        >
                          <Icon size={16} stroke={1.8} aria-hidden="true" />
                        </motion.span>
                      </AnimatedLink>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={9}
                    collisionPadding={8}
                    className={styles.tooltipContent}
                  >
                    {name}
                  </TooltipContent>
                </Tooltip>
              ))}
              <span
                className={styles.separator}
                role="separator"
                aria-orientation="vertical"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.item}
                    asChild
                  >
                    <a
                      href="https://haunt.gg/rnn"
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t(
                        "Socials (opens in a new tab)",
                        "โซเชียล (เปิดในแท็บใหม่)",
                      )}
                    >
                      <IconLink size={16} stroke={1.8} aria-hidden="true" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={9}
                  collisionPadding={8}
                  className={styles.tooltipContent}
                >
                  {t("Socials", "โซเชียล")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    ref={languageButton}
                    variant="ghost"
                    size="icon"
                    className={styles.item}
                    aria-label={
                      languageVisible
                        ? t("Hide language switcher", "ซ่อนตัวเลือกภาษา")
                        : t("Show language switcher", "แสดงตัวเลือกภาษา")
                    }
                    aria-expanded={languageVisible}
                    aria-controls="site-language-controls"
                    onClick={() => setLanguageVisible((value) => !value)}
                  >
                    <IconLanguage size={16} stroke={1.8} aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={9}
                  collisionPadding={8}
                  className={styles.tooltipContent}
                >
                  {t("Language", "ภาษา")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <AnimatedLink
                      layout
                      transition={transition}
                      href="/docs"
                      className={styles.item}
                      aria-label={t("Docs", "เอกสาร")}
                      onClick={() => {
                        rememberDocsReturn(
                          `${pathname}${window.location.search}`,
                        );
                        setLanguageVisible(false);
                      }}
                    >
                      <motion.span
                        layout="position"
                        transition={transition}
                        className={styles.icon}
                      >
                        <IconBook size={16} stroke={1.8} aria-hidden="true" />
                      </motion.span>
                    </AnimatedLink>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={9}
                  collisionPadding={8}
                  className={styles.tooltipContent}
                >
                  {t("Docs", "เอกสาร")}
                </TooltipContent>
              </Tooltip>
            </motion.nav>
          </LayoutGroup>
          <div
            id="site-language-controls"
            hidden={!languageVisible}
            className={styles.languagePanel}
          >
            <LanguageSwitcher />
          </div>
        </div>
        <div className={styles.utilities}>
          <SocialLinks />
        </div>
      </header>
    </TooltipProvider>
  );
}
