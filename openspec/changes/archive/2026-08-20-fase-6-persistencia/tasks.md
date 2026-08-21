## 1. Package and Jest

- [x] 1.1 Add `@react-native-async-storage/async-storage` to the `mobile` workspace (no Expo storage SDK) and verify `mobile/package.json` lists that package and does not list `expo` or `expo-secure-store`
- [x] 1.2 Mock `@react-native-async-storage/async-storage` in Jest `setupFiles` (package `jest/async-storage-mock` or equivalent) and add `@react-native-async-storage` to `transformIgnorePatterns`, then verify `npm test -w mobile -- App.test.tsx` still passes without loading a native storage module

## 2. Persisted record schema and mapper

- [x] 2.1 Add Zod envelope `{ version: 1, goals: PersistedGoalRecord[] }` and `PersistedGoalRecord` (`id`, `name`, `targetAmount`, `depositedAmount`) under `mobile/src/features/goals/infrastructure` with `.strip()` so extra keys are dropped, and verify a colocated schema test accepts a valid envelope and rejects missing `id` or a non-integer amount
- [x] 2.2 Add `toPersistedGoalRecord` / `toSavingsGoal` (do not reuse `GoalSnapshot`) that round-trips identifier, name, and integer amounts and derives progress from domain, then verify a mapper test: target 100000 / deposited 25000 → 25 percent and not completed, and a record with stray `progressPercent: 99` still reconstructs 25 percent

## 3. Persisted repository

- [x] 3.1 Add `KeyValueStore` plus `MapKeyValueStore` (tests) and `AsyncStorageKeyValueStore` (production, key `sgw.goals.v1`) under `features/goals/infrastructure`, and verify repository tests never import `@react-native-async-storage/async-storage`
- [x] 3.2 Implement `createPersistedGoalsRepository({ store, seed })` with hydrate-once, seed-if-empty (reuse `createSeedGoals()`), in-memory cache, and write-through `save`, then verify tests with `MapKeyValueStore`: empty store lists the three seed ids; saving `goal-vacaciones` at deposited 35000 is listed by a second repository instance on the same store; a pre-filled envelope with deposited 35000 is not reset to 25000
- [x] 3.3 Treat `null`, non-JSON, schema-invalid, empty `goals`, and domain reconstruction failure as empty storage (write seed, return seed, do not throw), then verify colocated tests for corrupt JSON and a record missing `id` both return the seed goals
- [x] 3.4 Keep `createSeededGoalsRepository()` for in-memory tests, export the persisted factory from the infrastructure barrel, and verify existing `create-seeded-goals-repository.test.ts` still passes

## 4. Composition root

- [x] 4.1 Change `createAppDependencies` to inject `createPersistedGoalsRepository` with `AsyncStorageKeyValueStore` (keep `GetGoals` / `MakeDeposit` factories unchanged) and verify `create-app-dependencies.ts` no longer calls `createSeededGoalsRepository` in production
- [x] 4.2 Confirm list and detail presentation modules do not import `@react-native-async-storage/async-storage` or instantiate the persisted adapter, and verify `rg "@react-native-async-storage" mobile/src/features/goals/presentation mobile/src/features/goal-detail/presentation` is empty

## 5. Freeze, coverage, and docs

- [x] 5.1 Confirm `GetGoals`, `MakeDeposit`, `GoalsRepository` signatures, Zod `postMessage` catalog, `web/`, and `libreria/` are unchanged, and verify `git diff -- mobile/src/core mobile/src/features/goals/application mobile/src/features/goal-detail/application web libreria` is empty except if a documented no-op was required
- [x] 5.2 Extend `collectCoverageFrom` with `src/features/goals/infrastructure/**` (exclude `index.ts`) and verify `npm test` from the repository root exits 0 without an emulator
- [x] 5.3 Update README phase table (Fase 6 done) and the in-memory seed bullet to say persistence sits behind `GoalsRepository`, and verify those lines no longer mark Fase 6 as pendiente

## 6. Device demo

- [x] 6.1 Rebuild the Android host once after adding AsyncStorage (`npm run android` or equivalent) and verify on emulator/device: first launch still shows the three seed goals; deposit on `goal-vacaciones` (or another seed); force-stop the app; relaunch; that row shows the new acumulado and percent, not the original seed
