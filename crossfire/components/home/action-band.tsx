"use client";

import { assignments, classes, type Progress } from "@/lib/data";
import { FILL, LIFT, ON_FILL } from "@/lib/class-color";
import { MicIcon, ClockIcon, PlayIcon, CheckIcon } from "@/components/ui/icons";
import { useDebate } from "@/components/debate/debate-store";

/** State, not percentage. A debate is untouched, mid-round, or done —
 *  "62% complete" would measure artifact production, which is the proxy
 *  this app replaces. */
const STATUS: Record<Progress, { label: string; Icon: typeof ClockIcon }> = {
  "not-started": { label: "Not started", Icon: ClockIcon },
  "in-round": { label: "In round", Icon: PlayIcon },
  done: { label: "Done", Icon: CheckIcon },
};

/**
 * Collapses to nothing when empty — the page must never look emptier
 * because school is going well. One card tall no matter how many are due:
 * a vertical list of five would push the proposition off the fold.
 */
export default function ActionBand() {
  const { openSetup } = useDebate();
  if (assignments.length === 0) return null;

  return (
    <section aria-labelledby="due-heading">
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 id="due-heading" className="font-display text-[20px] font-extrabold tracking-[-0.01em]">
          Class debates
        </h2>
        <span className="rounded-full bg-rose px-2.5 py-0.5 font-display text-[12px] font-extrabold tabular-nums text-ink">
          {assignments.length}
        </span>
      </div>

      {/* Cards scroll in their own track — the page never scrolls sideways,
          and overscroll-contain keeps the swipe off the back gesture.
          pt-1 matches the hover lift (-translate-y-0.5) so it doesn't clip
          against the top edge: overflow-x-auto forces overflow-y to auto too. */}
      <ul className="flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain pt-1 pb-2">
        {assignments.map((a) => {
          const cls = classes.find((c) => c.id === a.classId);
          const color = cls?.color ?? "forest";
          const status = STATUS[a.progress];
          // The pill is for the one badge meant to feel earned — the streak.
          // Status and Voice are metadata, not achievements, so they read as
          // icon + label with no chip behind them. In round gets a cut top
          // corner instead: a state mark on the card itself, not another
          // badge competing with the two it already carries.
          const inRound = a.progress === "in-round";
          return (
            <li
              key={a.id}
              className="w-[80%] shrink-0 snap-start sm:w-[360px]"
            >
              <button
                type="button"
                onClick={() =>
                  openSetup({
                    origin: "assignment",
                    graded: a.voice,
                    source: {
                      kind: "class",
                      label: a.className,
                      detail: a.classId === "ap-world" ? "Unit 5 · Revolutions" : "Class material",
                    },
                    proposition: {
                      id: a.id,
                      text: a.proposition,
                      excerpt:
                        a.classId === "ap-world"
                          ? "The Grande Armée advanced over a supply line that stretched farther with every mile, while Russian forces refused the decisive battle Napoleon needed."
                          : "Use the class material to build a claim and test it against the opposing case.",
                    },
                    belief: "affirmative",
                  })
                }
                className={`relative flex h-full flex-col overflow-hidden p-5 transition-transform duration-150 hover:-translate-y-0.5 ${
                  inRound ? "rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg" : "rounded-lg"
                } ${FILL[color]}`}
              >
                <span aria-hidden className={`absolute inset-0 ${LIFT[color]}`} />

                <div className="relative flex items-center justify-between gap-2">
                  <span className="font-display text-[14px] font-extrabold">{a.className}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${ON_FILL[color]}`}>
                    <status.Icon className="size-3.5" />
                    {status.label}
                  </span>
                </div>

                <p className="relative mt-3 line-clamp-3 text-left text-[14.5px] leading-snug font-semibold">
                  {a.proposition}
                </p>

                {a.classId === "ap-world" && (
                  <span className={`relative mt-3 text-left font-mono text-[10px] font-medium tracking-[0.1em] uppercase ${ON_FILL[color]}`}>
                    Unit 5 · Revolutions
                  </span>
                )}

                <div
                  className={`relative mt-auto flex items-center gap-1.5 pt-5 text-[12.5px] font-bold ${ON_FILL[color]}`}
                >
                  <ClockIcon className="size-4" />
                  {a.due}
                  {a.voice && (
                    <span className="ml-auto inline-flex items-center gap-1.5">
                      <MicIcon className="size-3.5" />
                      Voice
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
