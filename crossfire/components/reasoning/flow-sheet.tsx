import { PHASES, type MarkKind, type FlowRow } from "@/lib/data";

/** Shape as well as colour — colour alone never carries the meaning.
 *  Filled bar = extended, diamond = conceded, dot = dropped. */
const MARK: Record<MarkKind, { label: string; node: React.ReactNode }> = {
  extended: {
    label: "extended",
    node: <rect x="4.4" y="1.5" width="3.2" height="9" rx="1.6" fill="#8fc9b8" />,
  },
  conceded: {
    label: "conceded",
    node: <path d="M6 2.2 9.2 6 6 9.8 2.8 6Z" fill="none" stroke="#efa83b" strokeWidth={1.3} />,
  },
  dropped: {
    label: "dropped",
    node: <circle cx="6" cy="6" r="1.35" fill="#6e6e66" />,
  },
};

function Mark({ kind, claim, phase }: { kind: MarkKind; claim: string; phase: string }) {
  return (
    <svg viewBox="0 0 12 12" className="mx-auto block size-3" role="img">
      <title>{`${claim}, ${phase}: ${MARK[kind].label}`}</title>
      {MARK[kind].node}
    </svg>
  );
}

/**
 * Debate's own notation: each column is a speech, each row a claim tracked
 * across the round.
 *
 * This is the one austere object in a warm system. Everything around it is
 * soft and rounded; the flow stays a precision instrument, because it's the
 * assessment artifact and the thing no competitor has. The contrast is
 * deliberate — it should read as an instrument sitting on a desk.
 */
export default function FlowSheet({ rows }: { rows: FlowRow[] }) {
  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">
        Your claims across the four phases of your last five rounds
      </caption>
      <thead>
        <tr className="border-b border-slate-line">
          <th
            scope="col"
            className="pb-2 text-left font-mono text-[8px] font-normal tracking-[0.1em] text-slate-muted"
          >
            CLAIM
          </th>
          {PHASES.map((p) => (
            <th
              key={p.key}
              scope="col"
              className="w-[28px] pb-2 text-center font-mono text-[8px] font-normal tracking-[0.06em] text-slate-muted"
            >
              <abbr title={p.label} className="no-underline">
                {p.short}
              </abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.claim} className="border-t border-slate-line/70">
            <th
              scope="row"
              className="max-w-0 truncate py-2.5 pr-2 text-left text-[11.5px] font-normal text-slate-text"
            >
              {row.claim}
            </th>
            {PHASES.map((p) => (
              <td key={p.key} className="py-2.5">
                <Mark kind={row.marks[p.key]} claim={row.claim} phase={p.label} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
