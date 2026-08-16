"use client";

import { useState } from "react";
import type { Preparation } from "@/lib/debate";
import type { Excerpt, Phase } from "@/lib/data";

function fitToContent(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "0";
  element.style.height = `${element.scrollHeight}px`;
}

/**
 * Working memory, not a scoreboard. No marks and no verdict during the round:
 * §7 puts the mirror after, and a rail that grades you mid-argument puts a
 * score in your peripheral vision. What it does carry is the concede action —
 * having the action is not the same as showing the judgment, and §3 wants
 * updating to be a move a student chooses rather than a behaviour detected
 * about them afterwards.
 */
export default function OnTheTable({
  preparation,
  phase,
  evidence,
  className = "",
}: {
  preparation: Preparation;
  phase: Phase;
  evidence: Excerpt[];
  className?: string;
}) {
  const [closedPrepFor, setClosedPrepFor] = useState<Phase | null>(null);
  const [phasePlan, setPhasePlan] = useState("");
  const [scratch, setScratch] = useState("");

  const phaseCopy: Record<Phase, { title: string; prompt: string }> = {
    constructive: { title: "Prepare your opening", prompt: "Outline your opening claim and any evidence you may want to use." },
    "cross-ex": { title: "Prepare your questions", prompt: "Write questions that test an assumption, evidence, or conclusion." },
    rebuttal: { title: "Prepare your response", prompt: "Choose the opponent claim you need to answer and explain why." },
    closing: { title: "Prepare your closing", prompt: "Name what survived and the final reason your side carries the burden." },
  };
  const current = phaseCopy[phase];
  const prepOpen = closedPrepFor !== phase;

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
        {prepOpen && <><p className="mt-2 text-[12.5px] leading-snug text-ink/70">{current.prompt}</p><textarea ref={fitToContent} value={phasePlan} onChange={(event) => { fitToContent(event.currentTarget); setPhasePlan(event.target.value); }} rows={1} placeholder="Write a quick plan…" className="mt-3 w-full resize-none overflow-hidden rounded-inner bg-surface p-3 text-[16px] leading-relaxed placeholder:text-muted" /><button type="button" onClick={() => setClosedPrepFor(phase)} className="mt-2 min-h-9 cursor-pointer text-[12px] font-bold text-amber-ink">Skip prep</button></>}
      </section>

      <PrepGroup title="Main points" items={preparation.mainPoints} />
      <PrepGroup title="Planned rebuttals" items={preparation.rebuttals} />

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
    <section className="mt-5 rounded-card bg-ground p-4">
      <h3 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => <li key={index} className="rounded-inner bg-surface p-3 text-[16px] leading-relaxed text-ink/80">{item}</li>)}
      </ul>
    </section>
  );
}
