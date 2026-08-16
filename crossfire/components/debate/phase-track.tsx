import { PHASES, type Phase } from "@/lib/data";

/**
 * Linear and always visible. A debate you can wander through is a chat, so
 * the track never offers navigation — it reports where you are.
 */
export default function PhaseTrack({ phase, done }: { phase: Phase; done: boolean }) {
  const current = PHASES.findIndex((p) => p.key === phase);

  return (
    <ol className="flex items-center gap-1.5" aria-label="Round phases">
      {PHASES.map((p, i) => {
        const state = done || i < current ? "done" : i === current ? "current" : "ahead";
        return (
          <li key={p.key} className="flex items-center gap-1.5">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={`inline-flex min-h-8 items-center rounded-full px-3 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors ${
                state === "current"
                  ? "bg-ink text-white"
                  : state === "done"
                    ? "bg-accent-soft text-accent-ink"
                    : "bg-ground text-muted"
              }`}
            >
              <abbr title={p.label} className="no-underline">
                {p.short}
              </abbr>
              <span className="sr-only">
                {" "}
                — {state === "current" ? "current phase" : state === "done" ? "complete" : "not started"}
              </span>
            </span>
            {i < PHASES.length - 1 && (
              <span aria-hidden className={`h-px w-3 ${state === "done" ? "bg-accent" : "bg-line"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
