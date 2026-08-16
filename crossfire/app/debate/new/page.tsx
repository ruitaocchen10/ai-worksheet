"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { dealHand, otherSide, type OpponentType, type Side, type Twist, type TwistKey } from "@/lib/debate";
import { useDebate } from "@/components/debate/debate-store";
import { ArrowRightIcon, ChevronLeftIcon } from "@/components/ui/icons";

const SKIN: Record<TwistKey, { fill: string; depth: string }> = {
  steelman: { fill: "bg-forest text-white", depth: "#1d4a40" },
  "devils-advocate": { fill: "bg-rose text-ink", depth: "#b8465e" },
  constraint: { fill: "bg-amber text-ink", depth: "#b87d18" },
};

const OPPONENTS: { key: OpponentType; name: string; description: string; color: string }[] = [
  { key: "professor", name: "The Professor", description: "Analytical. Follows the evidence and tests your logic.", color: "bg-forest-soft text-forest-ink" },
  { key: "challenger", name: "The Challenger", description: "Aggressive. Presses weak claims and demands clear answers.", color: "bg-rose-soft text-rose-ink" },
  { key: "skeptic", name: "The Skeptic", description: "Questions everything, including your assumptions.", color: "bg-amber-soft text-amber-ink" },
  { key: "troll", name: "The Troll", description: "Intentionally provocative. Stay precise; do not take the bait.", color: "bg-sage-soft text-sage-ink" },
  { key: "genius", name: "The Genius", description: "Sounds brilliant. Dissect what they are actually claiming.", color: "bg-[#e1e4f4] text-[#32407a]" },
];

function updateLine(lines: string[], index: number, value: string) {
  return lines.map((line, i) => (i === index ? value : line));
}

function fitToContent(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "0";
  element.style.height = `${element.scrollHeight}px`;
}

