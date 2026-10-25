"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ExternalLinkIcon from "./external-link-icon";
import useRandomProfileImage from "./use-random-profile-image";

export default function PortfolioNavbar() {
  const profileImage = useRandomProfileImage();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setCollapsed(window.matchMedia("(min-width: 761px)").matches && window.scrollY > 80);
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
  }, []);

  return (
    <header className={`site-header ${collapsed ? "site-header--collapsed" : ""}`}>
      <Link className="wordmark" href="/#top" aria-label="Home"><span className={`wordmark__shape ${profileImage ? "wordmark__shape--image" : ""}`} style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined}>{!profileImage && "R"}</span><span>Rynnie<span className="wordmark__dot">.</span></span></Link>
      <a className="site-header__socials" href="https://haunt.gg/rnn" target="_blank" rel="noreferrer">Socials <ExternalLinkIcon size={15}/></a>
    </header>
  );
}
