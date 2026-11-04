"use client";

import LoadingMessage from "./loading-message";
import ShapeGrid from "./shape-grid";
import { useSiteSettings } from "./site-settings-provider";

type LoadingScreenProps = {
  overlay?: boolean;
  fading?: boolean;
};

export default function LoadingScreen({
  overlay = false,
  fading = false,
}: LoadingScreenProps) {
  const { t } = useSiteSettings();
  const content = (
    <>
      <div className="loading-demo__background" aria-hidden="true">
        <ShapeGrid
          shape="cross"
          direction="diagonal"
          lineColor="#3b3747"
          hoverColor="#ffffff"
          hoverFillColor="#ffffff"
          fillOpacity={0.15}
          cellSize={34}
          speed={0.5}
          radius={3}
          trail={1.2}
          glow={0.2}
          dpr={1}
          intro={false}
          paused={fading}
        />
      </div>
      <section className="loading-demo__card" aria-busy="true">
        <div
          className="loading-demo__art"
          role="img"
          aria-label="Loading animation"
        >
          <span className="loading-demo__symbols loading-demo__symbols--base" />
          <span className="loading-demo__symbols loading-demo__symbols--sweep">
            <span className="loading-demo__fill" />
          </span>
        </div>
        <div className="loading-demo__copy">
          <h1>{t("Loading into My Sekai", "กำลังเข้าสู่ My Sekai")}</h1>
          <LoadingMessage />
        </div>
      </section>
    </>
  );

  if (overlay) {
    return (
      <div
        className={`loading-demo global-loader${fading ? " global-loader--fading" : ""}`}
        role="status"
        aria-live="polite"
        aria-label={t("Loading page", "กำลังโหลดหน้าเว็บ")}
      >
        {content}
      </div>
    );
  }

  return (
    <main className="loading-demo" aria-live="polite">
      {content}
    </main>
  );
}
