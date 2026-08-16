/** Rounds played per day. Bars, not a chart — it only has to show rhythm. */
export default function LedgerStrip({ days }: { days: number[] }) {
  const max = Math.max(...days, 1);
  const total = days.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div
        role="img"
        aria-label={`${total} rounds over the last ${days.length} days`}
        className="flex h-[54px] items-end gap-[3px]"
      >
        {days.map((n, i) => (
          <span
            key={i}
            style={{ height: n === 0 ? 4 : `${Math.round((n / max) * 52)}px` }}
            className={`flex-1 rounded-full ${n === 0 ? "bg-line" : "bg-accent"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted">
        <span>2 Aug</span>
        <span>16 Aug</span>
      </div>
    </div>
  );
}
