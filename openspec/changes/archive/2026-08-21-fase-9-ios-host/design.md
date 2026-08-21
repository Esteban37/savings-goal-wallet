## Context

See `proposal.md` for motivation and the delta specs under `specs/` for behavior. Fases 1–8 are archived: Android host runs the full loop (native list, local WebView, persist, HU 4 Toast, create/delete). `mobile/ios` is still the Community CLI template (no `Podfile.lock`, no `Pods/`, no copy of `web/`). `LOCAL_WEB_ASSET_URI` is hardcoded to `file:///android_asset/web/index.html`. `libreria/ios/RnSavingsNotifier.mm` resolves `notifyGoalCompleted` / `notifyGoalCreated` with no UI and `showConfirmDialog` to `@YES`. Architecture stays the frozen plan: feature-first, TurboModule in `libreria/` (never vendored into `mobile/`), no Expo, no fourth feature.

Constraints: TypeScript strict, RN 0.81 / React 19, no new npm packages, no tests in `web/`. Presentation does not instantiate adapters. Use cases do not call notifier or confirm-dialog. Android Gradle `copyWebAssets` MUST remain.

## Goals / Non-Goals

**Goals:**

- iOS Simulator launches the existing JS product (list → WebView deposit/create → persist → native completion/registration feedback → native delete confirm).
- Platform-local file URI for the same `web/index.html` + `app.js` pair.
- Real iOS TurboModule UI in `libreria/` so confirm cannot auto-resolve `true`.

**Non-Goals:**

- IA docs (new Fase 10) or full README closure (new Fase 11) beyond phase-table and iOS setup rename.
- App Store, TestFlight, or a paid Apple Developer account as merge gate.
- XCUITest / Detox as CI gate (JS tests stay the merge gate; simulator demo is manual).
- Changing `postMessage`, domain, persistence, or Android Toast/AlertDialog behavior.

## Decisions

### 1. This change is Fase 9; IA and cierre shift

In `docs/PLAN_EJECUCION.md`: insert Fase 9 (entorno iOS). Rename today’s Fase 9 → **Fase 10 — IA gobernada**, Fase 10 → **Fase 11 — Documentación y cierre**. Update the ASCII diagram, intro “fases 9–10”, §6 “Android es el cierre de demo”, §8 headings, recorte “iOS nativo de la librería”, demo walkthrough, checklist, and §13 table. README: Fase 9 is this work; next branch hint becomes `feat/fase-10-ia-gobernada`; “Cómo ejecutar” includes Mac/Xcode/simulator and `npm run ios`. Root `package.json` gains `"ios": "npm run ios -w mobile"` beside `android`.

**Alternatives considered:** Keep IA as 9 and append iOS as 11 (user asked to enable iOS now; IA/docs stay last). Renumber only OpenSpec and leave the plan stale (demo readers use the plan first).

### 2. CocoaPods + New Architecture + Hermes on the existing iOS template

Keep `mobile/ios` as the 0.81 CLI app. Run `pod install` from `mobile/ios` (commit `Podfile.lock`; continue to gitignore `Pods/`). Ensure New Architecture and Hermes are on for iOS (RN 0.81 default is on; if the template omitted `ios/Podfile.properties.json` / `RCT_NEW_ARCH_ENABLED`, add the equivalent the 0.81 template uses so `pod install` does not silently flip them off). Autolinking must pick up `rn-savings-notifier` via `RnSavingsNotifier.podspec` — do not copy `.mm` into the host.

Simulator is the launch gate (`react-native run-ios` from `mobile/`, or root `npm run ios`). Physical device is optional and MUST NOT block merge.

**Alternatives considered:** Expo prebuild (forbidden). Regenerating the whole `mobile/` app (destroys Fases 1–8). Vendoring Pods (repo bloat; lockfile is enough).

### 3. Copy `web/` into the iOS bundle; resolve a `file://` URI at runtime

Mirror Android’s Gradle copy with an Xcode Run Script build phase: copy `index.html` and `app.js` from the workspace `web/` into `$(UNLOCALIZED_RESOURCES_FOLDER_PATH)/web/`. Source of truth stays `web/`; do not maintain a second hand-edited copy under `mobile/ios`.

WKWebView needs an absolute `file://` URI. Metro’s debug `scriptURL` is `http://localhost`, so it cannot derive the HTML path. Add a **host-only** blocking native getter in `mobile/ios` (not in `libreria/`) that returns `[[NSBundle mainBundle] URLForResource:@"index" withExtension:@"html" subdirectory:@"web"]`. JS:

