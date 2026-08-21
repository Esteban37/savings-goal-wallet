---
name: rtk-slice-selector-test
description: >-
  Adds or extends a Redux Toolkit slice, selector, and Jest tests for Savings
  Goal Wallet following feature-first conventions. Use when changing goals-slice,
  GoalSnapshot, selectors, depositApplied, goalCreated, goalDeleted, or
  extraArgument thunks.
---

# RTK slice + selector + test

Repeatable flow for the **mobile** `goals` feature: serializable snapshots in the slice, I/O only in thunks via `extraArgument`, selectors that map to view rows. Reducers stay pure.

## Where it lives

- Slice: `mobile/src/features/goals/store/goals-slice.ts`
- Snapshots: `mobile/src/features/goals/store/goal-snapshot.ts` (`toGoalSnapshot`)
- Selectors: `mobile/src/features/goals/store/selectors.ts`
- Tests: `goals-slice.test.ts`, `selectors.test.ts` next to the slice
- DI: `mobile/src/app/di/create-app-dependencies.ts` wired as `thunk.extraArgument`

Cross-feature: other features import `goals/public.ts` only. HU 4 reactions use `createListenerMiddleware` in `app/`, not a notifier call from the reducer.

## Rules

- State holds `GoalSnapshot` (plain fields), not class instances from domain.
- `depositApplied` / `goalCreated` / `goalDeleted` receive **results** (snapshots or ids). They must not call repositories, TurboModules, or `Alert`.
- Thunks (`fetchGoals`, deposit/create/delete request helpers) read use cases from `{ extra: AppDependencies }`.
- Selectors (`selectGoalRows`, `selectGoalById`) take `{ goals: GoalsState }` and return presenter-ready rows (`targetAmount`, `depositedAmount`, `progressPercent`, `isCompleted`).
- No `any`. Fixture names `inputX` / `actualX` / `expectedX`.

## Steps

1. If the domain entity gained a field, extend `GoalSnapshot` + `toGoalSnapshot` first.
2. Add a reducer that replaces or filters `state.items` by `id`.
3. Export actions from the slice; keep `goalsReducer` as the store slice.
4. Add or extend a selector; do not compute progress in the presenter if the snapshot already has it.
5. Tests:
   - reducer: apply snapshot → item acumulado/% matches (no store I/O)
   - selector: given fixture state → expected rows
   - thunk tests use a fake `AppDependencies`, never production AsyncStorage

## Reject

- Instantiating adapters inside the slice
- Duplicating the same list state in React Context
- Importing `goal-detail` internals from `goals` (use actions + listeners)
