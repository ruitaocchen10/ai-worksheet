import { UploadIcon } from "./icons";

/** Students upload too, not just teachers — it's what makes the home page
 *  work for someone with no class at all, which is the case that actually
 *  tests whether anyone does this voluntarily. */
export default function UploadRow() {
  return (
    <section className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-surface p-5 shadow-[0_1px_2px_rgba(20,20,18,0.06)]">
      <span
        aria-hidden
        className="grid size-12 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-ink"
      >
        <UploadIcon className="size-5" />
      </span>
      <p className="min-w-[14ch] flex-1 text-[14.5px] font-semibold">
        Bring your own reading and argue against it.
      </p>
      <button
        type="button"
        className="min-h-12 shrink-0 cursor-pointer rounded-full bg-ink px-6 font-display text-[14px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5"
      >
        Upload a source
      </button>
    </section>
  );
}
