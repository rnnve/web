"use client";

import { useCallback, useState } from "react";
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
  { name: "Home", link: "#top" },
  { name: "Projects", link: "#more" },
  { name: "Tools", link: "#developer" },
];

export default function PortfolioNavbar() {
  const profileImage = useRandomProfileImage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <header>
        <nav aria-label="Primary navigation">
          <Navbar className="fixed top-4">
            <NavBody>
              <NavbarLogo imageSrc={profileImage ?? undefined} />
              <NavItems items={navItems} />
              <div className="flex items-center gap-4">
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
                  className="inline-flex items-center gap-2"
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
                    onClick={closeMobileMenu}
                    className="relative text-neutral-600 dark:text-neutral-300"
                  >
                    <span className="block">{item.name}</span>
                  </a>
                ))}
                <div className="flex w-full flex-col gap-4">
                  <NavbarButton
                    href="https://github.com/rnnve"
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobileMenu}
                    variant="secondary"
                    className="w-full"
                  >
                    GitHub
                  </NavbarButton>
                  <NavbarButton
                    href="https://haunt.gg/rnn"
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobileMenu}
                    variant="primary"
                    className="inline-flex w-full items-center justify-center gap-2"
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
