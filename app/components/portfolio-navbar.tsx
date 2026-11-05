"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  IconHome2,
  IconCake,
  IconHeadphones,
  IconMessageQuestion,
  IconBrowser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import ExternalLinkIcon from "./external-link-icon";
import useRandomProfileImage from "./use-random-profile-image";
import LanguageSwitcher from "./language-switcher";
import { useSiteSettings } from "./site-settings-provider";
import { usePageReady } from "../page-transition";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "./ui/resizable-navbar";

const subscribeToMount = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;

export default function PortfolioNavbar() {
  const { t } = useSiteSettings();
  const pageReady = usePageReady();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    clientMounted,
    serverMounted,
  );
  const navItems = [
    { name: t("Home", "หน้าแรก"), link: "/", icon: <IconHome2 size={18} /> },
    {
      name: t("Birthday", "วันเกิด"),
      link: "/birthday",
      icon: <IconCake size={18} />,
    },
    {
      name: t("Listening", "เพลงที่ฟัง"),
      link: "/listen",
      icon: <IconHeadphones size={18} />,
    },
    {
      name: t("Ask", "ถามเรา"),
      link: "/ask",
      icon: <IconMessageQuestion size={18} />,
    },
    {
      name: t("New Tab", "แท็บใหม่"),
      link: "/newtab",
      icon: <IconBrowser size={18} />,
    },
  ];
  const activeLink = usePathname();
  const profileImage = useRandomProfileImage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const navigation = (
    <MotionConfig reducedMotion="user">
      <header
        className="portfolio-navbar-root"
        inert={!pageReady || undefined}
        aria-hidden={!pageReady || undefined}
      >
        <nav aria-label={t("Primary navigation", "เมนูหลัก")}>
          <Navbar>
            <NavBody>
              <NavbarLogo imageSrc={profileImage ?? undefined} />
              <NavItems items={navItems} activeLink={activeLink} />
              <div className="m3-navbar-actions">
                <NavbarButton
                  href="https://github.com/rnnve"
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                >
                  GitHub
                </NavbarButton>
                <NavbarButton
                  href="https://haunt.gg/rnn"
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                >
                  {t("Socials", "โซเชียล")} <ExternalLinkIcon size={15} />
                </NavbarButton>
                <LanguageSwitcher />
              </div>
            </NavBody>

            <MobileNav>
              <MobileNavHeader>
                <NavbarLogo imageSrc={profileImage ?? undefined} />
                <div className="m3-navbar-mobile-controls">
                  <LanguageSwitcher />
                  <MobileNavToggle
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen((open) => !open)}
                  />
                </div>
              </MobileNavHeader>
              <MobileNavMenu
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.link}
                    href={item.link}
                    onClick={closeMobileMenu}
                    aria-current={activeLink === item.link ? "page" : undefined}
                    className="m3-navbar-link"
                  >
                    <span className="m3-navbar-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="m3-navbar-menu-actions">
                  <NavbarButton
                    href="https://github.com/rnnve"
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobileMenu}
                    variant="secondary"
                  >
                    GitHub
                  </NavbarButton>
                  <NavbarButton
                    href="https://haunt.gg/rnn"
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobileMenu}
                    variant="primary"
                  >
                    {t("Socials", "โซเชียล")} <ExternalLinkIcon size={15} />
                  </NavbarButton>
                </div>
              </MobileNavMenu>
            </MobileNav>
          </Navbar>
        </nav>
      </header>
    </MotionConfig>
  );

  // Anchor navigation to the viewport, outside the page's scrolling/paint layers.
  return mounted ? createPortal(navigation, document.body) : navigation;
}
