import Link from "next/link";
import { assignments, classes, type Progress } from "@/lib/data";
import { FILL, LIFT, ON_FILL } from "@/lib/class-color";
import { MicIcon, ClockIcon, PlayIcon, CheckIcon } from "@/components/ui/icons";

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
  if (assignments.length === 0) return null;

  return (
    <section aria-labelledby="due-heading">
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 id="due-heading" className="font-display text-[20px] font-extrabold tracking-[-0.01em]">
          Due this week
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
          return (
            <li
              key={a.id}
              className="w-[80%] shrink-0 snap-start sm:w-auto sm:min-w-[248px] sm:flex-1"
            >
              <Link
                href={`/assignments/${a.id}`}
                className={`relative flex h-full flex-col overflow-hidden rounded-lg p-5 transition-transform duration-150 hover:-translate-y-0.5 ${FILL[color]}`}
              >
                <span aria-hidden className={`absolute inset-0 ${LIFT[color]}`} />

                <div className="relative flex items-center justify-between gap-2">
                  <span className="font-display text-[14px] font-extrabold">{a.className}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-bold">
                    <status.Icon className="size-3.5" />
                    {status.label}
                  </span>
                </div>

                <p className="relative mt-3 line-clamp-3 text-[14.5px] leading-snug font-semibold">
                  {a.proposition}
                </p>

                <div
                  className={`relative mt-5 flex items-center gap-1.5 text-[12.5px] font-bold ${ON_FILL[color]}`}
                >
                  <ClockIcon className="size-4" />
                  {a.due}
                  {a.voice && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-bold">
                      <MicIcon className="size-3.5" />
                      Voice
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
