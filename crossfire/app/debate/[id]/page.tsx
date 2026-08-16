"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PHASES } from "@/lib/data";
import { PHASE_RULE, turnsInPhase, type DebateSetup } from "@/lib/debate";
import { useDebate } from "@/components/debate/debate-store";
import PhaseTrack from "@/components/debate/phase-track";
import PhaseInterstitial from "@/components/debate/phase-interstitial";
import TurnClock from "@/components/debate/turn-clock";
import Transcript from "@/components/debate/transcript";
import OnTheTable from "@/components/debate/on-the-table";
import Composer from "@/components/debate/composer";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * No sidebar and no tab bar. A round is a bounded thing you are inside, not a
 * page you browse from — and a nav rail during a timed argument is an
 * invitation to leave in the middle of one.
 */
export default function RoundPage() {
  const router = useRouter();
  const { debate, bank, thinking, crossed, submit, clearCrossed, beginCrossExamination, leave } = useDebate();
  const [leaving, setLeaving] = useState(false);
  const [composing, setComposing] = useState(true);
  const foot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debate) router.replace("/");
  }, [debate, router]);

  useEffect(() => {
    foot.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [debate?.turns.length, debate?.claims.length]);

  if (!debate) return null;

  const { setup, phase, turns, claims, spent, done } = debate;
  const total = turnsInPhase(phase, setup);
  const phaseLabel = PHASES.find((p) => p.key === phase)!.label;
  const openingsComplete =
    phase === "constructive" &&
    spent >= total &&
    turns.some((turn) => turn.by === "opponent" && turn.phase === "constructive");
  return (
    <div className="flex h-dvh flex-col bg-ground">
      <header className="shrink-0 px-3 pt-3">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(20,20,18,0.06)] nav:px-6">
          <PhaseTrack phase={phase} done={done} />
          <div className="ml-auto flex items-center gap-2">
            {!done && <TurnClock paused={thinking || openingsComplete} key={turns.length} />}
            <button
              type="button"
              onClick={() => setLeaving(true)}
              className="min-h-9 cursor-pointer rounded-full px-3 text-[12.5px] font-semibold text-muted hover:text-ink"
            >
              Leave round
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3 nav:flex-row nav:overflow-hidden">
        <main className="min-w-0 flex-1 rounded-lg bg-surface px-4 py-6 shadow-[0_1px_2px_rgba(20,20,18,0.06)] nav:w-[55%] nav:px-6 nav:overflow-y-auto">
          <div className="mx-auto max-w-[760px]">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase ${
                  setup.side === "affirmative"
                    ? "bg-forest-soft text-forest-ink"
                    : "bg-rose-soft text-rose-ink"
                }`}
              >
                {setup.side}
              </span>
              <span className="rounded-full bg-ground px-3 py-1.5 text-[12px] font-semibold text-muted">
                {setup.twist.name}
              </span>
              <span className="rounded-full bg-ground px-3 py-1.5 text-[12px] font-semibold text-muted">
                {setup.source.label}
              </span>
              <span className="rounded-full bg-amber-soft px-3 py-1.5 text-[12px] font-semibold text-amber-ink">
                The {setup.opponent[0].toUpperCase() + setup.opponent.slice(1)}
              </span>
            </div>

            <h1 className="mt-3 font-display text-[23px] leading-[1.18] font-bold tracking-[-0.015em] nav:text-[28px]">
              {setup.proposition.text}
            </h1>

            {/* The rule that governs the phase you are in, restated where you
                are working rather than only on the interstitial you dismissed. */}
            <p className="mt-4 rounded-card bg-ground p-3.5 text-[13.5px] leading-snug font-semibold">
              <span className="text-muted">{phaseLabel} · </span>
              {PHASE_RULE[phase]}
              {!done && !openingsComplete && (
                <span className="text-muted">
                  {" "}
                  · turn {Math.min(spent + 1, total)} of {total}
                </span>
              )}
            </p>

            {turns.length > 0 && (
              <div className="mt-6">
                <Transcript turns={turns} claims={claims} />
              </div>
            )}

            {thinking && (
              <p aria-live="polite" className="mt-4 text-[13.5px] font-semibold text-muted">
                They&rsquo;re thinking…
              </p>
            )}

            {openingsComplete && (
              <section className="mt-6 rounded-card bg-amber-soft p-4" aria-label="Opening exchange complete">
                <span className="font-mono text-[10px] tracking-[0.12em] text-amber-ink uppercase">Opening exchange complete</span>
                <p className="mt-1.5 text-[13.5px] leading-snug text-ink/75">
                  Review both opening arguments before you start questioning the opposing case.
                </p>
                <button
                  type="button"
                  onClick={beginCrossExamination}
                  className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-ink px-5 font-display text-[13.5px] font-bold text-white hover:-translate-y-0.5"
                >
                  Begin cross-examination <ArrowRightIcon className="size-4" />
                </button>
              </section>
            )}

            {!done && !composing && !openingsComplete && (
                <button type="button" onClick={() => setComposing(true)} className="mt-6 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-6 font-display text-[14px] font-bold text-white hover:-translate-y-0.5">
                  Write your response <ArrowRightIcon className="size-4" />
                </button>
            )}

            {done && (
              <div className="mt-6 rounded-lg bg-surface p-6 text-center shadow-[0_2px_10px_rgba(20,20,18,0.05)]">
                <h2 className="font-display text-[22px] font-extrabold">Round complete.</h2>
                <p className="mx-auto mt-2 max-w-[36ch] text-[14px] leading-relaxed text-muted">
                  Your closing is in the record. Review how each argument held up across the round.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/debate/${debate.id}/review`)}
                  className="mt-5 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-7 font-display text-[14.5px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5"
                >
                  See what happened
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
            )}

            <div ref={foot} />
          </div>

          {!done && !openingsComplete && (
            <section className={composing ? "mt-6" : "hidden"} aria-label="Response workspace">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Response workspace</span>
                  <h2 className="mt-1 font-display text-[22px] font-extrabold">{phase === "constructive" ? "Make your opening claim" : phase === "cross-ex" ? "Ask a question" : phase === "rebuttal" ? spent === 0 ? "Answer their strongest argument" : "Address their strongest reply" : "Make your closing argument"}</h2>
                </div>
                <button type="button" onClick={() => setComposing(false)} className="min-h-10 cursor-pointer rounded-full bg-ground px-4 text-[12.5px] font-bold text-muted hover:text-ink">Back to debate</button>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-muted">{phase === "constructive" ? "State your position. You can attach evidence if it helps, but it is optional." : phase === "cross-ex" ? "Ask any question about the debate. You have three questions; do not introduce a new argument." : phase === "rebuttal" ? "Choose the opponent claim you are answering, then explain why it does not hold. Evidence is not required in this phase." : "Weigh the arguments that survived. Do not introduce new claims or evidence."}</p>
              <div className="mt-5 rounded-lg bg-ground p-1">
              {/* Keyed by turn: the composer is a fresh instrument each turn, so
                  the clock, the gate message and the draft all reset without an
                  effect chain to keep in sync. */}
              <Composer
                key={turns.length}
                phase={phase}
                setup={setup}
                turns={turns}
                claims={claims}
                bank={bank}
                thinking={thinking}
                onSubmit={(args) => {
                  void submit(args);
                  if (phase === "constructive") setComposing(false);
                }}
              />
              </div>
            </section>
          )}
        </main>

        <OnTheTable
          preparation={setup.preparation}
          phase={phase}
          evidence={bank}
          className="rounded-lg bg-surface px-4 py-6 shadow-[0_1px_2px_rgba(20,20,18,0.06)] nav:w-[45%] nav:shrink-0 nav:overflow-y-auto nav:px-6"
        />
      </div>

      {crossed && <PhaseInterstitial phase={crossed} onDismiss={clearCrossed} />}

      {leaving && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-heading"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4"
        >
          <div className="w-full max-w-[380px] rounded-lg bg-surface p-6">
            <h2 id="leave-heading" className="font-display text-[20px] font-extrabold">
              Leave this round?
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              It won&rsquo;t be saved. Nothing happens to your streak.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={leave}
                className="min-h-11 cursor-pointer rounded-full bg-ink px-5 font-display text-[13.5px] font-bold text-white"
              >
                Leave
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setLeaving(false)}
                className="min-h-11 cursor-pointer rounded-full px-4 text-[13.5px] font-bold text-muted hover:text-ink"
              >
                Keep arguing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* The remaining phase samples are retained as reference content while their
   live equivalents are redesigned screen by screen. */
