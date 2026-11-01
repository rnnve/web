"use client";

import { useEffect, useState } from "react";
import Counter from "../components/counter";
import { getBirthdayCountdown } from "../lib/birthday";
import { usePageReady } from "../page-transition";

type Countdown = ReturnType<typeof getBirthdayCountdown>;
const units = ["days", "hours", "minutes", "seconds"] as const;

export default function BirthdayCountdown() {
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
          ? "Happy birthday, Rynnie!"
          : "Until my birthday."}
      </h1>
      <p className="birthday-description" aria-live="polite">
        {countdown
          ? countdown.isBirthday
            ? `${countdown.age} years of little moments. Here’s to another year.`
            : `Counting down to chapter ${countdown.age}.`
          : "The next chapter is on its way."}
      </p>
      <div
        className="birthday-countdown"
        role="timer"
        aria-label="Time until Rynnie’s birthday"
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
            <span className="birthday-unit-label">{unit}</span>
          </div>
        ))}
      </div>
      <p className="birthday-date">
        {countdown ? (
          <time dateTime={new Date(countdown.target).toISOString()}>
            December 31,{" "}
            {new Date(countdown.target + 7 * 3_600_000).getUTCFullYear()}
          </time>
        ) : (
          "December 31"
        )}
        <span aria-hidden="true"> / </span>A day worth waiting for.
      </p>
    </>
  );
}
