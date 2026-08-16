import Link from "next/link";
import { classes } from "@/lib/data";
import { DOT } from "./class-color";
import { HomeIcon } from "./icons";
import SchoolTheme from "./school-theme";

/** Classes are enumerated rather than hidden behind an index page — they're
 *  one click from anywhere, which is what makes the class layer feel present
 *  rather than filed away. */
export default function Sidebar() {
  return (
    <div className="hidden shrink-0 p-3 pr-0 nav:block">
      <aside className="sticky top-3 flex h-[calc(100dvh-1.5rem)] w-[244px] flex-col overflow-y-auto rounded-lg bg-surface px-3 pt-6 pb-4 shadow-[0_1px_2px_rgba(20,20,18,0.06)]">
      <div className="flex items-center gap-2.5 px-3 pb-6">
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-full bg-ink font-display text-[17px] font-extrabold text-white"
        >
          C
        </span>
        <span className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
          Crossfire
        </span>
      </div>

      <nav aria-label="Main">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/"
              aria-current="page"
              className="flex min-h-11 items-center gap-2.5 rounded-full bg-accent-soft px-4 text-[14px] font-bold text-accent-ink"
            >
              <HomeIcon className="size-[18px]" />
              Home
            </Link>
          </li>
        </ul>
      </nav>

      <h2 className="px-3 pt-6 pb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
        Classes
      </h2>
      <nav aria-label="Your classes">
        <ul className="flex flex-col gap-1">
          {classes.map((c) => (
            <li key={c.id}>
              <Link
                href={`/c/${c.id}`}
                className="flex min-h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-semibold hover:bg-ground"
              >
                <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[c.color]}`} />
                <span className="flex-1">{c.name}</span>
                <span className="rounded-full bg-ground px-2 py-0.5 text-[11px] font-bold tabular-nums text-muted">
                  {c.dueCount}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/join"
              className="flex min-h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-semibold text-muted hover:bg-ground"
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-full border border-line bg-ground" />
              Join a class
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto px-3 pt-6">
        <SchoolTheme />
        <div className="mt-5 flex items-center gap-2.5 text-[13px] font-semibold">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-rose-soft text-[11px] font-bold text-rose-ink"
          >
            RC
          </span>
          Rui Chen
        </div>
        </div>
      </aside>
    </div>
  );
}
