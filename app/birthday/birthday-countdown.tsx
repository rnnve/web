"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { IconCake } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import Counter from "../components/ui/counter";
import { getBirthdayCountdown } from "../lib/birthday";
import { usePageReady } from "../page-transition";
import { useSiteSettings } from "../components/settings/site-settings-provider";

type Countdown = ReturnType<typeof getBirthdayCountdown>;
const units = ["days", "hours", "minutes", "seconds"] as const;

export default function BirthdayCountdown() {
  const { language, t } = useSiteSettings();
  const unitLabels = {
    days: t("Days", "วัน"),
    hours: t("Hours", "ชั่วโมง"),
    minutes: t("Minutes", "นาที"),
    seconds: t("Seconds", "วินาที"),
  };
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const previousCountdown = useRef<Countdown | null>(null);
  const pageReady = usePageReady();

  useEffect(() => {
    let celebrationTimer: number | undefined;
    const update = () => {
      const next = getBirthdayCountdown(Date.now());
      const previous = previousCountdown.current;
      if (
        previous &&
        !previous.isBirthday &&
        next.isBirthday &&
        previous.target === next.target &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setCelebrating(true);
        celebrationTimer = window.setTimeout(() => setCelebrating(false), 4000);
      }
      previousCountdown.current = next;
      setCountdown(next);
    };
    update();
    const timer = window.setInterval(update, 1_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(celebrationTimer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const dateLabel = countdown
    ? new Intl.DateTimeFormat(
        language === "th" ? "th-TH-u-ca-gregory" : "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Bangkok",
        },
      ).format(new Date(countdown.target))
    : t("December 31", "31 ธันวาคม");

  return (
    <section className="flex h-full flex-col" aria-labelledby="birthday-title">
      {celebrating && (
        <div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 48 }, (_, index) => (
            <span
              key={index}
              className="absolute top-[48%] left-1/2 opacity-0 motion-reduce:hidden"
              style={
                {
                  width: index % 3 === 2 ? 10 : 9,
                  height: index % 3 === 2 ? 10 : 14,
                  borderRadius: index % 3 === 2 ? 999 : 2,
                  background: [
                    "#f6c7db",
                    "#d8c8ff",
                    "#ffe7a8",
                    "#b9e4f3",
                    "#ffffff",
                  ][index % 5],
                  animation: `birthday-confetti-burst 3.3s ${(index % 8) * 0.035}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                  "--confetti-x": `${((index * 73) % 181) - 90}vw`,
                  "--confetti-mid-x": `${(((index * 73) % 181) - 90) * 0.65}vw`,
                  "--confetti-mid-y": `${-(30 + ((index * 41) % 45)) * 0.6}vh`,
                  "--confetti-rotate": `${(index % 2 ? 1 : -1) * (360 + ((index * 137) % 720))}deg`,
                  "--confetti-mid-rotate": `${(index % 2 ? 1 : -1) * (360 + ((index * 137) % 720)) * 0.45}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      <header className="max-w-xl">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconCake size={14} stroke={1.75} aria-hidden="true" />
          {t("December 31, 13:12 Bangkok", "31 ธันวาคม 13:12 กรุงเทพฯ")}
        </p>
        <h1
          id="birthday-title"
          className="text-3xl font-medium tracking-tight text-balance"
          aria-live="polite"
        >
          {countdown?.isBirthday
            ? t("Happy birthday", "สุขสันต์วันเกิด")
            : t("Until the next birthday", "นับถอยหลังถึงวันเกิด")}
        </h1>
        <p
          className="mt-2 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground"
          aria-live="polite"
        >
          {countdown
            ? countdown.isBirthday
              ? t(
                  `${countdown.age} years of small moments. Another year starts today.`,
                  `${countdown.age} ปีของช่วงเวลาเล็ก ๆ อีกปีเริ่มต้นวันนี้`,
                )
              : t(
                  `Counting down to year ${countdown.age}.`,
                  `นับถอยหลังสู่ปีที่ ${countdown.age}`,
                )
            : t("The next year is on its way.", "ปีถัดไปกำลังจะมาถึง")}
        </p>
        <p className="mt-3 text-sm text-pretty text-muted-foreground">
          {countdown ? (
            <time dateTime={new Date(countdown.target).toISOString()}>
              {dateLabel}
            </time>
          ) : (
            dateLabel
          )}
          <span aria-hidden="true"> · </span>
          {t("Bangkok time", "เวลากรุงเทพฯ")}
        </p>
      </header>
      <div
        className="mt-8 grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2"
        role="timer"
        aria-label={t(
          "Time until the next birthday",
          "เวลาที่เหลือก่อนวันเกิดครั้งถัดไป",
        )}
        aria-busy={!countdown}
      >
        {units.map((unit) => (
          <Card key={unit} size="sm" className="h-full justify-center">
            <CardContent className="flex flex-col items-center gap-2 px-2 py-2 text-center lg:py-4">
              <div className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {countdown && pageReady ? (
                  <Counter
                    value={countdown[unit]}
                    minDigits={2}
                    format={{ useGrouping: false }}
                    direction="down"
                    duration={0.6}
                    bounce={0.15}
                    stagger={0.025}
                    fontSize="1em"
                    fontWeight={600}
                  />
                ) : (
                  <span className="text-muted-foreground" aria-label="Loading">
                    --
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {unitLabels[unit]}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
