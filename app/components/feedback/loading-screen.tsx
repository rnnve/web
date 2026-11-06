"use client";

import LoadingMessage from "./loading-message";
import { useSiteSettings } from "../settings/site-settings-provider";

type LoadingScreenProps = {
  overlay?: boolean;
  fading?: boolean;
  durationMs?: number;
  heading?: string;
  message?: string;
};

const symbolMask =
  "absolute inset-0 [mask:url('/loading.webp')_center/contain_no-repeat] [-webkit-mask:url('/loading.webp')_center/contain_no-repeat]";

// Colors follow the icon order in loading.webp, with stops in the gaps.
// VIRTUAL SINGER, Leo/need, MORE MORE JUMP!, Nightcord at 25:00,
// Wonderlands×Showtime, Vivid BAD SQUAD.
const unitColors =
  "linear-gradient(to right, #ffffff 0% 16.4%, #4455dd 16.4% 32%, #88dd44 32% 49%, #884499 49% 66%, #ff9900 66% 83.2%, #ee1166 83.2% 100%)";

export default function LoadingScreen({
  overlay = false,
  fading = false,
  durationMs = 1_500,
  heading,
  message,
}: LoadingScreenProps) {
  const { t } = useSiteSettings();
  const layout =
    "isolate grid min-h-svh place-items-center overflow-hidden bg-(--md-sys-color-surface) p-4 min-[601px]:p-7";
  const content = (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/loading-pattern.svg')] opacity-35 [contain:strict] [animation:loading-pattern-drift_3s_linear_infinite] motion-reduce:[animation:none]"
        aria-hidden="true"
      />
      <section
        className={`w-full rounded-(--md-shape-extra-large) border-0 bg-(--md-sys-color-surface-container-high) shadow-(--md-elevation-2) transition-transform duration-[180ms] ease-out motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none ${
          overlay
            ? "max-w-[660px] p-[clamp(30px,5.5vw,58px)]"
            : "max-w-[760px] px-[22px] py-10 min-[601px]:p-[clamp(34px,7vw,72px)]"
        } ${fading ? "-translate-y-2 scale-[0.985]" : "translate-y-0 scale-100"}`}
        aria-busy="true"
      >
        <div
          className={`relative mx-auto aspect-500/87 w-full ${overlay ? "max-w-[440px]" : "max-w-[500px]"}`}
          role="img"
          aria-label={t("Loading animation", "ภาพเคลื่อนไหวขณะโหลด")}
        >
          <span
            className={`${symbolMask} bg-(--md-sys-color-surface-container-highest)`}
          />
          <span className={symbolMask}>
            <span
              className="absolute inset-0 [animation:loading-symbol-fill_1.5s_ease-in-out_both] [will-change:clip-path] motion-reduce:[animation:none]"
              style={{
                backgroundImage: unitColors,
                animationDuration: `${durationMs}ms`,
              }}
            />
          </span>
        </div>
        <div className={`text-center ${overlay ? "mt-7" : "mt-[34px]"}`}>
          <h2
            className={`m-0 leading-[1.05] tracking-[-0.045em] text-(--md-sys-color-on-surface) ${overlay ? "text-[clamp(23px,3.4vw,34px)]" : "text-[clamp(25px,4vw,38px)]"}`}
          >
            {heading ?? t("Loading into My Sekai", "กำลังเข้าสู่ My Sekai")}
          </h2>
          {message ? (
            <p className="m-0 mt-[11px] text-sm italic text-(--ink-soft) [overflow-wrap:anywhere]">
              {message}
            </p>
          ) : (
            <LoadingMessage />
          )}
        </div>
      </section>
    </>
  );

  if (overlay) {
    return (
      <div
        data-loading-overlay
        className={`${layout} fixed inset-0 z-[9999] transition-opacity duration-[180ms] ease-out will-change-[opacity] motion-reduce:transition-none ${fading ? "opacity-0" : "opacity-100"}`}
        role="status"
        aria-live="polite"
        aria-label={t("Loading page", "กำลังโหลดหน้าเว็บ")}
      >
        {content}
      </div>
    );
  }

  return (
    <main className={`${layout} relative`} aria-live="polite">
      {content}
    </main>
  );
}
