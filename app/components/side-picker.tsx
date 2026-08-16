"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Side = "affirmative" | "negative";

/**
 * Side first, twist card after. The constraint should land as a surprise,
 * not as another menu to browse.
 */
export default function SidePicker({ propositionId }: { propositionId: string }) {
  const [picked, setPicked] = useState<Side | null>(null);
  const router = useRouter();

  function choose(side: Side) {
    setPicked(side);
    router.push(`/debate/new?proposition=${propositionId}&side=${side}`);
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
            picked === side ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""
          }`}
        >
          <span className="block font-display text-[20px] leading-tight font-bold">{label}</span>
          <span className="mt-0.5 block text-[12px] font-semibold opacity-70">{sub}</span>
        </button>
      ))}
    </div>
  );
}
