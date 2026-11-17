"use client";

import { useId, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  IconHomeFilled,
  IconCake,
  IconMusic,
  IconMailFilled,
  IconLanguage,
  IconLink,
  IconCode,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "../settings/site-settings-provider";
import { usePageReady } from "../../page-transition";
import LanguageSwitcher from "../settings/language-switcher";
import SocialLinks from "./social-links";
import styles from "./portfolio-navbar.module.css";

const AnimatedLink = motion.create(Link);

export default function PortfolioNavbar() {
  const { t } = useSiteSettings();
  const layoutId = useId();
  const reducedMotion = useReducedMotion();
  const transition = {
    duration: reducedMotion ? 0 : 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const [languageVisible, setLanguageVisible] = useState(false);
  const pageReady = usePageReady();
  const pathname = usePathname();
  const navItems = [
    { name: t("Home", "หน้าแรก"), href: "/", icon: IconHomeFilled },
    { name: t("Developing", "งานพัฒนา"), href: "/developing", icon: IconCode },
    {
      name: t("Listening", "เพลงที่ฟัง"),
      href: "/listen",
      icon: IconMusic,
    },
    { name: t("Birthday", "วันเกิด"), href: "/birthday", icon: IconCake },
    { name: t("Ask", "ถามเรา"), href: "/ask", icon: IconMailFilled },
  ];
  return (
    <header
      className={`portfolio-navbar-root ${styles.position}`}
      inert={!pageReady || undefined}
      aria-hidden={!pageReady || undefined}
    >
      <div className={styles.navigationGroup}>
        <LayoutGroup id={layoutId}>
          <motion.nav
            layout
            transition={transition}
            className={styles.rail}
            aria-label={t("Primary navigation", "เมนูหลัก")}
          >
            {navItems.map(({ name, href, icon: Icon }) => (
              <AnimatedLink
                layout
                transition={transition}
                key={href}
                href={href}
                className={styles.item}
                aria-label={name}
                aria-current={pathname === href ? "page" : undefined}
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
                  <Icon size={16} stroke={2} aria-hidden="true" />
                </motion.span>
                {pathname === href && (
                  <motion.span
                    layout="position"
                    transition={transition}
                    className={styles.currentLabel}
                    data-current-page
                    aria-hidden="true"
                  >
                    {name}
                  </motion.span>
                )}
                <span className={styles.tooltip} aria-hidden="true">
                  {name}
                </span>
              </AnimatedLink>
            ))}
            <a
              className={styles.item}
              href="https://haunt.gg/rnn"
              target="_blank"
              rel="noreferrer"
              aria-label={t(
                "Socials (opens in a new tab)",
                "โซเชียล (เปิดในแท็บใหม่)",
              )}
            >
              <IconLink size={16} stroke={2} aria-hidden="true" />
              <span className={styles.tooltip} aria-hidden="true">
                {t("Socials", "โซเชียล")}
              </span>
            </a>
            <button
              type="button"
              className={styles.item}
              aria-label={
                languageVisible
                  ? t("Hide language switcher", "ซ่อนตัวเลือกภาษา")
                  : t("Show language switcher", "แสดงตัวเลือกภาษา")
              }
              aria-expanded={languageVisible}
              aria-controls="site-language-controls"
              onClick={() => setLanguageVisible((visible) => !visible)}
            >
              <IconLanguage size={16} aria-hidden="true" />
              <span className={styles.tooltip} aria-hidden="true">
                {t("Language", "ภาษา")}
              </span>
            </button>
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
  );
}
