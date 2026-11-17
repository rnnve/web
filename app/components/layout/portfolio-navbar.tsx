"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useSiteSettings } from "../settings/site-settings-provider";

function PortfolioNavigation() {
  const pathname = usePathname();
  const { t, language } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const navItems = [
    { name: t("Home", "หน้าแรก"), link: `/#${language}` },
    { name: t("Developing", "งานพัฒนา"), link: `/developing#${language}` },
    { name: t("Listening", "เพลงที่ฟัง"), link: `/listen#${language}` },
    { name: t("Birthday", "วันเกิด"), link: `/birthday#${language}` },
    { name: t("Ask", "ถามเรา"), link: `/ask#${language}` },
  ];
  const logo = (
    <NavbarLogo
      href={`/#${language}`}
      label={t("Ryn — home", "Ryn — หน้าแรก")}
    />
  );
  const socialLinks = (
    <>
      <NavbarButton
        href="https://github.com/rnnve"
        variant="secondary"
        target="_blank"
        rel="noreferrer"
        aria-label={t("GitHub (opens in a new tab)", "GitHub (เปิดในแท็บใหม่)")}
        onClick={closeMenu}
      >
        GitHub
      </NavbarButton>
      <NavbarButton
        href="https://haunt.gg/rnn"
        variant="primary"
        target="_blank"
        rel="noreferrer"
        aria-label={t(
          "Socials (opens in a new tab)",
          "โซเชียล (เปิดในแท็บใหม่)",
        )}
        onClick={closeMenu}
      >
        {t("Socials", "โซเชียล")}
      </NavbarButton>
    </>
  );
  return (
    <Navbar>
      <NavBody>
        {logo}
        <nav aria-label={t("Primary navigation", "เมนูหลัก")}>
          <NavItems items={navItems} activeLink={`${pathname}#${language}`} />
        </nav>
        <div className="relative z-20 flex items-center gap-2">
          {socialLinks}
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          {logo}
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            label={
              isMobileMenuOpen
                ? t("Close menu", "ปิดเมนู")
                : t("Open menu", "เปิดเมนู")
            }
            controls="mobile-navigation"
          />
        </MobileNavHeader>
        <MobileNavMenu
          id="mobile-navigation"
          isOpen={isMobileMenuOpen}
          onClose={closeMenu}
        >
          <nav
            aria-label={t("Primary navigation", "เมนูหลัก")}
            className="grid w-full gap-2"
          >
            {navItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                onClick={closeMenu}
                aria-current={
                  item.link === `${pathname}#${language}` ? "page" : undefined
                }
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex w-full flex-col gap-4">{socialLinks}</div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export default function PortfolioNavbar() {
  const pathname = usePathname();
  return <PortfolioNavigation key={pathname} />;
}
