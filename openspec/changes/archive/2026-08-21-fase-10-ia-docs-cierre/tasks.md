## 1. Governed AI artifacts

- [x] 1.1 Add canonical Cursor skill `typed-postmessage-handler` at `.cursor/skills/typed-postmessage-handler/SKILL.md` (Zod envelope, discriminated union or typed error, Jest cases) and mirror the **same file body** to `mobile/.cursor/skills/typed-postmessage-handler/SKILL.md`, then verify both files exist and describe that flow rather than a generic “write code” prompt
- [x] 1.2 Add canonical Cursor skill `turbomodule-js-wrapper-test` at `.cursor/skills/turbomodule-js-wrapper-test/SKILL.md` and mirror it to `libreria/.cursor/skills/turbomodule-js-wrapper-test/SKILL.md`, then verify the library tree contains a skill that encodes typed wrappers + mocked TurboModule tests
- [x] 1.3 Add optional `rtk-slice-selector-test` skill at repo `.cursor/skills/` and mirror it under `mobile/.cursor/skills/`, then verify `mobile/` has at least one skill (postMessage and/or RTK)
- [x] 1.4 Add agent `architecture-boundary-reviewer` at `.cursor/agents/architecture-boundary-reviewer.md` (domain without RN/Redux, `public.ts` only across features, no unjustified `any`, coverage ≥70%, do not implement new HUs) and mirror it to `mobile/.cursor/agents/` and `libreria/.cursor/agents/`, then verify all three paths exist
- [x] 1.5 Write `docs/ia/USO_IA.md` in Spanish following the Movie Universe AI-usage shape: author-owned architecture (Clean Architecture feature-first, Container-Presenter, factory DI + RTK `extraArgument`, immersive/atomic pragmatic); Cursor + Cursor Grok 4.6; effort varied by phase; independent agent per phase; Context7; phase↔branch table; human vs AI table; at least three concrete rejections (Expo, vendoring native into `mobile/`, confirm-in-web vs `DEPOSIT_REQUESTED`, IoC, RN `Alert`, `android_asset` on iOS, empty atoms — pick the real ones); no exam/kata wording; then verify the file exists and package READMEs (once written) can link `../docs/ia/USO_IA.md`

## 2. Coverage and TypeScript bar

- [x] 2.1 Add `test:coverage` scripts (`jest --coverage`) on `mobile/` and `libreria/`, wire root `"test:coverage"` to both workspaces, and add `libreria` Jest `collectCoverageFrom` for `src/**/*.ts` excluding tests with ≥70% lines/functions on that set, then verify `npm run test:coverage` from the repo root exits 0 without an emulator
- [x] 2.2 Search domain, `postMessage` contracts, slices, and use cases for `any`; remove or comment-justify each hit, then verify `rg "\bany\b" mobile/src/core mobile/src/features/*/application mobile/src/features/*/store --glob '*.ts'` shows no unjustified `any`
- [x] 2.3 Confirm `npm test` still exits 0 from the repo root and that `web/` still has no test runner

## 3. Package READMEs

- [x] 3.1 Replace `mobile/README.md` with a host README (Metro, `npm run android` / `npm run ios` from repo root, tests + coverage, pointer to root architecture and `docs/ia/USO_IA.md`) and verify it is not solely the Community CLI template
- [x] 3.2 Add `libreria/README.md` covering workspace install, autolinking, TurboModule API (`notifyGoalCompleted`, `notifyGoalCreated`, `showConfirmDialog`), example, how to test, never copy native into `mobile/`, and a link to `docs/ia/USO_IA.md`, then verify those sections are present

## 4. Root README and engineering docs

- [x] 4.1 Reorder root `README.md` to the Movie Universe shape: badges, intro, **Vista previa** with light screenshots `docs/assets/screenshots/metas-de-ahorro.png`, `nueva-meta.png`, `abonar.png` (list / create / deposit), highlights, implemented + phase tables with F10/F11 done, stack, architecture with named patterns, how to run, `postMessage` catalog, tests/coverage including `npm run test:coverage`, docs index, Uso de IA, honest gaps (edit-goal, App Store/TestFlight/device, no `web/` tests, no instrumented Toast tests), Git, author; then verify Vista previa is above Destacados and does not use dark-mode assets
- [x] 4.2 Add `docs/architecture.md` (layers, features, DI, Container-Presenter, TurboModule, atomic-pragmatic) citing the plan as freeze, then verify the root docs index links it
- [x] 4.3 Add `docs/runtime-design.md` (bridge catalog, store/`extraArgument`, persistence, WebView `file://`, notifier at runtime) and verify it links from the root docs index
- [x] 4.4 Add `docs/testing-strategy.md` (domain/parser/use cases/slice/container/library JS; no `web/` tests; coverage commands and 70% gate) and verify it links from the root docs index
- [x] 4.5 Optionally add a short root `AGENTS.md` with import-boundary rules pointing at the plan, then verify it does not contradict `docs/architecture.md` if created

## 5. Plan closure

- [x] 5.1 Update `docs/PLAN_EJECUCION.md` intro, §8 F10/F11, §10 demo “IA gobernada”, §11 checklist (skills/agent, coverage, TS, README), and §13 table so this change `fase-10-ia-docs-cierre` is the vehicle and F10/F11 are no longer “pending future changes”, then verify no row still says IA/docs are unscoped
- [x] 5.2 Confirm no fourth feature, no Expo, no new runtime npm dependencies, and no `web/` tests, then verify `ls mobile/src/features` is still `goals`, `goal-detail`, `notifications` and `npm test` from the repo root exits 0
