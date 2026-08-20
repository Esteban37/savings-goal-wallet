## 1. Dependencies and shared Result

- [x] 1.1 Add `zod` as a dependency of the `mobile` workspace (`npm install zod -w mobile` from the repo root) and verify `mobile/package.json` lists `zod` and the install exits 0
- [x] 1.2 Add a tiny `Result<T, E>` helper under `mobile/src/core/domain` (ok/error discriminant, no extra package) and re-export it from `core/domain/index.ts`, then verify TypeScript compiles the helper without `any`

## 2. Domain values and entity

- [x] 2.1 Implement `Money` (`zero`, `ofNonNegative` for deposited, `ofPositive` for deposits/target; reject non-integers, non-finite, and non-positive where required) with colocated `money.test.ts` using `inputX`/`actualX`/`expectedX`, then verify those tests pass via `npm test -w mobile -- money.test.ts`
- [x] 2.2 Implement derived `Progress` (integer percent 0–100 with `Math.floor`, cap at 100, `isCompleted` when deposited ≥ target) with colocated tests for 0%, 25%, 100%, and overshoot, then verify `npm test -w mobile -- progress.test.ts` passes
- [x] 2.3 Implement immutable `SavingsGoal` (`id`, `name`, `target`, `deposited`, `applyDeposit` returning `Result`, original instance unchanged, no port calls) with colocated tests, then verify `npm test -w mobile -- savings-goal.test.ts` passes
- [x] 2.4 Re-export domain types from `mobile/src/core/domain/index.ts` (replace `export {}`) and verify a `rg "from 'rn-savings-notifier'|from 'react-native'|from 'react'" mobile/src/core/domain` search is empty

## 3. Ports and test fakes

- [x] 3.1 Define `GoalsRepository` (`list`, `getById` returning absence, `save`), `GoalNotifier` (`notifyGoalCompleted(goalName)`), and `ConfirmDialog` (`confirm({ title, message }) => Promise<boolean>`) under `mobile/src/core/application/ports/` and re-export them from the ports barrel, then verify the barrel compiles and none of those files import `rn-savings-notifier`
- [x] 3.2 Add test-only fakes under `core/application/ports/fakes/` (`InMemoryGoalsRepository`, `NoopGoalNotifier`, `AlwaysConfirmDialog` resolving `true`) with a small fake round-trip test, then verify the fake test passes and `create-app-dependencies.ts` still returns `{}`

## 4. Use cases

- [x] 4.1 Implement `createGetGoals({ repository })` in `features/goals/application/get-goals.ts` (empty list and two seeded goals) with colocated `get-goals.test.ts` against the in-memory fake, then verify `npm test -w mobile -- get-goals.test.ts` passes
- [x] 4.2 Implement `createMakeDeposit({ repository })` in `features/goal-detail/application/make-deposit.ts` (success 10000+20000, missing goal, amount 0, completing deposit does not call notifier) with colocated tests, then verify `npm test -w mobile -- make-deposit.test.ts` passes and the factory’s type does not accept a notifier
- [x] 4.3 Re-export the use-case factories from the two feature `application/index.ts` barrels and verify those barrels do not import Redux, React Native, or `rn-savings-notifier`

## 5. postMessage contract

- [x] 5.1 Add strict Zod schemas in `core/contracts` for `WEB_READY`, `DEPOSIT_REQUESTED`, `SESSION_BOOTSTRAP` (goal DTO + `userInfo` record), `DEPOSIT_SUCCEEDED`, and `DEPOSIT_FAILED`, plus a closed `bridgeMessageSchema` discriminated on `type`, then verify inferred types exist and `PING` is not a member of the union
- [x] 5.2 Implement `parseBridgeMessage(input: unknown): Result<BridgeMessage, 'invalid-message'>` (JSON-parse strings, `safeParse`, no `any`) with colocated `parse-bridge-message.test.ts` covering valid JSON string, valid object, unknown type, invalid JSON, null, missing `amount`, and extra payload keys, then verify `npm test -w mobile -- parse-bridge-message.test.ts` passes
- [x] 5.3 Re-export the parser and types from `core/contracts/index.ts` and verify `App.tsx` still only `console.log`s `onMessage` (no import of `parseBridgeMessage`)

## 6. Coverage gate and freeze

- [x] 6.1 Extend `mobile/jest.config.js` with `collectCoverageFrom` for `src/core/domain/**`, `src/core/contracts/**`, `src/features/goals/application/**`, and `src/features/goal-detail/application/**` (exclude barrels/`fakes` as designed) and `coverageThreshold` ≥70 for that set, then verify `npm test -w mobile -- --coverage --coverageReporters=text-summary` reports at least 70% on those paths
- [x] 6.2 Confirm `App.tsx`, `store.ts`, `listener-middleware.ts`, `create-app-dependencies.ts`, `web/app.js`, and `web/index.html` are unchanged from `main` except if a task above required a documented no-op, then verify `git diff main -- mobile/src/app web` is empty
- [x] 6.3 Run `npm test` from the repository root and verify it exits 0 (existing `App.test.tsx` plus new domain/parser/use-case tests) without starting an emulator
