"use client";

import { useEffect } from "react";

let registration: Promise<unknown> | null = null;

type WavyLinearProgressProps = {
  className?: string;
  label: string;
  max: number;
  value: number;
};

export default function WavyLinearProgress({ className, label, max, value }: WavyLinearProgressProps) {
  useEffect(() => {
    registration ??= import("@m3e/web/progress-indicator");
  }, []);

  return (
    <m3e-linear-progress-indicator
      className={className}
      variant="wavy"
      mode="determinate"
      value={value}
      max={max}
      aria-label={label}
    />
  );
}
