"use client";

import { useMemo, useState } from "react";
import type { Excerpt, Phase } from "@/lib/data";
import type { Claim, DebateSetup, EvidenceRef, Turn, TurnKind } from "@/lib/debate";
import { isQuestionShaped } from "@/lib/opponent";
import { ArrowRightIcon, DocIcon, MicIcon, TextIcon } from "@/components/ui/icons";

interface Props {
  phase: Phase;
  setup: DebateSetup;
  turns: Turn[];
  claims: Claim[];
  bank: Excerpt[];
  thinking: boolean;
  onSubmit(args: {
    text: string;
    kind: TurnKind;
    evidence?: EvidenceRef;
    targetClaimId?: string;
    elapsedMs: number;
  }): void;
}

/**
 * The same slot, four different instruments. A round where the input never
 * changes shape is a chat with headings — the phase has to be something you
 * feel in what you're allowed to type, not something you read at the top.
 */
export default function Composer({ phase, setup, turns, claims, bank, thinking, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [evidence, setEvidence] = useState<EvidenceRef | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [own, setOwn] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const [gate, setGate] = useState<string | null>(null);
  // The round remounts this component once per turn, so a lazy initializer is
  // the turn's start time — no effect, and nothing to reset.
  const [startedAt] = useState(() => Date.now());

  const theirClaims = useMemo(() => claims.filter((c) => c.by === "opponent"), [claims]);
  const crossExClaim = theirClaims.find((claim) => claim.bornIn === "constructive") ?? theirClaims[0];

  // Derived rather than defaulted through an effect: the first of their
  // claims is what you're answering until you say otherwise.
  const activeTarget = target ?? theirClaims[0]?.id ?? null;

  const canAttachEvidence = phase === "constructive";
  const crossExQuestions = turns.filter(
    (turn) => turn.by === "you" && turn.phase === "cross-ex" && turn.kind === "question",
  ).length;
  const rebuttals = turns.filter(
    (turn) => turn.by === "you" && turn.phase === "rebuttal" && turn.kind === "rebuttal",
  ).length;
  const yourCase = claims.find((claim) => claim.by === "you" && claim.bornIn === "constructive");
  const opponentCase = claims.find((claim) => claim.by === "opponent" && claim.bornIn === "constructive");
  const lastRebuttal = turns.filter((turn) => turn.phase === "rebuttal").slice(-1)[0];
  const kind = phase === "constructive"
    ? "claim"
    : phase === "cross-ex"
      ? "question"
      : phase === "rebuttal"
        ? "rebuttal"
        : "closing";

  const config = {
    claim: { heading: "Make your opening claim", placeholder: "Make a claim…", action: "Send claim" },
    question:
      crossExQuestions === 0
        ? { heading: "Test their main claim", placeholder: "What assumption or evidence do you want to test?", action: "Ask question" }
        : crossExQuestions === 1
          ? { heading: "Press on their answer", placeholder: "What did their answer leave unresolved?", action: "Ask question" }
          : { heading: "Set up your rebuttal", placeholder: "What question will matter most in your rebuttal?", action: "Ask question" },
    rebuttal:
      rebuttals === 0
        ? { heading: "Answer their strongest argument", placeholder: "Explain why their claim does not hold…", action: "Send rebuttal" }
        : { heading: "Address their strongest reply", placeholder: "What did their response still miss?", action: "Send rebuttal" },
    closing: {
      heading: "What survived?",
      placeholder: "After the strongest objections, what does this debate show?",
      action: "Deliver closing",
    },
  }[kind];

  const ready =
    text.trim().length > 2 &&
    (phase !== "rebuttal" || Boolean(activeTarget)) &&
    !thinking;

  function send() {
    const body = text.trim();
    // An empty box is nothing to correct — the gate is for a real assertion,
    // not for a student who hasn't typed yet.
    if (body.length < 3) return;
    // Shape gate. Deliberately cheap and local — it catches the obvious case
    // instantly and offline. The opponent handles the question that is really
    // an assertion, which is the interesting half.
    if (phase === "cross-ex" && !isQuestionShaped(body)) {
      setGate("That's a claim. Ask it instead.");
      return;
    }
    if (!ready) return;

    onSubmit({
      text: body,
      kind,
      evidence: evidence ?? undefined,
      targetClaimId: kind === "rebuttal" ? (activeTarget ?? undefined) : undefined,
      elapsedMs: Date.now() - startedAt,
    });

    setText("");
    setEvidence(null);
    setOwn("");
    setGate(null);
    setDrawer(false);
  }

  return (
    <div className="rounded-lg border-t border-line bg-surface shadow-[0_-2px_10px_rgba(20,20,18,0.05)]">
      {drawer && (
        <EvidenceDrawer
          bank={bank}
          own={own}
          setOwn={setOwn}
          onPick={(next) => {
            setEvidence(next);
            setDrawer(false);
          }}
          onClose={() => setDrawer(false)}
        />
      )}

      <div className="mx-auto max-w-none px-4 py-4 nav:px-6">
        {phase === "closing" && (
          <aside className="mb-4 rounded-card bg-amber-soft p-3.5" aria-label="Arguments to weigh in closing">
            <span className="font-mono text-[9px] tracking-[0.14em] text-amber-ink uppercase">What&apos;s on the table</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <p className="text-[12.5px] leading-snug text-ink/80"><span className="font-bold text-ink">Your case · </span>{yourCase?.text ?? "Your constructive claim"}</p>
              <p className="text-[12.5px] leading-snug text-ink/80"><span className="font-bold text-ink">Opponent case · </span>{opponentCase?.text ?? "Their constructive claim"}</p>
            </div>
            {lastRebuttal && <p className="mt-2 border-t border-amber-ink/15 pt-2 text-[12.5px] leading-snug text-ink/80"><span className="font-bold text-ink">Latest rebuttal · </span>{lastRebuttal.text}</p>}
          </aside>
        )}

        {phase === "cross-ex" && crossExClaim && (
          <aside className="mb-4 rounded-card bg-rose-soft p-3.5" aria-label="Opponent claim under examination">
            <span className="font-mono text-[9px] tracking-[0.14em] text-rose-ink uppercase">Opponent&apos;s claim under examination</span>
            <p className="mt-1.5 text-[13.5px] leading-snug font-semibold text-ink">{crossExClaim.text}</p>
          </aside>
        )}

        {phase === "rebuttal" && theirClaims.length > 0 && (
          <fieldset className="mb-3">
            <legend className="mb-2 font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
              Responding to
            </legend>
            {/* You can't rebut into the air — the turn has to name what it
                answers, which is also what makes the flow computable later. */}
            <div className="flex flex-wrap gap-2">
              {theirClaims.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={activeTarget === c.id}
                  onClick={() => setTarget(c.id)}
                  className={`min-h-9 max-w-full cursor-pointer truncate rounded-full px-3.5 text-[12.5px] font-bold ${
                    activeTarget === c.id ? "bg-ink text-white" : "bg-ground text-muted hover:text-ink"
                  }`}
                >
                  {c.text}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
            {config.heading}
          </span>
          {setup.twist.banned && (
            <span className="text-[11.5px] font-bold text-rose-ink">
              {setup.twist.banned.label} is off the table
            </span>
          )}
        </div>

        <label className="mt-1.5 block">
          <span className="sr-only">{config.heading}</span>
          <textarea
            rows={phase === "closing" ? 4 : 2}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (gate) setGate(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            placeholder={config.placeholder}
            className="w-full resize-none rounded-card bg-ground p-3.5 text-[15px] leading-relaxed placeholder:text-muted"
          />
        </label>

        {gate && (
          <p role="alert" className="mt-2 text-[13px] font-bold text-rose-ink">
            {gate}
          </p>
        )}

        {evidence && (
          <div className="mt-2.5 flex items-start gap-2 rounded-inner bg-ground p-3">
            <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink/80">
              <span className="font-bold">
                {evidence.kind === "source" ? "From the reading · " : "Your evidence · "}
              </span>
              {evidence.text}
            </span>
            <button
              type="button"
              onClick={() => setEvidence(null)}
              className="shrink-0 cursor-pointer text-[12.5px] font-bold text-accent-ink hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          {canAttachEvidence && (
            <button
              type="button"
              onClick={() => setDrawer((v) => !v)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-ground px-4 text-[13px] font-bold hover:bg-line-soft"
            >
              <DocIcon className="size-4 text-muted" />
              {evidence ? "Change evidence" : "Attach evidence"}
            </button>
          )}

          {/* Present and honest rather than hidden: graded work is voice work
              per §6, and pretending otherwise on screen would be the kind of
              claim the pitch refuses to make. */}
          {setup.mode === "voice" && (
            <span
              title="Voice turns are coming — this round runs in text."
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ground px-4 text-[13px] font-bold text-muted opacity-60"
            >
              <MicIcon className="size-4" />
              Voice coming
            </span>
          )}

          <button
            type="button"
            onClick={send}
            disabled={thinking || !ready}
            className={`ml-auto inline-flex min-h-11 items-center gap-2 rounded-full px-6 font-display text-[14px] font-bold text-white transition-transform duration-150 ${
              thinking || !ready
                ? "cursor-not-allowed bg-ink/25"
                : "cursor-pointer bg-ink hover:-translate-y-0.5"
            }`}
          >
            {thinking ? "Thinking…" : config.action}
            {!thinking && <ArrowRightIcon className="size-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * Both paths, side by side. The bank is the fast one; your own is legal but
 * says so out loud in the transcript, which turns the loophole into something
 * the opponent can press on rather than a hole in the grounding claim.
 */
function EvidenceDrawer({
  bank,
  own,
  setOwn,
  onPick,
  onClose,
}: {
  bank: Excerpt[];
  own: string;
  setOwn: (v: string) => void;
  onPick: (e: EvidenceRef) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"bank" | "own">("bank");

  return (
    <div className="max-h-[46vh] overflow-y-auto border-b border-line bg-ground">
      <div className="mx-auto max-w-[680px] px-4 py-4 nav:px-6">
        <div className="flex items-center justify-between gap-3">
          <div role="radiogroup" aria-label="Where the evidence comes from" className="flex gap-1 rounded-full bg-surface p-1">
            {(
              [
                { key: "bank", label: "From the reading", Icon: DocIcon },
                { key: "own", label: "My own", Icon: TextIcon },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={tab === key}
                onClick={() => setTab(key)}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[12.5px] font-bold ${
                  tab === key ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 cursor-pointer px-1 text-[12.5px] font-semibold text-muted hover:text-ink"
          >
            Close
          </button>
        </div>

        {tab === "bank" ? (
          <ul className="mt-3 space-y-2">
            {bank.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onPick({ kind: "source", text: e.text, cite: e.cite })}
                  className="w-full cursor-pointer rounded-card bg-surface p-3.5 text-left hover:bg-accent-soft"
                >
                  <span className="block font-source text-[14.5px] leading-relaxed text-ink/85 italic">
                    {e.text}
                  </span>
                  <span className="mt-1 block text-[11.5px] font-semibold text-muted">{e.cite}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <label className="block">
              <span className="sr-only">Evidence you&rsquo;re bringing yourself</span>
              <textarea
                rows={3}
                value={own}
                onChange={(e) => setOwn(e.target.value)}
                placeholder="Something you know that the reading doesn't say…"
                className="w-full resize-none rounded-card bg-surface p-3.5 text-[14.5px] leading-relaxed placeholder:text-muted"
              />
            </label>
            <p className="mt-2 text-[12px] leading-snug text-muted">
              This is allowed, and it will be marked as outside the reading. Expect to be asked to
              back it up.
            </p>
            <button
              type="button"
              disabled={own.trim().length < 8}
              onClick={() => onPick({ kind: "own", text: own.trim() })}
              className={`mt-3 min-h-11 rounded-full px-5 font-display text-[13.5px] font-bold text-white ${
                own.trim().length < 8 ? "cursor-not-allowed bg-ink/25" : "cursor-pointer bg-ink"
              }`}
            >
              Attach my evidence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
