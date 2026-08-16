"use client";

import { useState } from "react";
import { useDebate } from "@/components/debate/debate-store";
import { ClockIcon, MicIcon, PlayIcon, ArrowRightIcon } from "@/components/ui/icons";
import { CHIP, FILL, LIFT, ON_FILL } from "@/lib/class-color";
import { propositionsFor, type Assignment, type ClassRef, type GeneratedProposition } from "@/lib/data";

type ClassHomeProps = {
  classroom: ClassRef;
  assignments: Assignment[];
};

const unitFor = (classId: string) =>
  classId === "ap-world" ? "Unit 5 · Revolutions" : classId === "ap-gov-11" ? "Unit 2 · Federalism" : "Current class material";

/** A class is a place to pick up the next live argument, then practice the
 * same material voluntarily. Its activity is intentionally not a gradebook. */
export default function ClassHome({ classroom, assignments }: ClassHomeProps) {
  const { openSetup } = useDebate();
  const [choosingPractice, setChoosingPractice] = useState(false);
  const next = assignments.find((assignment) => assignment.progress === "in-round") ?? assignments[0];
  const unit = unitFor(classroom.id);
  const practicePropositions = propositionsFor({ kind: "class", label: classroom.name, detail: unit });

  function start(assignment: Assignment, graded = assignment.voice) {
    openSetup({
      origin: "assignment",
      graded,
      source: { kind: "class", label: classroom.name, detail: unit },
      proposition: {
        id: assignment.id,
        text: assignment.proposition,
        excerpt:
          classroom.id === "ap-world"
            ? "The Grande Armée advanced over a supply line that stretched farther with every mile, while Russian forces refused the decisive battle Napoleon needed."
            : "Use the class material to build a claim and test it against the opposing case.",
      },
      belief: "affirmative",
    });
  }

  function startPractice(proposition: GeneratedProposition) {
    openSetup({
      origin: "study",
      graded: false,
      source: { kind: "class", label: classroom.name, detail: unit },
      proposition,
      belief: "affirmative",
    });
  }

  return (
    <div className="flex min-w-0 flex-1">
      <main className="min-w-0 flex-1 px-4 pt-5 pb-28 nav:px-6 nav:pt-7 nav:pb-8">
        <div className="mx-auto max-w-[760px]">
          <header>
            <span className={`inline-flex rounded-full px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase ${CHIP[classroom.color]}`}>
              Your class
            </span>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-[32px] leading-none font-extrabold tracking-[-0.025em] nav:text-[42px]">
                  {classroom.name}
                </h1>
                <p className="mt-2 text-[14.5px] font-semibold text-muted">{unit}</p>
              </div>
              <span className="rounded-full bg-ground px-3.5 py-2 text-[12.5px] font-bold text-muted">
                {assignments.length} {assignments.length === 1 ? "debate" : "debates"} this week
              </span>
            </div>
          </header>

          {next ? (
            <section aria-labelledby="next-debate-heading" className={`relative mt-7 overflow-hidden rounded-lg p-5 nav:p-7 ${FILL[classroom.color]}`}>
              <span aria-hidden className={`absolute inset-0 ${LIFT[classroom.color]}`} />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span id="next-debate-heading" className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase">
                    Up next
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold ${ON_FILL[classroom.color]}`}>
                    {next.progress === "in-round" ? <PlayIcon className="size-4" /> : <ClockIcon className="size-4" />}
                    {next.progress === "in-round" ? "In round" : "Not started"}
                  </span>
                </div>
                <h2 className="mt-5 max-w-[27ch] font-display text-[23px] leading-tight font-extrabold tracking-[-0.015em] nav:text-[29px]">
                  {next.proposition}
                </h2>
                <div className={`mt-7 flex flex-wrap items-center justify-between gap-3 text-[13px] font-bold ${ON_FILL[classroom.color]}`}>
                  <span className="inline-flex items-center gap-1.5"><ClockIcon className="size-4" /> Due {next.due}</span>
                  {next.voice && <span className="inline-flex items-center gap-1.5"><MicIcon className="size-4" /> Voice required</span>}
                </div>
                <button
                  type="button"
                  onClick={() => start(next)}
                  className="mt-6 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-6 font-display text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  {next.progress === "in-round" ? "Continue round" : "Start debate"}
                  <ArrowRightIcon className="size-4" />
                </button>
              </div>
            </section>
          ) : (
            <section className="mt-7 rounded-lg bg-surface p-6 shadow-[0_2px_10px_rgba(20,20,18,0.05)]">
              <h2 className="font-display text-[22px] font-extrabold">Nothing is due right now.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">Use the class material for a low-stakes practice round.</p>
            </section>
          )}

          <section aria-labelledby="weekly-debates-heading" className="mt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="weekly-debates-heading" className="font-display text-[20px] font-extrabold">This week&rsquo;s debates</h2>
              <span className="text-[12px] font-semibold text-muted">Assigned work</span>
            </div>
            {assignments.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {assignments.filter((assignment) => assignment.id !== next?.id).map((assignment) => (
                  <li key={assignment.id}>
                    <button
                      type="button"
                      onClick={() => start(assignment)}
                      className="flex min-h-20 w-full cursor-pointer items-center gap-4 rounded-card bg-surface p-4 text-left shadow-[0_1px_2px_rgba(20,20,18,0.06)] transition-transform hover:-translate-y-0.5"
                    >
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full ${CHIP[classroom.color]}`}>
                        {assignment.progress === "in-round" ? <PlayIcon className="size-5" /> : <ClockIcon className="size-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[14px] leading-snug font-bold">{assignment.proposition}</span>
                        <span className="mt-1 block text-[12px] font-semibold text-muted">Due {assignment.due} · {assignment.voice ? "Voice" : "Text"}</span>
                      </span>
                      <ArrowRightIcon className="size-4 shrink-0 text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-card bg-surface p-4 text-[14px] text-muted">Your teacher has not assigned a debate this week.</p>
            )}
            {assignments.length === 1 && (
              <p className="mt-3 text-[13px] font-semibold text-muted">Your next debate is featured above.</p>
            )}
          </section>

          <section className="mt-8 grid gap-3 nav:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-lg bg-slate p-5 text-slate-text">
              <span className="font-mono text-[10px] tracking-[0.12em] text-slate-muted uppercase">Practice from class material</span>
              <h2 className="mt-2 font-display text-[20px] font-extrabold">Make a case when nothing&rsquo;s on the line.</h2>
              <p className="mt-2 max-w-[40ch] text-[13px] leading-relaxed text-slate-muted">Choose a proposition from {unit} and argue it in text. Practice does not affect an assignment.</p>
              <button type="button" onClick={() => setChoosingPractice((open) => !open)} aria-expanded={choosingPractice} className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-amber px-5 text-[13px] font-bold text-ink hover:-translate-y-0.5">
                {choosingPractice ? "Hide practice propositions" : "Choose a practice proposition"} <ArrowRightIcon className="size-4" />
              </button>
              {choosingPractice && (
                <ul className="mt-4 space-y-2">
                  {practicePropositions.map((proposition) => (
                    <li key={proposition.id}>
                      <button type="button" onClick={() => startPractice(proposition)} className="w-full cursor-pointer rounded-inner bg-white/10 p-3 text-left text-[12.5px] leading-snug font-bold hover:bg-white/20">
                        {proposition.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-lg bg-surface p-5 shadow-[0_1px_2px_rgba(20,20,18,0.06)]">
              <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Class pulse</span>
              <p className="mt-3 font-display text-[18px] leading-snug font-extrabold">Most challenged idea</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">Russian strategy did more than winter alone.</p>
              <ul className="mt-4 space-y-1.5 text-[12px] font-bold text-accent-ink">
                <li>18 classmates debated this unit</li>
                <li>11 supported a claim with evidence</li>
                <li>6 revised a claim after challenge</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
