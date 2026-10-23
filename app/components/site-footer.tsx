"use client";

import Link from "next/link";
import useRandomProfileImage from "./use-random-profile-image";

export default function SiteFooter() {
  const profileImage = useRandomProfileImage();

  return (
    <footer className="site-footer">
      <Link className="site-footer__brand" href="/#top" aria-label="Ryn home">
        <span style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined}>{!profileImage && "R"}</span>
        <strong>Ryn<span>.</span></strong>
      </Link>
      <p>&copy; 2026 Ryn</p>
    </footer>
  );
}
