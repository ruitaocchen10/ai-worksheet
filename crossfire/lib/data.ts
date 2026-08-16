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
  { id: "bio-3", name: "Bio 3", dueCount: 0, color: "forest" },
  { id: "ap-gov-11", name: "AP Gov 11", dueCount: 1, color: "rose" },
  { id: "ap-world", name: "AP World History", dueCount: 1, color: "amber" },
];

export const assignments: Assignment[] = [
  {
    id: "napoleon-debate",
    proposition: "Napoleon's invasion of Russia was a strategic mistake from the start.",
    className: "AP World History",
    classId: "ap-world",
    due: "Fri",
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

/** How a source got here. `class` is the teacher's corpus; the other three
 *  are the student bringing their own, which is the case that actually tests
 *  whether anyone does this when nobody is grading them. */
export type SourceKind = "file" | "link" | "text" | "class";

export interface CustomSource {
  kind: SourceKind;
  /** What the student sees back: a filename, a domain, a class unit. */
  label: string;
  /** Where it came from, when the label alone is ambiguous. */
  detail?: string;
}

export interface GeneratedProposition {
  id: string;
  text: string;
  /** Every proposition ships with the line it came from. A proposition with
   *  no excerpt is an opinion, and arguing about opinions is the generic
   *  chatbot this app is trying not to be. */
  excerpt: string;
}

const AP_WORLD: GeneratedProposition[] = [
  {
    id: "g1",
    text: "Napoleon's invasion of Russia was a strategic mistake from the start.",
    excerpt:
      "The Grande Armée advanced over a supply line that stretched farther with every mile, while Russian forces refused the decisive battle Napoleon needed.",
  },
  {
    id: "g2",
    text: "Russia's scorched-earth strategy, not winter alone, defeated Napoleon.",
    excerpt:
      "As the French moved east, supplies vanished, villages burned, and the army found less food and shelter than its plans required.",
  },
  {
    id: "g3",
    text: "The invasion exposed the limits of Napoleon's continental empire.",
    excerpt:
      "An empire held together by quick victories could not easily replace hundreds of thousands of experienced soldiers lost on one campaign.",
  },
];

const AP_GOV_11: GeneratedProposition[] = [
  {
    id: "g4",
    text: "Federalism has outlived its usefulness.",
    excerpt:
      "The framers divided power between the states and the nation because they could not agree which one to trust. That disagreement was never settled; it was written down.",
  },
  {
    id: "g5",
    text: "State-level variation in rights is a feature of the system, not a failure of it.",
    excerpt:
      "What one legislature calls an experiment, the citizen subject to it calls a condition of their life.",
  },
  {
    id: "g6",
    text: "The federal government's power grew through spending, not through amendment.",
    excerpt:
      "Conditions attached to federal funds have redrawn more of the boundary than any constitutional convention did.",
  },
];

/** Stands in for the model call that reads the source and returns grounded
 *  propositions for the student to pick from. The real one is item 1 of v1;
 *  this keeps the flow demonstrable end to end without a backend. */
export function propositionsFor(source: CustomSource): GeneratedProposition[] {
  if (source.kind === "class") {
    return source.label.startsWith("AP World") ? AP_WORLD : AP_GOV_11;
  }
  return AP_WORLD;
}

/** A line from the source a student can lean on. The bank is the fast path;
 *  §3's "no evidence, no claim" is enforced against it, but a student may
 *  also bring their own — see EvidenceRef in lib/debate.ts. */
export interface Excerpt {
  id: string;
  text: string;
  cite: string;
}

const BIO_EVIDENCE: Excerpt[] = [
  {
    id: "e1",
    text: "The line between therapy and enhancement is not written into the biology. It is drawn, and redrawn, by whoever is doing the drawing.",
    cite: "Ch. 4 Genetics · p. 118",
  },
  {
    id: "e2",
    text: "Changes to the germline are inherited by every descendant, none of whom were party to the consent form.",
    cite: "Ch. 4 Genetics · p. 121",
  },
  {
    id: "e3",
    text: "The first generation of any therapy is priced for the people who can pay for it, and the second generation is priced by what the first one proved.",
    cite: "Ch. 4 Genetics · p. 124",
  },
  {
    id: "e4",
    text: "Every trial to date has treated a condition with a name. None has treated a preference.",
    cite: "Ch. 4 Genetics · p. 119",
  },
  {
    id: "e5",
    text: "A disease is a condition a society has agreed to treat. That agreement has moved before, and it will move again.",
    cite: "Ch. 4 Genetics · p. 120",
  },
  {
    id: "e6",
    text: "Regulators drew the therapy line in 2015 and have not moved it since, in any jurisdiction, under considerable pressure.",
    cite: "Ch. 4 Genetics · p. 126",
  },
];

const GOV_EVIDENCE: Excerpt[] = [
  {
    id: "e7",
    text: "The framers divided power between the states and the nation because they could not agree which one to trust. That disagreement was never settled; it was written down.",
    cite: "Unit 2 · Federalism",
  },
  {
    id: "e8",
    text: "What one legislature calls an experiment, the citizen subject to it calls a condition of their life.",
    cite: "Unit 2 · Federalism",
  },
  {
    id: "e9",
    text: "Conditions attached to federal funds have redrawn more of the boundary than any constitutional convention did.",
    cite: "Unit 2 · Federalism",
  },
  {
    id: "e10",
    text: "No state has successfully refused a funding condition it could afford to refuse, because none could afford to.",
    cite: "Unit 2 · Federalism",
  },
  {
    id: "e11",
    text: "Uniformity was never the promise. The promise was that the disagreement would have somewhere to go.",
    cite: "Unit 2 · Federalism",
  },
  {
    id: "e12",
    text: "The commerce power grew fastest in the decades when Congress was least able to pass an amendment.",
    cite: "Unit 2 · Federalism",
  },
];

const NAPOLEON_EVIDENCE: Excerpt[] = [
  {
    id: "e13",
    text: "The Grande Armée advanced over a supply line that stretched farther with every mile, while Russian forces refused the decisive battle Napoleon needed.",
    cite: "Unit 5 · The Napoleonic Wars",
  },
  {
    id: "e14",
    text: "As the French moved east, supplies vanished, villages burned, and the army found less food and shelter than its plans required.",
    cite: "Unit 5 · The Napoleonic Wars",
  },
  {
    id: "e15",
    text: "By the retreat from Moscow, cold magnified an army already weakened by hunger, disease, exhaustion, and desertion.",
    cite: "Unit 5 · The Napoleonic Wars",
  },
  {
    id: "e16",
    text: "The campaign destroyed experienced soldiers and weakened the political foundations of an empire built on military success.",
    cite: "Unit 5 · The Napoleonic Wars",
  },
];

/** Stands in for the retrieval pass over the uploaded source. The real one
 *  chunks the document; this returns the same shape. */
export function evidenceFor(source: CustomSource): Excerpt[] {
  if (source.kind === "class" && source.label.startsWith("AP World")) return NAPOLEON_EVIDENCE;
  if (source.kind === "class" && source.label.startsWith("AP Gov")) return GOV_EVIDENCE;
  return BIO_EVIDENCE;
}
