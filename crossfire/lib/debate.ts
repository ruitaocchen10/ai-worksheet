import {
  PHASES,
  type CustomSource,
  type FlowRow,
  type GeneratedProposition,
  type MarkKind,
  type Phase,
} from "@/lib/data";

export type Side = "affirmative" | "negative";

export type OpponentType = "professor" | "challenger" | "skeptic" | "troll" | "genius";

export interface Preparation {
  mainPoints: string[];
  rebuttals: string[];
}

export function otherSide(side: Side): Side {
  return side === "affirmative" ? "negative" : "affirmative";
}

/* ---- twists -------------------------------------------------------------
   The constraint changes what the student's brain has to do. Wildcard (the
   AI switching sides mid-round) and Persona are deferred: wildcard fights
   the fixed-turn model, and persona is an opponent-voice change that costs
   nothing once the Opponent interface has a live implementation. */

export type TwistKey = "steelman" | "devils-advocate" | "constraint";

export interface Twist {
  key: TwistKey;
  name: string;
  /** One line on what it does to you. Shown on the card. */
  rule: string;
  /** Restated at the top of the round, where it has to keep working. */
  short: string;
  /** Devil's advocate is the only one that changes which side you argue. */
  flipsSide?: boolean;
  /** Constraint card: an argument you may not reach for. The opponent calls
   *  it out rather than the composer blocking it — the constraint is yours
   *  to keep, and breaking it should cost you in the round, not in a form. */
  banned?: { label: string; terms: string[] };
  /** Steelman opens the round with a turn that isn't your own case. */
  opensWithSteelman?: boolean;
}

export const TWISTS: Twist[] = [
  {
    key: "steelman",
    name: "Steelman",
    rule: "State their best case before your own.",
    short: "You opened with their case, not yours.",
    opensWithSteelman: true,
  },
  {
    key: "devils-advocate",
    name: "Devil's advocate",
    rule: "Argue the side you personally reject.",
    short: "You are arguing against your own position.",
    flipsSide: true,
  },
  {
    key: "constraint",
    name: "Constraint card",
    rule: "One argument is off the table for the whole round.",
    short: "Cost and access are off the table.",
    banned: {
      label: "cost and access",
      terms: ["cost", "costs", "costly", "price", "priced", "expensive", "afford", "affordable", "money", "rich", "poor", "unequal", "inequality", "access"],
    },
  },
];

export function twistByKey(key: TwistKey): Twist {
  const found = TWISTS.find((t) => t.key === key);
  if (!found) throw new Error(`Unknown twist: ${key}`);
  return found;
}

/** Every twist is in play in this build, so the hand is the whole pool. The
 *  signature is the seam a teacher's allowed-pool restriction slots into. */
export function dealHand(pool: Twist[] = TWISTS): Twist[] {
  return pool.slice(0, 3);
}

/* ---- shape of a round --------------------------------------------------- */

/** Fixed turns rather than a phase timer: round length stays knowable, a
 *  demo can't run long, and a slow opponent never eats the student's clock. */
export const PHASE_TURNS: Record<Phase, number> = {
  constructive: 2,
  "cross-ex": 3,
  rebuttal: 2,
  closing: 1,
};

/** Soft. It goes rose past the wire and the elapsed time is recorded, but
 *  it never submits or forfeits — §6 refuses to claim text mode is
 *  cheat-resistant, so a hard clock over a text box would be theatre. */
export const TURN_SECONDS = 90;

export const PHASE_RULE: Record<Phase, string> = {
  constructive: "Build your case. Every claim attaches to evidence.",
  "cross-ex": "You may only ask questions. No assertions.",
  rebuttal: "Answer their arguments. Pick what you're responding to.",
  closing: "Sum up what survived. No new claims, no new evidence.",
};

/* ---- the record --------------------------------------------------------- */

export type Speaker = "you" | "opponent";

export interface EvidenceRef {
  /** From the bank, or the student's own. Both are legal; the difference is
   *  the measurement the teacher dashboard exists to produce. */
  kind: "source" | "own";
  text: string;
  cite?: string;
}

export interface Claim {
  id: string;
  text: string;
  by: Speaker;
  bornIn: Phase;
  evidence?: EvidenceRef;
  /** Set by the explicit concede action. The action is recorded during the
   *  round; the verdict is withheld until review. */
  conceded?: { phase: Phase; reason: string };
  /** Phases in which the student carried this claim forward. */
  extendedIn: Phase[];
  /** For a rebuttal: the opposing claim this one answers. */
  answers?: string;
}

