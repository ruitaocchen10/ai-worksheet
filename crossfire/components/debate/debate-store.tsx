"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { evidenceFor, type CustomSource, type Excerpt, type GeneratedProposition } from "@/lib/data";
import {
  mintDebateId,
  nextPhase,
  otherSide,
  turnsInPhase,
  uid,
  type Claim,
  type DebateSetup,
  type DebateState,
  type EvidenceRef,
  type OpponentType,
  type Preparation,
  type Side,
  type Turn,
  type TurnKind,
  type Twist,
} from "@/lib/debate";
import { scriptedOpponent, type Opponent } from "@/lib/opponent";

/** What home collects before the twist is picked. Held in memory rather than
 *  in the URL because an uploaded file has no URL representation — and
 *  because this is the object that becomes a POST /debates body later. */
interface Draft {
  origin: "study" | "assignment";
  graded: boolean;
  source: CustomSource;
  proposition: GeneratedProposition;
  belief: Side;
}

interface SubmitArgs {
  text: string;
  kind: TurnKind;
  evidence?: EvidenceRef;
  targetClaimId?: string;
  elapsedMs?: number;
}

interface DebateContextValue {
  draft: Draft | null;
  debate: DebateState | null;
  bank: Excerpt[];
  thinking: boolean;
  /** Set when a phase boundary was just crossed, so the round can hold an
   *  interstitial. Cleared by the round, not by the store. */
  crossed: DebateState["phase"] | null;
  openSetup(draft: Draft): void;
  begin(twist: Twist, belief: Side, opponent: OpponentType, preparation: Preparation): void;
  submit(args: SubmitArgs): Promise<void>;
  concede(claimId: string, reason: string): void;
  clearCrossed(): void;
  beginCrossExamination(): void;
  previewCrossExamination(): void;
  previewRebuttal(): void;
  previewClosing(): void;
  previewRoundReview(): void;
  leave(): void;
}

const DebateContext = createContext<DebateContextValue | null>(null);

export function useDebate() {
  const ctx = useContext(DebateContext);
  if (!ctx) throw new Error("useDebate must be used inside DebateProvider");
  return ctx;
}

