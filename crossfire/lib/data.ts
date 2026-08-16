/**
 * Mock data for the prototype. Shapes here are the contract the real
 * backend will fill: a proposition always carries its source, because
 * grounding in the teacher's corpus is the thing that makes this not a
 * generic chatbot.
 */

export type Phase = "constructive" | "cross-ex" | "rebuttal" | "closing";

/** What happened to a claim in a given phase. Shape carries the meaning,
 *  colour only reinforces it — never colour alone. */
export type MarkKind = "extended" | "conceded" | "dropped";

export interface Source {
  className: string;
  unit: string;
  page?: string;
}

export interface Proposition {
  id: string;
  text: string;
  source: Source;
  /** Pulled from the source. Every claim has to attach to something. */
  excerpt?: string;
}

/** Where a student is in an assigned debate. Deliberately not a percentage:
 *  a debate is either untouched, mid-round, or done — "62% complete" would
 *  be measuring artifact production, which is the proxy this app exists to
 *  replace. */
export type Progress = "not-started" | "in-round" | "done";

export interface Assignment {
  id: string;
  proposition: string;
  className: string;
  classId: string;
  due: string;
  /** Graded work is voice — it's the half that resists outsourcing. */
  voice: boolean;
  progress: Progress;
}

/** Fixed identity colours, not brand colours — they tell one class from
 *  another and are never the only signal. */
export type ClassColor = "forest" | "rose" | "amber" | "sage";

export interface ClassRef {
  id: string;
  name: string;
  dueCount: number;
  color: ClassColor;
}

export interface FlowRow {
  claim: string;
  marks: Record<Phase, MarkKind>;
}

export interface ReasoningProfile {
  streakDays: number;
  extended: number;
  conceded: number;
  dropped: number;
  changedPosition: number;
  flow: FlowRow[];
  /** Rounds played per day, oldest first. */
  ledger: number[];
}

export interface LastRound {
  id: string;
  proposition: string;
}

export const PHASES: { key: Phase; short: string; label: string }[] = [
  { key: "constructive", short: "CON", label: "Constructive" },
  { key: "cross-ex", short: "CX", label: "Cross-examination" },
  { key: "rebuttal", short: "REB", label: "Rebuttal" },
  { key: "closing", short: "CLO", label: "Closing" },
];

export const classes: ClassRef[] = [
  { id: "bio-3", name: "Bio 3", dueCount: 2, color: "forest" },
  { id: "ap-gov-11", name: "AP Gov 11", dueCount: 1, color: "rose" },
];

export const assignments: Assignment[] = [
  {
    id: "a1",
    proposition: "Gene editing in humans should be limited to preventing disease.",
    className: "Bio 3",
    classId: "bio-3",
    due: "Thu",
    voice: true,
    progress: "in-round",
  },
  {
    id: "a2",
    proposition: "Federalism has outlived its usefulness.",
    className: "AP Gov 11",
    classId: "ap-gov-11",
    due: "Fri",
    voice: true,
    progress: "not-started",
  },
];

export const featured: Proposition = {
  id: "p1",
  text: "Gene editing in humans should be limited to preventing disease.",
  source: { className: "Bio 3", unit: "Ch. 4 Genetics", page: "p. 118" },
  excerpt:
    "The line between therapy and enhancement is not written into the biology. It is drawn, and redrawn, by whoever is doing the drawing.",
};

export const profile: ReasoningProfile = {
  streakDays: 4,
  extended: 6,
  conceded: 2,
  dropped: 5,
  changedPosition: 1,
  flow: [
    {
      claim: "Therapy line is drawn",
      marks: { constructive: "extended", "cross-ex": "extended", rebuttal: "extended", closing: "extended" },
    },
    {
      claim: "Access is unequal",
      marks: { constructive: "extended", "cross-ex": "extended", rebuttal: "dropped", closing: "dropped" },
    },
    {
      claim: "Consent of the unborn",
      marks: { constructive: "extended", "cross-ex": "conceded", rebuttal: "dropped", closing: "dropped" },
    },
    {
      claim: "Slippery slope",
      marks: { constructive: "extended", "cross-ex": "dropped", rebuttal: "dropped", closing: "dropped" },
    },
  ],
  ledger: [2, 0, 1, 3, 1, 0, 0, 2, 1, 2, 0, 1, 2, 1],
};

export const lastRound: LastRound = {
  id: "r-97",
  proposition: "Reconstruction failed primarily because of Northern indifference.",
};
