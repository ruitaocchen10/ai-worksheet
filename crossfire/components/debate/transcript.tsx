import type { Claim, EvidenceRef, Turn } from "@/lib/debate";

/**
 * A turn is not a chat bubble — it renders as claim plus attachment, because
 * "no evidence, no claim" has to be visible in the record, not just enforced
 * at the composer. Bank evidence cites; your own says so plainly, so the
 * transcript itself distinguishes a grounded argument from an asserted one.
 */
export default function Transcript({ turns, claims }: { turns: Turn[]; claims: Claim[] }) {
  return (
    <ol className="space-y-4">
      {turns.map((turn) => (
        <li key={turn.id}>
          {turn.by === "you" ? (
            <YourTurn turn={turn} claims={claims} />
          ) : (
            <TheirTurn turn={turn} />
          )}
        </li>
      ))}
    </ol>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
      {children}
    </span>
  );
}

function YourTurn({ turn, claims }: { turn: Turn; claims: Claim[] }) {
  if (turn.kind === "concession") {
    const target = claims.find((c) => c.id === turn.targetClaimId);
    return (
      <div className="ml-auto max-w-[86%] rounded-card bg-amber-soft p-4">
        <Label>You conceded</Label>
        {target && (
          <p className="text-[14px] leading-snug font-bold text-amber-ink line-through">{target.text}</p>
        )}
        <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{turn.text}</p>
      </div>
    );
  }

  return (
    <div className="ml-auto max-w-[86%] rounded-card bg-accent-soft p-4">
      <Label>
        {turn.kind === "steelman" ? "You · their best case" : turn.kind === "question" ? "You asked" : "You"}
      </Label>
      <p className="text-[15px] leading-relaxed">{turn.text}</p>
      {turn.evidence && <Evidence evidence={turn.evidence} />}
    </div>
  );
}

function TheirTurn({ turn }: { turn: Turn }) {
  const rebuke = Boolean(turn.rebuke);
  return (
    <div
      className={`mr-auto max-w-[86%] rounded-card p-4 ${
        rebuke ? "bg-rose-soft" : "bg-ground"
      }`}
    >
      <Label>{rebuke ? "Opponent · not so fast" : "Opponent"}</Label>
      <p className={`text-[15px] leading-relaxed ${rebuke ? "font-semibold text-rose-ink" : ""}`}>
        {turn.text}
      </p>
    </div>
  );
}

function Evidence({ evidence }: { evidence: EvidenceRef }) {
  if (evidence.kind === "own") {
    return (
      <figure className="mt-3 border-l-2 border-dashed border-muted/50 pl-3">
        <blockquote className="text-[14px] leading-relaxed text-ink/75">{evidence.text}</blockquote>
        <figcaption className="mt-1 text-[11.5px] font-semibold text-muted">
          Your evidence · outside the reading
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="mt-3 border-l-2 border-accent pl-3">
      <blockquote className="font-source text-[14.5px] leading-relaxed text-ink/85 italic">
        {evidence.text}
      </blockquote>
      {evidence.cite && (
        <figcaption className="mt-1 text-[11.5px] font-semibold text-muted">{evidence.cite}</figcaption>
      )}
    </figure>
  );
}
