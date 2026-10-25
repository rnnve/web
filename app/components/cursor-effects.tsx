"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 39;

export default function CursorEffects() {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const glow = glowRef.current;
    const stars = Array.from(trailRef.current?.children ?? []) as HTMLElement[];
    if (!glow || !stars.length) return;

    let starIndex = 0;
    let lastX = -100;
    let lastY = -100;
    let lastStarAt = 0;
    let moveFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTime = 0;

    const showStar = (x: number, y: number) => {
      const star = stars[starIndex++ % stars.length];
      const angle = Math.random() * Math.PI * 2;
      const drift = 12 + Math.random() * 14;
      const size = 12.8 + Math.random() * 9.6;
      star.getAnimations().forEach((animation) => animation.cancel());
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.fontSize = `${size}px`;
      star.animate(
        [
          { opacity: 0.9, transform: `translate(-50%, -50%) scale(.45) rotate(0deg)` },
          { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(angle) * drift}px), calc(-50% + ${Math.sin(angle) * drift}px)) scale(1.15) rotate(80deg)` },
        ],
        { duration: 720 + Math.random() * 220, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
      );
    };

    const renderMove = () => {
      moveFrame = 0;

      if (document.documentElement.dataset.pageLoading === "true") {
        return;
      }

      glow.style.opacity = "1";
      glow.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;

      const distance = Math.hypot(pointerX - lastX, pointerY - lastY);
      if (distance > 4.6 && pointerTime - lastStarAt > 11) {
        showStar(pointerX, pointerY);
        if (starIndex % 2 === 0) showStar(pointerX + (Math.random() - 0.5) * 12, pointerY + (Math.random() - 0.5) * 12);
        lastX = pointerX;
        lastY = pointerY;
        lastStarAt = pointerTime;
      }
    };

    const handleMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerTime = event.timeStamp;
      if (!moveFrame) moveFrame = window.requestAnimationFrame(renderMove);
    };

    const hideGlow = () => { glow.style.opacity = "0"; };
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hideGlow);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", hideGlow);
      window.cancelAnimationFrame(moveFrame);
      stars.forEach((star) => star.getAnimations().forEach((animation) => animation.cancel()));
    };
  }, []);

  return (
    <div className="cursor-effects" aria-hidden="true">
      <div ref={glowRef} className="cursor-glow" />
      <div ref={trailRef} className="cursor-trail">
        {Array.from({ length: STAR_COUNT }, (_, index) => <span key={index}>✦</span>)}
      </div>
    </div>
  );
}
