"use client";

import { useEffect, useState } from "react";

/**
 * Demo affordance, not a student-facing feature — a school would set this
 * once at the district level. It's here so the white-label story is visible
 * in a pitch. Remove before this ships to students.
 *
 * Note this themes the *brand* accent only. Class identity colours stay
 * fixed, because they carry meaning rather than branding.
 */
const SCHOOLS = [
  { id: "forest", label: "Forest", swatch: "#2e6b5e" },
  { id: "rose", label: "Rose", swatch: "#c43f5b" },
  { id: "amber", label: "Amber", swatch: "#a06a10" },
  { id: "indigo", label: "Indigo", swatch: "#3a4a8c" },
  { id: "plum", label: "Plum", swatch: "#7a3f80" },
];

export default function SchoolTheme() {
  const [active, setActive] = useState("forest");

  // The token lives on <html> so every surface picks it up from one place.
  useEffect(() => {
    document.documentElement.dataset.school = active;
  }, [active]);

  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
        School theme
      </h3>
      <div role="radiogroup" aria-label="School theme" className="flex gap-1">
        {SCHOOLS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={active === s.id}
            aria-label={s.label}
            onClick={() => setActive(s.id)}
            className="grid size-8 cursor-pointer place-items-center rounded-full"
          >
            <span
              aria-hidden
              style={{ background: s.swatch }}
              className={`block size-4 rounded-full ring-offset-2 ring-offset-surface ${
                active === s.id ? "ring-2 ring-ink" : "ring-1 ring-line"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
