/**
 * Custom line crests for the four roles, drawn to sit inside a coin.
 * Each is stroked in the role's jewel tone and filled with a faint metal
 * wash, so it reads as engraved rather than as a flat pictogram.
 */

const PATHS = {
  // Crown — five points over a jewelled band
  Raja: (
    <>
      <path d="M6 21h20l1.6-11.2-6 4.4L16 5l-5.6 9.2-6-4.4z" />
      <path d="M6 25h20" />
      <circle cx="16" cy="12" r="1.1" />
      <circle cx="9.4" cy="16.4" r="0.9" />
      <circle cx="22.6" cy="16.4" r="0.9" />
    </>
  ),
  // Scroll — a parchment firman, curled top and bottom, with two lines of text
  Mantri: (
    <>
      <path d="M7 9c2-2.2 4 2.2 6 0s4-2.2 6 0 4 2.2 6 0" />
      <path d="M7 23c2-2.2 4 2.2 6 0s4-2.2 6 0 4 2.2 6 0" />
      <path d="M7 9v14M25 9v14" />
      <path d="M12.2 14.6h7.6M12.2 18.2h7.6" />
    </>
  ),
  // Shield — a guard bearing two rank chevrons, not a cross
  Sipahi: (
    <>
      <path d="M16 4.6 6.4 8.2v7.4c0 6 4 10.6 9.6 12.2 5.6-1.6 9.6-6.2 9.6-12.2V8.2z" />
      <path d="M11.4 13.2 16 17l4.6-3.8" />
      <path d="M11.4 18.4 16 22.2l4.6-3.8" />
    </>
  ),
  // Mask — the thief's face-cover, tied at the sides
  Chor: (
    <>
      <path d="M4.4 12.6c3.4-1.8 8-2.6 11.6-2.6s8.2.8 11.6 2.6c-.4 4.4-1.8 7.4-4.2 8.6-2.2 1.2-4.6.2-6-1.6l-1.4-1.8-1.4 1.8c-1.4 1.8-3.8 2.8-6 1.6-2.4-1.2-3.8-4.2-4.2-8.6z" />
      <path d="M11 15.4c1 -.7 2.2-.7 3.2 0M17.8 15.4c1-.7 2.2-.7 3.2 0" />
      <path d="M2.6 10.6 4.4 12.6M29.4 10.6 27.6 12.6" />
    </>
  ),
};

export default function RoleCrest({ role, size = 32, className = "" }) {
  const paths = PATHS[role];
  if (!paths) return null;

  return (
    <svg
      className={`crest ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}
