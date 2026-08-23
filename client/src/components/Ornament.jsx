/**
 * Line-art mandala used as the reverse face of the role coin and as a
 * decorative crest on the home screen. Twelve petals over concentric rings,
 * drawn once and rotated with CSS rather than duplicated in markup.
 */
export function Mandala({ size = 132, className = "" }) {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.9">
        <circle cx="60" cy="60" r="54" />
        <circle cx="60" cy="60" r="45" strokeDasharray="2 4" />
        <circle cx="60" cy="60" r="27" />
        <circle cx="60" cy="60" r="9" />
        {petals.map((deg) => (
          <path
            key={deg}
            d="M60 16 C68 30 68 38 60 50 C52 38 52 30 60 16 Z"
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
        {petals.map((deg) => (
          <line
            key={`t-${deg}`}
            x1="60"
            y1="51"
            x2="60"
            y2="55"
            transform={`rotate(${deg + 15} 60 60)`}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * A horizontal rule with a paisley (boteh) at its centre — used to separate
 * the wordmark from the content beneath it.
 */
export function PaisleyRule({ className = "" }) {
  return (
    <div className={`paisley-rule ${className}`} aria-hidden="true">
      <span className="paisley-line" />
      <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
        <path
          d="M13 1.6c4.6 0 8.4 3 8.4 7 0 4.6-4 8-8.8 8-3.2 0-5.6-2-5.6-4.6 0-2.4 1.8-4 3.8-4 1.6 0 2.8 1 2.8 2.4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="paisley-line" />
    </div>
  );
}
