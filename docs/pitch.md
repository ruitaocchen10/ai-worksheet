# Steelman — Hackathon Pitch

## 1 Problem Space

Students aren't disengaged because they're lazy — they're disengaged because the
work stopped requiring them. School's basic exchange was _produce an artifact,
receive a grade_, where the artifact was a costly proxy for thinking. AI collapsed
the cost of the artifact to zero, and the proxy broke.

Schools have mostly responded by trying to detect the cheating: plagiarism
checkers, AI detectors, comprehension quizzes bolted onto the same assignments.
That's an arms race against a tool that lives in every student's second browser
tab, and it's one schools lose. Meanwhile the actual casualty is the thing nobody
is measuring — the ability to hold a position, weigh evidence, and change your
mind for a reason.

## 2 Scope

Teachers upload the documents they already teach from; the app turns them into
debates students have with an AI that knows the material. It slots into the
homework slot teachers already own — no new class-time ritual, no new grading
workflow, no curriculum to adopt.

Two surfaces, one engine:

- **Class mode** — the teacher sets a debate as homework.
- **Study mode** — students debate the same class AI on their own time, ungraded,
  for practice.

## 3 Solution

The teacher uploads a unit — a reading, a case, a chapter, a primary source. The
app generates debatable propositions grounded in that specific text, and the
teacher approves or edits them in one pass.

A student picks a proposition, picks a side, and picks a **twist** — a constraint
that changes what their brain has to do:

- _Steelman_ — state your opponent's best case before your own
- _Devil's advocate_ — argue the side you personally disagree with
- _Persona_ — face a skeptical scientist, a 1789 revolutionary, your own strongest critic
- _Constraint card_ — "you may not use the economic argument"
- _Wildcard_ — the AI switches sides mid-debate and you defend what you just attacked

Then they debate, in four phases: **constructive → cross-examination → rebuttal →
closing.** Cross-examination is the phase we care most about — a round where the
student may only ask questions, not assert. It's the highest-value critical
thinking exercise in competitive debate and almost nobody has built it.

Every claim must attach to something from the source material. No evidence, no
claim — that's what keeps a debate from becoming vibes, and it's what keeps the
tool anchored to the curriculum.

**The scoring is the product.** Traditional debate rewards winning, which teaches
motivated reasoning — exactly the opposite of the goal. We score reasoning moves
instead: points for steelmanning the other side, for conceding a bad point, for
changing position with a stated reason, for evidence that actually supports the
claim it's attached to. **You can earn more by updating than by winning.**

## 4 Teacher and AI Collaboration

The teacher never writes debate prompts from scratch and never grades a transcript
cold. The AI generates the raw material — propositions, opponent arguments,
per-round move analysis — and the teacher stays the editor: figuring out what concepts
students are struggling on, interpreting the debate transcripts/reports, etc.

What comes back isn't a number. It's a map of how each student argues: who
steelmans, who never concedes, who cites evidence and who asserts, who's stuck on
a concept the class already covered. That's a diagnostic no essay pile produces,
and it's evidence _for_ the teacher rather than a grade _from_ the AI.

## 5 How This Is Different

Argument-mapping tools (Kialo and similar) let students diagram positions —
structured, but static, and nobody pushes back. Generic "argue with a chatbot"
tools have live opposition but no source material, no teacher layer, no
assessment, no engagement tactics and no reason for a school to adopt them.

This is the combination: **live adversarial reasoning, gamified-engagement tactics,
grounded in the teacher's own curriculum, scored on reasoning quality, with a teacher
dashboard.**

## 6 Cheating Prevention

We're going to be straight about this, because most edtech isn't.

A live, timed rebuttal to an argument that didn't exist thirty seconds ago is
extremely hard to outsource. Voice mode with a 60–90 second turn clock is the
strong version: round-tripping through another model is slow, and the pauses are
audible. Grounding in the class corpus helps at the margin — an outside model
doesn't have the reading.

What we won't claim: that text-mode homework is uncheatable. It isn't. So the
design splits by stakes — **voice for anything graded, text for study mode**,
where there's no grade and therefore no incentive.

## 7 Feedback Loop

Immediately after a round, the student sees their own reasoning played back:
which claims held, which evidence didn't support what it was attached to, where
they conceded, where they dodged a question. Not a score — a mirror.

The teacher's dashboard aggregates the same signal across the class: which
concepts collapse under pressure, which students never update, who's stuck.

## 8 The Main Goal

Make the thinking the deliverable, so there's nothing left to outsource — and make
it something students choose to do when nobody's grading them.

That last part is the real test. **The number we care about is unassigned debates
played.** If students open study mode voluntarily — no points, no grade, just
because arguing with something that knows the material is fun — we've proven the
thesis. Everything else is a distribution problem.

## 9 v1

1. Teacher or student uploads a document/file/presentation/source/etc. → grounded debate partner
2. One 4-phase debate loop, text and voice, with 3 twist cards
3. Post-round transcript annotated with reasoning moves — the teacher artifact
4. Study mode: the same loop, text-option, no grade, streak on reasoning moves

## 10 Unit Economics

Roughly **$0.09 per text debate** (Claude Sonnet with prompt caching) — about
$100 per classroom per year. The teacher's corpus is identical across all 30
students, which makes it a near-perfect cache prefix at 10% of input cost.

The real cost is voice: third-party text-to-speech runs ~$0.10–0.30/minute, so a
10-minute spoken debate costs 10–30× the model call. Mitigations are already in
the design — short bounded rounds, and voice-in / text-out as the default for
graded work, which preserves the cheat-resistance and cuts the expensive half.