export default function DebateProvider({
  children,
  opponent = scriptedOpponent,
}: {
  children: React.ReactNode;
  opponent?: Opponent;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [debate, setDebate] = useState<DebateState | null>(null);
  const [thinking, setThinking] = useState(false);
  const [crossed, setCrossed] = useState<DebateState["phase"] | null>(null);

  const bank = useMemo(() => {
    const source = debate?.setup.source ?? draft?.source;
    return source ? evidenceFor(source) : [];
  }, [debate?.setup.source, draft?.source]);

  const openSetup = useCallback(
    (next: Draft) => {
      setDraft(next);
      setDebate(null);
      router.push("/debate/new");
    },
    [router],
  );

  /** The mint point. `POST /debates` goes exactly here. */
  const begin = useCallback(
    (twist: Twist, belief: Side, opponent: OpponentType, preparation: Preparation) => {
      if (!draft) return;
      const setup: DebateSetup = {
        origin: draft.origin,
        graded: draft.graded,
        source: draft.source,
        proposition: draft.proposition,
        belief,
        // Devil's advocate is the only twist that moves you off your own
        // position — which is what makes it more than a label.
        side: twist.flipsSide ? otherSide(belief) : belief,
        twist,
        // Derived, never asked: §6 splits voice and text by stakes.
        mode: draft.graded ? "voice" : "text",
        opponent,
        preparation,
      };
      const id = mintDebateId();
      setDebate({ id, setup, turns: [], claims: [], phase: "constructive", spent: 0, done: false });
      // replace, so Back doesn't land you on a twist hand for a round that
      // has already started.
      router.replace(`/debate/${id}`);
    },
    [draft, router],
  );

  const submit = useCallback(
    async ({ text, kind, evidence, targetClaimId, elapsedMs }: SubmitArgs) => {
      if (!debate || thinking) return;

      const phase = debate.phase;
      const turnInPhase = debate.spent;

      const studentTurn: Turn = {
        id: uid("t"),
        by: "you",
        phase,
        kind,
        text,
        evidence,
        targetClaimId,
        elapsedMs,
      };

      // A constructive turn mints a claim; a rebuttal extends the claim of
      // yours it leans on. Steelman turns mint nothing — stating their case
      // is not stating yours.
      let claims = debate.claims;
      if (kind === "claim") {
        claims = [
          ...claims,
          {
            id: uid("c"),
            text,
            by: "you",
            bornIn: phase,
            evidence,
            extendedIn: [],
          } satisfies Claim,
        ];
      } else if (kind === "rebuttal") {
        // A rebuttal is an argument, so it enters the record as a claim of
        // yours too — otherwise the whole phase vanishes from the flow and
        // the review under-reports what you actually argued. targetClaimId
        // names the opposing claim it answers, not one of your own.
        claims = [
          ...claims,
          {
            id: uid("c"),
            text,
            by: "you",
            bornIn: phase,
            evidence,
            answers: targetClaimId,
            extendedIn: [],
          } satisfies Claim,
        ];
      }

      const mid: DebateState = {
        ...debate,
        turns: [...debate.turns, studentTurn],
        claims,
        spent: debate.spent + 1,
      };
      setDebate(mid);
      setThinking(true);

      // Constructive contains openings only: one from the student and one
      // from the opponent. The opponent does not answer the student's claim
      // until cross-examination begins.
      const reply = phase === "constructive"
        ? await opponent.opening({ setup: mid.setup })
        : await opponent.respond({
            setup: mid.setup,
            phase,
            turnInPhase,
            studentTurn,
            claims: mid.claims,
            bank,
          });

      const opponentTurn: Turn = {
        id: uid("t"),
        by: "opponent",
        phase,
        kind: phase === "cross-ex" ? "answer" : "claim",
        text: reply.text,
        rebuke: reply.rebuke,
      };

      // Only a *rejected* move is refunded. A rhetorical question was never a
      // question, so the turn didn't happen. Outside evidence and a broken
      // constraint are different: the claim stood, it's on the table, and the
      // opponent pressed on it — that's the cost. Refunding there would let a
      // student farm unlimited turns by never citing the reading.
      const spent = reply.rebuke === "rhetorical" ? mid.spent - 1 : mid.spent;
      const exhausted = spent >= turnsInPhase(phase, mid.setup);
      // The opening exchange is complete, but remains on screen until the
      // student explicitly begins cross-examination.
      const after = phase === "constructive" || !exhausted ? null : nextPhase(phase);

      setDebate((prev) => {
        if (!prev) return prev;
        const claimsAfter = reply.claim
          ? [
              ...prev.claims,
              {
                id: uid("c"),
                text: reply.claim,
                by: "opponent" as const,
                bornIn: phase,
                extendedIn: [],
              },
            ]
          : prev.claims;

        return {
          ...prev,
          turns: [...prev.turns, opponentTurn],
          claims: claimsAfter,
          phase: after ?? phase,
          spent: after ? 0 : spent,
          done: phase !== "constructive" && exhausted && !after,
        };
      });

      // Outside the updater on purpose: a setState called from inside another
      // updater can be dropped, which is exactly how the phase interstitial
      // went missing.
      if (after) setCrossed(after);
      setThinking(false);
    },
    [bank, debate, opponent, thinking],
  );

  /** Recorded as an action during the round; the verdict waits for review.
   *  Deliberately free — it does not spend a turn, because §3 wants updating
   *  to be cheaper than defending a bad claim. */
  const concede = useCallback((claimId: string, reason: string) => {
    setDebate((prev) => {
      if (!prev) return prev;
      const claim = prev.claims.find((c) => c.id === claimId);
      if (!claim || claim.conceded) return prev;
      return {
        ...prev,
        claims: prev.claims.map((c) =>
          c.id === claimId ? { ...c, conceded: { phase: prev.phase, reason } } : c,
        ),
        turns: [
          ...prev.turns,
          {
            id: uid("t"),
            by: "you",
            phase: prev.phase,
            kind: "concession",
            text: reason,
            targetClaimId: claimId,
          },
        ],
      };
    });
  }, []);

  const clearCrossed = useCallback(() => setCrossed(null), []);

  const beginCrossExamination = useCallback(() => {
    setDebate((prev) => {
      if (!prev || prev.phase !== "constructive" || prev.spent < turnsInPhase("constructive", prev.setup)) {
        return prev;
      }
      return { ...prev, phase: "cross-ex", spent: 0 };
    });
    setCrossed("cross-ex");
  }, []);

  /** Lets the classroom demo move through the round without manufacturing
   *  student turns. Real debates advance through submit() above. */
  const previewCrossExamination = useCallback(() => {
    setDebate((prev) => (prev && prev.phase === "constructive" ? { ...prev, phase: "cross-ex", spent: 0 } : prev));
  }, []);

  const previewRebuttal = useCallback(() => {
    setDebate((prev) => {
      if (!prev || prev.phase !== "cross-ex") return prev;
      const claims = prev.claims.some((claim) => claim.by === "opponent")
        ? prev.claims
        : [...prev.claims, { id: uid("c"), text: "The invasion was a high-risk but rational response to Russia undermining the Continental System.", by: "opponent" as const, bornIn: "cross-ex" as const, extendedIn: [] }];
      return { ...prev, phase: "rebuttal", spent: 0, claims };
    });
  }, []);

  const previewClosing = useCallback(() => {
    setDebate((prev) => (prev && prev.phase === "rebuttal" ? { ...prev, phase: "closing", spent: 0 } : prev));
  }, []);

  const previewRoundReview = useCallback(() => {
    setDebate((prev) => {
      if (!prev || prev.phase !== "closing") return prev;
      const supportsMotion = prev.setup.side === "affirmative";
      const source = evidenceFor(prev.setup.source)[0];
      const evidence: EvidenceRef = source
        ? { kind: "source", text: source.text, cite: source.cite }
        : { kind: "source", text: "The campaign's supply problems emerged before the retreat.", cite: "Unit 5 · The Napoleonic Wars" };
      const myClaim = supportsMotion
        ? "The invasion was strategically unsound because its supply line depended on a decisive battle Russia could refuse."
        : "The invasion was a calculated response to Russia undermining the Continental System.";
      const opponentClaim = supportsMotion
        ? "The invasion was a high-risk but rational response to Russia undermining the Continental System."
        : "The invasion was strategically unsound because Russia could deny Napoleon a decisive battle and supplies.";
      const claims: Claim[] = [
        { id: "demo-mine", text: myClaim, by: "you", bornIn: "constructive", evidence, extendedIn: ["rebuttal", "closing"] },
        { id: "demo-theirs", text: opponentClaim, by: "opponent", bornIn: "constructive", extendedIn: ["rebuttal"] },
      ];
      const turns: Turn[] = [
        { id: "demo-t1", by: "you", phase: "constructive", kind: "claim", text: myClaim, evidence },
        { id: "demo-t2", by: "opponent", phase: "constructive", kind: "claim", text: opponentClaim },
        { id: "demo-t3", by: "you", phase: "cross-ex", kind: "question", text: "How could Napoleon secure a decisive battle when Russian forces could continue retreating?" },
        { id: "demo-t4", by: "opponent", phase: "cross-ex", kind: "answer", text: "Napoleon expected pressure on Moscow to force negotiations, as decisive pressure had done in earlier campaigns." },
        { id: "demo-t5", by: "you", phase: "rebuttal", kind: "rebuttal", text: "A reason to act is not a workable strategy. The army could not sustain itself if Russia denied both battle and supplies.", evidence, targetClaimId: "demo-theirs" },
        { id: "demo-t6", by: "opponent", phase: "rebuttal", kind: "claim", text: "The campaign's outcome was disastrous, but the initial strategic problem remained real." },
        { id: "demo-t7", by: "you", phase: "closing", kind: "closing", text: supportsMotion ? "The evidence shows the campaign's failure began with its assumptions, not with winter alone." : "The decision carried real risk, but it responded to a genuine threat to Napoleon's continental strategy." },
        { id: "demo-t8", by: "opponent", phase: "closing", kind: "closing", text: "The question is whether the original calculation was unreasonable, not whether the campaign ended badly." },
      ];
      return { ...prev, turns, claims, done: true };
    });
  }, []);

  const leave = useCallback(() => {
    setDebate(null);
    setDraft(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({ draft, debate, bank, thinking, crossed, openSetup, begin, submit, concede, clearCrossed, beginCrossExamination, previewCrossExamination, previewRebuttal, previewClosing, previewRoundReview, leave }),
    [draft, debate, bank, thinking, crossed, openSetup, begin, submit, concede, clearCrossed, beginCrossExamination, previewCrossExamination, previewRebuttal, previewClosing, previewRoundReview, leave],
  );

  return <DebateContext.Provider value={value}>{children}</DebateContext.Provider>;
}
