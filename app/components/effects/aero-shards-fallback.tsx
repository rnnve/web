import styles from "./aero-shards-fallback.module.css";

// Fixed positions keep the fallback stable across renders and accent changes.
const shards = Array.from({ length: 120 }, (_, index) => {
  const layer = index % 3;
  const position = Math.floor(index / 3) / 39;
  return {
    x: position * 1800 - 100 + Math.sin(index * 7.3) * 24,
    y:
      160 +
      layer * 280 +
      Math.sin(position * Math.PI * 2 + layer) * 140 +
      Math.cos(index * 4.7) * 48,
    rotation: (index * 137.5) % 360,
    scale: (0.35 + ((index * 17) % 31) / 24) * (1 - layer * 0.2),
    opacity: 0.8 - layer * 0.2,
  };
});

export default function AeroShardsFallback({ color }: { color: string }) {
  return (
    <svg
      className={styles.scene}
      data-aero-shards-fallback=""
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      fill={color}
      stroke={color}
      aria-hidden="true"
    >
      {shards.map((shard, index) => (
        <g
          key={index}
          className={styles.drift}
          style={{
            animationDuration: `${18 + (index % 7) * 4}s`,
            animationDelay: `${-index * 2}s`,
          }}
          opacity={shard.opacity}
        >
          <g
            transform={`translate(${shard.x} ${shard.y}) rotate(${shard.rotation}) scale(${shard.scale})`}
          >
            <polygon
              points="-24,-8 15,-18 28,10 -10,20"
              fillOpacity={0.1}
              strokeOpacity={0.65}
              strokeWidth={0.8}
            />
            <path d="M-24-8 4 2 15-18Z" fillOpacity={0.25} stroke="none" />
            <path d="M4 2 28 10-10 20Z" fillOpacity={0.05} stroke="none" />
            <path
              d="m-24-8 28 10 24 8"
              fill="none"
              strokeOpacity={0.35}
              strokeWidth={0.6}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
