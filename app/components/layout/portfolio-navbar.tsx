"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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

const subscribeToMount = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;

export default function PortfolioNavbar() {
  const { t } = useSiteSettings();
  const [languageVisible, setLanguageVisible] = useState(true);
  const pageReady = usePageReady();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    clientMounted,
    serverMounted,
  );
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
  const navigation = (
    <header
      className={`portfolio-navbar-root ${styles.position}`}
      inert={!pageReady || undefined}
      aria-hidden={!pageReady || undefined}
    >
      <nav
        className={styles.rail}
        aria-label={t("Primary navigation", "เมนูหลัก")}
      >
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={styles.item}
            aria-label={name}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon size={16} stroke={2} aria-hidden="true" />
            {pathname === href && (
              <span
                className={styles.currentLabel}
                data-current-page
                aria-hidden="true"
              >
                {name}
              </span>
            )}
            <span className={styles.tooltip} aria-hidden="true">
              {name}
            </span>
          </Link>
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
      </nav>
      <div className={styles.utilities}>
        <SocialLinks />
        <div
          id="site-language-controls"
          hidden={!languageVisible}
          className={styles.languagePanel}
        >
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );

  // Keep the navigation anchored to the viewport during page transitions.
  return mounted ? createPortal(navigation, document.body) : navigation;
}
