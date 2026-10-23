"use client";

import { useEffect, useId, useState } from "react";

type AgeCalculatorProps = { birthDate: Date | string; className?: string };

function calculateAge(birthDate: Date, now: Date) {
  let years = now.getFullYear() - birthDate.getFullYear();
  let lastBirthday = new Date(birthDate);
  lastBirthday.setFullYear(birthDate.getFullYear() + years);

  if (lastBirthday > now) {
    years -= 1;
    lastBirthday = new Date(birthDate);
    lastBirthday.setFullYear(birthDate.getFullYear() + years);
  }

  const nextBirthday = new Date(lastBirthday);
  nextBirthday.setFullYear(lastBirthday.getFullYear() + 1);
  const progress = (now.getTime() - lastBirthday.getTime()) / (nextBirthday.getTime() - lastBirthday.getTime());
  return years + progress;
}

export default function AgeCalculator({ birthDate, className = "" }: AgeCalculatorProps) {
  const [age, setAge] = useState("0.0000000");
  const tooltipId = useId();

  useEffect(() => {
    const parsedBirthDate = birthDate instanceof Date ? new Date(birthDate.getTime()) : new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      const invalidFrame = window.requestAnimationFrame(() => setAge("0.0000000"));
      return () => window.cancelAnimationFrame(invalidFrame);
    }

    let frame = 0;
    const tick = () => {
      setAge(calculateAge(parsedBirthDate, new Date()).toFixed(7));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [birthDate]);

  const integerAge = age.split(".")[0];

  return (
    <span className={`age-calculator ${className}`.trim()} tabIndex={0} aria-describedby={tooltipId}>
      <span className="age-calculator__integer">{integerAge}</span>
      <span className="age-calculator__tooltip" id={tooltipId} role="tooltip">{age}</span>
    </span>
  );
}
