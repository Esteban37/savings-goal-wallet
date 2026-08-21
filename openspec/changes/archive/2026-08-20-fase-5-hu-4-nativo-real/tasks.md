## 1. Android TurboModule Toast

- [x] 1.1 Implement `notifyGoalCompleted` in `libreria/android/.../RnSavingsNotifierModule.kt` as a main-thread `Toast` whose text includes the goal name (`Toast.LENGTH_LONG`), resolve the Promise after requesting the Toast, omit the Toast for an empty name, and verify the Kotlin source contains `Toast.makeText` plus a main-thread post (`UiThreadUtil` or `Looper.getMainLooper`) and does not only `promise.resolve` with no UI
- [x] 1.2 Leave iOS `notifyGoalCompleted` / `showConfirmDialog` as resolving stubs and verify `libreria/ios/RnSavingsNotifier.mm` still resolves those methods without requiring a new UI framework
- [x] 1.3 Confirm no native sources were copied into `mobile/android` or `mobile/ios` and verify `git diff --name-only` has no new `.kt`/`.java`/`.mm` under `mobile/`

## 2. Library JavaScript tests

- [x] 2.1 Add a Jest config and `test` script to the `libreria` workspace (`preset: 'react-native'`, mock TurboModule) and verify `npm run test -w libreria` exits 0 with at least one test file
- [x] 2.2 Add wrapper tests (`inputX` / `mockX` / `actualX` / `expectedX`) that mock `NativeRnSavingsNotifier`: `notifyGoalCompleted` forwards the fixture name; `showConfirmDialog` forwards title and message and settles to a boolean; and verify those assertions are in `libreria/src/*.test.ts`
- [x] 2.3 Chain the library suite from the repo root `test` script (`npm run test -w mobile && npm run test -w libreria`) and verify `npm test` from the repository root runs both workspaces and exits 0

## 3. Notifications adapter and host wiring

- [x] 3.1 Add `RnSavingsNotifierAdapter` under `features/notifications/infrastructure` implementing `GoalNotifier` by calling `notifyGoalCompleted` from `rn-savings-notifier`, export it from the feature `public.ts` only if `app/di` needs it (prefer importing from infrastructure via notifications public barrel), and verify a colocated test with a mocked package asserts the fixture goal name is forwarded
- [x] 3.2 Change `createAppDependencies` to inject `RnSavingsNotifierAdapter` instead of `NoopGoalNotifier`, keep `AlwaysConfirmDialog`, keep `NoopGoalNotifier` for hand-built test deps, and verify `create-app-dependencies.ts` no longer instantiates `NoopGoalNotifier` in the production factory
- [x] 3.3 Remove the `notifyGoalCompleted('scaffold')` `useEffect` from `App.tsx` (and unused `useEffect` import), keep `App.test.tsx` mocking `rn-savings-notifier` because module-scope DI still loads the adapter, and verify `rg "scaffold" mobile/src/app` is empty and `npm test -w mobile -- App.test.tsx` passes
- [x] 3.4 Confirm `features/goals` and `features/goal-detail` do not import `rn-savings-notifier`, the listener still calls `extra.goalNotifier` only when `isCompleted`, and verify `rg "rn-savings-notifier" mobile/src/features/goals mobile/src/features/goal-detail mobile/src/app/App.tsx` is empty while `rg "rn-savings-notifier" mobile/src/features/notifications` is not

## 4. Freeze and coverage

- [x] 4.1 Confirm `mobile/src/core` domain, ports (signatures), and Zod catalog are unchanged and `MakeDeposit` still does not call the notifier; verify `git diff -- mobile/src/core mobile/src/features/goal-detail/application` is empty except if a documented no-op was required
- [x] 4.2 Confirm `web/` is unchanged and verify `git diff -- web` is empty
- [x] 4.3 Run `npm test` from the repository root and verify it exits 0 (mobile + libreria) without an emulator
- [ ] 4.4 Rebuild the Android host once after the Kotlin change (`npm run android` or equivalent) and verify on emulator/device: open seed goal **Fondo de emergencia** (90%), deposit enough to reach 100%, see a native Toast containing the goal name, and see no React Native `Alert` for that event

Stretch (not checkboxes; skip unless explicitly requested): `AlertDialog` / `UIAlertController` for `showConfirmDialog`; `POST_NOTIFICATIONS` local notification in addition to Toast.