/* eslint-disable @typescript-eslint/no-unused-vars */
function OpeningPreview({ setup, onNext }: { setup: DebateSetup; onNext: () => void }) {
  const youAgree = setup.side === "affirmative";
  const yourOpening = youAgree
    ? "The invasion of Russia was a strategic mistake from the start, not simply a campaign ruined by winter. Napoleon marched the Grande Armée farther from its supply base with every mile, into a country whose roads and distances made resupply unreliable. His plan depended on forcing a decisive battle quickly, but the Russian army refused to give him the kind of victory that had worked elsewhere in Europe.\n\nRussia’s scorched-earth strategy made that weakness fatal. Villages and supplies disappeared ahead of the French advance, leaving soldiers hungry and exhausted before they reached Moscow. Winter made the retreat worse, but it did not create the core problem: Napoleon had committed an enormous army to a campaign he could not supply, end, or safely retreat from.\n\nFinally, the losses mattered beyond Russia. Napoleon’s empire relied on experienced troops and the image of repeated military success. By sacrificing so much of the Grande Armée, he weakened his ability to control Europe and encouraged his enemies to unite against him."
    : "The invasion of Russia was a dangerous decision, but not a strategic mistake from the start. Russia had withdrawn from the Continental System, undermining Napoleon’s effort to isolate Britain economically. If a major power could ignore the blockade without consequence, Napoleon’s broader European strategy would lose credibility. Military action was a calculated attempt to restore that system.\n\nNapoleon also had reason to expect a decisive campaign. He had defeated larger coalitions before, and Russian armies had previously been forced into unfavorable terms after major French victories. The Russian refusal to fight decisively and its scorched-earth retreat changed the conditions Napoleon expected; those choices were effective precisely because they were not the normal response to his campaigns.\n\nThe retreat was catastrophic, but a bad outcome does not prove that every initial calculation was irrational. Napoleon faced a real strategic problem in Russia’s defiance, and he chose the tool that had repeatedly secured his position in Europe: rapid military force.";
  const theirOpening = youAgree
    ? "Calling the invasion a mistake from the start uses hindsight. Russia’s refusal to honor the Continental System threatened Napoleon’s entire European strategy. If Russia could trade freely with Britain, the blockade became optional for every other state as well. Napoleon had a genuine political and economic reason to act.\n\nHe also had reason to believe a swift campaign was possible. France had repeatedly defeated European armies through speed and decisive battle, and Russia had made peace after French victories before. The Russian army’s withdrawal and scorched-earth strategy were effective precisely because they denied Napoleon the kind of campaign he expected—not because an invasion was automatically doomed.\n\nThe disaster of the retreat should not erase the problem Napoleon faced. A strategic choice can be high-risk and still be rational when the alternative is allowing a rival power to undermine the system that holds an empire together."
    : "A campaign can be understandable without being strategically sound. Napoleon faced a real problem when Russia weakened its commitment to the Continental System, but invading Russia was not the only response. He chose to solve an economic and diplomatic conflict through a massive land campaign across distances his army could not manage.\n\nThe campaign’s main vulnerabilities existed before the first French soldier crossed the border: poor roads, long supply routes, an enormous territory, and an opponent able to retreat rather than risk its army in one battle. Napoleon’s past victories depended on speed and decisive engagements, but Russia did not have to cooperate with that model.\n\nWinter intensified the defeat, but the deeper failure was strategic. Hunger, disease, exhaustion, desertion, and the loss of experienced troops had already damaged the Grande Armée. The campaign revealed that Napoleon’s methods could not simply be expanded across an entire continent.";

  return (
    <section className="mt-4 border-t border-line pt-5">
      <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Constructive · sample transcript</span>
      <div className="mt-4 space-y-6">
        <article>
          <span className="font-mono text-[10px] tracking-[0.1em] text-accent-ink uppercase">You · {setup.side}</span>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed">{yourOpening}</p>
        </article>
        <article>
          <span className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase">The {setup.opponent[0].toUpperCase() + setup.opponent.slice(1)} · opposing case</span>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed">{theirOpening}</p>
        </article>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] leading-snug text-muted">Sample openings only. Make your own first move below; evidence is optional.</p>
        <button type="button" onClick={onNext} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-bold text-white hover:-translate-y-0.5">
          Preview cross-examination <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </section>
  );
}

