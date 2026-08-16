"use client";

import { useState } from "react";
import { useDebate } from "@/components/debate/debate-store";
import type { CustomSource, GeneratedProposition } from "@/lib/data";
import type { Side } from "@/lib/debate";

/**
 * These buttons say "I agree" and "I disagree", so what they capture is what
 * the student actually believes — not which side they'll argue. The two come
 * apart when the twist is Devil's advocate, and keeping them apart is what
 * lets the review page say you argued against your own position.
 *
 * The choice goes into the store rather than the URL: an uploaded file has no
 * URL representation, and this object is the future POST /debates body.
 */
export default function SidePicker({
  source,
  proposition,
}: {
  source: CustomSource;
  proposition: GeneratedProposition;
}) {
  const [picked, setPicked] = useState<Side | null>(null);
  const { openSetup } = useDebate();

  function choose(belief: Side) {
    setPicked(belief);
    openSetup({ origin: "study", graded: false, source, proposition, belief });
  }

  return (
    <div className="flex gap-3">
      {(
        [
          { side: "affirmative", label: "I agree", sub: "Affirmative", fill: "bg-forest text-white", depth: "#1d4a40" },
          { side: "negative", label: "I disagree", sub: "Negative", fill: "bg-rose text-ink", depth: "#b8465e" },
        ] as const
      ).map(({ side, label, sub, fill, depth }) => (
        <button
          key={side}
          type="button"
          aria-pressed={picked === side}
          onClick={() => choose(side)}
          style={{ ["--depth-color" as string]: depth }}
          className={`depth flex-1 cursor-pointer rounded-card px-4 py-4 ${fill} ${
            picked === side ? "outline-2 outline-offset-2 outline-ink" : ""
          }`}
        >
          <span className="block font-display text-[20px] leading-tight font-bold">{label}</span>
          <span className="mt-0.5 block text-[12px] font-semibold opacity-70">{sub}</span>
        </button>
      ))}
    </div>
  );
}
