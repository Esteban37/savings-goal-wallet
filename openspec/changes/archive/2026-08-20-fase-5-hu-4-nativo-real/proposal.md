## Why

HU 4 is specified as a native confirmation when a goal reaches 100%, but `rn-savings-notifier` still no-ops and DI still injects `NoopGoalNotifier`. Completing a goal after Fase 4 therefore never shows Toast or a system notification. This phase fills the reserved TurboModule and swaps the adapter so the existing `depositApplied` listener drives real native UI.

## What Changes

- Implement Android Kotlin `notifyGoalCompleted` as a real Toast (and optionally a local notification). The Promise MUST still settle; the host MUST NOT use React Native `Alert`.
- Add JavaScript tests in `libreria/` that mock the TurboModule and cover the public wrappers.
- Add `RnSavingsNotifierAdapter` in `features/notifications/infrastructure`, inject it from `createAppDependencies` instead of `NoopGoalNotifier`, and keep the existing listener as the only production call path.
- Remove the Fase 1/4 `notifyGoalCompleted('scaffold')` ping from `App` mount so launch does not Toast a fake goal.
- Keep iOS native as a resolving stub unless stretch work lands. Stretch: Android `AlertDialog` (and iOS `UIAlertController`) for `showConfirmDialog`; optional `POST_NOTIFICATIONS` notification channel. Do not change `MakeDeposit`, the `postMessage` catalog, or persistence.

## Capabilities

### New Capabilities

- `notifications`: HU 4 wiring — real `GoalNotifier` adapter over `rn-savings-notifier`, composition-root DI swap, and listener-only invocation when a deposit completes a goal. No notifications UI screen.

### Modified Capabilities

- `rn-savings-notifier`: Android MUST show native Toast (or equivalent native confirmation) for `notifyGoalCompleted`; JS wrappers MUST be unit-tested against a mocked TurboModule. Stub-only Android behavior is no longer acceptable. iOS MAY remain a resolving stub.
- `mobile-host`: the host MUST NOT call `notifyGoalCompleted` on launch as a scaffold ping. Library consumption MUST go through the notifications adapter and the existing listener. Startup MUST still import/link the library without crashing.

## Impact

- **Code:** `libreria/android/.../RnSavingsNotifierModule.kt`, `libreria/src/` wrappers + new Jest tests, `libreria` Jest config if missing, `mobile/src/features/notifications/infrastructure`, `mobile/src/app/di/create-app-dependencies.ts`, `mobile/src/app/App.tsx`. Listener file stays behaviorally the same. Domain, Zod catalog, WebView, and `web/` stay unchanged.
- **APIs:** public JS API of `rn-savings-notifier` is unchanged (`notifyGoalCompleted`, `showConfirmDialog`). Native Android implementation of `notifyGoalCompleted` becomes visible to the user. `GoalNotifier` port is unchanged.
- **Dependencies:** no new npm packages for the Toast path. Stretch local notifications may add `POST_NOTIFICATIONS` in the library or host Android manifest. Jest for `libreria/` if the workspace has no test script yet. Root `npm test` SHOULD also run the library suite.
- **Systems:** Android demo: abono that reaches 100% shows a native Toast with the goal name. JS tests do not require an emulator. Instrumented Toast tests are not a merge gate (plan §12).
- **Out of scope:** AsyncStorage (Fase 6), IA docs (Fase 7), README closure (Fase 8), CRUD of goals, copying native code into `mobile/`, Expo.
