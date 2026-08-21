## 1. Phase numbering

- [x] 1.1 Insert Fase 8 (alta y baja de metas: FAB, formulario web, Toast de registro, long-press + confirmación) in `docs/PLAN_EJECUCION.md`, rename today’s Fase 8 → Fase 9 (IA gobernada) and Fase 9 → Fase 10 (documentación y cierre), update the ASCII diagram, intro “fases 8–9”, §8 headings, §12 CRUD line (create/delete are this phase; edit remains out), and §13 table, and verify those sections use 8 = this work, 9 = IA, 10 = cierre
- [x] 1.2 Update the README phase table and “Fase actual” line so Fase 8 is this work (in progress) and IA/cierre are 9/10, and verify no README row still lists “8 | IA gobernada”

## 2. Catalog and parser

- [x] 2.1 Extend Zod Web-to-native with `CREATE_REQUESTED` `{ name, targetAmount }` and Native-to-web with required `SESSION_BOOTSTRAP.mode` (`deposit` | `create`; `goal` required only for `deposit`), `CREATE_SUCCEEDED`, and `CREATE_FAILED`, update existing bootstrap fixtures to include `mode: "deposit"`, and verify parser tests accept the new envelopes and reject missing `mode`, missing create `name`, and unknown types
- [x] 2.2 Keep `web/` without a test runner and verify `find web -name '*test*' -o -name '*spec*'` (or equivalent) shows none

## 3. Domain ports and use cases

- [x] 3.1 Add `remove(id)` to `GoalsRepository` and the in-memory fake, and verify colocated fake tests: remove one of two seeded ids leaves the other; get-by-id for the removed id reports absent
- [x] 3.2 Add `notifyGoalCreated(goalName)` to `GoalNotifier` and the no-op fake, and verify the fake settles without importing `rn-savings-notifier` from domain/ports/use-case modules (`rg "rn-savings-notifier" mobile/src/core` is empty)
- [x] 3.3 Implement `CreateGoal` in `features/goals/application` (trim name; reject empty; positive integer target; deposited 0; unique id; save; no notifier) and verify tests: Viaje / 500000 persists with deposited 0; `"   "` fails without save; target 0 fails without save
- [x] 3.4 Implement `DeleteGoal` in `features/goals/application` (`remove`; typed miss; no confirm/notifier) and verify tests: known id disappears from list; unknown id fails and leaves the repository unchanged
- [x] 3.5 Wire `createGoal` and `deleteGoal` on `AppDependencies` and verify `createAppDependencies` still injects the persisted repository (no Expo storage)

## 4. Persistence

- [x] 4.1 Stop treating a valid empty `goals` array as missing in `parseStoredGoals` (seed only on missing/corrupt/schema-invalid envelope) and verify a colocated test: stored `{ version: 1, goals: [] }` lists zero goals and does not write the seed
- [x] 4.2 Persist `remove` through the production repository (`memory.remove` then `persistAll`) and verify a fake key-value test: save two goals, remove one, a second repository instance lists only the remaining id
- [x] 4.3 Confirm `sgw.goals.v1` record fields stay identifier/name/integer amounts (no stored percent) and verify mapper tests still reconstruct progress from deposited and target

## 5. Native library

- [x] 5.1 Add TurboModule spec + JS `notifyGoalCreated(goalName)`, Android Toast `Meta registrada: {goalName}` on the main thread (empty name resolves without UI), and iOS resolving stub, and verify `libreria` wrapper tests mock the native method with that name and `npm test -w libreria` exits 0
- [x] 5.2 Implement Android `showConfirmDialog` as `AlertDialog` on `currentActivity` (confirm → `true`, cancel/dismiss → `false`, no activity → `false`, no double-resolve) and verify the JS wrapper test still forwards title and message to the mock (instrumented dialog is not the merge gate)
- [x] 5.3 Confirm callers still import from the package name and verify `rg "libreria/android" mobile/src` is empty

## 6. Notifications, confirm adapter, and listeners

