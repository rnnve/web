import ShapeGrid from "../effects/shape-grid";

export default function SiteBackground() {
  return (
    <div
      className="site-background fixed [inset:0] [z-index:0] overflow-hidden pointer-events-none [background:var(--page-background)]"
      aria-hidden="true"
    >
      <ShapeGrid
        shape="hexagon"
        direction="diagonal"
        lineColor="#2a2734"
        style={{ color: "var(--accent)" }}
        hoverColor="currentColor"
        hoverFillColor="currentColor"
        fillOpacity={0.15}
        cellSize={41}
        speed={0.5}
        tiltX={0}
        tiltY={0}
        rainbow={false}
        radius={1}
        trail={0.4}
      />
    </div>
  );
}
