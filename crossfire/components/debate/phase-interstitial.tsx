"use client";

import { PHASES, type Phase } from "@/lib/data";
import { PHASE_RULE, PHASE_TURNS } from "@/lib/debate";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Focus lands on the dialog itself rather than on Continue: the keystroke
 * that submitted the last turn (⌘↩) would otherwise arrive at a freshly
 * autofocused button and dismiss the interstitial before it was ever read.
 *
 * Transitions are where you re-teach the rule for free — the student is
 * already looking, and the constraint they're about to be held to has just
 * changed. Cross-examination gets the loudest version because it's the phase
 * that breaks people's habits.
 */
export default function PhaseInterstitial({
  phase,
  onDismiss,
}: {
  phase: Phase;
  onDismiss: () => void;
}) {
  const meta = PHASES.find((p) => p.key === phase)!;
  const crossEx = phase === "cross-ex";
  const completedPhase = phase === "cross-ex" ? "Constructive" : phase === "rebuttal" ? "Cross-examination" : phase === "closing" ? "Rebuttal" : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phase-heading"
      tabIndex={-1}
      ref={(node) => node?.focus()}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm outline-none"
    >
      <div className="w-full max-w-[440px] rounded-lg bg-surface p-7 text-center">
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          {completedPhase ? `${completedPhase} complete` : "Next phase"}
        </span>
        <h2 id="phase-heading" className="mt-3 font-display text-[34px] leading-none font-extrabold tracking-[-0.02em]">
          {meta.label}
        </h2>

        <p
          className={`mt-5 rounded-card p-4 text-[15px] leading-snug font-bold ${
            crossEx ? "bg-rose text-ink" : "bg-ground text-ink"
          }`}
        >
          {PHASE_RULE[phase]}
        </p>

        <p className="mt-4 text-[13px] font-semibold text-muted">
          {PHASE_TURNS[phase]} {PHASE_TURNS[phase] === 1 ? "turn" : "turns"}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-7 font-display text-[14.5px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5"
        >
          Continue
          <ArrowRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
