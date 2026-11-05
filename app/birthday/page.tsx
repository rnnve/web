import { generatePageMetadata } from "../lib/og/metadata";
import { IconCake } from "@tabler/icons-react";
import LocalizedText from "../components/localized-text";
import BirthdayCountdown from "./birthday-countdown";
import BirthdayWishForm from "./birthday-wish-form";
import styles from "../viewport-pages.module.css";
export function generateMetadata() {
  return generatePageMetadata("/birthday");
}
export default function BirthdayPage() {
  return (
    <main className={`viewport-page ${styles.page} ${styles.birthday}`}>
      <section className={styles.countdown} aria-labelledby="birthday-title">
        <span className={styles.icon} aria-hidden="true">
          <IconCake size={30} stroke={1.5} />
        </span>
        <p className={styles.eyebrow}>
          <LocalizedText
            en="A little closer, every second"
            th="ใกล้เข้ามาอีกนิดในทุกวินาที"
          />
        </p>
        <BirthdayCountdown />
        <p className={styles.timezone}>
          <LocalizedText
            en="13:12 · Bangkok (UTC+7)"
            th="13:12 · กรุงเทพฯ (UTC+7)"
          />
        </p>
      </section>
      <section
        className={styles.wishes}
        aria-labelledby="birthday-wishes-title"
      >
        <BirthdayWishForm />
      </section>
    </main>
  );
}
