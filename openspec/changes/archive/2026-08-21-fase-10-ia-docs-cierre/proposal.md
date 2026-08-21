## Why

The product loop is complete on Android and iOS Simulator (HU 1–4, persist, appearance, create/delete). What is still missing is **governed AI** in the evaluated packages (`libreria/`, `mobile/`) and a **delivery-grade documentation set**: a root README with architecture named in the open, a `postMessage` catalog, light-mode preview, honest gaps, package READMEs, coverage how-to, and a written record of what AI produced versus what the author defined, rejected, or corrected. Until that lands, the engineering decisions that already freeze the codebase are not fully communicable.

## What Changes

- Close **Fase 10 — IA gobernada** and **Fase 11 — Documentación y cierre** in one change (`docs/PLAN_EJECUCION.md` numbering after iOS was inserted as Fase 9). Do not reopen Metro, contracts, native UI, or feature folders.
- Add **at least one project skill** that encodes a repeatable flow already used in this repo (RTK slice + selector + test, and/or typed `postMessage` handler + Zod + test) under Cursor (`.cursor/skills/`) **in both evaluated packages**.
- Add **at least one agent/subagent** with a clear purpose: architecture-boundary review (domain without RN/Redux, feature `public.ts` only, no unjustified `any`, coverage of core).
- Write `docs/ia/USO_IA.md` (and package pointers): author-owned architecture vs AI-accelerated implementation; Cursor + **Cursor Grok 4.6**; effort varied by phase; **one independent agent per phase**; prompts/skills; **what was rejected or rewritten**.
- Close the **root README** to the Movie Universe documentation shape: badges, **Vista previa** with existing **light-mode** screenshots (`docs/assets/screenshots/`), highlights, implemented table, stack, architecture, how to run (iOS/Android + Node/RN 0.81), tests/coverage, docs index, Uso de IA, Git, author. Do not frame the product as an exam or kata.
- Add supporting docs in English or Spanish consistently with this repo’s existing Spanish product voice: `docs/architecture.md`, `docs/runtime-design.md`, `docs/testing-strategy.md` (plan remains the freeze; these are the readable maps).
- Replace the CLI template `mobile/README.md` and add `libreria/README.md` (install, autolinking, TurboModule API, example, how to test).
- Document how to run tests and see **coverage** for `mobile/` and `libreria/`; keep the ≥70% domain/core gate; fill remaining product-checklist items (TypeScript without unjustified `any` as a documented/verified bar).
- Honest gaps in the README: physical device / TestFlight / App Store, edit-goal, no `web/` tests.

## Capabilities

### New Capabilities

- `ai-governance`: Skills, boundary-review agent, and `docs/ia/USO_IA.md` (with pointers from `mobile/` and `libreria/`) so AI use is governed, repeatable, and auditable.
- `product-documentation`: Root README, preview screenshots, architecture/runtime/testing docs, package READMEs, coverage instructions, and phase-table closure.

### Modified Capabilities

- `rn-savings-notifier`: The library package MUST ship its own README (install, autolinking, typed API, example, tests) and MUST contain the governed-AI artifacts required of evaluated layers (skill and agent under that package tree, or a documented pointer from that tree to the shared skill/agent that applies to it).
- `mobile-host`: The host package MUST ship a product README (not the Community CLI template as the only doc) and MUST contain the same class of governed-AI artifacts as the library. Coverage for the host MUST be runnable and documented from the repo root or the mobile workspace.

## Impact

- **Code:** Minimal. No new features, no `postMessage` types, no native UI. Allowed: Jest coverage scripts/config if the coverage command is missing or unclear; TypeScript `any` cleanup if a scan finds unjustified uses; `.cursor/skills` and `.cursor/agents` (or package-local equivalents).
- **Docs:** Root `README.md`, `docs/architecture.md`, `docs/runtime-design.md`, `docs/testing-strategy.md`, `docs/ia/USO_IA.md`, `docs/PLAN_EJECUCION.md` (F10/F11 closed), `mobile/README.md`, `libreria/README.md`. Preview uses existing light screenshots: `metas-de-ahorro.png`, `nueva-meta.png`, `abonar.png`.
- **APIs / native:** Unchanged.
- **Dependencies:** None. No Expo. No tests in `web/`.
- **Out of scope:** App Store, TestFlight, physical-device signing as merge gate, edit-goal, instrumented native UI tests, rewriting phases 1–9.
