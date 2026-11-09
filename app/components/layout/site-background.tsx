import PatternWaves from "../effects/pattern-waves";

export default function SiteBackground() {
  return (
    <div
      className="site-background fixed [inset:0] [z-index:0] overflow-hidden pointer-events-none [background:var(--page-background)]"
      aria-hidden="true"
    >
      <PatternWaves
        preset="silk"
        color="#ffffff"
        backgroundColor="transparent"
        opacity={0.35}
        fade="edges"
        interactive
        cursorSize={50}
        cursorStrength={0.6}
      />
    </div>
  );
}
