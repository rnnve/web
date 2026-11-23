"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { IconCake, IconSparkles } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import Counter from "../components/ui/counter";
import {
  getBirthdayCountdown,
  getNewYearCountdown,
} from "../lib/birthday";
import { useSiteSettings } from "../components/settings/site-settings-provider";

type BirthdayState = ReturnType<typeof getBirthdayCountdown>;
type NewYearState = ReturnType<typeof getNewYearCountdown>;

const units = [
  "years",
  "months",
  "days",
  "hours",
  "minutes",
  "seconds",
] as const;

const SEEN_KEY = "ryn:countdown-entrance-seen";

function readHasSeenEntrance() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markEntranceSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage is optional.
  }
}

function ConfettiBurst() {
  return (
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
  );
}

function CountdownCard({
  label,
  values,
  animate,
}: {
  label: string;
  values: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  } | null;
  animate: boolean;
}) {
  const { t } = useSiteSettings();
  const unitLabels = {
    years: t("Years", "ปี"),
    months: t("Months", "เดือน"),
    days: t("Days", "วัน"),
    hours: t("Hours", "ชั่วโมง"),
    minutes: t("Minutes", "นาที"),
    seconds: t("Seconds", "วินาที"),
  };

  return (
    <Card
      className="justify-center"
      role="timer"
      aria-label={label}
      aria-busy={!values}
    >
      <CardContent className="flex items-start justify-center gap-1 px-2 py-4 sm:gap-2 sm:px-5 sm:py-5">
        {units.map((unit, index) => (
          <Fragment key={unit}>
            {index > 0 && (
              <span
                className="text-lg text-muted-foreground sm:text-2xl"
                aria-hidden="true"
              >
                :
              </span>
            )}
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <div className="text-lg font-semibold tracking-tight sm:text-2xl">
                {values ? (
                  <Counter
                    value={values[unit]}
                    minDigits={2}
                    format={{ useGrouping: false }}
                    direction="down"
                    duration={animate ? 0.6 : 0}
                    bounce={animate ? 0.15 : 0}
                    stagger={animate ? 0.025 : 0}
                    fontSize="1em"
                    fontWeight={600}
                  />
                ) : (
                  <span className="text-muted-foreground" aria-label="Loading">
                    --
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground sm:text-xs">
                {unitLabels[unit]}
              </span>
            </div>
          </Fragment>
        ))}
        <span
          className="self-start pt-1 text-lg text-muted-foreground sm:pt-1.5 sm:text-2xl"
          aria-hidden="true"
        >
          .
        </span>
        <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
          <div className="min-w-[3ch] text-sm font-semibold tracking-tight tabular-nums text-muted-foreground sm:text-base">
            {values
              ? String(values.milliseconds).padStart(3, "0")
              : "---"}
          </div>
          <span className="text-[10px] text-muted-foreground sm:text-xs">
            {t("ms", "มส")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CountdownBlock({
  eyebrow,
  title,
  description,
  dateLabel,
  timerLabel,
  values,
  animate,
}: {
  eyebrow: ReactNode;
  title: string;
  description: string;
  dateLabel: string;
  timerLabel: string;
  values: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
  } | null;
  animate: boolean;
}) {
  const { t } = useSiteSettings();
  return (
    <section className="flex min-h-0 flex-col gap-3">
      <header className="max-w-xl">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {eyebrow}
        </p>
        <h2
          className="text-xl font-medium tracking-tight text-balance sm:text-2xl"
          aria-live="polite"
        >
          {title}
        </h2>
        <p
          className="mt-1.5 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground"
          aria-live="polite"
        >
          {description}
        </p>
        <p className="mt-2 text-xs text-pretty text-muted-foreground sm:text-sm">
          {dateLabel}
          <span aria-hidden="true"> · </span>
          {t("Bangkok time", "เวลากรุงเทพฯ")}
        </p>
      </header>
      <CountdownCard label={timerLabel} values={values} animate={animate} />
    </section>
  );
}

export default function BirthdayCountdown() {
  const { language, t } = useSiteSettings();
  const [birthday, setBirthday] = useState<BirthdayState | null>(null);
  const [newYear, setNewYear] = useState<NewYearState | null>(null);
  const [birthdayMs, setBirthdayMs] = useState(0);
  const [newYearMs, setNewYearMs] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [animateEntrance] = useState(() => !readHasSeenEntrance());
  const previousBirthday = useRef<BirthdayState | null>(null);
  const previousNewYear = useRef<NewYearState | null>(null);

  useEffect(() => {
    markEntranceSeen();
  }, []);

  useEffect(() => {
    let celebrationTimer: number | undefined;
    let raf = 0;
    let active = true;
    const preferMotion = () =>
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const burst = () => {
      if (!preferMotion()) return;
      setCelebrating(true);
      window.clearTimeout(celebrationTimer);
      celebrationTimer = window.setTimeout(() => setCelebrating(false), 4000);
    };

    const tick = () => {
      if (!active) return;
      const now = Date.now();
      const nextBirthday = getBirthdayCountdown(now);
      const nextNewYear = getNewYearCountdown(now);
      const prevBirthday = previousBirthday.current;
      const prevNewYear = previousNewYear.current;

      if (
        prevBirthday &&
        !prevBirthday.isBirthday &&
        nextBirthday.isBirthday &&
        prevBirthday.target === nextBirthday.target
      ) {
        burst();
      }
      if (
        prevNewYear &&
        !prevNewYear.isNewYear &&
        nextNewYear.isNewYear &&
        prevNewYear.target === nextNewYear.target
      ) {
        burst();
      }

      const birthdaySecondChanged =
        !prevBirthday ||
        Math.floor(prevBirthday.remainingMs / 1_000) !==
          Math.floor(nextBirthday.remainingMs / 1_000) ||
        prevBirthday.isBirthday !== nextBirthday.isBirthday;
      const newYearSecondChanged =
        !prevNewYear ||
        Math.floor(prevNewYear.remainingMs / 1_000) !==
          Math.floor(nextNewYear.remainingMs / 1_000) ||
        prevNewYear.isNewYear !== nextNewYear.isNewYear;

      previousBirthday.current = nextBirthday;
      previousNewYear.current = nextNewYear;
      if (birthdaySecondChanged) setBirthday(nextBirthday);
      if (newYearSecondChanged) setNewYear(nextNewYear);
      setBirthdayMs(nextBirthday.milliseconds);
      setNewYearMs(nextNewYear.milliseconds);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    const onVisibility = () => {
      if (document.hidden) return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(celebrationTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(
      language === "th" ? "th-TH-u-ca-gregory" : "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      },
    ).format(new Date(timestamp));

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      {celebrating ? <ConfettiBurst /> : null}
      <CountdownBlock
        eyebrow={
          <>
            <IconCake size={14} stroke={1.75} aria-hidden="true" />
            {t("December 31, midnight Bangkok", "31 ธันวาคม เที่ยงคืน กรุงเทพฯ")}
          </>
        }
        title={
          birthday?.isBirthday
            ? t("Happy birthday", "สุขสันต์วันเกิด")
            : t("Until the next birthday", "นับถอยหลังถึงวันเกิด")
        }
        description={
          birthday
            ? birthday.isBirthday
              ? t(
                  `${birthday.age} years of small moments. Another year starts today.`,
                  `${birthday.age} ปีของช่วงเวลาเล็ก ๆ อีกปีเริ่มต้นวันนี้`,
                )
              : t(
                  `Counting down to year ${birthday.age}.`,
                  `นับถอยหลังสู่ปีที่ ${birthday.age}`,
                )
            : t("The next year is on its way.", "ปีถัดไปกำลังจะมาถึง")
        }
        dateLabel={
          birthday ? formatDate(birthday.target) : t("December 31", "31 ธันวาคม")
        }
        timerLabel={t(
          "Time until the next birthday",
          "เวลาที่เหลือก่อนวันเกิดครั้งถัดไป",
        )}
        values={
          birthday ? { ...birthday, milliseconds: birthdayMs } : null
        }
        animate={animateEntrance}
      />
      <CountdownBlock
        eyebrow={
          <>
            <IconSparkles size={14} stroke={1.75} aria-hidden="true" />
            {t("January 1, midnight Bangkok", "1 มกราคม เที่ยงคืน กรุงเทพฯ")}
          </>
        }
        title={
          newYear?.isNewYear
            ? t("Happy New Year", "สวัสดีปีใหม่")
            : t("Until the new year", "นับถอยหลังถึงปีใหม่")
        }
        description={
          newYear
            ? newYear.isNewYear
              ? t(
                  `Welcome to ${newYear.year}.`,
                  `ยินดีต้อนรับสู่ปี ${newYear.year}`,
                )
              : t(
                  `Counting down to ${newYear.year}.`,
                  `นับถอยหลังสู่ปี ${newYear.year}`,
                )
            : t("The next year is on its way.", "ปีถัดไปกำลังจะมาถึง")
        }
        dateLabel={
          newYear ? formatDate(newYear.target) : t("January 1", "1 มกราคม")
        }
        timerLabel={t(
          "Time until the new year",
          "เวลาที่เหลือก่อนปีใหม่",
        )}
        values={
          newYear ? { ...newYear, milliseconds: newYearMs } : null
        }
        animate={animateEntrance}
      />
    </div>
  );
}
