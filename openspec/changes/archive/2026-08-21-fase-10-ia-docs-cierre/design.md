## Context

See `proposal.md` for motivation and the delta specs under `specs/` for behavior. Fases 1–9 are archived: the host runs the full loop on Android and iOS Simulator. Root `README.md` already sketches architecture and AI, but the preview table sits in the wrong place, `mobile/README.md` is still the CLI template, `libreria/` has no README, `docs/ia/` does not exist, and there are no package-local skills/agents. Root `npm test` does not collect coverage. Architecture stays the freeze in `docs/PLAN_EJECUCION.md`: feature-first, factory DI + RTK `extraArgument`, TurboModule in `libreria/`, no Expo, no `web/` tests.

Constraints: TypeScript strict; no new npm runtime dependencies; no product-feature work; Spanish product voice (same as the current README and plan). Do not mention exams, katas, or homework in any public doc.

## Goals / Non-Goals

**Goals:**

- Governed AI artifacts that a reviewer can find in `mobile/` and `libreria/`, plus a canonical `docs/ia/USO_IA.md`.
- Delivery README/docs shaped like [Movie Universe](https://github.com/Esteban37/movie-universe-app/blob/main/README.md): Vista previa with the existing **light** screenshots, named architecture, `postMessage` catalog, tests/coverage, Uso de IA, honest gaps.
- Close Fase 10 and Fase 11 in the plan as this change.

**Non-Goals:**

- New user stories, native UI, or `postMessage` types.
- App Store / TestFlight / device signing as merge gate.
- Golden tests, Detox, or a `web/` test suite.
- Changing which model ran on historical PRs; the AI-usage doc records Cursor Grok 4.6 and per-phase independent agents as the working method of this repository.

## Decisions

### 1. One OpenSpec change covers plan Fases 10 and 11

Keep `docs/PLAN_EJECUCION.md` numbering (F9 = iOS already archived). This change is `fase-10-ia-docs-cierre`: IA gobernada + documentación/cierre. Branch `feat/fase-10-ia-docs-cierre`. Do not split into two PRs unless a later review asks; the remaining checklist is documentary and tooling, not two product increments.

**Alternatives considered:** Two changes (`fase-10-ia-gobernada` then `fase-11-docs-cierre`) — matches the original plan vehicles, but the user asked to propose both together and they share the same README/USO_IA surface. Renumber back to “Fase 9 IA / Fase 10 docs” — would contradict the archived iOS change.

### 2. Canonical skills/agents at repo `.cursor/`, mirrored into evaluated packages

Cursor loads project skills from the repository `.cursor/skills/`. Put the **canonical** skill and agent there so apply/review actually uses them, then **mirror** (same `SKILL.md` / agent markdown, not a stub that says “see root”) under:

```
mobile/.cursor/skills/<name>/SKILL.md
libreria/.cursor/skills/<name>/SKILL.md
mobile/.cursor/agents/<name>.md
libreria/.cursor/agents/<name>.md
```

Package-specific skills (minimum one per evaluated package):

| Package | Skill | Repeatable flow |
| --- | --- | --- |
| `mobile/` | `typed-postmessage-handler` | Parse `unknown` with the Zod envelope → discriminated union or typed error → Jest cases (valid, extra type, bad JSON) |
| `mobile/` (optional second) | `rtk-slice-selector-test` | Slice + selector + test using domain snapshots, no I/O in the reducer |
| `libreria/` | `turbomodule-js-wrapper-test` | Typed JS wrapper calling the spec + Jest with TurboModule mocked |

Shared agent `architecture-boundary-reviewer`: fail on `core/domain` importing RN/Redux; feature internals imported across features; unjustified `any` in domain/contracts/slices/use cases; domain+use-case coverage below 70%. The agent MUST NOT implement new HUs.

Root `.cursor/skills/` MAY hold the same files so a monorepo session sees them without opening a nested folder.

**Alternatives considered:** Only root `.cursor/` (Cursor-friendly, fails “in the evaluated layers”). Only `docs/ia/` without skills (fails the skill/agent requirement). Claude `.claude/` folders (this repo uses Cursor).

### 3. `docs/ia/USO_IA.md` is the Movie Universe AI-usage document, adapted

Structure after [ai-usage.md](https://github.com/Esteban37/movie-universe-app/blob/main/docs/ai-usage.md), in Spanish:

- Summary: SDD + OpenSpec; AI accelerates inside a contract the author set.
- Author-owned architecture (from the initial explore mandate, named in the plan): Clean Architecture feature-first; cross-feature decoupling for integral teams; Container-Presenter; explicit DI (no IoC container); DI via Redux Toolkit `extraArgument` + listener middleware; immersive templates; atomic design only where reused.
- Why SDD + OpenSpec; Context7 for current RN / Metro / library docs.
- Tooling table: **Cursor** + **Cursor Grok 4.6**; **effort varied by phase** (higher for architecture/UI fidelity and iOS native, more contained for scaffolding/tests); **one independent agent per phase** (separate apply on `feat/<change-name>`, not a single unbounded chat across all HUs).
- Phase ↔ branch ↔ PR table for Fases 1–9 (archived) and this change.
- Human vs AI responsibility table (architecture, merge, rejections = human).
- **Rejections / corrections** (required): at least Expo vs CLI; vendoring native into `mobile/`; confirming the deposit in the web vs `DEPOSIT_REQUESTED` + `MakeDeposit`; IoC vs factory+`extraArgument`; RN `Alert` vs TurboModule; iOS loading `android_asset`; empty atomic `Button`/`Spacer` wrappers.
- Verification gate: `tasks.md` alignment, `npm test`, coverage, Android/iOS smoke, author merge.

Root README **Uso de IA** stays a short pointer; detail lives in `docs/ia/USO_IA.md`. Package READMEs link that file (relative `../docs/ia/USO_IA.md`).

**Alternatives considered:** English-only `docs/ai-usage.md` (breaks this repo’s Spanish surface). Claiming skills were unused until Fase 10 (the doc should state that OpenSpec skills/commands governed apply from Fase 1, and that Fase 10 **materializes** the evaluated-layer copies plus the written record).

### 4. Root README layout matches Movie Universe; preview is light-mode only

Reorder the root README to:

1. Title + badges  
2. Short product intro (workspaces table)  
3. **Vista previa** — three-column table, light screenshots already in `docs/assets/screenshots/` (`metas-de-ahorro.png`, `nueva-meta.png`, `abonar.png`). Caption list / create / deposit. Do not add dark-mode shots.  
4. Destacados  
5. Funcionalidades (implemented complete; phase table with 10–11 done)  
6. Stack  
7. Arquitectura (diagram + named patterns; link `docs/architecture.md`)  
8. Cómo ejecutar (Node 20+, RN 0.81.6, JDK 17, Xcode; `npm test` and `npm run test:coverage`)  
9. Catálogo `postMessage` (full table from the plan)  
10. Documentación index  
11. Uso de IA (short) + gaps honestos  
12. Git + autor  

Add `docs/architecture.md`, `docs/runtime-design.md`, `docs/testing-strategy.md` as readable maps; do not fork a second source of truth — they MUST cite the plan for frozen decisions. Optional short root `AGENTS.md` with layer import rules (Movie Universe pattern); if added, keep it short and point at the plan.

Replace `mobile/README.md` with a host-focused page (Metro, Android, iOS, tests/coverage, pointer to root). Add `libreria/README.md` (workspace install, autolinking, TurboModule vs NativeModule one-liner, API, example, Jest with mocked module, “never copy into mobile”).

**Alternatives considered:** Keep screenshots where they are today (after the phase table — easy to miss). Invent dark screenshots (user asked light). Duplicate the entire plan into the README (unmaintainable).

### 5. Coverage scripts without new test frameworks

Root:

```json
"test:coverage": "npm run test:coverage -w mobile && npm run test:coverage -w libreria"
```

`mobile`: `jest --coverage` (thresholds already ≥70% on `collectCoverageFrom`). `libreria`: add `test:coverage` and a Jest `collectCoverageFrom` for `src/**/*.ts` excluding tests, with a reasonable wrapper threshold (lines/functions ≥70% on the JS API). Document both commands in READMEs. No Cypress, no Detox.

Scan domain, contracts, slices, and use cases for `any`; remove or comment-justify. Do not weaken `strict`.

**Alternatives considered:** Publishing coverage HTML in CI (nice-to-have, not required). Lowering the 70% gate (forbidden by the plan).

### 6. Plan and checklist closure

Update `docs/PLAN_EJECUCION.md` §8 (F10/F11 **Estado: this change**), §11 checklist boxes for skills/agent, coverage, TS, README, and §13 table row 10–11 → `fase-10-ia-docs-cierre`. Intro sentence that currently says “fases 10–11 se proponen como changes aparte” MUST be updated.

## Risks / Trade-offs

- **[Risk] Duplicated skills drift between root and packages** → Mitigation: identical file bodies; tasks say “copy, do not summarize”; USO_IA.md names the canonical path.
- **[Risk] Nested `.cursor/` ignored by Cursor UI** → Mitigation: keep canonical copies at repo `.cursor/` so the agent actually loads them; package copies satisfy the evaluated-layer inspection.
- **[Risk] USO_IA.md reads as a recap of an assignment** → Mitigation: product language only; same professional tone as Movie Universe AI usage.
- **[Risk] Coverage script fails on libreria with no collectCoverageFrom** → Mitigation: add Jest coverage config in `libreria/` in this change.
- **[Trade-off] One PR for two plan phases** → Smaller review than a product HU; docs and IA are the same delivery surface.
- **[Trade-off] Mirroring skills vs a single root folder** → Duplication is the cost of making `libreria/` and `mobile/` self-contained for review.

## Migration Plan

Docs and Cursor files only. No native rebuild required. Rollback is revert of the docs/config commit. After merge, the next “phase” is archive of this change (`/opsx-archive`), not a new product increment.

## Open Questions

None. Screenshot set, model name, per-phase independent agents, and README shape are fixed by the request and the existing assets.
