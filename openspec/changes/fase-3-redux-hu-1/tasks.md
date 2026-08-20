## 1. Dependencies

- [x] 1.1 Add `@reduxjs/toolkit` and `react-redux` to the `mobile` workspace (`npm install @reduxjs/toolkit react-redux -w mobile` from the repo root) and verify `mobile/package.json` lists both and the install exits 0
- [x] 1.2 Add `@testing-library/react-native` as a `mobile` devDependency, choosing a release that supports React Native 0.81 and React 19, and verify `npm test -w mobile -- --listTests` still exits 0

## 2. Composition root (DI + store)

- [x] 2.1 Add `createSeededGoalsRepository()` in `mobile/src/features/goals/infrastructure` that constructs `InMemoryGoalsRepository` with the three frozen seed goals (`goal-vacaciones` 100000/25000, `goal-emergencia` 1000000/0, `goal-bici` 800000/200000) and verify a small colocated test lists those ids and percents (25, 0, 25)
- [x] 2.2 Implement `AppDependencies` and `createAppDependencies()` (`repository`, `getGoals`, `makeDeposit`, `goalNotifier`, `confirmDialog`) using the seeded repository, existing use-case factories, `NoopGoalNotifier`, and `AlwaysConfirmDialog`, then verify TypeScript compiles and presentation files are not imported from `di/`
- [x] 2.3 Implement `createAppStore(deps)` with `configureStore`, the goals reducer slot, and `thunk.extraArgument = deps` (typed `RootState` / `AppDispatch` / `AppThunk`); leave listener middleware as a no-op, then verify a smoke test can `dispatch` a no-op and `getState()` is a plain object
- [x] 2.4 Confirm `createAppListenerMiddleware` is still unused by the store (no HU 4 listeners) and verify `rg "createListenerMiddleware|depositApplied" mobile/src/app` does not register a notifications listener

## 3. Goals slice and selectors

- [x] 3.1 Add `GoalSnapshot`, `toGoalSnapshot`, and the `goals` slice (`idle|loading|succeeded|failed`, `fetchGoals` thunk via `extra.getGoals`, `depositApplied` reducer) under `mobile/src/features/goals/store`, then verify colocated slice tests: fulfilled load writes three serializable snapshots, `depositApplied` updates deposited/percent for one id, and `JSON.parse(JSON.stringify(state))` succeeds
- [x] 3.2 Add `selectGoalRows` (name, integer amounts, progress percent, completed) and verify a colocated selector test with fixture snapshots `inputX` / `expectedX` (include 25% and 0%)
- [x] 3.3 Re-export store public pieces from `features/goals/store/index.ts` and verify the slice module does not import React Native or `rn-savings-notifier`

## 4. Shared UI and list presentation

- [x] 4.1 Fill `shared/ui/tokens` (color, spacing, type) and atoms `MoneyText` (whole pesos, `es-CO` grouping, no fraction) and `ProgressBar` (0–100), then verify a small `MoneyText` test renders a grouped integer (for example 25000) without a decimal part
- [x] 4.2 Implement `GoalListItem` (feature molecule), `GoalListTemplate`, `GoalListPresenter` (props only, `onGoalPress` optional), and `GoalListContainer` (select + `dispatch(fetchGoals)` on mount, `onGoalPress` no-op), then verify the presenter/container do not import adapters, `MakeDeposit`, or `parseBridgeMessage`
- [x] 4.3 Export `GoalListContainer` from `features/goals/public.ts` and verify `App.tsx` (once wired) can import it only from `public.ts`, not from `presentation/` internals
- [x] 4.4 Add an RNTL test that wraps `GoalListContainer` in `Provider` with `createAppStore(fakeDeps)` whose `getGoals` returns the seed snapshots, then verify the test finds the name `Vacaciones` and `25` (percent) without an emulator

## 5. Launch screen

- [x] 5.1 Change `App.tsx` to `Provider` + `SafeAreaProvider` + `GoalListContainer`, keep `notifyGoalCompleted` on mount, remove the launch WebView, and verify `App.tsx` no longer imports `react-native-webview` or loads `file:///android_asset/web/index.html`
- [x] 5.2 Update `mobile/__tests__/App.test.tsx` for the list host (keep the `rn-savings-notifier` mock; drop the WebView mock if unused) and verify `npm test -w mobile -- App.test.tsx` passes
- [x] 5.3 Confirm the Android Gradle/asset copy of `web/` is unchanged and verify `git diff main -- mobile/android` has no deletion of the web asset mapping (or is empty if Android files were never touched)

## 6. Coverage and freeze

- [x] 6.1 Extend `mobile/jest.config.js` `collectCoverageFrom` with `src/features/goals/store/**` and `src/app/store/**` (exclude listener placeholder / barrels) without putting presentation into the global 70% gate, then verify `npm test -w mobile -- --coverage --coverageReporters=text-summary` still meets 70% on the collected set
- [x] 6.2 Confirm `web/index.html`, `web/app.js`, and `core/` domain/parser files are unchanged (no MakeDeposit UI, no bridge parser in App) and verify `git diff main -- web mobile/src/core` is empty except if a task above required a documented no-op
- [x] 6.3 Run `npm test` from the repository root and verify it exits 0 (domain tests, slice/selector, RNTL list, App render) without starting an emulator
