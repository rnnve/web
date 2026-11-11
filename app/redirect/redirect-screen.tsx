"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import styles from "./redirect.module.css";

export default function RedirectScreen({
  destination,
}: {
  destination: string | null;
}) {
  const { t } = useSiteSettings();
  useEffect(() => {
    if (!destination) return;
    const timer = window.setTimeout(() => {
      window.location.replace(destination);
    }, 2_000);
    return () => window.clearTimeout(timer);
  }, [destination]);

  if (!destination)
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <span className={styles.icon}>
            <IconArrowUpRight size={24} aria-hidden="true" />
          </span>
          <p className={styles.eyebrow}>RYNNIE / LINK</p>
          <h1>{t("No valid destination", "ปลายทางไม่ถูกต้อง")}</h1>
          <p>
            {t(
              "Add a valid http:// or https:// URL using ?url= to continue.",
              "เพิ่ม URL ที่ขึ้นต้นด้วย http:// หรือ https:// ผ่าน ?url= เพื่อดำเนินการต่อ",
            )}
          </p>
          <Link className={styles.link} href="/">
            {t("Back to home", "กลับหน้าแรก")}
          </Link>
        </div>
      </main>
    );

  return (
    <main className={styles.page}>
      <div className={styles.card} role="status">
        <span className={styles.icon}>
          <IconArrowUpRight size={24} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>RYNNIE / LINK</p>
        <h1>{t("Taking you there…", "กำลังพาคุณไป…")}</h1>
        <p>
          {t(
            `Redirecting to ${new URL(destination).hostname}`,
            `กำลังไปยัง ${new URL(destination).hostname}`,
          )}
        </p>
        <a className={styles.link} href={destination}>
          {t("Continue now", "ไปต่อเลย")}{" "}
          <IconArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </main>
  );
}
