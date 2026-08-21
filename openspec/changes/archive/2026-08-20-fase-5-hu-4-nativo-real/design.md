## Context

See `proposal.md` for motivation and `specs/notifications/spec.md`, `specs/rn-savings-notifier/spec.md`, and `specs/mobile-host/spec.md` for behavior. Fase 4 already registers `registerNotificationsListeners` on `depositApplied` and calls `extra.goalNotifier.notifyGoalCompleted(name)` when `isCompleted`. DI still injects `NoopGoalNotifier`. `App.tsx` still pings `notifyGoalCompleted('scaffold')`. `RnSavingsNotifierModule.kt` resolves without UI. Architecture for this phase is frozen in `docs/PLAN_EJECUCION.md` §6 (library), §8 Fase 5, and §12 (no instrumented Toast as merge gate).

Constraints: TurboModule stays in `libreria/`; never copy native into `mobile/`. `MakeDeposit` stays UI-free. TypeScript strict. No Expo. No tests in `web/`.

## Goals / Non-Goals

**Goals:**

- Close HU 4 on Android: completing a goal shows a native Toast that includes the goal name.
- Swap production DI to a real adapter; keep the existing listener as the only production call path.
- Add Jest in `libreria/` with TurboModule mocks; include that suite in root `npm test`.

**Non-Goals:**

- Persistence (Fase 6), IA docs (Fase 7), README closure (Fase 8).
- Changing seed data, `MakeDeposit` rules, or the `postMessage` catalog.
- Instrumented Espresso/Detox Toast assertions as CI gate.
- Wiring `ConfirmDialog` into the deposit UX (library `showConfirmDialog` native UI is stretch only).
- Real iOS Toast/notification (stub remains acceptable).

## Decisions

### 1. Android Toast is the HU 4 close; local notifications are stretch

Implement `notifyGoalCompleted` in Kotlin with `Toast.makeText` on the main thread (`UiThreadUtil.runOnUiThread` or `Handler(Looper.getMainLooper())`), then `promise.resolve(null)`. Message includes the goal name (Spanish, consistent with `web/`, e.g. `Meta completada: {goalName}`). Use `Toast.LENGTH_LONG`. Empty `goalName`: resolve without showing a Toast.

Do **not** require `POST_NOTIFICATIONS` for the close. A `NotificationCompat` channel is stretch: it needs runtime permission on API 33+ and can fail silently if denied, which weakens the demo. Toast is always visible without a permission prompt.

`showConfirmDialog` stays `promise.resolve(true)` on Android unless stretch `AlertDialog` lands (needs a live `Activity`; resolve `false` if none).

**Alternatives considered:** Notification-only (permission friction, easy to miss in demo). RN `Alert.alert` in the listener (forbidden by spec). Snackbar from Material in the host (bypasses the library).

### 2. Adapter in `notifications/infrastructure`; composition root swaps the fake

```
createAppDependencies().goalNotifier = RnSavingsNotifierAdapter
  → import { notifyGoalCompleted } from 'rn-savings-notifier'
registerNotificationsListeners (unchanged)
App.tsx: remove useEffect scaffold ping
```

`RnSavingsNotifierAdapter` implements `GoalNotifier` and only forwards. Keep `NoopGoalNotifier` for unit tests that build `AppDependencies` by hand. Tests that render `App` (module-scope `createAppDependencies`) MUST still mock `rn-savings-notifier` so Jest does not load the real TurboModule.

`features/goals` and `features/goal-detail` MUST NOT import the package. `App.tsx` MUST NOT import it after the ping is removed. `confirmDialog` stays `AlwaysConfirmDialog`.

**Alternatives considered:** Call the package from the listener (couples the feature to RN and skips the port). Call from `MakeDeposit` (forbidden). Keep the scaffold ping plus the listener (double Toast on 100% and a fake Toast on every launch).

### 3. Jest for `libreria/` via RN preset; mock `NativeRnSavingsNotifier`

Add `libreria` `test` script and a `jest.config.js` with `preset: 'react-native'` (same major as the host). Colocate `src/index.test.ts`. Mock `./NativeRnSavingsNotifier` (or `TurboModuleRegistry`) with `inputX` / `mockX` / `actualX` / `expectedX` names.

Root `package.json`: `npm test` runs mobile then libreria (`npm run test -w mobile && npm run test -w libreria`). Do not put Kotlin in the JS coverage gate.

**Alternatives considered:** Only test the adapter in `mobile/` (would not cover the library public API as a first-class package). Robolectric for Toast (out of plan §12).

### 4. Rebuild native host after Kotlin change

Toast lives in autolinked Kotlin. After implementation, Android needs a native rebuild (`npm run android`), not Metro reload alone. Document that as the demo step, not as a new Gradle copy of sources into `mobile/`.

**Alternatives considered:** JS-only Toast polyfill (fails HU 4). Manual copy of `.kt` into the app module (violates workspace library rule).

## Risks / Trade-offs

- **[Risk] Toast from a background thread crashes or no-ops** → Mitigation: always post to the main looper before `Toast.show()`.
- **[Risk] `reactApplicationContext` has no activity when the listener fires after the WebView unmounts** → Mitigation: use application context for `Toast.makeText` (valid for Toast); do not require `currentActivity`.
- **[Risk] Removing the App ping makes reviewers think the library is unused** → Mitigation: adapter import is the link; `App.test` still mocks the package because `createAppDependencies` loads it at module init.
- **[Risk] Jest in `libreria/` fails to transform RN** → Mitigation: same `preset: 'react-native'` and `transformIgnorePatterns` pattern as mobile if needed; keep tests to pure wrapper forwarding.
- **[Trade-off] Toast vs notification** → Toast wins demo reliability; stretch notification can be added later without changing the JS API.
- **[Trade-off] iOS stays stub** → Matches the frozen plan (Android is the demo close).

## Migration Plan

Additive on `feat/fase-5-hu-4-nativo-real`: Kotlin Toast, adapter, DI swap, remove ping, library Jest. Rollback: revert the branch; no user data. After merge, demo path is list → detail → abono that reaches 100% → native Toast (seed “Fondo de emergencia” is 90% so a 10%+ abono completes it). Native rebuild required once.

## Open Questions

None. Toast vs notification, adapter placement, launch ping removal, and JS-only library tests are decided above and match the specs.
