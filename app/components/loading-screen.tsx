"use client";

import LoadingMessage from "./loading-message";

type LoadingScreenProps = {
  overlay?: boolean;
  fading?: boolean;
};

export default function LoadingScreen({ overlay = false, fading = false }: LoadingScreenProps) {
  const content = (
    <>
      <div className="loading-demo__glow loading-demo__glow--one" />
      <div className="loading-demo__glow loading-demo__glow--two" />
      <section className="loading-demo__card" aria-busy="true">
        <div className="loading-demo__art" role="img" aria-label="Loading animation">
          <span className="loading-demo__symbols loading-demo__symbols--base" />
          <span className="loading-demo__symbols loading-demo__symbols--sweep" />
        </div>
        <div className="loading-demo__copy">
          <h1>Loading into My Sekai</h1>
          <LoadingMessage />
        </div>
      </section>
    </>
  );

  if (overlay) {
    return <div className={`loading-demo global-loader${fading ? " global-loader--fading" : ""}`} role="status" aria-live="polite" aria-label="Loading page">{content}</div>;
  }

  return <main className="loading-demo" aria-live="polite">{content}</main>;
}
