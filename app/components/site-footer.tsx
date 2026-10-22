import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="site-footer__brand" href="/#top" aria-label="Ryn home">
        <span>R</span>
        <strong>Ryn<span>.</span></strong>
      </Link>
      <p>© 2026 Ryn</p>
      <nav aria-label="Footer navigation">
        <Link href="/">Home</Link>
        <Link href="/#status">Status</Link>
        <a href="https://github.com/rnnve" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
    </footer>
  );
}
