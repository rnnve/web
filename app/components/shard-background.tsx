"use client";

import { useEffect, useRef } from "react";

const shapes = [
  { speed: -0.055, variant: "one", shape: "triangle" },
  { speed: -0.11, variant: "two", shape: "circle" },
  { speed: -0.075, variant: "three", shape: "triangle" },
  { speed: -0.16, variant: "four", shape: "triangle" },
  { speed: -0.09, variant: "five", shape: "circle" },
  { speed: -0.2, variant: "six", shape: "triangle" },
  { speed: -0.125, variant: "seven", shape: "circle" },
  { speed: -0.065, variant: "eight", shape: "triangle" },
  { speed: -0.145, variant: "nine", shape: "triangle" },
  { speed: -0.095, variant: "ten", shape: "circle" },
  { speed: -0.18, variant: "eleven", shape: "triangle" },
  { speed: -0.08, variant: "twelve", shape: "circle" },
];

export default function ShardBackground() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const tracks = Array.from(fieldRef.current?.querySelectorAll<HTMLElement>("[data-shard-speed]") ?? []);
    let frame = 0;

    const update = () => {
      const scrollY = window.scrollY;
      tracks.forEach((track) => {
        const speed = Number(track.dataset.shardSpeed ?? 0);
        track.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });
      frame = 0;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={fieldRef} className="shard-background" aria-hidden="true">
      {shapes.map((shape) => (
        <span className={`shard-background__track shard-background__track--${shape.variant}`} data-shard-speed={shape.speed} key={shape.variant}>
          <i className={`shard-background__shape shard-background__shape--${shape.shape}`} />
        </span>
      ))}
    </div>
  );
}
