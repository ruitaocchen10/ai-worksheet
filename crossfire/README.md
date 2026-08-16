# Crossfire

An AI debate app for students. Two surfaces, one engine: open practice on the
home page, and graded work inside a class.

Prototype built with Next.js (App Router) and Tailwind CSS v4.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Layout

- `app/` — routes. `page.tsx` is the home page (study mode).
- `components/` — UI, grouped by surface (`home/`, `reasoning/`, `shell/`, `ui/`).
- `lib/data.ts` — typed mock data. This is the contract a real backend would fill.
- `app/globals.css` — the design system: color, type, radius, and breakpoint tokens.

School branding is a single token. Set `data-school` on `<html>` to swap
`--accent`; the functional class colors stay fixed.
