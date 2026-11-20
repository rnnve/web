"use client";

import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { useEffect, useId, useState } from "react";
type AgeCalculatorProps = {
  birthDate: Date | string;
  className?: string;
  initialNow?: number;
};
const AGE_UPDATE_INTERVAL = 100;
function ageText(birthDate: Date | string, now = new Date()) {
  const parsedBirthDate =
    birthDate instanceof Date
      ? new Date(birthDate.getTime())
      : new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime())) return "0.0000000000";
  return calculateAge(parsedBirthDate, now).toFixed(10);
}
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
  const progress =
    (now.getTime() - lastBirthday.getTime()) /
    (nextBirthday.getTime() - lastBirthday.getTime());
  return years + progress;
}
export default function AgeCalculator({
  birthDate,
  className = "",
  initialNow,
}: AgeCalculatorProps) {
  const [age, setAge] = useState(() =>
    ageText(
      birthDate,
      initialNow === undefined ? new Date() : new Date(initialNow),
    ),
  );
  const tooltipId = useId();
  useEffect(() => {
    const updateAge = () => {
      const nextAge = ageText(birthDate);
      setAge((currentAge) => (currentAge === nextAge ? currentAge : nextAge));
    };
    updateAge();
    const interval = window.setInterval(updateAge, AGE_UPDATE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [birthDate]);
  const integerAge = age.split(".")[0];
  return (
    <span
      className={`age-calculator relative [width:2ch] [min-width:0] [margin:0] inline-block [font-family:var(--font-site)] [font-variant-numeric:tabular-nums] [vertical-align:baseline] [cursor:help] [outline:none] [&:focus-visible]:[border-radius:4px] [&:focus-visible]:[outline:2px_solid_color-mix(in_srgb,_var(--site-accent)_55%,_transparent)] [&:focus-visible]:[outline-offset:3px] ${className}`.trim()}
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      <span className="age-calculator__integer [width:100%] [min-width:0] inline-block text-right">
        {integerAge}
      </span>
      <span
        className="age-calculator__tooltip absolute [z-index:40] [left:50%] [top:calc(100%_+_9px)] [width:max-content] [padding:7px_9px] [border:1px_solid_var(--border)] [border-radius:8px] [background:var(--popover)] [color:var(--popover-foreground)] [box-shadow:0_9px_24px_var(--shadow)] [backdrop-filter:none] [font-size:10px] [line-height:1] [letter-spacing:0.15px] [opacity:0] pointer-events-none [transform:translate(-50%,_-4px)_scale(0.96)] [transform-origin:top_center] [transition:opacity_0.16s_ease,_transform_0.2s_var(--ease)] [-webkit-backdrop-filter:none] [&::after]:[content:''] [&::after]:absolute [&::after]:[left:50%] [&::after]:[bottom:100%] [&::after]:[width:7px] [&::after]:[height:7px] [&::after]:[border-left:1px_solid_var(--border)] [&::after]:[border-top:1px_solid_var(--border)] [&::after]:[background:var(--popover)] [&::after]:[transform:translate(-50%,_4px)_rotate(45deg)] [.age-calculator:hover_&]:[opacity:1] [.age-calculator:hover_&]:[transform:translate(-50%,_0)_scale(1)] [.age-calculator:focus-visible_&]:[opacity:1] [.age-calculator:focus-visible_&]:[transform:translate(-50%,_0)_scale(1)]"
        id={tooltipId}
        role="tooltip"
      >
        <SlidingNumber
          number={Number(age)}
          decimalPlaces={10}
          initiallyStable
          style={{ letterSpacing: 0 }}
        />
      </span>
    </span>
  );
}
