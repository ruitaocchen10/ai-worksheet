"use client";

import { useEffect, useState } from "react";
import { TURN_SECONDS } from "@/lib/debate";
import { ClockIcon } from "@/components/ui/icons";

/**
 * Soft on purpose. It goes rose past the wire and the elapsed time is
 * recorded as pace, but it never submits or forfeits for you — §6 explicitly
 * refuses to claim text mode is cheat-resistant, and a hard clock over a text
 * box mostly punishes slow typists.
 */
export default function TurnClock({ paused }: { paused: boolean }) {
  // Remounted per turn by the round, so the lazy initializer is this turn's
  // start. Keeping it here means the round holds no clock state at all.
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paused, startedAt]);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const left = TURN_SECONDS - elapsed;
  const over = left < 0;
  const value = Math.abs(left);
  const label = `${over ? "+" : ""}${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[13px] font-extrabold tabular-nums ${
        over ? "bg-rose text-ink" : "bg-ground text-muted"
      }`}
    >
      <ClockIcon className="size-3.5" />
      <span aria-hidden>{label}</span>
      <span className="sr-only">
        {over ? `${value} seconds over the suggested turn length` : `${value} seconds left in this turn`}
      </span>
    </span>
  );
}
