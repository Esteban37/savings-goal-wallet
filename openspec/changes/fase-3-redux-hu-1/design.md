## Context

See `proposal.md` for motivation and `specs/goals-list/spec.md` plus `specs/mobile-host/spec.md` for behavior. Fase 2 is archived: `GetGoals`, `MakeDeposit`, `InMemoryGoalsRepository` (test fake), and domain types exist; `createAppDependencies` returns `{}`; `createAppStore` returns `null`; `App.tsx` is still the Fase 1 WebView. Architecture for this phase is frozen in `docs/PLAN_EJECUCION.md` §§2.3–2.6 and §8 (Fase 3).

Constraints: TypeScript strict, RN 0.81 / React 19, no Expo, no navigation library, no persistence package. Reducers stay pure and serializable. Presentation does not instantiate adapters.

## Goals / Non-Goals

**Goals:**

- Make the composition root a real RTK store with `thunk.extraArgument = dependencies`.
- Ship HU 1: native list of 2–3 seeded goals (name, target, deposited, %) from that store.
- Prove Container-Presenter with reducer/selector tests plus one RNTL list test.
- Leave a `depositApplied` reducer so Fase 4 can update the same snapshots without reshaping the slice.

**Non-Goals:**

- Loading the WebView, `parseBridgeMessage`, or `injectJavaScript` (Fase 4).
- Dispatching `MakeDeposit` from UI (the use case may be constructed in DI unused).
- Registering notification listeners or real Toast/dialog adapters (Fase 5).
- AsyncStorage (Fase 6).
- A navigation stack or a second launch screen.

## Decisions

### 1. Launch screen is the list; WebView leaves `App.tsx`

Replace the full-screen WebView in `App.tsx` with `Provider` + `SafeAreaProvider` + the public `GoalListContainer`. Keep `notifyGoalCompleted('scaffold')` (or equivalent) on mount so the existing library-import requirement still holds. Do **not** keep the WebView as an auxiliary screen (that would imply navigation). Do **not** remove the Gradle copy of `web/` into Android assets.

Delete the WebView JSX from `App.tsx`. Fase 4 will add `ImmersiveWebViewTemplate` under `goal-detail`; copying the Fase 1 snippet forward is cheaper than maintaining a dead screen.

**Alternatives considered:** Keep WebView behind a hidden route (needs a navigator, forbidden this phase). Dual screens without navigation (no way to switch). Leave WebView as launch (fails HU 1 closure).

### 2. Serializable `GoalSnapshot` in the slice, not `SavingsGoal` class instances

RTK `serializableCheck` must stay on. Domain classes (`SavingsGoal`, `Money`) are not serializable.

```ts
type GoalSnapshot = {
  id: string;
  name: string;
  targetAmount: number;
  depositedAmount: number;
  progressPercent: number;
  isCompleted: boolean;
};
```

Map in the feature store layer (`toGoalSnapshot(goal: SavingsGoal)`), not in `core/domain`. Slice state: `{ status: 'idle' | 'loading' | 'succeeded' | 'failed'; items: GoalSnapshot[]; error: string | null }`. Plain array (three items); do not add `createEntityAdapter` unless mapping becomes painful.

`fetchGoals` thunk: `extra.getGoals()`, then map `ok` → snapshots. Container dispatches it on mount. Do **not** call `repository.list()` from presentation.

`depositApplied` reducer: replace the matching `id` with a new snapshot (deposited, percent, completed). Not dispatched this phase. Unit-test it so the “same store, no reload” spec is already true for Fase 4.

**Alternatives considered:** Store class instances (breaks serializableCheck / DevTools). Normalize with entity adapter (overhead for n=3). Omit `depositApplied` until Fase 4 (would reopen the slice contract).

### 3. DI factory owns adapters; thunks read use cases from `extra`

`createAppDependencies()` returns a typed `AppDependencies`:

| Field | Fase 3 implementation |
| --- | --- |
| `repository` | Seeded in-memory adapter (see decision 4) |
| `getGoals` | `createGetGoals({ repository })` |
| `makeDeposit` | `createMakeDeposit({ repository })` — constructed, not called from UI |
| `goalNotifier` | existing `NoopGoalNotifier` |
| `confirmDialog` | existing `AlwaysConfirmDialog` |

`createAppStore(deps)`: `configureStore` with `goalsReducer`, `middleware` default plus `thunk.extraArgument = deps`. Typed `RootState`, `AppDispatch`, and `AppThunk` that know `extra: AppDependencies`. Listener middleware stays a no-op placeholder (`createAppListenerMiddleware` may remain `null`); do not register HU 4 listeners.

Presentation imports containers from `features/goals/public.ts` only. Tests use `createAppStore(fakeDeps)` (or a thin `createTestStore`) with a fake `getGoals`.

**Alternatives considered:** Import adapters inside thunk files (breaks extraArgument DI). IoC container (plan freeze). Skip wiring `makeDeposit` until Fase 4 (then extra’s shape changes mid-product).

### 4. Production seed in `features/goals/infrastructure`; test fake stays in `core/`

