"use client";

import { useCallback, useEffect, useState } from "react";
import { IconHome2, IconCode, IconTools } from "@tabler/icons-react";
import { MotionConfig } from "motion/react";
import ExternalLinkIcon from "./external-link-icon";
import useRandomProfileImage from "./use-random-profile-image";
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

const navItems = [
  { name: "Home", link: "#top", icon: <IconHome2 size={18} /> },
  { name: "Projects", link: "#more", icon: <IconCode size={18} /> },
  { name: "Stacks", link: "#developer", icon: <IconTools size={18} /> },
];

export default function PortfolioNavbar() {
  const [activeLink, setActiveLink] = useState("#top");
  const profileImage = useRandomProfileImage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveLink(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    for (const item of navItems) {
      const section = document.querySelector(item.link);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <header>
        <nav aria-label="Primary navigation">
          <Navbar>
            <NavBody>
              <NavbarLogo imageSrc={profileImage ?? undefined} />
              <NavItems
                items={navItems}
                activeLink={activeLink}
                onItemClick={setActiveLink}
              />
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
                  Socials <ExternalLinkIcon size={15} />
                </NavbarButton>
              </div>
            </NavBody>

            <MobileNav>
              <MobileNavHeader>
                <NavbarLogo imageSrc={profileImage ?? undefined} />
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen((open) => !open)}
                />
              </MobileNavHeader>
              <MobileNavMenu
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
              >
                {navItems.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    onClick={() => {
                      setActiveLink(item.link);
                      closeMobileMenu();
                    }}
                    aria-current={
                      activeLink === item.link ? "location" : undefined
                    }
                    className="m3-navbar-link"
                  >
                    <span className="m3-navbar-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </a>
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
                    Socials <ExternalLinkIcon size={15} />
                  </NavbarButton>
                </div>
              </MobileNavMenu>
            </MobileNav>
          </Navbar>
        </nav>
      </header>
    </MotionConfig>
  );
}
