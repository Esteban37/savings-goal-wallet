## 1. Phase numbering

- [x] 1.1 Insert Fase 7 (UI contemporánea, títulos únicos, modo oscuro) in `docs/PLAN_EJECUCION.md`, rename today’s Fase 7 → Fase 8 (IA gobernada) and Fase 8 → Fase 9 (documentación y cierre), and verify the ASCII diagram, intro “fases 7–8” sentence, §8 headings, and §13 table all use 7 = this UI change, 8 = IA, 9 = cierre
- [x] 1.2 Update the README phase table and “Fase actual” line so Fase 7 is this UI work (in progress) and IA/cierre are 8/9, and verify no README row still lists “7 | IA gobernada”

## 2. Tokens and scheme resolve

- [x] 2.1 Replace the single `color` export in `mobile/src/shared/ui/tokens` with `palette.light` / `palette.dark` (accent stays brand red in both), keep `spacing` and `type` shared, and verify TypeScript still compiles against a `ColorPalette` (or equivalent) used by both schemes
- [x] 2.2 Add a pure `resolveScheme(preference, osScheme)` (`system` → OS, `light`/`dark` → themselves; missing OS → `light`) under `app/appearance/` with colocated tests, and verify: `system`+`dark` → `dark`; `light`+`dark` OS → `light`; `dark`+`light` OS → `dark`

## 3. Appearance preference and provider

- [x] 3.1 Add persist/load for `{ version: 1, preference }` at AsyncStorage key `sgw.appearance.v1` (Zod; missing/corrupt/unknown → `system`) in `app/appearance/` without importing `features/goals/infrastructure`, and verify colocated tests with the existing AsyncStorage mock: empty storage loads `system`; saving `dark` is read back; `"not-json"` loads `system`
- [x] 3.2 Add `AppearanceProvider` + `useAppearance` / `useThemeTokens` (preference, `resolvedScheme` from `useColorScheme`, `setPreference` that persists) wrapping the tree in `App.tsx` outside the navigator, and verify no RTK appearance slice exists (`rg appearance mobile/src/app/store` is empty of a new slice)
- [x] 3.3 Apply palette colors at render in `GoalListTemplate`, `GoalListItem`, `ProgressBar`, and any other `shared/ui` consumer that today closes over static `color`, and verify none of those files still import a module-scope `color` object for scheme-dependent fills

## 4. Native header and titles

- [x] 4.1 Remove the in-body “Metas de ahorro” heading and extra top SafeArea padding from `GoalListTemplate` (keep row names), keep stack `options.title` as “Metas de ahorro”, and verify `GoalListContainer` tests still find a seeded goal name and `queryByText('Metas de ahorro')` is null on the template/container render
- [x] 4.2 Add a header-right appearance control via stack `screenOptions` (cycle `system` → `light` → `dark` → `system`, `accessibilityLabel` `Apariencia: sistema|claro|oscuro`) on list and detail, and verify the control is registered on `RootNavigator` `screenOptions.headerRight` (not only on one screen)
- [x] 4.3 Theme `NavigationContainer` and `StatusBar` from `resolvedScheme` (light header/status vs dark header/status), and verify `RootNavigator` passes a React Navigation theme derived from `resolvedScheme` rather than the unthemed default only

## 5. List chrome refresh

- [x] 5.1 Refresh list cards (radius, light elevation or hairline, dark fill without a white scaffold border) using existing `GoalListItem` / tokens only — no new Button/Spacer atoms — and verify `mobile/src/shared/ui` still has only the existing atom files plus token/hook changes (`ls mobile/src/shared/ui/atoms` has no new Button)

## 6. Web micro-app appearance and titles

- [x] 6.1 Stop rendering the bootstrapped goal name as a page heading (`h1#goal-name` removed or unused; `app.js` no longer writes `goal.name` into a heading), keep target/deposited/progress and the deposit form, and verify `web/index.html` has no heading whose copy is filled from `goal.name` and `web/app.js` no longer assigns `goal.name` to that heading
- [x] 6.2 Add `html[data-theme="light"|"dark"]` CSS (do not rely on `prefers-color-scheme` for the override) and inject/update `data-theme` from the host via `injectedJavaScript` / `injectJavaScript` when `resolvedScheme` changes, without a new `postMessage` type, and verify `core/contracts` catalog is unchanged (`git diff -- mobile/src/core/contracts` empty) and the detail template/container sets `data-theme` from `resolvedScheme`

## 7. Freeze, coverage, and tests

- [x] 7.1 Confirm `GetGoals`, `MakeDeposit`, `GoalsRepository`, `sgw.goals.v1`, `libreria/`, and the Zod `postMessage` catalog are unchanged, and verify `git diff -- mobile/src/core mobile/src/features/goals/application mobile/src/features/goal-detail/application mobile/src/features/goals/infrastructure/persisted-goal-record.ts libreria` is empty except if a documented no-op was required
- [x] 7.2 Extend `collectCoverageFrom` with `src/app/appearance/**` (exclude barrels) and verify `npm test` from the repository root exits 0 without an emulator, including resolveScheme, appearance persist, and list heading-absence tests

## 8. Device demo

- [x] 8.1 On emulator/device: list header shows “Metas de ahorro” once (not in the list body); header-right control cycles system/light/dark; list and open WebView restyle together; kill/relaunch keeps an explicit dark (or light) choice; with preference system, toggling the OS scheme restyles the app
