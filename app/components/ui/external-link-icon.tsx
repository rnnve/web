type ExternalLinkIconProps = {
  className?: string;
  size?: number;
};
export default function ExternalLinkIcon({
  className,
  size = 16,
}: ExternalLinkIconProps) {
  return (
    <svg
      className={`external-link-icon block [flex:0_0_auto] [.github-repo-card_>_div_&]:[flex:0_0_auto] [.developer-tool_>_&]:absolute [.developer-tool_>_&]:[top:16px] [.developer-tool_>_&]:[right:16px] [.developer-tool_>_&]:[color:color-mix(in_srgb,_var(--tool-color)_82%,_var(--text))] max-[521px]:[.developer-tool_>_&]:static${className ? ` ${className}` : ""}`}
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
