type LinearProgressProps = {
  className?: string;
  label: string;
  max: number;
  value: number;
};

export default function LinearProgress({
  className = "",
  label,
  max,
  value,
}: LinearProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 1;
  const current = Number.isFinite(value)
    ? Math.min(limit, Math.max(0, value))
    : 0;

  return (
    <div
      className={`overflow-hidden [height:3px] [border-radius:2px] [background:var(--border)] ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={current}
    >
      <div
        className="h-full [background:var(--accent)]"
        style={{ width: `${(current / limit) * 100}%` }}
      />
    </div>
  );
}
