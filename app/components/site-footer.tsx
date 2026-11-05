"use client";

import Link from "next/link";
import ExternalLinkIcon from "./external-link-icon";
import useRandomProfileImage from "./use-random-profile-image";

export default function SiteFooter() {
  const profileImage = useRandomProfileImage();

  return (
    <footer className="site-footer">
      <Link className="site-footer__brand" href="/#top" aria-label="Ryn home">
        <span
          style={
            profileImage
              ? { backgroundImage: `url(${profileImage})` }
              : undefined
          }
        >
          {!profileImage && "R"}
        </span>
        <strong>
          Rynnie<span>.</span>
        </strong>
      </Link>
      <p>
        &copy; 2026 Rynnie
        {process.env.NEXT_PUBLIC_COMMIT_HASH && (
          <span className="site-footer__commit">
            {" · commit "}
            <a
              href={`https://github.com/rnnve/web/commit/${process.env.NEXT_PUBLIC_COMMIT_HASH}`}
              target="_blank"
              rel="noreferrer"
            >
              {process.env.NEXT_PUBLIC_COMMIT_HASH.slice(0, 7)}
            </a>
            {" @ "}
            <a href="https://github.com/rnnve/web" target="_blank" rel="noreferrer">
              rnnve/web
            </a>
          </span>
        )}
      </p>
      <nav aria-label="Footer navigation">
        <a href="https://github.com/rnnve" target="_blank" rel="noreferrer">
          GitHub <ExternalLinkIcon size={14} />
        </a>
      </nav>
    </footer>
  );
}
