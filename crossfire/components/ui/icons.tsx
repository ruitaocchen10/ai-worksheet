/** Inline SVG only — no emoji, one stroke weight (1.5), one 20px grid. */
type Props = { className?: string };

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function HomeIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V8.5Z" />
    </svg>
  );
}

export function ClassesIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3 5h5a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2H3V5ZM17 5h-5a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h5V5Z" />
    </svg>
  );
}

export function ReasoningIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3 4h14M3 9h14M3 14h9" />
      <path d="M14.5 13.5 16 15l2.5-2.5" />
    </svg>
  );
}

export function ShuffleIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M15 4.5 17.5 7 15 9.5" />
      <path d="M2.5 7h4.2c1.2 0 2.3.6 3 1.6l2.6 3.8c.7 1 1.8 1.6 3 1.6h2.2" />
      <path d="M2.5 14h4.2c1.2 0 2.3-.6 3-1.6" />
      <path d="M15 11.5 17.5 14 15 16.5" />
    </svg>
  );
}

export function UploadIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M10 13V3.5M6.5 7 10 3.5 13.5 7" />
      <path d="M3.5 13v2.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V13" />
    </svg>
  );
}

export function MicIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" />
      <path d="M4.5 9a5.5 5.5 0 0 0 11 0M10 14.5v3" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 10h13M12 5.5 16.5 10 12 14.5" />
    </svg>
  );
}

export function ClockIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.2V10l2.6 1.6" />
    </svg>
  );
}

export function PlayIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 5.6 14.4 10l-6.9 4.4V5.6Z" />
    </svg>
  );
}

export function CheckIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 10.5 8 14l7.5-8" />
    </svg>
  );
}

export function LinkIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M8.5 11.5a3 3 0 0 0 4.24 0l2.5-2.5a3 3 0 0 0-4.24-4.24l-1 1" />
      <path d="M11.5 8.5a3 3 0 0 0-4.24 0l-2.5 2.5a3 3 0 0 0 4.24 4.24l1-1" />
    </svg>
  );
}

export function TextIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4h12M4 8h12M4 12h8M4 16h5" />
    </svg>
  );
}

export function DocIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M11.5 2.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6l-3.5-3.5Z" />
      <path d="M11.5 2.5V6H15" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5 7 10l5 5" />
    </svg>
  );
}
