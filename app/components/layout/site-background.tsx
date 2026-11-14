import DotGrid from "../effects/dot-grid";

export default function SiteBackground() {
  return (
    <div
      className="site-background fixed [inset:0] [z-index:0] overflow-hidden pointer-events-none [background:var(--page-background)]"
      aria-hidden="true"
    >
      <DotGrid
        baseColor="#1e1e1e"
        activeColor="var(--accent)"
        shape="circle"
        dotSize={3}
        gap={10}
        proximity={95}
        strength={1}
        bounce={0}
        tension={0.2}
        returnDuration={0.8}
        shockRadius={180}
        shockStrength={4}
        swell={0.35}
        stretch={0.25}
        glow={0.6}
        fade={0}
        intro
        clickShock={false}
      />
    </div>
  );
}
