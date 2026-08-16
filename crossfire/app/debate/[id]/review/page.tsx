"use client";

import Link from "next/link";
import { computeFlow, tally } from "@/lib/debate";
import { useDebate } from "@/components/debate/debate-store";
import FlowSheet from "@/components/reasoning/flow-sheet";
import Transcript from "@/components/debate/transcript";
import { ExtendedMark, ConcededMark, DroppedMark, ChangedMark } from "@/components/reasoning/mark-icons";

/**
 * A mirror, not a score. The marks are computed here rather than shown during
 * the round on purpose — §7 puts the playback after, and a verdict in your
 * peripheral vision while you argue teaches you to play the meter instead of
 * the argument.
 */
export default function ReviewPage() {
  const { debate } = useDebate();

  if (!debate) {
    // Rounds live in memory until there's a backend, so a refresh or a link
    // from an earlier session has nothing to render. Say so plainly.
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="max-w-[34ch] text-center">
          <h1 className="font-display text-[22px] font-extrabold">This round isn&rsquo;t loaded.</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Rounds aren&rsquo;t saved between visits yet. Start another one and it&rsquo;ll be here
            when you finish.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-display text-[14px] font-bold text-white"
          >
            Back to Crossfire
          </Link>
        </div>
      </main>
    );
  }

  const { setup, turns, claims } = debate;
  const flow = computeFlow(debate);
  const counts = tally(debate);

  const stats = [
    { label: "claims made", value: counts.claims, Icon: ExtendedMark, tone: "text-forest-ink" },
    { label: "grounded in the reading", value: counts.grounded, Icon: ExtendedMark, tone: "text-forest-ink" },
    { label: "conceded with a reason", value: counts.conceded, Icon: ConcededMark, tone: "text-amber-ink" },
    { label: "questions asked", value: counts.questions, Icon: DroppedMark, tone: "text-muted" },
  ];

  return (
    <main className="mx-auto max-w-[720px] px-4 py-8 nav:px-6 nav:py-12">
      <span className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-accent-ink uppercase">
        Round {debate.id}
      </span>

      <h1 className="mt-4 font-display text-[29px] leading-[1.14] font-bold tracking-[-0.02em] nav:text-[36px]">
        {setup.proposition.text}
      </h1>

      <p className="mt-3 text-[14px] font-semibold text-muted">
        You argued {setup.side} · {setup.twist.name} · {setup.source.label}
      </p>

      {/* The single most interesting thing the setup can produce, so it gets
          stated rather than buried in a stat. */}
      {counts.changedPosition > 0 && (
        <p className="mt-4 flex items-start gap-2.5 rounded-card bg-rose-soft p-4 text-[14.5px] leading-snug font-bold text-rose-ink">
          <ChangedMark className="mt-0.5 size-4 shrink-0" />
          You argued against your own position for a whole round.
        </p>
      )}

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon, tone }) => (
          <li key={label} className="rounded-lg bg-surface p-4 shadow-[0_1px_2px_rgba(20,20,18,0.06)]">
            <span className={`flex items-center gap-2 ${tone}`}>
              <Icon className="size-4" />
              <span className="font-display text-[26px] leading-none font-extrabold tabular-nums text-ink">
                {value}
              </span>
            </span>
            <span className="mt-1.5 block text-[12.5px] leading-snug font-semibold text-muted">
              {label}
            </span>
          </li>
        ))}
      </ul>

      {counts.own > 0 && (
        <p className="mt-3 text-[13px] leading-snug text-muted">
          {counts.own} {counts.own === 1 ? "claim leaned" : "claims leaned"} on evidence from outside
          the reading.
        </p>
      )}

      <section className="on-slate mt-6 rounded-lg bg-slate p-5">
        <h2 className="mb-3 font-mono text-[9px] tracking-[0.14em] text-slate-muted uppercase">
          How this round went
        </h2>
        {flow.length > 0 ? (
          <FlowSheet rows={flow} />
        ) : (
          <p className="text-[13px] text-slate-muted">You didn&rsquo;t make a claim this round.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-[19px] font-extrabold">The round, in full</h2>
        <Transcript turns={turns} claims={claims} />
      </section>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-display text-[14px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5"
      >
        Argue about something else
      </Link>
    </main>
  );
}
