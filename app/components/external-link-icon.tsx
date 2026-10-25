type ExternalLinkIconProps = {
  className?: string;
  size?: number;
};

export default function ExternalLinkIcon({ className, size = 16 }: ExternalLinkIconProps) {
  return (
    <svg
      className={`external-link-icon${className ? ` ${className}` : ""}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
