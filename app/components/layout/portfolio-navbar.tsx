"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  IconHomeFilled,
  IconCake,
  IconHeadphones,
  IconMessageQuestion,
  IconBrandGithub,
  IconLink,
  IconLanguage,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "../settings/site-settings-provider";
import { usePageReady } from "../../page-transition";
import styles from "./portfolio-navbar.module.css";

const subscribeToMount = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;

export default function PortfolioNavbar() {
  const { t, language, setLanguage } = useSiteSettings();
  const pageReady = usePageReady();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    clientMounted,
    serverMounted,
  );
  const pathname = usePathname();
  const navItems = [
    { name: t("Home", "หน้าแรก"), href: "/", icon: IconHomeFilled },
    {
      name: t("Listening", "เพลงที่ฟัง"),
      href: "/listen",
      icon: IconHeadphones,
    },
    { name: t("Birthday", "วันเกิด"), href: "/birthday", icon: IconCake },
    { name: t("Ask", "ถามเรา"), href: "/ask", icon: IconMessageQuestion },
  ];
  const languageLabel = t("Switch to Thai", "เปลี่ยนเป็น English");
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
            <Icon size={23} stroke={1.8} aria-hidden="true" />
            <span className={styles.tooltip} aria-hidden="true">
              {name}
            </span>
          </Link>
        ))}
        <span className={styles.separator} aria-hidden="true" />
        <a
          className={styles.item}
          href="https://github.com/rnnve"
          target="_blank"
          rel="noreferrer"
          aria-label={t(
            "GitHub (opens in a new tab)",
            "GitHub (เปิดในแท็บใหม่)",
          )}
        >
          <IconBrandGithub size={23} stroke={1.8} aria-hidden="true" />
          <span className={styles.tooltip} aria-hidden="true">
            GitHub
          </span>
        </a>
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
          <IconLink size={23} stroke={1.8} aria-hidden="true" />
          <span className={styles.tooltip} aria-hidden="true">
            {t("Socials", "โซเชียล")}
          </span>
        </a>
        <span className={styles.separator} aria-hidden="true" />
        <button
          type="button"
          className={styles.item}
          onClick={() => setLanguage(language === "en" ? "th" : "en")}
          aria-label={languageLabel}
        >
          <IconLanguage size={23} stroke={1.8} aria-hidden="true" />
          <span className={styles.tooltip} aria-hidden="true">
            {languageLabel}
          </span>
        </button>
      </nav>
    </header>
  );

  // Keep the dock anchored to the viewport during page transitions.
  return mounted ? createPortal(navigation, document.body) : navigation;
}
