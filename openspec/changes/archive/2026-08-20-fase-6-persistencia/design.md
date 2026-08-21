## Context

See `proposal.md` for motivation and `specs/goals-persistence/spec.md`, `specs/goals-list/spec.md`, plus `specs/mobile-host/spec.md` for behavior. Production DI still calls `createSeededGoalsRepository()` (`InMemoryGoalsRepository` + frozen seed). `GetGoals` / `MakeDeposit` already persist only through `GoalsRepository`. `fetchGoals` already awaits `extra.getGoals()` on list mount, so hydration can stay inside `list()` / `getById()` / `save()` — no splash screen. Architecture for this phase is frozen in `docs/PLAN_EJECUCION.md` §§2.4, 5 (port table), and §8 Fase 6.

Constraints: TypeScript strict, RN 0.81 / React 19, no Expo, no backend, no encryption. Reducers stay pure. Presentation does not instantiate adapters. Do not change use-case signatures or the `postMessage` catalog.

## Goals / Non-Goals

**Goals:**

- Swap production `GoalsRepository` to a durable adapter without editing `GetGoals` or `MakeDeposit`.
- Seed once when storage is empty; keep deposited amounts across kill/relaunch.
- Prove snapshot ↔ domain mapping and seed/corrupt paths with a fake key-value store.

**Non-Goals:**

- CRUD of goals, migrations beyond envelope `version: 1`, encryption, cloud sync.
- Changing RTK `GoalSnapshot` (that DTO keeps derived percent for the list).
- MMKV, SQLite, or Expo SecureStore.
- IA docs (Fase 7) or full README closure (Fase 8), beyond a one-line phase-table update.

## Decisions

### 1. `@react-native-async-storage/async-storage` behind a tiny `KeyValueStore`

Install the Community CLI package in `mobile` (not `expo-secure-store`, not MMKV). Native rebuild is required once after install (`npm run android`).

Do **not** call `AsyncStorage` from the repository tests. Define a one-method port in feature infrastructure (not `core/`):

```ts
type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
```

Production: `AsyncStorageKeyValueStore` forwards `getItem` / `setItem`. Tests: `MapKeyValueStore` (in-memory map). Key owned by the adapter: `sgw.goals.v1`.

`App.tsx` still calls `createAppDependencies()` at module scope, so Jest MUST mock `@react-native-async-storage/async-storage` in `setupFiles` (package `jest/async-storage-mock`, same pattern as `jest.rn-savings-notifier-mock.js`). Extend `transformIgnorePatterns` to include `@react-native-async-storage`.

**Alternatives considered:** MMKV (faster, extra native surface, not named in the plan). Call AsyncStorage directly in tests (fails without the mock and couples mapper tests to RN). Expo SecureStore (forbidden). Persist the RTK store with `redux-persist` (would store derived percent, skip the port, and duplicate source of truth).

### 2. Envelope `{ version: 1, goals: PersistedGoalRecord[] }`; not `GoalSnapshot`

Persisted record (infrastructure only):

```ts
type PersistedGoalRecord = {
  id: string;
  name: string;
  targetAmount: number;
  depositedAmount: number;
};
```

Zod: `z.object({...}).strip()` so a stray `progressPercent` is ignored (spec: stored percent cannot override domain). Envelope: `version` literal `1`, `goals` array. `getItem` `null`, `''`, non-JSON, failed parse, empty `goals`, or any record that cannot reconstruct `SavingsGoal` (`Money` / `SavingsGoal.create`) → treat as empty → write seed.

Mapper colocated in `features/goals/infrastructure`: `toPersistedGoalRecord` / `toSavingsGoal`. Do **not** reuse `toGoalSnapshot` (that type includes `progressPercent` and `isCompleted`). Reconstruct with `Money.ofPositive(target)` + `Money.ofNonNegative(deposited)` + `SavingsGoal.create`.

**Alternatives considered:** Persist `GoalSnapshot` as-is (violates “progress is derived”). Per-goal keys (`sgw.goal.{id}`) (harder empty/corrupt handling; n=3 does not need it). No version field (cheaper now, painful if Fase 8+ adds fields).

### 3. Hydrate-once cache + write-through; reuse `InMemoryGoalsRepository`

`createPersistedGoalsRepository({ store, seed = createSeedGoals() })` returns a `GoalsRepository` that:

1. On first `list` / `getById` / `save`, `ensureHydrated()` (single in-flight Promise).
2. Loads JSON → parse → domain goals, or seeds and `setItem`.
3. Holds an `InMemoryGoalsRepository` as the session cache.
4. `save(goal)` updates the cache then writes the full envelope (read-modify-write of the list). JS is single-threaded; `MakeDeposit` is already get-then-save.

Keep `createSeededGoalsRepository()` for tests that do not care about durability. Production `createAppDependencies()` uses the persisted factory only. `core/application/ports/fakes/InMemoryGoalsRepository` stays test/cache infrastructure; do not move it.

**Alternatives considered:** Await hydrate in `App` before `Provider` (splash, extra UI). Hit storage on every `list()` with no cache (slower, harder to test write-through). Rewrite `MakeDeposit` to accept a storage API (forbidden; the port already exists).

### 4. Files, coverage, README line

New files under `mobile/src/features/goals/infrastructure/` (schema, mapper, `KeyValueStore` adapters, persisted repository + tests). Barrel re-exports the production factory. `create-app-dependencies.ts` swaps the factory call.

Extend `collectCoverageFrom` with `src/features/goals/infrastructure/**` (exclude `index.ts`). Fixture names stay `inputX` / `mockX` / `actualX` / `expectedX`.

README: mark Fase 6 done in the phase table and replace “seed in-memory” with “AsyncStorage detrás del puerto”. No Fase 8 rewrite.

**Alternatives considered:** Put the Zod schema in `core/contracts` (persistence is not the bridge catalog; keep it in the feature). Document only in `docs/PLAN_EJECUCION.md` and leave README stale (demo readers use README first).

## Risks / Trade-offs

- **[Risk] Jest / Metro cannot resolve the native storage module** → Mitigation: `setupFiles` mock; `transformIgnorePatterns` includes `@react-native-async-storage`; repository tests inject `MapKeyValueStore`.
- **[Risk] First Android run after install crashes (autolinking)** → Mitigation: document a native rebuild; same as adding any RN native dependency.
- **[Risk] Corrupt storage wipes demo deposits** → Mitigation: accepted; reseed is safer than a blank/crashing list. No backup in this stretch.
- **[Risk] Hydrate vs `save` race on first call** → Mitigation: one `hydratePromise`; `save` awaits it before mutating.
- **[Trade-off] Full-list write on every `save`** → Fine for three goals; avoids per-id key sprawl.
- **[Trade-off] Reseed on any schema miss** → Loses partial data; matches the spec and keeps the demo deterministic.

## Migration Plan

Additive on `feat/fase-6-persistencia`: npm package, infrastructure adapter, DI swap, Jest mock, README one-liner. Existing installs have empty AsyncStorage → first launch writes the same seed as today (no user-visible change until the first post-Fase-6 deposit). Rollback: revert the branch; leftover `sgw.goals.v1` is ignored by the in-memory adapter. After merge, demo path is list → abono → kill app → relaunch → new acumulado still on the row.

## Open Questions

None. Storage package, envelope shape, seed-if-empty / reseed-on-corrupt, and test-time `KeyValueStore` are decided above and match the specs.
