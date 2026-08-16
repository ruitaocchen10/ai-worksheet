"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { classes } from "@/lib/data";
import { FILL } from "@/lib/class-color";
import { HomeIcon, ChevronLeftIcon } from "@/components/ui/icons";
import SchoolTheme from "@/components/school-theme/school-theme";

const WIDE = "(min-width: 1200px)";
const KEY = "cf-nav";

/** The preference lives in localStorage, which is an external store, not
 *  React state — so it is read as one. This also keeps every sidebar on the
 *  page in agreement without a provider. */
const listeners = new Set<() => void>();

function subscribePref(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readPref() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    // Private mode. No preference, so the width decides.
    return "";
  }
}

function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const readWide = () => window.matchMedia(WIDE).matches;

/** Two letters, the way a class shows up on a roster. */
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Classes are enumerated rather than hidden behind an index page — they're
 *  one click from anywhere, which is what makes the class layer feel present
 *  rather than filed away. Collapsing keeps that true on a laptop: the rows
 *  stay, they just lose their labels.
 *
 *  Nothing here sets a width. The panel reads --nav-w and its contents read
 *  the panel, so the collapsed state has exactly one definition, in CSS. */
export default function Sidebar() {
  const pref = useSyncExternalStore(subscribePref, readPref, () => "");
  const wide = useSyncExternalStore(subscribeWide, readWide, () => true);

  // Until the user says otherwise the width decides, so the attribute stays
  // off the document — writing it on mount would freeze that default.
  const collapsed = pref ? pref === "collapsed" : !wide;

  useEffect(() => {
    if (pref) document.documentElement.dataset.nav = pref;
  }, [pref]);

  function toggle() {
    try {
      localStorage.setItem(KEY, collapsed ? "expanded" : "collapsed");
    } catch {
      // Preference is per-session then. Not worth telling anyone about.
    }
    listeners.forEach((f) => f());
  }

  return (
    <div className="hidden shrink-0 p-3 pr-0 nav:block">
      <aside
        id="sidebar"
        className="nav-panel sticky top-3 flex h-[calc(100dvh-1.5rem)] flex-col rounded-lg bg-surface px-3 pt-6 pb-4 shadow-[0_1px_2px_rgba(20,20,18,0.06)]"
      >
        <div className="nav-brand flex items-center gap-2.5 px-3 pb-6">
          <span
            aria-hidden
            className="nav-logo grid size-9 shrink-0 place-items-center rounded-full bg-ink font-display text-[17px] font-extrabold text-white"
          >
              C
          </span>
          <span className="nav-wordmark font-display text-[19px] font-extrabold tracking-[-0.01em]">
            Crossfire
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="nav-toggle ml-auto grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-ground hover:text-ink"
          >
            <ChevronLeftIcon className="nav-chevron size-[18px]" />
          </button>
        </div>

        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/"
                aria-current="page"
                className="nav-item flex min-h-11 items-center gap-2.5 rounded-full bg-accent-soft px-4 text-[14px] font-bold text-accent-ink"
              >
                <HomeIcon className="size-[18px] shrink-0" />
                <span className="nav-label">Home</span>
              </Link>
            </li>
          </ul>
        </nav>

        <h2 className="nav-section px-3 pt-6 pb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          Classes
        </h2>
        <nav aria-label="Your classes">
          <ul className="flex flex-col gap-1">
            {classes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/c/${c.id}`}
                  className="nav-item flex min-h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-semibold hover:bg-ground"
                >
                  {/* One element, two sizes: a 10px dot with the initials
                      suppressed, or a 30px disc that shows them. */}
                  <span
                    aria-hidden
                    className={`nav-disc grid size-2.5 shrink-0 place-items-center rounded-full text-[0px] font-bold ${FILL[c.color]}`}
                  >
                    {initials(c.name)}
                  </span>
                  <span className="nav-label flex-1">{c.name}</span>
                  <span className="nav-badge rounded-full bg-ground px-2 py-0.5 text-center text-[11px] font-bold tabular-nums text-muted">
                    {c.dueCount}
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/join"
                className="nav-item flex min-h-11 items-center gap-2.5 rounded-full px-4 text-[14px] font-semibold text-muted hover:bg-ground"
              >
                <span
                  aria-hidden
                  className="nav-disc grid size-2.5 shrink-0 place-items-center rounded-full border border-line bg-ground text-[0px] font-bold"
                >
                  +
                </span>
                <span className="nav-label flex-1">Join a class</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-auto pt-6">
          <div className="nav-theme px-3">
            <SchoolTheme />
          </div>
          <div className="nav-user mt-5 flex items-center gap-2.5 px-3 text-[13px] font-semibold">
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-soft text-[11px] font-bold text-rose-ink"
            >
              RC
            </span>
            <span className="nav-user-name">Rui Chen</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