- Android: keep `file:///android_asset/web/index.html`
- iOS: that bundle URL

`allowingReadAccessToURL` on iOS MUST be the **`web/` directory** URI (not only `index.html`) so the sibling `app.js` loads. Origin whitelist and `allowFileAccess` stay as today. Do not load `https`.

Unit-test the URI helper: iOS mock is not `android_asset`; Android stays the current asset URI. Container tests keep injecting a fixture URI.

**Alternatives considered:** `react-native-fs` (new npm package). Inlining HTML into JS (breaks `<script src="app.js">`). Relative `web/index.html` without `file://` (WKWebView fails). Putting the getter on `rn-savings-notifier` (wrong package). Keeping the Android URI on iOS (blank WebView).

### 4. iOS TurboModule: toast-like overlay + `UIAlertController`

Stay in `libreria/ios`. Main queue for all UI. Empty `goalName` resolves without UI.

`notifyGoalCompleted` / `notifyGoalCreated`: non-blocking overlay on the key window (rounded label, ~2s auto-dismiss), copy aligned with Android: `Meta completada: {goalName}` and `Meta registrada: {goalName}`. Do not use `UNUserNotificationCenter` (permission prompt). Do not use `UIAlertController` for these (would block the deposit/create flow).

`showConfirmDialog`: `UIAlertController` alert from the presented view controller (`RCTPresentedViewController()`). Cancel action → `false`. Confirm action → `true`. Dismiss / no presenter → `false` (do not delete). Guard against double-resolve. Stop resolving `@YES` unconditionally.

JS wrappers and Jest mocks stay unchanged (already forward the three methods). Native rebuild after `.mm` changes (`pod install` if the podspec/codegen changes, then `npm run ios`).

**Alternatives considered:** Leave iOS as a resolving stub (delete skips confirm; HU 4 is invisible). Local notifications (permission). RN `Alert` in the host (specs forbid it). Snackbar in `mobile/` (bypasses the library).

### 5. No product JS changes beyond the WebView URI

Do not add a fourth feature. Do not change Zod, use cases, slice, DI, or listeners. Production `GoalNotifier` and `ConfirmDialog` adapters already call the package; once iOS native shows UI, those paths work on both platforms.

**Alternatives considered:** Platform-specific JS forasts in the notifications feature (duplicates the library). A second HTML file for iOS (duplicated handshake).

## Risks / Trade-offs

- **[Risk] First `pod install` fails on hoisted RN path** → Mitigation: keep the template’s `require.resolve("react-native/scripts/react_native_pods.rb")`; use `install-strategy=nested` already in `.npmrc`; document running install from `mobile/ios`.
- **[Risk] WKWebView blocks `app.js` when read access is only the HTML file** → Mitigation: `allowingReadAccessToURL` is the `web/` directory; verify both files land in that folder.
- **[Risk] Host bundle-path getter is missing in Debug** → Mitigation: copy happens in a build phase, not Metro; smoke-check detail WebView on Simulator after `run-ios`.
- **[Risk] `showConfirmDialog` with no presenter auto-deletes** → Mitigation: resolve `false` when `RCTPresentedViewController()` is nil, matching Android’s no-activity path.
- **[Risk] Overlay toast is covered by the stack header** → Mitigation: pin the overlay to the bottom of the key window (Android Toast is bottom-weighted).
- **[Risk] ObjC change ignored by Metro** → Mitigation: native rebuild is a demo task; document `pod install` + `npm run ios`.
- **[Trade-off] Simulator-only gate** → Matches “enable execution”; device signing is Fase-11 README honesty if still missing.
- **[Trade-off] Custom overlay vs iOS notification** → Overlay needs no permission and matches Android Toast’s non-blocking demo.

## Migration Plan

Additive on `feat/fase-9-ios-host`: plan/README phase shift, root `ios` script, Podfile.lock, iOS web copy + URI helper, real `libreria/ios` UI. Rollback: revert the branch; Android behavior unchanged. After merge, demo on Simulator: list → detail/abono → native completion overlay at 100%; FAB → form → overlay “Meta registrada”; long-press → `UIAlertController` → cancel keeps the row, confirm removes it. Native rebuild required once.

## Open Questions

None. Phase numbering, Pods, web-bundle copy, host URI getter, overlay vs notification, and `UIAlertController` confirm are decided above and match the specs.
