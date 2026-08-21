## Why

The product already runs the full savings-goal loop on Android (list, local WebView, persist, native Toast and confirm). iOS exists only as the CLI template plus a TurboModule stub that resolves without UI, so a developer cannot launch the host, load `web/`, or see HU 4 / delete confirmation on a simulator. After Fase 8, this is the leftover platform gap before IA docs and README closure.

## What Changes

- Insert this work as **Fase 9** in `docs/PLAN_EJECUCION.md`. Shift today’s Fase 9 (IA gobernada) to **Fase 10** and Fase 10 (documentación y cierre) to **Fase 11**. Update the phase diagram, OpenSpec table, README phase mentions, and the “iOS del template” setup line so later phases are not overwritten.
- Make the iOS host a first-class run target: CocoaPods install, New Architecture + Hermes, root `npm run ios`, and a simulator launch that reaches the native goal list without crashing.
- Bundle `web/` into the iOS app (same `index.html` / `app.js` as Android) and load the immersive deposit/create WebView from a **local iOS file URI**, not `file:///android_asset/...`.
- Replace the iOS TurboModule resolving stubs with real native UI in `libreria/`: completion and registration feedback that includes the goal name, and `showConfirmDialog` as a cancel-or-confirm `UIAlertController`. Empty names still settle without UI. Confirm MUST NOT auto-resolve to `true`.
- Document Mac/Xcode/simulator prerequisites next to the existing Android run path. Do not copy native sources into `mobile/`.

## Capabilities

### New Capabilities

- None. iOS extends the existing host, detail WebView, notifications, and library.

### Modified Capabilities

- `mobile-host`: iOS application launches with New Architecture and Hermes; `web/` is bundled as local iOS resources; production notifier and confirm-dialog stay the workspace library on iOS as on Android.
- `goal-detail`: deposit and create WebViews load a platform-local file URI (iOS bundle path on iOS, Android asset path on Android), never a remote URL.
- `rn-savings-notifier`: iOS native is no longer an allowed silent stub; `notifyGoalCompleted`, `notifyGoalCreated`, and `showConfirmDialog` show real UI on the main thread.
- `notifications`: HU 4 completion confirmation is native on iOS as well as Android (still not React Native `Alert`).

## Impact

- **Code:** `mobile/ios` (Pods, asset copy into the app bundle, New Architecture flags if missing), `mobile/src` WebView URI selection, root `package.json` `ios` script, `libreria/ios` TurboModule implementations, `docs/PLAN_EJECUCION.md` and README phase tables.
- **APIs:** public JS of `rn-savings-notifier` is unchanged. `postMessage` catalog, domain, persistence, and Redux stay the same.
- **Dependencies:** CocoaPods for the iOS host. No Expo. No new npm packages. No Yarn/pnpm.
- **Systems:** iOS Simulator is the demo gate (physical device optional). Android Gradle copy of `web/` MUST remain. Native rebuild after ObjC/Swift changes (`pod install` then `npm run ios`).
- **Docs:** phase numbers 9→10 (IA) and 10→11 (cierre). README setup MUST include iOS.
- **Out of scope:** IA docs (new Fase 10), full README closure (new Fase 11), edit-goal, backend, App Store / TestFlight / signing for a physical device as a blocker, instrumented XCUITest/Detox as merge gate, changing deposit rules or persistence.
