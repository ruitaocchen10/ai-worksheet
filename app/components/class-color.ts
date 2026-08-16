import type { ClassColor } from "@/lib/data";

/** Tailwind needs the full class name in source, so these are written out
 *  rather than interpolated. Each fill is paired with the text colour that
 *  clears AA on it. */
export const FILL: Record<ClassColor, string> = {
  forest: "bg-forest text-white",
  rose: "bg-rose text-ink",
  amber: "bg-amber text-ink",
  sage: "bg-sage text-ink",
};

/** Corner lift on a filled card. The reference uses a hard rounded block,
 *  but that only works on tall cards with empty space — at this card height
 *  its edge cuts across the footer and reads as a seam. A radial highlight
 *  gives the same depth with nothing to collide with. Aria-hidden at the
 *  call site. */
export const LIFT: Record<ClassColor, string> = {
  forest: "bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,0.16),transparent_60%)]",
  rose: "bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,0.28),transparent_60%)]",
  amber: "bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,0.3),transparent_60%)]",
  sage: "bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,0.3),transparent_60%)]",
};

/** Muted-but-legible text on a filled card. */
export const ON_FILL: Record<ClassColor, string> = {
  forest: "text-white/75",
  rose: "text-ink/70",
  amber: "text-ink/70",
  sage: "text-ink/70",
};

/** Small chip on a light surface. */
export const CHIP: Record<ClassColor, string> = {
  forest: "bg-forest-soft text-forest-ink",
  rose: "bg-rose-soft text-rose-ink",
  amber: "bg-amber-soft text-amber-ink",
  sage: "bg-sage-soft text-sage-ink",
};

export const DOT: Record<ClassColor, string> = {
  forest: "bg-forest",
  rose: "bg-rose",
  amber: "bg-amber",
  sage: "bg-sage",
};