export type TurnKind = "steelman" | "claim" | "question" | "answer" | "rebuttal" | "concession" | "closing";

export interface Turn {
  id: string;
  by: Speaker;
  phase: Phase;
  kind: TurnKind;
  text: string;
  evidence?: EvidenceRef;
  /** Which claim this turn acts on — the student's own when extending or
   *  conceding, the opponent's when rebutting. */
  targetClaimId?: string;
  /** Milliseconds the student spent on the turn. Pace, not a verdict. */
  elapsedMs?: number;
  /** The opponent pushing back on the move rather than the argument. */
  rebuke?: "rhetorical" | "unsourced" | "constraint";
}

export interface DebateSetup {
  origin: "study" | "assignment";
  graded: boolean;
  source: CustomSource;
  proposition: GeneratedProposition;
  /** What the student actually thinks. Recorded, not argued from by default. */
  belief: Side;
  /** What they argue. Equal to belief unless the twist flipped them. */
  side: Side;
  twist: Twist;
  /** Derived from `graded`, never asked: §6 splits voice and text by stakes. */
  mode: "text" | "voice";
  opponent: OpponentType;
  preparation: Preparation;
}

export interface DebateState {
  id: string;
  setup: DebateSetup;
  turns: Turn[];
  claims: Claim[];
  phase: Phase;
  /** Student turns spent in the current phase. */
  spent: number;
  done: boolean;
}

let seq = 97;
export function mintDebateId() {
  seq += 1;
  return `r-${seq}`;
}

let idc = 0;
export function uid(prefix: string) {
  idc += 1;
  return `${prefix}-${idc}`;
}

/** How many student turns this phase runs. Steelman buys constructive an
 *  extra turn, because stating their case is not stating yours. */
export function turnsInPhase(phase: Phase, setup: DebateSetup) {
  const base = PHASE_TURNS[phase];
  if (phase === "constructive" && setup.twist.opensWithSteelman) return base + 1;
  return base;
}

export function nextPhase(phase: Phase): Phase | null {
  const i = PHASES.findIndex((p) => p.key === phase);
  return i < PHASES.length - 1 ? PHASES[i + 1].key : null;
}

/* ---- marks -------------------------------------------------------------
   Computed here, at review, over claim objects the round captured — never
   shown during the round. A rail that grades you mid-argument is a
   scoreboard in your peripheral vision, and §7 puts the mirror after. */

export function computeFlow(state: DebateState): FlowRow[] {
  return state.claims
    .filter((c) => c.by === "you")
    .map((claim) => {
      const marks = {} as Record<Phase, MarkKind>;
      let fallen = false;

      for (const { key } of PHASES) {
        if (claim.conceded && phaseIndex(key) >= phaseIndex(claim.conceded.phase)) {
          marks[key] = "conceded";
          fallen = true;
          continue;
        }
        const alive = key === claim.bornIn || claim.extendedIn.includes(key);
        if (alive && !fallen) {
          marks[key] = "extended";
        } else if (phaseIndex(key) < phaseIndex(claim.bornIn)) {
          // Before it existed. Nothing happened to it, which reads as dropped
          // in the notation and is the honest thing to draw.
          marks[key] = "dropped";
        } else {
          marks[key] = "dropped";
          fallen = true;
        }
      }
      return { claim: claim.text, marks };
    });
}

function phaseIndex(phase: Phase) {
  return PHASES.findIndex((p) => p.key === phase);
}

/** The counts behind the review page's tiles. Conceding is a first-class
 *  move here, not a penalty — §3: you can earn more by updating than by
 *  winning. */
export function tally(state: DebateState) {
  const mine = state.claims.filter((c) => c.by === "you");
  return {
    claims: mine.length,
    grounded: mine.filter((c) => c.evidence?.kind === "source").length,
    own: mine.filter((c) => c.evidence?.kind === "own").length,
    conceded: mine.filter((c) => c.conceded).length,
    questions: state.turns.filter((t) => t.by === "you" && t.kind === "question").length,
    changedPosition: state.setup.belief !== state.setup.side ? 1 : 0,
  };
}
