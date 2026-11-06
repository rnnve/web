"use client";

import { useEffect, useState } from "react";
import { IconLock } from "@tabler/icons-react";
import styles from "../viewport-pages.module.css";
import AskForm from "../ask/ask-form";
import { useSiteSettings } from "../components/settings/site-settings-provider";
import { getBirthdayWishWindow } from "../lib/birthday";

export default function BirthdayWishForm() {
  const { language, t } = useSiteSettings();
  const [window, setWindow] = useState<ReturnType<
    typeof getBirthdayWishWindow
  > | null>(null);

  useEffect(() => {
    const update = () => setWindow(getBirthdayWishWindow(Date.now()));
    update();
    const timer = globalThis.setInterval(update, 1_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      globalThis.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const date = window
    ? new Intl.DateTimeFormat(
        language === "th" ? "th-TH-u-ca-gregory" : "en-US",
        {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Bangkok",
        },
      ).format(window.isOpen ? window.closesAt : window.opensAt)
    : null;

  const locked = !window?.isOpen;

  return (
    <div className={styles.wishCard} data-locked={locked}>
      <div
        className={styles.wishContent}
        inert={locked || undefined}
        aria-hidden={locked || undefined}
      >
        <h2 id={locked ? undefined : "birthday-wishes-title"}>
          {t("Leave a birthday wish.", "ฝากคำอวยพรวันเกิดไว้หน่อย")}
        </h2>
        <p className={styles.wishDescription}>
          {t(
            "A little message for my birthday. Sent anonymously.",
            "ฝากข้อความเล็ก ๆ สำหรับวันเกิด ส่งแบบไม่ระบุตัวตน",
          )}
        </p>
        {!locked && (
          <p role="status">
            {t(
              `Wishes are open until ${date} (Bangkok time).`,
              `ส่งคำอวยพรได้ถึง ${date} (เวลากรุงเทพฯ)`,
            )}
          </p>
        )}
        <AskForm variant="birthday" disabled={locked} />
      </div>
      {locked && (
        <div className={styles.wishLock} role="status">
          <IconLock size={40} stroke={1.5} aria-hidden="true" />
          <span id="birthday-wishes-title" className="sr-only">
            {t("Birthday wishes are locked.", "กล่องคำอวยพรยังไม่เปิด")}
          </span>
          <span className="sr-only">
            {t(
              "Unlocks when the countdown reaches 00. Open for 48 hours.",
              "เปิดเมื่อนับถอยหลังถึง 00 เป็นเวลา 48 ชั่วโมง",
            )}
          </span>
          {date && (
            <span className="sr-only">
              {t(`Opens ${date} · Bangkok time`, `เปิด ${date} · เวลากรุงเทพฯ`)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
