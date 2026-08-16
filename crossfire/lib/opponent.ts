import type { Excerpt, Phase } from "@/lib/data";
import type { Claim, DebateSetup, Turn } from "@/lib/debate";

const OPPONENT_VOICE = {
  professor: "Let's separate the claim from the evidence.",
  challenger: "That is not enough to carry your conclusion.",
  skeptic: "What makes you confident that follows?",
  troll: "A very tidy story — perhaps a little too tidy.",
  genius: "At a more sophisticated level, your framing needs scrutiny.",
} as const;

export interface OpponentContext {
  setup: DebateSetup;
  phase: Phase;
  /** Which student turn of this phase just landed, zero-based. */
  turnInPhase: number;
  studentTurn: Turn;
  claims: Claim[];
  bank: Excerpt[];
}

export interface OpponentReply {
  text: string;
  /** An opposing argument entering the record, so cross-ex and rebuttal have
   *  something concrete to work against. */
  claim?: string;
  rebuke?: Turn["rebuke"];
}

/**
 * The seam. A live implementation takes the same context and returns the same
 * reply — the round never learns which one it is talking to.
 */
export interface Opponent {
  respond(ctx: OpponentContext): Promise<OpponentReply>;
}

/* ---- layer 2 -----------------------------------------------------------
   The composer gates the shape of a cross-ex turn; the opponent gates the
   substance. A question mark is not a question, and students find that
   within one round. */

const RHETORICAL = [
  /^\s*isn'?t it (obvious|clear|true)/i,
  /^\s*(surely|obviously|clearly)\b/i,
  /\b(obviously|clearly|everyone knows|any reasonable person)\b/i,
  /^\s*(don'?t|doesn'?t|wouldn'?t|aren'?t|isn'?t) you\b/i,
  /^\s*(don'?t|doesn'?t|wouldn'?t|aren'?t|isn'?t|shouldn'?t) (we|it|they)\b.*\?\s*$/i,
];

export function isRhetorical(text: string) {
  return RHETORICAL.some((re) => re.test(text));
}

/** The composer's own gate: shape only, and deliberately cheap. */
export function isQuestionShaped(text: string) {
  return /\?\s*$/.test(text.trim());
}

export function breaksConstraint(text: string, setup: DebateSetup) {
  const banned = setup.twist.banned;
  if (!banned) return false;
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  return words.some((w) => banned.terms.includes(w));
}

/* ---- the scripted opponent ---------------------------------------------- */

/** First few words of the student's turn, so replies land on what was
 *  actually said rather than floating free of it. */
function stub(text: string, words = 7) {
  const parts = text.trim().replace(/[.?!]+$/, "").split(/\s+/);
  const head = parts.slice(0, words).join(" ");
  return parts.length > words ? `${head}…` : head;
}

/** An excerpt the student hasn't leaned on yet, so the opposition is
 *  grounded in the same corpus rather than asserted. */
function freshExcerpt(ctx: OpponentContext) {
  const used = new Set(
    ctx.claims.map((c) => c.evidence?.text).filter((t): t is string => Boolean(t)),
  );
  return ctx.bank.find((e) => !used.has(e.text)) ?? ctx.bank[ctx.bank.length - 1];
}

const SCRIPT: Record<Phase, ((ctx: OpponentContext) => OpponentReply)[]> = {
  constructive: [
    (ctx) => {
      const e = freshExcerpt(ctx);
      return {
        text: `"${stub(ctx.studentTurn.text)}" — that only holds if the evidence supports your interpretation rather than merely allowing it. The same source says: "${e.text}"`,
        claim: "The source supports a different conclusion",
      };
    },
    (ctx) => {
      const e = freshExcerpt(ctx);
      return {
        text: `You've now got two claims resting on the same passage. Take this evidence: "${e.text}" It cuts against you at least as hard as it cuts for you.`,
        claim: "The source underdetermines your position",
      };
    },
    (ctx) => ({
        text: `Granted, and I'll hold you to it. But an argument built on ${stub(ctx.studentTurn.text, 5)} still has to survive questioning, not just assertion.`,
      claim: "Your case is untested under questioning",
    }),
  ],
  "cross-ex": [
    () => ({
      text: "Yes — with a condition. I accept it in the specific circumstances the reading describes, and not automatically beyond them.",
    }),
    () => ({
      text: "No, and here's why that matters: you're treating an interpretation as a fact. Show how the text requires your conclusion.",
    }),
    () => ({
      text: "I'll concede that much. It doesn't get you the conclusion, but it's a fair question and the honest answer is yes.",
    }),
  ],
  rebuttal: [
    (ctx) => ({
      text: `That answers the claim you picked, not the one underneath it. Even if ${stub(ctx.studentTurn.text, 6)}, the source still leaves the central objection unanswered.`,
      claim: "The underlying objection is unanswered",
    }),
    () => ({
      text: "Fair. I'll drop that line rather than defend it badly — which leaves us with one real disagreement instead of three fake ones.",
    }),
  ],
  closing: [
    () => ({
      text: "Then we end with the evidence we actually have: both sides explain part of it, but one claim has carried its burden more consistently. That's a smaller disagreement than we started with.",
    }),
  ],
};

export const scriptedOpponent: Opponent = {
  async respond(ctx) {
    // Rebukes come first — the move matters more than the argument, and this
    // is where cross-ex's second layer actually lives.
    if (breaksConstraint(ctx.studentTurn.text, ctx.setup)) {
      return {
        text: `Your constraint card puts ${ctx.setup.twist.banned?.label} off the table, and you just reached for it. Make the argument without that, or don't make it.`,
        rebuke: "constraint",
      };
    }

    if (ctx.phase === "cross-ex" && isRhetorical(ctx.studentTurn.text)) {
      return {
        text: "That's an assertion with a question mark on it. Ask me something you don't already know the answer to.",
        rebuke: "rhetorical",
      };
    }

    if (ctx.studentTurn.evidence?.kind === "own") {
      return {
        text: `That isn't in the reading. I'm not refusing it — but you're now asking me to take your word for something the source doesn't say, so tell me why it's true.`,
        rebuke: "unsourced",
        claim: "Your outside evidence is unverified",
      };
    }

    const lines = SCRIPT[ctx.phase];
    const line = lines[Math.min(ctx.turnInPhase, lines.length - 1)];
    const reply = line(ctx);
    return { ...reply, text: `${OPPONENT_VOICE[ctx.setup.opponent]} ${reply.text}` };
  },
};
