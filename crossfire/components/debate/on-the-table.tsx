"use client";

import { useState } from "react";
import type { Claim, Preparation } from "@/lib/debate";
import type { Excerpt, Phase } from "@/lib/data";

/**
 * Working memory, not a scoreboard. No marks and no verdict during the round:
 * §7 puts the mirror after, and a rail that grades you mid-argument puts a
 * score in your peripheral vision. What it does carry is the concede action —
 * having the action is not the same as showing the judgment, and §3 wants
 * updating to be a move a student chooses rather than a behaviour detected
 * about them afterwards.
 */
export default function OnTheTable({
  claims,
  onConcede,
  preparation,
  phase,
  evidence,
  className = "",
}: {
  claims: Claim[];
  onConcede: (claimId: string, reason: string) => void;
  preparation: Preparation;
  phase: Phase;
  evidence: Excerpt[];
  className?: string;
}) {
  const [conceding, setConceding] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [closedPrepFor, setClosedPrepFor] = useState<Phase | null>(null);
  const [phasePlan, setPhasePlan] = useState("");
  const [scratch, setScratch] = useState("");

  const mine = claims.filter((c) => c.by === "you");
  const theirs = claims.filter((c) => c.by === "opponent");
  const phaseCopy: Record<Phase, { title: string; prompt: string }> = {
    constructive: { title: "Prepare your opening", prompt: "Outline the order of your claims and the evidence each one needs." },
    "cross-ex": { title: "Prepare your questions", prompt: "Write questions that test an assumption, evidence, or conclusion." },
    rebuttal: { title: "Prepare your response", prompt: "Choose the opponent claim you need to answer and explain why." },
    closing: { title: "Prepare your closing", prompt: "Name what survived and the final reason your side carries the burden." },
  };
  const current = phaseCopy[phase];
  const prepOpen = closedPrepFor !== phase;

  function commit(id: string) {
    const text = reason.trim();
    if (!text) return;
    onConcede(id, text);
    setConceding(null);
    setReason("");
  }

  return (
    <aside aria-label="Debate notebook" className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[18px] font-extrabold">Debate notebook</h2>
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Private</span>
      </div>

      <section className="mt-4 rounded-card bg-amber-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] tracking-[0.12em] text-amber-ink uppercase">{phase} prep</span>
            <h3 className="mt-1 font-display text-[16px] font-extrabold">{current.title}</h3>
          </div>
          <button type="button" onClick={() => setClosedPrepFor(prepOpen ? phase : null)} className="min-h-9 cursor-pointer rounded-full bg-surface px-3 text-[12px] font-bold text-amber-ink">
            {prepOpen ? "Start phase" : "Edit prep"}
          </button>
        </div>
        {prepOpen && <><p className="mt-2 text-[12.5px] leading-snug text-ink/70">{current.prompt}</p><textarea value={phasePlan} onChange={(event) => setPhasePlan(event.target.value)} rows={3} placeholder="Write a quick plan…" className="mt-3 w-full resize-none rounded-inner bg-surface p-3 text-[13px] leading-snug placeholder:text-muted" /><button type="button" onClick={() => setClosedPrepFor(phase)} className="mt-2 min-h-9 cursor-pointer text-[12px] font-bold text-amber-ink">Skip prep</button></>}
      </section>

      <section className="mt-5 rounded-card bg-ground p-4">
        <h2 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">My case</h2>
        <PrepGroup title="Main points" items={preparation.mainPoints} />
        <PrepGroup title="Planned rebuttals" items={preparation.rebuttals} />
      </section>

      <Group title="Claims I have made" empty="Nothing yet — your first claim starts the record.">
        {mine.map((c) => (
          <li key={c.id} className="rounded-card bg-ground p-3.5">
            <p className={`text-[13.5px] leading-snug font-semibold ${c.conceded ? "text-muted line-through" : ""}`}>
              {c.text}
            </p>

            {c.conceded ? (
              <p className="mt-1.5 text-[12px] leading-snug text-muted">
                Conceded — {c.conceded.reason}
              </p>
            ) : conceding === c.id ? (
              <div className="mt-2.5">
                <label className="block">
                  <span className="sr-only">Why are you giving this up?</span>
                  <textarea
                    autoFocus
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Because…"
                    className="w-full resize-none rounded-inner bg-ground p-2.5 text-[13px] leading-snug placeholder:text-muted"
                  />
                </label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => commit(c.id)}
                    disabled={!reason.trim()}
                    className={`min-h-9 rounded-full px-3.5 text-[12.5px] font-bold ${
                      reason.trim() ? "cursor-pointer bg-ink text-white" : "cursor-not-allowed bg-ink/20 text-white"
                    }`}
                  >
                    Concede
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConceding(null);
                      setReason("");
                    }}
                    className="min-h-9 cursor-pointer px-1 text-[12.5px] font-semibold text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConceding(c.id)}
                className="mt-1.5 min-h-8 cursor-pointer text-[12.5px] font-bold text-accent-ink hover:underline"
              >
                Concede this
              </button>
            )}
          </li>
        ))}
      </Group>

      <Group title="Opponent's claims" empty="They haven't argued yet.">
        {theirs.map((c) => (
          <li key={c.id} className="rounded-card bg-ground p-3.5 text-[13.5px] leading-snug font-semibold">
            {c.text}
          </li>
        ))}
      </Group>

      <section className="mt-5 border-t border-line pt-5">
        <h2 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Pinned evidence</h2>
        <ul className="mt-2 space-y-2">
          {evidence.slice(0, 2).map((excerpt) => <li key={excerpt.id} className="rounded-inner bg-ground p-3"><p className="font-source text-[13px] leading-snug text-ink/80 italic">“{excerpt.text}”</p><span className="mt-1 block text-[10.5px] font-semibold text-muted">{excerpt.cite}</span></li>)}
        </ul>
      </section>

      <label className="mt-5 block border-t border-line pt-5"><span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Scratch notes</span><textarea value={scratch} onChange={(event) => setScratch(event.target.value)} rows={4} placeholder="Private notes — capture a thought before it disappears…" className="mt-2 w-full resize-y rounded-inner bg-ground p-3 text-[13px] leading-snug placeholder:text-muted" /></label>
    </aside>
  );
}

function PrepGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <h3 className="text-[11px] font-bold tracking-[0.04em] text-amber-ink uppercase">{title}</h3>
      <ul className="mt-1.5 space-y-1.5 text-[12px] leading-snug text-ink/75">
        {items.map((item, index) => <li key={index}>• {item}</li>)}
      </ul>
    </div>
  );
}

function Group({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-[11.5px] font-bold tracking-[0.04em] text-muted uppercase">{title}</h3>
      {children.length === 0 ? (
        <p className="text-[12.5px] leading-snug text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </section>
  );
}