Keep `core/application/ports/fakes/InMemoryGoalsRepository` for use-case tests (GetGoals / MakeDeposit must not import feature infrastructure). Add `createSeededGoalsRepository()` in `features/goals/infrastructure` that constructs that same class with three `SavingsGoal` instances.

Frozen seed (must include the spec’s 25% and 0% cases):

| id | name | target | deposited | % |
| --- | --- | --- | --- | --- |
| `goal-vacaciones` | Vacaciones | 100000 | 25000 | 25 |
| `goal-emergencia` | Fondo de emergencia | 1000000 | 0 | 0 |
| `goal-bici` | Bicicleta | 800000 | 200000 | 25 |

Amounts are whole COP. Do not seed a completed goal (HU 4). `core/` MUST NOT import this seed.

**Alternatives considered:** Move the class into infrastructure and change Fase 2 tests (cross-feature imports from `goal-detail` tests). Duplicate the Map implementation (two sources of truth). Seed only two goals (allowed by spec, but three matches the plan’s “2–3”).

### 5. Container-Presenter + atomic minimum

```
App → GoalListContainer → GoalListPresenter → GoalListTemplate
                                              → GoalListItem (feature molecule)
```

- Container: `useAppSelector(selectGoalRows)`, `dispatch(fetchGoals())` on mount, passes view-models and an `onGoalPress` no-op (must not navigate).
- Presenter: no store, no fetch, no ports. Props already formatted for display (`progressPercent`, integer amounts).
- Template: header + list (FlatList). Safe area via `react-native-safe-area-context` (already in `mobile`).
- `shared/ui/tokens`: color, spacing, type (minimal; not a Davivienda design system).
- `shared/ui/atoms`: `MoneyText` (whole pesos, `es-CO` grouping, no fractional part) and `ProgressBar` (0–100). No `Button` / `Spacer` atoms.
- `GoalListItem` lives in `features/goals` (single consumer).
- Copy in Spanish, hardcoded (no i18n package).

`features/goals/public.ts` re-exports `GoalListContainer` (and types if App needs them). App MUST NOT import `presentation/` internals.

**Alternatives considered:** Container-only screens (harder presenter tests). Shared `GoalListItem` atom (only one consumer). Press → console.log navigation fake that later becomes a stack (still a fake nav API; no-op is clearer).

### 6. Dependencies and tests

Add to the `mobile` workspace: `@reduxjs/toolkit`, `react-redux`, `@testing-library/react-native`. Do not add React Navigation. Align RNTL with RN 0.81 / React 19 at apply time (`npm view`).

Tests (fixtures named `inputX` / `mockX` / `actualX` / `expectedX`):

| Unit | How |
| --- | --- |
| Slice | `goalsLoaded` / `fetchGoals.fulfilled` writes snapshots; `depositApplied` updates deposited + percent |
| Selector | maps snapshots to row fields used by the presenter |
| Container | RNTL + `createTestStore(fakeGetGoals)`; assert a seeded name and percent are on screen |
| Presenter (optional) | props only, no store |
| `App.test.tsx` | keep “renders without crash”; drop the unused WebView mock if App no longer imports WebView |

Extend `collectCoverageFrom` with `src/features/goals/store/**` and `src/app/store/**` (exclude listener placeholder). Do **not** fold presentation into the global 70% gate (UI coverage is asserted by the RNTL test, not by the domain threshold). Keep existing domain globs.

**Alternatives considered:** react-test-renderer only for the list (weaker queries). Lower the domain coverage gate (unrelated). Add `redux-mock-store` (obsolete with RTK).

## Risks / Trade-offs

- **[Risk] Production DI imports a class from `ports/fakes/`** → Mitigation: infrastructure factory is the only production import; F6 replaces it with a persisted adapter and the fake stays test-only. Do not rename the fakes folder in this change.
- **[Risk] `serializableCheck` fails if a mapper leaks a class** → Mitigation: map to `GoalSnapshot` in the thunk before `fulfill`; slice tests round-trip JSON.
- **[Risk] RNTL + RN 0.81 peer mismatch** → Mitigation: install the current RNTL that declares RN 0.81; if `App.test.tsx` and the container test fight act/async, wrap fetch in `findByText`.
- **[Risk] Removing WebView from App breaks the existing render test** → Mitigation: update `App.test.tsx` in the same change; keep the `rn-savings-notifier` mock.
- **[Risk] `onGoalPress` no-op surprises QA who expect detail** → Mitigation: README / this phase closure: list only; detail is Fase 4.
- **[Trade-off] Wiring `makeDeposit` unused** → Extra stays stable for Fase 4; unused field is cheaper than reshaping `AppDependencies` twice.

## Migration Plan

Additive inside reserved folders, plus `App.tsx` / `store.ts` / `create-app-dependencies.ts` replacing placeholders. Install the three npm packages in `mobile`. Rollback: revert the change branch; Android assets and Metro are unchanged. No data migration (in-memory seed only). After merge, the demo launch path is the list; developers who still need the test HTML open the asset via Fase 4 or `adb` — not via App.

## Open Questions

None. Launch-as-list, snapshot shape, seed rows (including 25% and 0%), and “no navigation / no WebView” are decided above and match the specs.
