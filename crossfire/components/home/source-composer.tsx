"use client";

import { useRef, useState } from "react";
import { classes, propositionsFor, type CustomSource, type GeneratedProposition } from "@/lib/data";
import SidePicker from "@/components/home/side-picker";
import { UploadIcon, LinkIcon, TextIcon, DocIcon, ArrowRightIcon } from "@/components/ui/icons";

/**
 * Source first, proposition second. The home screen used to open on one
 * pre-chosen debate, which made the app feel like a thing that hands you
 * homework. Opening on "what are we arguing about" hands the choice back —
 * but the source is the first field rather than an afterthought, because a
 * debate with no text behind it is the generic argue-with-a-chatbot product
 * we're trying not to be.
 *
 * The class chips are the everyday path. Uploading is the powerful one but
 * nobody has a PDF handy on a Tuesday, and a surface that only works when
 * you've brought something dies on the days you haven't.
 */

type Mode = "file" | "link" | "text";
type Stage = "pick" | "reading" | "choose";

const MODES: { key: Mode; label: string; Icon: typeof LinkIcon }[] = [
  { key: "file", label: "Upload", Icon: UploadIcon },
  { key: "link", label: "Link", Icon: LinkIcon },
  { key: "text", label: "Paste", Icon: TextIcon },
];

/** Trims a URL down to what a person would say out loud. */
function hostOf(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 40);
  }
}

export default function SourceComposer() {
  const [mode, setMode] = useState<Mode>("file");
  const [link, setLink] = useState("");
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>("pick");
  const [source, setSource] = useState<CustomSource | null>(null);
  const [props, setProps] = useState<GeneratedProposition[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  /** Stands in for upload + the model call. Real work replaces the timer. */
  function submit(next: CustomSource) {
    setSource(next);
    setStage("reading");
    setChosen(null);
    setTimeout(() => {
      setProps(propositionsFor(next));
      setStage("choose");
    }, 900);
  }

  function reset() {
    setStage("pick");
    setSource(null);
    setChosen(null);
    setLink("");
    setText("");
  }

  const ready = mode === "file" ? true : mode === "link" ? link.trim().length > 3 : text.trim().length > 40;

  return (
    <section
      aria-labelledby="composer-heading"
      className="mt-8 rounded-lg bg-surface p-5 shadow-[0_2px_10px_rgba(20,20,18,0.05)] nav:p-7"
    >
      <span className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-accent-ink uppercase">
        New debate
      </span>

      <h1
        id="composer-heading"
        className="mt-4 max-w-[17ch] font-display text-[31px] leading-[1.12] font-bold tracking-[-0.02em] nav:text-[40px]"
      >
        What are we arguing about?
      </h1>

      {stage === "pick" ? (
        <>
          <p className="mt-3 max-w-[46ch] text-[14.5px] leading-relaxed text-muted">
            Bring a reading, an article, or a chapter. Crossfire finds the claims in it worth
            fighting over — and holds you to the text while you do.
          </p>

          {/* Mutually exclusive ways in, so a radiogroup rather than tabs:
              picking one doesn't reveal a panel, it changes what you fill in. */}
          <div
            role="radiogroup"
            aria-label="How to bring your source"
            className="mt-6 flex gap-2 rounded-full bg-ground p-1"
          >
            {MODES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={mode === key}
                onClick={() => setMode(key)}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-[13.5px] font-bold transition-colors ${
                  mode === key ? "bg-surface text-ink shadow-[0_1px_3px_rgba(20,20,18,0.10)]" : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {mode === "file" && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) submit({ kind: "file", label: f.name, detail: "Your upload" });
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line bg-ground px-4 text-center hover:border-accent"
                >
                  <span aria-hidden className="grid size-11 place-items-center rounded-full bg-sage-soft text-sage-ink">
                    <DocIcon className="size-5" />
                  </span>
                  <span className="text-[14.5px] font-bold">Choose a file</span>
                  <span className="text-[12.5px] font-semibold text-muted">PDF, Word, slides, or plain text</span>
                </button>
              </>
            )}

            {mode === "link" && (
              <label className="block">
                <span className="sr-only">Link to an article or page</span>
                <input
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://…"
                  className="min-h-[52px] w-full rounded-card bg-ground px-4 text-[15px] font-semibold placeholder:font-normal placeholder:text-muted"
                />
              </label>
            )}

            {mode === "text" && (
              <label className="block">
                <span className="sr-only">Paste the passage you want to argue with</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  placeholder="Paste a passage — a paragraph is enough."
                  className="w-full resize-y rounded-card bg-ground p-4 text-[15px] leading-relaxed placeholder:text-muted"
                />
              </label>
            )}
          </div>

          <button
            type="button"
            disabled={!ready || mode === "file"}
            onClick={() =>
              mode === "link"
                ? submit({ kind: "link", label: hostOf(link), detail: "Link" })
                : submit({ kind: "text", label: "Pasted passage", detail: `${text.trim().split(/\s+/).length} words` })
            }
            className={`mt-4 inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-display text-[14.5px] font-bold text-white transition-transform duration-150 ${
              !ready || mode === "file"
                ? "cursor-not-allowed bg-ink/25"
                : "cursor-pointer bg-ink hover:-translate-y-0.5"
            }`}
          >
            Find the arguments
            <ArrowRightIcon className="size-4" />
          </button>

          <div className="mt-6 border-t border-line-soft pt-5">
            <h2 className="text-[12.5px] font-bold tracking-[0.04em] text-muted uppercase">
              Or use class material
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {classes.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => submit({ kind: "class", label: c.name, detail: "Class material" })}
                    className="min-h-11 cursor-pointer rounded-full bg-ground px-4 text-[13.5px] font-bold hover:bg-accent-soft hover:text-accent-ink"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-ground px-3.5 py-2 text-[13px] font-bold">
              <DocIcon className="size-4 shrink-0 text-muted" />
              <span className="truncate">{source?.label}</span>
              {source?.detail && (
                <span className="shrink-0 font-semibold text-muted">· {source.detail}</span>
              )}
            </span>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 cursor-pointer rounded-full px-1 text-[13px] font-semibold text-muted hover:text-ink"
            >
              Use something else
            </button>
          </div>

          {stage === "reading" ? (
            <div className="mt-5" aria-live="polite">
              <p className="text-[14.5px] font-semibold text-muted">Reading your source…</p>
              <ul className="mt-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <li
                    key={i}
                    aria-hidden
                    className="h-[76px] animate-pulse rounded-card bg-ground"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-5" aria-live="polite">
              <h2 className="text-[12.5px] font-bold tracking-[0.04em] text-muted uppercase">
                Three claims worth fighting over
              </h2>

              <ul className="mt-3 space-y-3">
                {props.map((p) => {
                  const open = chosen === p.id;
                  return (
                    <li key={p.id}>
                      {/* The excerpt rides with the proposition rather than
                          appearing after you commit — you should be able to
                          see what you're being held to before you pick. */}
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setChosen(open ? null : p.id)}
                        className={`w-full cursor-pointer rounded-card p-4 text-left transition-colors ${
                          open ? "bg-accent-soft" : "bg-ground hover:bg-line-soft"
                        }`}
                      >
                        <span className="block font-display text-[17px] leading-snug font-bold">
                          {p.text}
                        </span>
                        <span className="mt-2 block font-source text-[14.5px] leading-relaxed text-ink/75 italic">
                          {p.excerpt}
                        </span>
                      </button>

                      {open && (
                        <div className="mt-3">
                          <SidePicker source={source!} proposition={p} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