export default function NewDebatePage() {
  const router = useRouter();
  const { draft, begin, bank } = useDebate();
  const [stance, setStance] = useState<Side>("affirmative");
  const [opponent, setOpponent] = useState<OpponentType>("professor");
  const [twist, setTwist] = useState<Twist | null>(null);
  const [points, setPoints] = useState([
    "The invasion depended on an impossibly long supply line; the Grande Armée could not reliably feed or reinforce itself in Russia.",
    "Napoleon needed a decisive battle, but Russian forces withdrew and used scorched earth to deny the French supplies and shelter.",
  ]);
  const [rebuttals, setRebuttals] = useState([
    "They may blame winter alone. Respond that cold intensified losses already caused by hunger, disease, exhaustion, and desertion.",
    "They may say the campaign was necessary to enforce the Continental System. Respond that the cost exposed the limits of using military force to sustain empire.",
  ]);
  const [scratch, setScratch] = useState("");
  const hand = useMemo(() => dealHand(), []);

  useEffect(() => {
    if (!draft) router.replace("/");
  }, [draft, router]);

  if (!draft) return null;
  const debateSide = twist?.flipsSide ? otherSide(stance) : stance;
  const ready = Boolean(twist) && points.some((point) => point.trim());

  return (
    <main className="min-h-dvh bg-ground p-3">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between rounded-lg bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(20,20,18,0.06)] nav:px-6">
        <button type="button" onClick={() => router.push("/")} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-1 text-[13px] font-semibold text-muted hover:text-ink">
          <ChevronLeftIcon className="size-4" /> Back to class debates
        </button>
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Debate setup</span>
      </div>

      <div className="mx-auto mt-3 flex max-w-[1440px] flex-col gap-3 nav:min-h-[calc(100dvh-6.75rem)] nav:flex-row">
        <section className="rounded-lg bg-surface px-4 py-6 shadow-[0_1px_2px_rgba(20,20,18,0.06)] nav:flex nav:w-[55%] nav:flex-col nav:px-6">
          <div className="mx-auto w-full max-w-[760px]">
            <span className="rounded-full bg-amber-soft px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-amber-ink uppercase">{draft.source.detail ?? draft.source.label}</span>
            <h1 className="mt-4 max-w-[30ch] font-display text-[27px] leading-[1.15] font-extrabold tracking-[-0.02em] nav:text-[34px]">{draft.proposition.text}</h1>
            <p className="mt-4 rounded-card bg-ground p-4 font-source text-[16px] leading-relaxed text-ink/75 italic">“{draft.proposition.excerpt}”</p>

            <section className="mt-6">
              <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">01 · Your position</span>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {([ ["affirmative", "Agree", "It was a strategic mistake."], ["negative", "Disagree", "It was a calculated risk."] ] as const).map(([side, label, note]) => (
                  <button key={side} type="button" onClick={() => setStance(side)} className={`cursor-pointer rounded-card p-4 text-left ${stance === side ? side === "negative" ? "bg-rose-soft text-rose-ink ring-2 ring-rose" : "bg-accent-soft ring-2 ring-accent" : "bg-ground hover:bg-line-soft"}`}>
                    <span className="block font-display text-[17px] font-bold">{label}</span><span className="mt-1 block text-[12.5px] leading-snug text-muted">{note}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">02 · Opponent</span>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {OPPONENTS.map((choice) => (
                  <button key={choice.key} type="button" onClick={() => setOpponent(choice.key)} aria-pressed={opponent === choice.key} className={`flex cursor-pointer items-start gap-3 rounded-card p-3.5 text-left ${opponent === choice.key ? "bg-ink text-white" : "bg-ground hover:bg-line-soft"}`}>
                    <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full font-display text-[12px] font-extrabold ${opponent === choice.key ? "bg-amber text-ink" : choice.color}`}>{choice.name.slice(4, 5)}</span>
                    <span><span className="block text-[14px] font-bold">{choice.name}</span><span className={`mt-0.5 block text-[12px] leading-snug ${opponent === choice.key ? "text-white/70" : "text-muted"}`}>{choice.description}</span></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">03 · Debate twist</span>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {hand.map((choice) => {
                  const skin = SKIN[choice.key];
                  return <button key={choice.key} type="button" onClick={() => setTwist(choice)} style={{ ["--depth-color" as string]: skin.depth }} className={`depth cursor-pointer rounded-card p-4 text-left ${twist?.key === choice.key ? skin.fill : "bg-ground text-ink hover:bg-line-soft"}`}><span className="block font-display text-[16px] font-extrabold">{choice.name}</span><span className="mt-1 block text-[12px] leading-snug opacity-75">{choice.rule}</span></button>;
                })}
              </div>
              {twist?.flipsSide && <p className="mt-3 rounded-card bg-rose p-3 text-[13px] font-bold text-ink">You selected {stance === "affirmative" ? "Agree" : "Disagree"}; this twist makes you argue the {debateSide} side.</p>}
            </section>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-[760px] flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-[12.5px] font-semibold text-muted">Your pre-round notes stay open during Constructive.</p>
            <button type="button" disabled={!ready} onClick={() => twist && begin(twist, stance, opponent, { mainPoints: points.filter((p) => p.trim()), rebuttals: rebuttals.filter((r) => r.trim()) })} className={`inline-flex min-h-12 items-center gap-2 rounded-full px-7 font-display text-[14px] font-bold text-white ${ready ? "cursor-pointer bg-ink hover:-translate-y-0.5" : "cursor-not-allowed bg-ink/25"}`}>Start debate <ArrowRightIcon className="size-4" /></button>
          </div>
        </section>

        <aside aria-label="Debate notebook" className="rounded-lg bg-surface px-4 py-6 shadow-[0_1px_2px_rgba(20,20,18,0.06)] nav:w-[45%] nav:overflow-y-auto nav:px-6">
          <div className="flex items-baseline justify-between gap-3"><h2 className="font-display text-[18px] font-extrabold">Debate notebook</h2><span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Private</span></div>
          <section className="mt-4 rounded-card bg-amber-soft p-4"><span className="font-mono text-[10px] tracking-[0.12em] text-amber-ink uppercase">Pre-round prep</span><h3 className="mt-1 font-display text-[17px] font-extrabold">Prepare your opening</h3><p className="mt-2 text-[12.5px] leading-snug text-ink/70">Plan the claims and responses you want available when Constructive starts.</p></section>
          <section className="mt-5 rounded-card bg-ground p-4"><h3 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Main points</h3><div className="mt-3 space-y-2">{points.map((point, i) => <textarea key={i} ref={fitToContent} value={point} onChange={(event) => { fitToContent(event.currentTarget); setPoints(updateLine(points, i, event.target.value)); }} rows={1} placeholder={`Point ${i + 1} — claim + evidence`} className="w-full resize-none overflow-hidden rounded-inner bg-surface p-3 text-[16px] leading-relaxed placeholder:text-muted" />)}</div><button type="button" onClick={() => setPoints([...points, ""])} className="mt-2 min-h-10 cursor-pointer text-[13px] font-bold text-accent-ink">+ Add a point</button></section>
          <section className="mt-4 rounded-card bg-ground p-4"><h3 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Planned rebuttals</h3><div className="mt-3 space-y-2">{rebuttals.map((rebuttal, i) => <textarea key={i} ref={fitToContent} value={rebuttal} onChange={(event) => { fitToContent(event.currentTarget); setRebuttals(updateLine(rebuttals, i, event.target.value)); }} rows={1} placeholder="They may argue… My response…" className="w-full resize-none overflow-hidden rounded-inner bg-surface p-3 text-[16px] leading-relaxed placeholder:text-muted" />)}</div><button type="button" onClick={() => setRebuttals([...rebuttals, ""])} className="mt-2 min-h-10 cursor-pointer text-[13px] font-bold text-accent-ink">+ Add a rebuttal</button></section>
          <section className="mt-5 border-t border-line pt-5"><h3 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Pinned evidence</h3><ul className="mt-2 space-y-2">{bank.slice(0, 2).map((excerpt) => <li key={excerpt.id} className="rounded-inner bg-ground p-3"><p className="font-source text-[13px] leading-snug text-ink/80 italic">“{excerpt.text}”</p><span className="mt-1 block text-[10.5px] font-semibold text-muted">{excerpt.cite}</span></li>)}</ul></section>
          <label className="mt-5 block border-t border-line pt-5"><span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">Scratch notes</span><textarea value={scratch} onChange={(event) => setScratch(event.target.value)} rows={4} placeholder="Private notes — capture a thought before it disappears…" className="mt-2 w-full resize-y rounded-inner bg-ground p-3 text-[13px] leading-snug placeholder:text-muted" /></label>
        </aside>
      </div>
    </main>
  );
}