- [x] 6.1 Extend `RnSavingsNotifierAdapter` with `notifyGoalCreated` and add `RnConfirmDialogAdapter` that calls `showConfirmDialog`; swap production `confirmDialog` off `AlwaysConfirmDialog`; keep fakes for tests; and verify adapter tests forward both notify methods and confirm title/message
- [x] 6.2 Listen for `goalCreated` and call `extra.goalNotifier.notifyGoalCreated(name)` (keep the completed-deposit listener) and verify a unit test: `goalCreated` invokes created notify; incomplete `depositApplied` does not; completed `depositApplied` still invokes completed notify
- [x] 6.3 Confirm list/detail presentation still does not import `rn-savings-notifier` and verify `rg "rn-savings-notifier" mobile/src/features/goals/presentation mobile/src/features/goal-detail/presentation` is empty

## 7. Store, list FAB, and long-press delete

- [x] 7.1 Add slice actions `goalCreated` (append) and `goalDeleted` (filter by id), export them from `goals/public.ts`, and verify reducer tests: append Viaje 0%; delete `goal-vacaciones` removes only that row; empty items stay empty
- [x] 7.2 Implement `requestDelete` thunk (`confirmDialog` then `deleteGoal` then `goalDeleted`) and verify tests: confirm `true` removes the snapshot; confirm `false` leaves items unchanged and does not call `deleteGoal`
- [x] 7.3 Add list FAB (`Pressable`, accent, `accessibilityLabel` “Agregar meta”, bottom list padding so it does not cover the last card), `onCreatePress`, empty-list with FAB still visible, and `onLongPress` on `GoalListItem` that does not fire `onPress`, then verify RNTL: FAB is present with that label when items are empty; long-press callback fires without the press callback
- [x] 7.4 Confirm no new `shared/ui` Button atom and verify `ls mobile/src/shared/ui/atoms` has no new Button file

## 8. Create WebView and micro-app

- [x] 8.1 Add stack route `GoalCreate` (header “Nueva meta”, same appearance `headerRight`) that renders `GoalDetailContainer` with `mode: "create"` against the existing local `web/index.html` URI, send `SESSION_BOOTSTRAP` with `mode: "create"` and no `goal` after `WEB_READY`, and verify deposit bootstrap still sends `mode: "deposit"` with the selected goal
- [x] 8.2 Implement `requestCreate` thunk (`extra.createGoal` → `goalCreated` → `CREATE_SUCCEEDED` / `CREATE_FAILED`), inject the result, then `goBack()` on success, and verify colocated tests: valid name/target appends deposited 0 to the goals store; target 0 yields failed payload and unchanged item count; malformed envelope does not call `createGoal`
- [x] 8.3 Add `#create` form (name + target) in `web/index.html` / `app.js` toggled by bootstrap `mode`, post `CREATE_REQUESTED` on confirm, handle `CREATE_SUCCEEDED` / `CREATE_FAILED`, keep the deposit form for `deposit` mode, and verify the sources contain those catalog `type` strings, assign `__onHostMessage`, and contain no `fetch` / XHR / native-module usage
- [x] 8.4 Confirm Android Gradle still copies `web/` into assets and verify `git diff -- mobile/android` does not delete the web asset mapping

## 9. Coverage and freeze

- [x] 9.1 Extend `collectCoverageFrom` with new use-case / slice / persist / adapter paths (exclude presentation and `web/`) and verify `npm test` from the repository root exits 0 without an emulator, including parser, create/delete use cases, empty-list persist, thunks, and listener tests
- [x] 9.2 Confirm domain coverage stays ≥70 percent on `core/domain` plus pure use cases and verify the coverage summary still reports that gate
- [x] 9.3 Confirm no fourth feature folder and no Expo packages, and verify `ls mobile/src/features` is still `goals`, `goal-detail`, `notifications` and `mobile/package.json` has no Expo dependency

## 10. Device demo

- [ ] 10.1 Native-rebuild the Android host after Kotlin/Codegen, then on emulator/device: FAB opens the web create form; submitting Viaje / 500000 shows Toast “Meta registrada: Viaje”, returns to the list with a 0% row; long-press shows a native confirm dialog; cancel keeps the row; confirm removes it; deleting all goals then kill/relaunch does not restore the seed
