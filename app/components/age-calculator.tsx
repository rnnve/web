"use client";

import { useEffect, useId, useState } from "react";

type AgeCalculatorProps = { birthDate: Date | string; className?: string };

const AGE_UPDATE_INTERVAL = 250;

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
  const [age, setAge] = useState("0.00000000");
  const tooltipId = useId();

  useEffect(() => {
    const parsedBirthDate = birthDate instanceof Date ? new Date(birthDate.getTime()) : new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      const invalidFrame = window.requestAnimationFrame(() => setAge("0.00000000"));
      return () => window.cancelAnimationFrame(invalidFrame);
    }

    const updateAge = () => {
      const nextAge = calculateAge(parsedBirthDate, new Date()).toFixed(8);
      setAge((currentAge) => currentAge === nextAge ? currentAge : nextAge);
    };

    const initialFrame = window.requestAnimationFrame(updateAge);
    const interval = window.setInterval(updateAge, AGE_UPDATE_INTERVAL);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.clearInterval(interval);
    };
  }, [birthDate]);

  const integerAge = age.split(".")[0];

  return (
    <span className={`age-calculator ${className}`.trim()} tabIndex={0} aria-describedby={tooltipId}>
      <span className="age-calculator__integer">{integerAge}</span>
      <span className="age-calculator__tooltip" id={tooltipId} role="tooltip">{age}</span>
    </span>
  );
}
