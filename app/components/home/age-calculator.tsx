"use client";

import { useEffect, useId, useState } from "react";
type AgeCalculatorProps = {
  birthDate: Date | string;
  className?: string;
};
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
  const progress =
    (now.getTime() - lastBirthday.getTime()) /
    (nextBirthday.getTime() - lastBirthday.getTime());
  return years + progress;
}
export default function AgeCalculator({
  birthDate,
  className = "",
}: AgeCalculatorProps) {
  const [age, setAge] = useState("0.00000000");
  const tooltipId = useId();
  useEffect(() => {
    const parsedBirthDate =
      birthDate instanceof Date
        ? new Date(birthDate.getTime())
        : new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      const invalidFrame = window.requestAnimationFrame(() =>
        setAge("0.00000000"),
      );
      return () => window.cancelAnimationFrame(invalidFrame);
    }
    const updateAge = () => {
      const nextAge = calculateAge(parsedBirthDate, new Date()).toFixed(8);
      setAge((currentAge) => (currentAge === nextAge ? currentAge : nextAge));
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
    <span
      className={`age-calculator relative [width:2ch] [min-width:0] [margin:0] inline-block [font-family:var(--font-site)] [font-variant-numeric:tabular-nums] [vertical-align:baseline] [cursor:help] [outline:none] [&:focus-visible]:[border-radius:4px] [&:focus-visible]:[outline:2px_solid_color-mix(in_srgb,_var(--purple-bright)_55%,_transparent)] [&:focus-visible]:[outline-offset:3px] ${className}`.trim()}
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      <span className="age-calculator__integer [width:100%] [min-width:0] inline-block text-right">
        {integerAge}
      </span>
      <span
        className="age-calculator__tooltip absolute [z-index:20] [left:50%] [bottom:calc(100%_+_9px)] [width:max-content] [padding:7px_9px] [border:1px_solid_color-mix(in_srgb,_var(--purple-bright)_30%,_var(--line))] [border-radius:8px] [background:var(--md-sys-color-surface-container-highest)] [color:var(--ink)] [box-shadow:0_9px_24px_var(--shadow)] [backdrop-filter:none] [font-size:10px] [line-height:1] [letter-spacing:0.15px] [opacity:0] pointer-events-none [transform:translate(-50%,_5px)_scale(0.96)] [transform-origin:bottom_center] [transition:opacity_0.16s_ease,_transform_0.2s_var(--ease)] [-webkit-backdrop-filter:none] [border-color:var(--md-sys-color-outline-variant)] [&::after]:[content:''] [&::after]:absolute [&::after]:[left:50%] [&::after]:[top:100%] [&::after]:[width:7px] [&::after]:[height:7px] [&::after]:[border-right:1px_solid_color-mix(in_srgb,_var(--purple-bright)_30%,_var(--line))] [&::after]:[border-bottom:1px_solid_color-mix(in_srgb,_var(--purple-bright)_30%,_var(--line))] [&::after]:[background:var(--md-sys-color-surface-container-highest)] [&::after]:[transform:translate(-50%,_-4px)_rotate(45deg)] [&::after]:[border-color:var(--md-sys-color-outline-variant)] [.age-calculator:hover_&]:[opacity:1] [.age-calculator:hover_&]:[transform:translate(-50%,_0)_scale(1)] [.age-calculator:focus-visible_&]:[opacity:1] [.age-calculator:focus-visible_&]:[transform:translate(-50%,_0)_scale(1)]"
        id={tooltipId}
        role="tooltip"
      >
        {age}
      </span>
    </span>
  );
}
