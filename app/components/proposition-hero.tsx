import { featured } from "@/lib/data";
import SidePicker from "./side-picker";
import { ShuffleIcon } from "./icons";

/**
 * One proposition, two doors. Not a grid of twelve — a wall of options is a
 * decision before the work starts, and decisions are where people bail.
 *
 * The source is stated twice on purpose: as a chip up top so you know which
 * class this came from at a glance, and under the excerpt as a citation.
 * Grounding in the teacher's own material is the thing competitors don't
 * have, so the page says it out loud.
 */
export default function PropositionHero() {
  const { text, source, excerpt } = featured;

  return (
    <section
      aria-labelledby="proposition"
      className="mt-8 rounded-lg bg-surface p-5 shadow-[0_2px_10px_rgba(20,20,18,0.05)] nav:p-7"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-accent-ink uppercase">
          Resolved
        </span>
        <span className="rounded-full bg-ground px-3 py-1.5 text-[12px] font-semibold text-muted">
          {source.className} · {source.unit}
        </span>
      </div>

      <h1
        id="proposition"
        className="mt-4 max-w-[19ch] font-display text-[31px] leading-[1.12] font-bold tracking-[-0.02em] nav:text-[40px]"
      >
        {text}
      </h1>

      {excerpt && (
        <figure className="mt-5 rounded-card bg-ground p-4">
          <blockquote className="font-source text-[15.5px] leading-relaxed text-ink/85 italic">
            {excerpt}
          </blockquote>
          <figcaption className="mt-2 text-[11.5px] font-semibold text-muted">
            {source.unit}
            {source.page ? ` · ${source.page}` : ""}
          </figcaption>
        </figure>
      )}

      <div className="mt-6">
        <SidePicker propositionId={featured.id} />
      </div>

      <button
        type="button"
        className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-1 text-[13px] font-semibold text-muted hover:text-ink"
      >
        <ShuffleIcon className="size-4" />
        Show me something else
      </button>
    </section>
  );
}
