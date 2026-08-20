## 1. Root workspace

- [x] 1.1 Add a private root `package.json` with `workspaces: ["mobile", "libreria", "web"]` and delegate scripts (`start`, `android`, `test` → `npm run -w mobile …`), plus `.npmrc` with `install-strategy=nested` and a root `.gitignore` for `node_modules/`, native build outputs, and Metro cache, without deleting `docs/` or `openspec/` — verify those three files exist and `docs/` and `openspec/` are unchanged
- [x] 1.2 Resolve the newest published React Native **0.81.x** patch with `npm view react-native versions --json` (do not use 0.82+) and record the pin in the root README stub or a comment in root `package.json` — verify the chosen version matches `^0.81.` and is not 0.82 or higher

## 2. Mobile CLI host

- [x] 2.1 Scaffold the app with `@react-native-community/cli` into `mobile/` (`SavingsGoalWallet`, `--version 0.81.<patch>`, `--pm npm`, `--skip-git`, `--skip-install`) so the template does not overwrite the repo root — verify `mobile/package.json` lists `react-native` 0.81.x and `react` 19.x, and `mobile/android/` plus `mobile/ios/` exist
- [x] 2.2 Confirm New Architecture and Hermes on Android (`newArchEnabled=true`, Hermes enabled in the Gradle/template defaults) and that `mobile/package.json` has no Expo packages — verify those properties in `mobile/android/gradle.properties` and dependencies
- [x] 2.3 Keep the template TypeScript/Jest config and leave `index.js` (or the 0.81 entry file) ready to register the composition-root component — verify the entry file still calls `AppRegistry.registerComponent`

## 3. Library package

- [x] 3.1 Run `npx create-react-native-library@latest --help`, then scaffold a TurboModule into `libreria/` with Kotlin + Objective-C, `--no-interactive`, no nested example app, and `--no-git` (map `--slug` / `--example none` if the CLI supports them; delete `example/` if generated) — verify `libreria/android/`, `libreria/ios/`, and a TypeScript Codegen spec exist
- [x] 3.2 Set the package `"name"` to `rn-savings-notifier` and export `notifyGoalCompleted(goalName: string): Promise<void>` and `showConfirmDialog({ title, message }): Promise<boolean>` from `libreria/src/index.ts` as thin wrappers over the spec — verify `node -e` cannot run RN, so instead verify the named exports exist in `index.ts` and `package.json` `"name"` is `rn-savings-notifier`
- [x] 3.3 Implement Android Kotlin and iOS Objective-C stubs that resolve immediately (`true` for the dialog) without Toast, notifications, or alerts — verify both native module files exist under `libreria/` only (not under `mobile/`)

## 4. Web micro-app

- [x] 4.1 Add `web/package.json` (`private`, name `web`) plus `web/index.html` and `web/app.js` with no test files — verify `web/` has no `*.test.*`, `*.spec.*`, or test-runner config
- [x] 4.2 On load, post a JSON string `{ type: "WEB_READY", payload: { goalId } }` via `ReactNativeWebView.postMessage`, and show a visible button that posts `{ type: "DEPOSIT_REQUESTED", payload: { goalId, amount } }` with a hardcoded test amount — verify the source contains those `type` strings, uses `postMessage`, and has no `fetch` / XHR / native-module calls

## 5. Install, Metro, autolinking, assets

- [x] 5.1 Declare `rn-savings-notifier` as `"*"` on `mobile`, add `react-native-webview` to `mobile`, then run `npm install` from the repo root — verify the install exits 0 and `mobile/node_modules/rn-savings-notifier` (or the workspace symlink) resolves
- [x] 5.2 Extend `mobile/metro.config.js` with `watchFolders` (repo root), `nodeModulesPaths` (`mobile` then root `node_modules`), and `extraNodeModules` pinning `react` and `react-native` to `mobile/node_modules` — verify the file exports a Metro config that includes those keys
- [x] 5.3 Add or update `mobile/react-native.config.js` so autolinking finds `rn-savings-notifier` without copying native sources into `mobile/android` or `mobile/ios` — verify a search for the library’s Kotlin/ObjC filenames under `mobile/` returns no implementation files
- [x] 5.4 Wire Gradle so `web/` is bundled as Android assets under a `web/` path (`sourceSets` extra dir or a `copyWebAssets` task on `preBuild`) — verify `mobile/android` references `../../web` (or copies into `src/main/assets/web`) and does not keep a hand-maintained duplicate under `mobile/src`

## 6. Composition-root skeleton and host UI

- [x] 6.1 Create the frozen `mobile/src` tree from `docs/PLAN_EJECUCION.md` §3: `app/App.tsx`, `app/di/create-app-dependencies.ts`, `app/store/{store.ts,listener-middleware.ts}`, `core/{domain,application/ports,contracts}`, `features/{goals,goal-detail,notifications}/public.ts`, `shared/ui/{tokens,atoms}` with empty or minimal barrels and no entities, Redux store, or navigation — verify those paths exist and contain no `SavingsGoal` / reducer / navigator implementations
- [x] 6.2 Point the RN entry at `src/app/App.tsx` and implement that screen as a full-screen `WebView` loading `file:///android_asset/web/index.html` with JS and file access enabled, `onMessage` logging (no Zod), and a `useEffect` that imports `rn-savings-notifier` and calls `notifyGoalCompleted('scaffold')` — verify `App.tsx` imports the package name (not a relative native path) and uses the Android asset URI
- [x] 6.3 Write a short root `README.md` with Node/RN 0.81, `npm install`, `npm start`, and `npm run android` only (not the full product README) — verify a clone-and-run section exists

## 7. Android close

- [x] 7.1 Start Metro and `npm run android`, confirm the app opens, the WebView shows the test button, tapping it does not crash, and the library call at startup does not crash — verify on an emulator or device that those three behaviors hold (Android is the Fase 1 gate; iOS is not required)
