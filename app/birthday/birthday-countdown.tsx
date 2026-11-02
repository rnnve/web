"use client";

import { useEffect, useState } from "react";
import Counter from "../components/counter";
import { getBirthdayCountdown } from "../lib/birthday";
import { usePageReady } from "../page-transition";
import { useSiteSettings } from "../components/site-settings-provider";

type Countdown = ReturnType<typeof getBirthdayCountdown>;
const units = ["days", "hours", "minutes", "seconds"] as const;

export default function BirthdayCountdown() {
  const { language, t } = useSiteSettings();
  const unitLabels = {
    days: t("days", "วัน"),
    hours: t("hours", "ชั่วโมง"),
    minutes: t("minutes", "นาที"),
    seconds: t("seconds", "วินาที"),
  };
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const pageReady = usePageReady();

  useEffect(() => {
    const update = () => setCountdown(getBirthdayCountdown(Date.now()));
    update();
    const timer = window.setInterval(update, 1_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <>
      <h1 id="birthday-title" aria-live="polite">
        {countdown?.isBirthday
          ? t("Happy birthday, Rynnie!", "สุขสันต์วันเกิดนะ Rynnie!")
          : t("Until my birthday.", "นับถอยหลังถึงวันเกิด")}
      </h1>
      <p className="birthday-description" aria-live="polite">
        {countdown
          ? countdown.isBirthday
            ? t(
                `${countdown.age} years of little moments. Here’s to another year.`,
                `${countdown.age} ปีแห่งความทรงจำเล็ก ๆ ขอให้เป็นอีกปีที่ดี`,
              )
            : t(
                `Counting down to chapter ${countdown.age}.`,
                `นับถอยหลังสู่ปีที่ ${countdown.age} ของชีวิต`,
              )
          : t("The next chapter is on its way.", "บทต่อไปของชีวิตกำลังมาถึง")}
      </p>
      <div
        className="birthday-countdown"
        role="timer"
        aria-label={t(
          "Time until Rynnie’s birthday",
          "เวลาที่เหลือก่อนวันเกิดของ Rynnie",
        )}
        aria-busy={!countdown}
      >
        {units.map((unit) => (
          <div className="birthday-unit" key={unit}>
            {countdown && pageReady ? (
              <Counter
                value={countdown[unit]}
                minDigits={2}
                format={{ useGrouping: false }}
                direction="down"
                duration={0.6}
                bounce={0.15}
                stagger={0.025}
                fontSize="inherit"
                fontWeight={600}
                className="birthday-number"
              />
            ) : (
              <span
                className="birthday-number birthday-placeholder"
                aria-label="Loading"
              >
                --
              </span>
            )}
            <span className="birthday-unit-label">{unitLabels[unit]}</span>
          </div>
        ))}
      </div>
      <p className="birthday-date">
        {countdown ? (
          <time dateTime={new Date(countdown.target).toISOString()}>
            {new Intl.DateTimeFormat(
              language === "th" ? "th-TH-u-ca-gregory" : "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "Asia/Bangkok",
              },
            ).format(new Date(countdown.target))}
          </time>
        ) : (
          t("December 31", "31 ธันวาคม")
        )}
        <span aria-hidden="true"> / </span>
        {t("A day worth waiting for.", "วันที่คุ้มค่าแก่การรอคอย")}
      </p>
    </>
  );
}
