"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  IconHome2,
  IconCake,
  IconHeadphones,
  IconMessageQuestion,
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
    {
      name: t("Home", "หน้าแรก"),
      link: "/",
      icon: <IconHome2 size={18} />,
    },
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
  ];
  const activeLink = usePathname();
  const profileImage = useRandomProfileImage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const navigation = (
    <MotionConfig reducedMotion="user">
      <header
        className="portfolio-navbar-root fixed [inset-inline:env(safe-area-inset-left,_0px)_env(safe-area-inset-right,_0px)] [top:max(16px,_env(safe-area-inset-top))] [z-index:60] [transform:translateZ(0)]"
        inert={!pageReady || undefined}
        aria-hidden={!pageReady || undefined}
      >
        <nav aria-label={t("Primary navigation", "เมนูหลัก")}>
          <Navbar>
            <NavBody>
              <NavbarLogo imageSrc={profileImage ?? undefined} />
              <NavItems items={navItems} activeLink={activeLink} />
              <div className="m3-navbar-actions [justify-self:end] flex [min-width:0] [flex-shrink:0] items-center [gap:8px]">
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
                <div className="m3-navbar-mobile-controls flex items-center [gap:4px]">
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
                    className="m3-navbar-link [.m3-navbar-more-menu_&]:flex [.m3-navbar-more-menu_&]:[min-height:48px] [.m3-navbar-desktop:has(.m3-navbar-more)_&]:[padding-inline:12px] [min-height:44px] [padding:0_16px] inline-flex items-center [gap:8px] [border-radius:20px] [color:var(--md-sys-color-on-surface-variant)] [font-size:14px] [font-weight:550] [line-height:20px] [letter-spacing:0.1px] [text-decoration:none] whitespace-nowrap [transition:color_0.2s_var(--md-motion-standard),_background-color_0.2s_var(--md-motion-standard)] [&:hover]:[color:var(--md-sys-color-on-surface)] [&:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&:focus-visible]:[color:var(--md-sys-color-on-surface)] [&:focus-visible]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-surface)_8%,_transparent_)] [&[aria-current]]:[color:var(--md-sys-color-on-secondary-container)] [&[aria-current]]:[background:var(--md-sys-color-secondary-container)] [&[aria-current]]:[font-weight:650] [&[aria-current]:hover]:[background:color-mix(_in_srgb,_var(--md-sys-color-on-secondary-container)_8%,_var(--md-sys-color-secondary-container)_)] [.m3-navbar-menu_&]:[width:100%] [.m3-navbar-menu_&]:[min-height:48px] [.m3-navbar-menu_&]:[border-radius:24px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[padding-inline:10px] [@media(min-width:_1024px)_and_(max-width:_1199px)]:[gap:6px] motion-reduce:[transition:none]"
                  >
                    <span
                      className="m3-navbar-icon inline-flex [flex-shrink:0] items-center"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="m3-navbar-menu-actions [margin-top:8px] [padding-top:12px] [width:100%] [min-width:0] flex [gap:8px] [border-top:1px_solid_var(--md-sys-color-outline-variant)] [&_>_a]:[min-height:48px] [&_>_a]:[min-width:0] [&_>_a]:[flex:1] [&_>_a]:[padding-inline:12px] max-[1024px]:flex-col max-[1024px]:[&_>_a]:[width:100%] max-[1024px]:[&_>_a]:[flex:none]">
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
