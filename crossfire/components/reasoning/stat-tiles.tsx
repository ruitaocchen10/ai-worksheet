import { profile } from "@/lib/data";
import { ExtendedMark, ConcededMark, DroppedMark, ChangedMark } from "@/components/reasoning/mark-icons";

/** Capsule tiles with an icon disc on top — the reference's stat row. Ours
 *  counts reasoning moves rather than lessons completed, which is the whole
 *  argument: percent-complete measures artifact production. */
const TILES = [
  { n: profile.extended, label: "Extended", Icon: ExtendedMark, tile: "bg-forest-soft", disc: "bg-forest text-white" },
  { n: profile.conceded, label: "Conceded", Icon: ConcededMark, tile: "bg-amber-soft", disc: "bg-amber text-ink" },
  { n: profile.dropped, label: "Dropped", Icon: DroppedMark, tile: "bg-surface", disc: "bg-line text-muted" },
  { n: profile.changedPosition, label: "Changed", Icon: ChangedMark, tile: "bg-rose-soft", disc: "bg-rose text-ink" },
];

export default function StatTiles() {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {TILES.map(({ n, label, Icon, tile, disc }) => (
        <li
          key={label}
          className={`flex flex-col items-center rounded-card px-3 py-4 text-center ${tile}`}
        >
          <span className={`mb-2 grid size-9 place-items-center rounded-full ${disc}`}>
            <Icon className="size-4" />
          </span>
          <span className="font-display text-[26px] leading-none font-extrabold tabular-nums">
            {n}
          </span>
          <span className="mt-1 text-[12px] font-semibold text-muted">{label}</span>
        </li>
      ))}
    </ul>
  );
}
