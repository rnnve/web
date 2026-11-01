import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft, IconCake } from "@tabler/icons-react";
import BirthdayCountdown from "./birthday-countdown";
import "../styles/birthday.css";

export const metadata: Metadata = {
  title: "Birthday · Rynnie",
  description: "Counting down to Rynnie’s next birthday on December 31.",
};

export default function BirthdayPage() {
  return (
    <main className="birthday-page">
      <header className="birthday-header">
        <Link href="/" className="birthday-home">
          <IconArrowLeft size={18} aria-hidden="true" />
          Back home
        </Link>
        <span className="birthday-wordmark">Rynnie.</span>
      </header>
      <section className="birthday-content" aria-labelledby="birthday-title">
        <span className="birthday-icon" aria-hidden="true">
          <IconCake size={30} stroke={1.5} />
        </span>
        <p className="birthday-eyebrow">A little closer, every second</p>
        <BirthdayCountdown />
      </section>
      <footer className="birthday-footer">
        <span>December 31</span>
        <span>13:12 · Bangkok (UTC+7)</span>
      </footer>
    </main>
  );
}
