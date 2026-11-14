# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The public website for Prognova AI, a small medical language model that reads a patient's verified
hospital and lab records and answers only with a citation to the exact line. The reference site is
https://www.prognova.ai/. All of its copy, data tables and global strings are already collected in
`CONTENT-INVENTORY.md`; start there, do not re-scrape the live site. The "Eighteen months, three
gates" plan section is to be restored (it is in the inventory but not on the live page).

Behind the page sits a fixed Three.js "sky" (`src/components/three/Brain.tsx`): a point-cloud brain
from `public/brain.bin` that fills the hero's right half, takes a stream of small glyphs, ripples under
the pointer, and over the last stretch of the hero scroll gathers, flashes and bursts into stars that
settle into one star above the contact band. The hero, the "Ask in plain words" chat section and the
contact band are transparent so the sky shows through; every other section paints its own ground.

The previous attempt lives in `D:\NAMAN\Website` (sibling folder, Vite + React, teal palette). It is
reference only; do not edit it.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # tsc -b, then vite build into dist/
npm run preview    # serve dist/
```

There are no tests or linters configured. `npm run build` is the type check.

For browser verification use the preview tooling with the launch config in `.claude/launch.json`
(configuration name `dev`), not a Bash-started server.

## Stack

- Vite 8, React 19, TypeScript (strict, `noEmit`, bundler resolution). Entry is `index.html` →
  `src/main.tsx` → `src/App.tsx`.
- Animation: `motion` (Motion for React; import from `motion/react`; this is the current name of
  framer-motion, never add `framer-motion`) and `gsap` with `@gsap/react` (`useGSAP`). Wrap the app
  in `MotionConfig reducedMotion="user"` and honour reduced motion in GSAP too; the reference site
  does.
- No CSS framework. Fonts must be self-hosted (the reference site makes no third-party requests and
  its privacy page promises this).

## Skills and MCP in this repo

- `.claude/skills/design-taste-frontend`: tasteskill 2.5 (anti-slop). Use it when building or
  reviewing any page. It needs Node 22+ and Chrome; both are installed on this machine. Its Stop
  hook runs a finish gate once a build has started under `.taste-skill/`.
- `.claude/skills/motion`: Motion best practices, docs search, performance audit.
- `.mcp.json`: Motion MCP servers (`motion`, `motion-plus`; the plus one needs sign-in).

## Content rules carried from the reference

- British spelling (haemoglobin, digitising, licence). Plain declarative sentences, no marketing
  adjectives.
- Every clinical example is fictional and must say so. Keep the disclaimer string verbatim:
  "Prognova is assistive technology under development. It does not diagnose and holds no regulatory
  clearance. Every clinical example on this site is fictional."
- Benchmark and traction numbers go stale; keep all copy and figures in one content module (the old
  repo used `src/content.ts`) so they are edited in one place.
- The only contact channel is hello@prognovahealth.com. There are no prices, team, partners or
  testimonials; do not invent any.