function CrossExaminationPreview({ setup, onNext }: { setup: DebateSetup; onNext: () => void }) {
  const opponentName = `The ${setup.opponent[0].toUpperCase() + setup.opponent.slice(1)}`;
  const studentSupportsMotion = setup.side === "affirmative";
  const exchange = studentSupportsMotion
    ? [
        ["You asked", "If Napoleon expected a quick, decisive battle, what made Russia likely to offer one after it had already begun retreating and burning supplies?"],
        [opponentName, "Napoleon had defeated Russian forces before, and refusing battle meant surrendering territory and political legitimacy. He could reasonably expect pressure on Moscow to force negotiations."],
        ["You asked", "But does reaching Moscow solve a supply problem when the army is farther from food and reinforcements than at the start of the campaign?"],
        [opponentName, "It does not solve it automatically. The strategic calculation was that taking Moscow would change Russia’s political choices before the supply problem became decisive."],
        [opponentName, "Your turn: if winter was not the main cause, why did losses accelerate so dramatically during the retreat?"],
        ["You answered", "Winter made existing problems worse. The army was already weakened by hunger, disease, exhaustion, and desertion because the campaign had failed to secure supplies or force a conclusion."]
      ]
    : [
        ["You asked", "If Russia could ignore the Continental System without consequence, how could Napoleon preserve the credibility of his wider European strategy?"],
        [opponentName, "He needed a response, but an invasion was not the only one. A strategy can address a real threat and still choose a tool whose costs are greater than its likely gains."],
        ["You asked", "What evidence shows Napoleon could know, before the campaign, that Russia would trade territory for time rather than fight for Moscow?"],
        [opponentName, "Russia’s scale, distance, and lack of a need to meet France in one decisive battle were already facts. Napoleon’s plan depended on an opponent accepting the kind of campaign he wanted."],
        [opponentName, "Your turn: if the invasion was a calculated risk, what was Napoleon’s workable plan if the Russian army simply kept retreating?"],
        ["You answered", "The plan was to create enough pressure on the Russian state that it would negotiate. The failure came from Russia’s choice to absorb territorial losses rather than make that calculation easy for France."]
      ];

  return (
    <section className="mt-4 border-t border-line pt-5">
      <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Cross-examination · sample transcript</span>
      <div className="mt-4 space-y-4">
        {exchange.map(([speaker, text], index) => {
          const yours = speaker.startsWith("You");
          return (
            <article key={index} className={yours ? "ml-auto max-w-[88%]" : "mr-auto max-w-[88%]"}>
              <span className={`font-mono text-[10px] tracking-[0.1em] uppercase ${yours ? "text-accent-ink" : "text-muted"}`}>{speaker}</span>
              <p className={`mt-1.5 rounded-card p-4 text-[13.5px] leading-relaxed ${yours ? "bg-accent-soft" : "bg-surface shadow-[0_1px_2px_rgba(20,20,18,0.06)]"}`}>{text}</p>
            </article>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] leading-snug text-muted">In cross-examination, questions should expose an assumption, test evidence, or clarify an opponent’s claim — not introduce a new argument.</p>
        <button type="button" onClick={onNext} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-bold text-white hover:-translate-y-0.5">
          Preview rebuttal <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </section>
  );
}

function RebuttalPreview({ setup, onNext }: { setup: DebateSetup; onNext: () => void }) {
  const opponentName = `The ${setup.opponent[0].toUpperCase() + setup.opponent.slice(1)}`;
  const studentSupportsMotion = setup.side === "affirmative";
  const exchange = studentSupportsMotion
    ? [
        ["You · rebuttal", "My opponent is right that Russia’s withdrawal from the Continental System created a serious problem. But having a reason to act is not the same as having a workable military strategy. Napoleon chose a campaign that depended on a quick battle and a cooperative supply system, even though Russia could deny both by retreating.\n\nThe key issue is not whether Moscow had symbolic value; it is whether taking Moscow could make the army sustainable. It could not. By the time the French arrived, the army had already crossed hundreds of miles of territory stripped of food and shelter. The plan had no credible answer if Russia refused negotiations."],
        [opponentName, "That assumes Napoleon could know Russia would not negotiate after Moscow fell. Russia had made peace after major French victories before, and the possibility of a swift settlement made the campaign a calculated risk rather than an obvious strategic error."],
        ["You · rebuttal", "A calculated risk still has to be proportionate to the danger. Napoleon put the core of his army at risk to enforce an economic system, while relying on Russia to behave in a way it did not have to behave. When a strategy fails if the opponent simply retreats, burns supplies, and refuses to negotiate, the weakness lies in the strategy itself—not only in the outcome."]
      ]
    : [
        ["You · rebuttal", "My opponent argues that the campaign was doomed because Russia was large and could retreat. But strategy is judged against alternatives, not against certainty. Russia’s departure from the Continental System threatened the economic pressure Napoleon used to contain Britain. Allowing that defiance to stand could have weakened the entire system.\n\nNapoleon had defeated Russian armies before and had reason to think rapid force might restore compliance. The campaign became disastrous because Russia adopted an unusually costly scorched-earth strategy and refused the decisive battle that had resolved earlier wars. Those choices mattered; they were not details Napoleon could treat as inevitable."],
        [opponentName, "But the possibility of Russian resistance was not a surprise. Russia’s size, its roads, and its ability to exchange territory for time existed before the invasion. A plan that needs a quick battle from an opponent who can refuse one is fragile from the beginning."],
        ["You · rebuttal", "Fragile does not mean irrational. Napoleon faced a real threat to his continental strategy and chose a response that had repeatedly succeeded in Europe. The retreat exposed the limits of that approach, but the failure of a high-risk strategy does not prove that taking no action would have protected the empire better."]
      ];

  return (
    <section className="mt-4 border-t border-line pt-5">
      <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Rebuttal · sample transcript</span>
      <div className="mt-4 space-y-5">
        {exchange.map(([speaker, text], index) => {
          const yours = speaker.startsWith("You");
          return <article key={index} className={yours ? "ml-auto max-w-[92%]" : "mr-auto max-w-[92%]"}><span className={`font-mono text-[10px] tracking-[0.1em] uppercase ${yours ? "text-accent-ink" : "text-muted"}`}>{speaker}</span><p className={`mt-1.5 whitespace-pre-line rounded-card p-4 text-[13.5px] leading-relaxed ${yours ? "bg-accent-soft" : "bg-ground"}`}>{text}</p></article>;
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] leading-snug text-muted">A rebuttal answers the strongest remaining objection. It does not repeat the opening case or introduce an unrelated claim.</p>
        <button type="button" onClick={onNext} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-bold text-white hover:-translate-y-0.5">
          Preview closing <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </section>
  );
}

function ClosingPreview({ setup, onNext }: { setup: DebateSetup; onNext: () => void }) {
  const opponentName = `The ${setup.opponent[0].toUpperCase() + setup.opponent.slice(1)}`;
  const studentSupportsMotion = setup.side === "affirmative";
  const yourClosing = studentSupportsMotion
    ? "This debate is not about whether Russia’s defiance created a problem for Napoleon. It did. The question is whether invading Russia was a strategy capable of solving that problem. The evidence says no: the Grande Armée could not sustain its supply line, Russia could deny the decisive battle Napoleon needed, and taking Moscow did not produce a settlement.\n\nWinter made a failed campaign more destructive, but the failure began with the plan. Napoleon gambled the strength of his empire on an opponent who could retreat, burn supplies, and refuse to negotiate. That is why the invasion was a strategic mistake from the start."
    : "The affirmative has shown that the invasion ended disastrously. It has not shown that Napoleon’s initial choice was strategically irrational. Russia’s withdrawal from the Continental System threatened the credibility of Napoleon’s European order, and in earlier campaigns decisive military pressure had forced states to negotiate.\n\nRussia’s scorched-earth retreat and refusal to make peace turned a calculated campaign into a catastrophe. The outcome revealed the limits of Napoleon’s strategy, but a high-risk decision made in response to a real threat is not automatically a mistake from the start."
  const theirClosing = studentSupportsMotion
    ? "The affirmative asks you to judge the decision only by the disaster that followed. But Napoleon faced a real challenge: Russia was undermining the Continental System, and allowing that defiance to stand could weaken his wider empire. He had reasons, based on earlier victories, to believe decisive pressure could restore compliance.\n\nThe campaign failed because Russia chose an extraordinary strategy of retreat and scorched earth. That made the gamble fail; it does not prove that taking action against Russia was unreasonable before the campaign began."
    : "The negative has explained why Napoleon wanted to act. But motive is not strategy. A campaign that relies on a quick battle, intact supplies, and Russian negotiation was unsound against a country large enough to retreat and determined enough to deny all three.\n\nThe disaster was not created by winter alone or by one unexpected choice. Hunger, disease, exhaustion, and the destruction of the Grande Armée flowed from a plan whose basic assumptions did not fit Russia. That is why it was a strategic mistake from the start.";

  return (
    <section className="mt-4 border-t border-line pt-5">
      <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Closing · sample transcript</span>
      <div className="mt-4 space-y-5">
        <article><span className="font-mono text-[10px] tracking-[0.1em] text-accent-ink uppercase">You · closing</span><p className="mt-1.5 whitespace-pre-line rounded-card bg-accent-soft p-4 text-[13.5px] leading-relaxed">{yourClosing}</p></article>
        <article><span className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase">{opponentName} · closing</span><p className="mt-1.5 whitespace-pre-line rounded-card bg-ground p-4 text-[13.5px] leading-relaxed">{theirClosing}</p></article>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] leading-snug text-muted">Closings weigh the arguments that survived. They should not introduce new evidence or claims.</p>
        <button type="button" onClick={onNext} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-bold text-white hover:-translate-y-0.5">
          Preview round review <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </section>
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */
