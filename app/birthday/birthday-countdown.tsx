"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  return (
    <>
      {celebrating && (
        <div
          className="birthday-confetti fixed [inset:0] [z-index:55] overflow-hidden pointer-events-none [&_span]:absolute [&_span]:[left:50%] [&_span]:[top:48%] [&_span]:[width:9px] [&_span]:[height:14px] [&_span]:[border-radius:2px] [&_span]:[background:var(--confetti-color)] [&_span]:[opacity:0] [&_span]:[animation:birthday-confetti-burst_3.3s_var(--confetti-delay)_ease-out_forwards] [&_span:nth-child(3n)]:[width:10px] [&_span:nth-child(3n)]:[height:10px] [&_span:nth-child(3n)]:[border-radius:50%] motion-reduce:hidden"
          aria-hidden="true"
        >
          {Array.from(
            {
              length: 48,
            },
            (_, index) => (
              <span
                key={index}
                style={
                  {
                    "--confetti-x": `${((index * 73) % 181) - 90}vw`,
                    "--confetti-mid-x": `${(((index * 73) % 181) - 90) * 0.65}vw`,
                    "--confetti-mid-y": `${-(30 + ((index * 41) % 45)) * 0.6}vh`,
                    "--confetti-rotate": `${(index % 2 ? 1 : -1) * (360 + ((index * 137) % 720))}deg`,
                    "--confetti-mid-rotate": `${(index % 2 ? 1 : -1) * (360 + ((index * 137) % 720)) * 0.45}deg`,
                    "--confetti-delay": `${(index % 8) * 0.035}s`,
                    "--confetti-color": [
                      "#f6c7db",
                      "#d8c8ff",
                      "#ffe7a8",
                      "#b9e4f3",
                      "#ffffff",
                    ][index % 5],
                  } as CSSProperties
                }
              />
            ),
          )}
        </div>
      )}
      <h1 id="birthday-title" aria-live="polite">
        {countdown?.isBirthday
          ? t("Happy birthday, Rynnie!", "สุขสันต์วันเกิดนะ Rynnie!")
          : t("Until my birthday.", "นับถอยหลังถึงวันเกิด")}
      </h1>
      <p
        className="birthday-description [margin:18px_0_0] [color:var(--ink-soft)] [font-size:15px] [line-height:1.6]"
        aria-live="polite"
      >
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
        className="birthday-countdown [width:100%] [max-width:860px] [margin-block:64px_52px] grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] max-[601px]:[max-width:360px] max-[601px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[601px]:[gap:38px_0] max-[601px]:[margin-block:48px_40px]"
        role="timer"
        aria-label={t(
          "Time until Rynnie’s birthday",
          "เวลาที่เหลือก่อนวันเกิดของ Rynnie",
        )}
        aria-busy={!countdown}
      >
        {units.map((unit) => (
          <div
            className="birthday-unit [font-size:clamp(40px,_8vw,_104px)] [min-width:0] flex flex-col items-center [gap:26px] [.birthday-unit_+_&]:[border-left:1px_solid_var(--line)] max-[601px]:[font-size:clamp(54px,_15vw,_80px)] max-[601px]:[gap:20px] max-[601px]:[&:nth-child(3)]:[border-left:0]"
            key={unit}
          >
            {countdown && pageReady ? (
              <Counter
                value={countdown[unit]}
                minDigits={2}
                format={{
                  useGrouping: false,
                }}
                direction="down"
                duration={0.6}
                bounce={0.15}
                stagger={0.025}
                fontSize="inherit"
                fontWeight={600}
                className="birthday-number [font-weight:600] [line-height:1] [letter-spacing:-0.045em]"
              />
            ) : (
              <span
                className="birthday-number [font-weight:600] [line-height:1] [letter-spacing:-0.045em] birthday-placeholder [color:var(--ink-soft)]"
                aria-label="Loading"
              >
                --
              </span>
            )}
            <span className="birthday-unit-label [color:var(--ink-soft)] [font-size:11px] [letter-spacing:2px] uppercase">
              {unitLabels[unit]}
            </span>
          </div>
        ))}
      </div>
      <p className="birthday-date [margin:0] [color:var(--ink-soft)] [font-size:12px] [line-height:1.8] [text-wrap:balance] [&_>_span]:[padding-inline:10px] [&_>_span]:[color:var(--md-sys-color-outline)]">
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
