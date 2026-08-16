/** The stat tiles use the same glyphs the flow sheet draws, so the legend
 *  and the notation are literally the same marks. */
type Props = { className?: string };

export function ExtendedMark({ className }: Props) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden focusable="false">
      <rect x="6.4" y="2" width="3.2" height="12" rx="1.6" fill="currentColor" />
    </svg>
  );
}

export function ConcededMark({ className }: Props) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden focusable="false">
      <path d="M8 2.6 13.4 8 8 13.4 2.6 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function DroppedMark({ className }: Props) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden focusable="false">
      <circle cx="8" cy="8" r="2.6" fill="currentColor" />
    </svg>
  );
}

export function ChangedMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d="M3 8a5 5 0 0 1 8.5-3.5L13 6" />
      <path d="M13 3v3h-3" />
      <path d="M13 8a5 5 0 0 1-8.5 3.5L3 10" />
      <path d="M3 13v-3h3" />
    </svg>
  );
}
