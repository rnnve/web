import ShapeGrid from "../effects/shape-grid";
import FallingStars from "../effects/falling-stars";

export default function SiteBackground() {
  return (
    <div
      className="site-background fixed [inset:0] [z-index:0] overflow-hidden pointer-events-none [background:var(--paper)]"
      aria-hidden="true"
    >
      <ShapeGrid
        shape="square"
        direction="diagonal"
        lineColor="#2a2734"
        hoverColor="#ffffff"
        hoverFillColor="#ffffff"
        fillOpacity={0.15}
        cellSize={40}
        speed={0.5}
        trail={0.2}
        tiltX={0}
        tiltY={0}
        rainbow={false}
        clickCascade={false}
      />
      <FallingStars />
    </div>
  );
}
