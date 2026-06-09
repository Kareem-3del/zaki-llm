/**
 * Zaki wordmark. Monochrome, geometric — a "reasoning path" mark:
 * three nodes linked into a single thought, beside the Arabic wordmark زكي.
 * Inherits currentColor so it flips to white on dark bands.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-sm ${className}`} aria-label="زكي">
      <ReasoningMark className="h-[26px] w-[26px]" />
      <span className="font-display text-display-sm leading-none tracking-normal">زكي</span>
    </span>
  );
}

export function ReasoningMark({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** "default" = ink square + white nodes (light surfaces); "onDark" = bare white nodes (dark surfaces). */
  variant?: "default" | "onDark";
}) {
  const onDark = variant === "onDark";
  const nodeColor = onDark ? "#fff" : "#fff";
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill={onDark ? "#282828" : "currentColor"} />
      {/* three linked nodes — a thought connecting ideas */}
      <path
        d={"M9 22.5 L16 13 L23 18.5"}
        stroke={nodeColor}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="22.5" r="2.6" fill={nodeColor} />
      <circle cx="16" cy="13" r="2.6" fill={nodeColor} />
      <circle cx="23" cy="18.5" r="2.6" fill={nodeColor} />
    </svg>
  );
}
