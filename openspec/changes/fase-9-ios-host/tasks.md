## 1. Phase numbering

- [x] 1.1 Insert Fase 9 (entorno iOS: Simulator, web bundle, TurboModule nativo real) in `docs/PLAN_EJECUCION.md`, rename today’s Fase 9 → Fase 10 (IA gobernada) and Fase 10 → Fase 11 (documentación y cierre), update the ASCII diagram, intro “fases 9–10”, §6 Android-only demo line, §8 headings, recorte “iOS nativo de la librería”, demo walkthrough, checklist, and §13 table, and verify those sections use 9 = this work, 10 = IA, 11 = cierre
- [x] 1.2 Update the README phase table, “Fase actual” line, next-branch hint, and “Cómo ejecutar” so Fase 9 is this work (in progress), IA/cierre are 10/11, Mac/Xcode/simulator and `npm run ios` are documented, and verify no README row still lists “9 | IA gobernada”

## 2. iOS host wiring

- [x] 2.1 Add root `"ios": "npm run ios -w mobile"` beside `android` and verify `node -p "require('./package.json').scripts.ios"` prints that command
- [x] 2.2 Ensure iOS New Architecture and Hermes are enabled (add `Podfile.properties.json` or the 0.81 template equivalent if missing) and verify the iOS project config does not leave `newArchEnabled` / Hermes off
- [x] 2.3 Run `pod install` from `mobile/ios`, commit `Podfile.lock`, keep `Pods/` gitignored, and verify `mobile/ios/Podfile.lock` exists and lists `RnSavingsNotifier` (or the autolinked pod name) without copying `libreria/ios` into `mobile/`
- [x] 2.4 Confirm `rg "libreria/ios" mobile/src mobile/ios` (excluding Pods) is empty and `mobile/package.json` has no Expo dependency

## 3. Local web assets on iOS

- [x] 3.1 Add an Xcode Run Script build phase that copies `web/index.html` and `web/app.js` into `$(UNLOCALIZED_RESOURCES_FOLDER_PATH)/web/`, leave Android `copyWebAssets` in place, and verify `git diff -- mobile/android` does not delete the Gradle web copy
- [x] 3.2 Add a host-only blocking native getter in `mobile/ios` that returns the main-bundle `web/index.html` `file://` URL (not in `libreria/`) and a JS helper that uses `file:///android_asset/web/index.html` on Android and that getter on iOS, and verify a colocated test: Android path stays the asset URI; iOS mocked path is not `android_asset` and is a `file://` URI ending in `web/index.html`
- [x] 3.3 Point deposit and create WebViews at the helper, set iOS `allowingReadAccessToURL` to the `web/` directory URI, keep `javaScriptEnabled` / file access / no `https`, and verify the template does not hardcode `file:///android_asset/web/index.html` as the only URI

## 4. iOS native library UI

- [x] 4.1 Implement iOS `notifyGoalCompleted` and `notifyGoalCreated` as a main-thread non-blocking overlay on the key window (`Meta completada: {goalName}` / `Meta registrada: {goalName}`, empty name resolves without UI, ~2s dismiss, bottom-weighted) and verify `libreria/ios/RnSavingsNotifier.mm` no longer resolves those methods with no UI
- [x] 4.2 Implement iOS `showConfirmDialog` as `UIAlertController` on `RCTPresentedViewController()` (confirm → `true`, cancel/dismiss → `false`, no presenter → `false`, no double-resolve) and verify the method no longer resolves `@YES` without user input
- [x] 4.3 Confirm JS wrappers and Jest mocks still forward the three methods and verify `npm test -w libreria` exits 0 without a simulator

## 5. Coverage and freeze

- [x] 5.1 Confirm no fourth feature folder, no new npm packages, and no Expo, and verify `ls mobile/src/features` is still `goals`, `goal-detail`, `notifications` and `git diff -- package.json mobile/package.json libreria/package.json` does not add dependencies other than the root `ios` script
- [x] 5.2 Confirm domain, Zod catalog, persist, and Android Gradle copy are unchanged and verify `npm test` from the repository root exits 0 without an emulator, including the new iOS URI helper test

## 6. Simulator demo

- [ ] 6.1 Native-rebuild the iOS host (`pod install` if needed, then `npm run ios`) and on Simulator: launch shows the native list (not the micro-app); opening a goal loads the bundled web form (not `android_asset`); completing a goal shows overlay “Meta completada”; FAB → Viaje / 500000 shows overlay “Meta registrada” and a new row; long-press shows `UIAlertController`; cancel keeps the row; confirm removes it
