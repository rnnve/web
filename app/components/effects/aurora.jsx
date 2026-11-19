"use client";

import { useEffect, useRef, useState } from "react";
import "./aurora.css";

const MAX_STOPS = 5;
const MAX_LAYERS = 3;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @param {{ colorStops?: string[], amplitude?: number, blend?: number,
 * speed?: number, time?: number, height?: number, scale?: number,
 * glow?: number, brightness?: number, layers?: number,
 * direction?: 'top' | 'bottom', mouseInteraction?: boolean,
 * intro?: boolean, opacity?: number, lightMode?: boolean,
 * paused?: boolean, dpr?: number, className?: string,
 * style?: import('react').CSSProperties }} props
 */
const Aurora = ({
  colorStops = ["#5227FF", "#7cff67", "#5227FF"],
  amplitude = 1,
  blend = 0.5,
  speed = 1,
  time,
  height = 0.45,
  scale = 1,
  glow = 0.6,
  brightness = 1,
  layers = 1,
  direction = "top",
  mouseInteraction = true,
  intro = true,
  opacity = 1,
  lightMode = false,
  paused = false,
  dpr,
  className = "",
  style,
}) => {
  const [fallback, setFallback] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const wakeRef = useRef(null);
  const stops = (Array.isArray(colorStops) ? colorStops : [])
    .filter(Boolean)
    .map(String)
    .slice(0, MAX_STOPS);
  const settings = {
    stops:
      stops.length >= 2
        ? stops
        : stops.length === 1
          ? [stops[0], stops[0]]
          : ["#5227FF", "#7cff67"],
    amplitude: Math.max(0, amplitude),
    blend: clamp(blend, 0, 1),
    speed,
    time,
    height: clamp(height, 0, 1),
    scale: Math.max(0.1, scale),
    glow: Math.max(0, glow),
    brightness: Math.max(0, brightness),
    layers: clamp(Math.round(layers), 1, MAX_LAYERS),
    flip: direction === "bottom" ? 1 : 0,
    mouseInteraction,
    intro,
    opacity: clamp(opacity, 0, 1),
    lightMode,
    paused,
    dpr,
  };
  const settingsRef = useRef(settings);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    let active = true;
    let driver;
    let worker;
    let timer;
    let inView = true;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const bounds = () => {
      const rect = container.getBoundingClientRect();
      return {
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        left: rect.left,
        top: rect.top,
        dpr: window.devicePixelRatio || 1,
      };
    };
    let viewport = bounds();
    const send = (type, value) => driver?.(type, value);
    const fail = () => {
      if (active) setFallback(true);
    };
    const visible = () => inView && !document.hidden;
    const init = async () => {
      if (
        !fallback &&
        canvas.transferControlToOffscreen &&
        typeof Worker !== "undefined"
      ) {
        try {
          worker = new Worker(new URL("./aurora.worker.js", import.meta.url), {
            type: "module",
          });
          worker.onerror = (event) => {
            event.preventDefault();
            fail();
          };
          worker.onmessage = ({ data }) => {
            if (data.type === "ready") window.clearTimeout(timer);
            else if (data.type === "fallback") fail();
          };
          const offscreen = canvas.transferControlToOffscreen();
          worker.postMessage(
            {
              type: "init",
              canvas: offscreen,
              settings: settingsRef.current,
              viewport: { ...viewport, visible: visible() },
              reduce: media?.matches ?? false,
            },
            [offscreen],
          );
          driver = (type, value) => worker.postMessage({ type, value });
          canvas.dataset.auroraRenderer = "worker";
          timer = window.setTimeout(fail, 10_000);
          return;
        } catch {
          fail();
          return;
        }
      }
      const { createAuroraRenderer } = await import("./aurora-renderer");
      if (!active) return;
      const renderer = createAuroraRenderer(
        canvas,
        settingsRef.current,
        { ...viewport, visible: visible() },
        media?.matches ?? false,
      );
      if (!renderer) return;
      driver = (type, value) => renderer[type]?.(value);
      canvas.dataset.auroraRenderer = "main";
    };
    void init();
    wakeRef.current = () => send("settings", settingsRef.current);
    const resize = () => {
      viewport = bounds();
      send("viewport", viewport);
    };
    const pointer = (event) => {
      const x = event.clientX - viewport.left;
      const y = event.clientY - viewport.top;
      send("pointer", {
        x,
        y,
        inside: x >= 0 && y >= 0 && x <= viewport.width && y <= viewport.height,
      });
    };
    const release = (event) => {
      if (event.pointerType !== "mouse") send("pointer", { inside: false });
    };
    const leave = () => send("pointer", { inside: false });
    const visibility = () => send("visible", visible());
    const reducedMotion = () => send("reducedMotion", media?.matches ?? false);
    const position = () => {
      const rect = container.getBoundingClientRect();
      viewport.left = rect.left;
      viewport.top = rect.top;
    };
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(container);
    const intersection =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            inView = entries.some((entry) => entry.isIntersecting);
            visibility();
          })
        : null;
    intersection?.observe(container);
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("pointerdown", pointer, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    window.addEventListener("scroll", position, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    media?.addEventListener("change", reducedMotion);
    return () => {
      active = false;
      window.clearTimeout(timer);
      send("destroy");
      worker?.terminate();
      wakeRef.current = null;
      resizeObserver?.disconnect();
      intersection?.disconnect();
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("pointerdown", pointer);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("scroll", position);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      media?.removeEventListener("change", reducedMotion);
    };
  }, [fallback]);

  useEffect(() => {
    settingsRef.current = settings;
    wakeRef.current?.();
  });

  return (
    <div
      ref={containerRef}
      className={`aurora-container${className ? ` ${className}` : ""}`}
      style={style}
    >
      <canvas
        key={fallback ? "main" : "worker"}
        ref={canvasRef}
        className="aurora-canvas"
        aria-hidden="true"
      />
    </div>
  );
};

export default Aurora;
