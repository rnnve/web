"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavIconName = "menu" | "moon" | "sun" | "x";

function NavIcon({ name, size = 20 }: { name: NavIconName; size?: number }) {
  const paths: Record<NavIconName, React.ReactNode> = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function PortfolioNavbar() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setCollapsed(window.matchMedia("(min-width: 761px)").matches && !menuOpen && window.scrollY > 80);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [menuOpen]);

  return (
    <header
      className={`site-header ${collapsed && !hovered ? "site-header--collapsed" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
    >
      <Link className="wordmark" href="/#top" onClick={() => setMenuOpen(false)} aria-label="Home"><span className="wordmark__shape">R</span><span>Ryn<span className="wordmark__dot">.</span></span></Link>
      <nav className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Main navigation">
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/#status" onClick={() => setMenuOpen(false)}>Status</Link>
        <Link href="/loading" onClick={() => setMenuOpen(false)}>Loading</Link>
      </nav>
      <div className="header-actions">
        <button className="round-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}><NavIcon name={theme === "light" ? "moon" : "sun"}/></button>
        <button className="round-button menu-toggle" onClick={() => { setCollapsed(false); setMenuOpen(!menuOpen); }} aria-label={menuOpen ? "Close menu" : "Open menu"}><NavIcon name={menuOpen ? "x" : "menu"}/></button>
      </div>
    </header>
  );
}
