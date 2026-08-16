import Link from "next/link";
import { profile, lastRound } from "@/lib/data";
import FlowSheet from "./flow-sheet";
import LedgerStrip from "./ledger-strip";
import StatTiles from "./stat-tiles";
import { ArrowRightIcon } from "./icons";

/**
 * The reasoning profile — a mirror, not a score. No leaderboard and no
 * completion percentage on purpose: rewarding winning teaches motivated
 * reasoning, and percent-complete measures artifact production. Both are
 * what this product exists to work against.
 */
export default function Rail({ className = "" }: { className?: string }) {
  return (
    <aside aria-label="Your reasoning" className={`px-4 pt-2 pb-6 nav:px-5 rail:pt-7 ${className}`}>
      <div className="flex max-w-[660px] flex-col gap-3 rail:max-w-none">
        {/* Streak — the number worth being proud of is days you kept
            reasoning, not days you logged in. */}
        <div className="relative overflow-hidden rounded-lg bg-rose p-5 text-ink">
          <span
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,0.3),transparent_60%)]"
          />
          <span className="relative block font-display text-[46px] leading-none font-extrabold tabular-nums">
            {profile.streakDays}
          </span>
          <span className="relative mt-1.5 block max-w-[22ch] text-[13px] leading-snug font-bold">
            days running with at least one reasoning move
          </span>
        </div>

        <StatTiles />

        {/* The instrument. */}
        <section className="on-slate rounded-lg bg-slate p-5">
          <h2 className="mb-3 font-mono text-[9px] tracking-[0.14em] text-slate-muted uppercase">
            How you argue · last 5 rounds
          </h2>
          <FlowSheet rows={profile.flow} />
        </section>

        <section className="rounded-lg bg-surface p-5 shadow-[0_1px_2px_rgba(20,20,18,0.06)]">
          <h2 className="mb-3 font-display text-[15px] font-extrabold">Rounds · last 14 days</h2>
          <LedgerStrip days={profile.ledger} />
        </section>

        <section className="rounded-lg bg-surface p-5 shadow-[0_1px_2px_rgba(20,20,18,0.06)]">
          <h2 className="mb-2 font-display text-[15px] font-extrabold">Last round</h2>
          <p className="mb-3 text-[13px] leading-snug text-muted">{lastRound.proposition}</p>
          <Link
            href={`/debate/${lastRound.id}/review`}
            className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] font-bold text-accent-ink"
          >
            Read the flow
            <ArrowRightIcon className="size-4" />
          </Link>
        </section>
      </div>
    </aside>
  );
}
