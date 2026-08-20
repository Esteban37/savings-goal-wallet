## Why

Savings Goal Wallet is an npm workspaces monorepo with `web/`, `libreria/`, and `mobile/` and an incremental history. The repo today only has docs and OpenSpec config, so later stories would mix Metro, autolinking, and folder layout with domain work. Fase 1 freezes that wiring now so HU 1–4 only add files into an already-runnable Android host.

## What Changes

- Add an npm workspaces monorepo with packages `mobile`, `libreria`, and `web`.
- Scaffold `mobile/` as a React Native **0.81.x** CLI app (no Expo), TypeScript, Hermes, and New Architecture (`newArchEnabled=true`).
- Scaffold `libreria/` as `rn-savings-notifier`: TurboModule codegen spec, typed JS wrappers, Kotlin + iOS template stubs that resolve; consume it via workspace + autolinking (never copy native sources into `mobile/`).
- Add `web/` as a static HTML/JS micro-app that emits `WEB_READY` and a test `DEPOSIT_REQUESTED` (no tests under `web/`).
- Wire Metro, autolinking, `react-native-webview`, and a Gradle copy of `web/` so the host loads HTML from `file:///android_asset/web/...`.
- Create the frozen `mobile/src/` folder skeleton (composition root, `core/`, three features with barrels, `shared/ui`) with empty or minimal re-exports. No entities, Redux, Zod parsers, or feature navigation.

## Capabilities

### New Capabilities

- `monorepo-workspaces`: npm workspaces layout, root scripts, and Metro/Gradle wiring so the three packages install and resolve as one repo.
- `mobile-host`: React Native 0.81 CLI host that launches on Android, keeps New Architecture and Hermes, exposes the folder skeleton, and hosts a WebView of the local micro-app.
- `web-micro-app`: static HTML/JS that talks to the host only through `postMessage` envelopes (`WEB_READY`, `DEPOSIT_REQUESTED`).
- `rn-savings-notifier`: workspace library with TurboModule spec and JS API (`notifyGoalCompleted`, `showConfirmDialog`) whose stubs resolve when imported from `mobile/`.

### Modified Capabilities

- None. There are no specs under `openspec/specs/` yet.

## Impact

- **Code:** new `package.json` (root + three workspaces), `mobile/` RN project, `libreria/` native module package, `web/index.html` + `web/app.js`, Android Gradle copy of web assets, Metro config for workspace packages.
- **APIs:** public JS of `rn-savings-notifier` is stubbed; `postMessage` types exist only as the HTML payload shape (Zod lands in Fase 2).
- **Dependencies:** `@react-native-community/cli`, React Native 0.81.x, React 19, TypeScript, `react-native-webview`, `create-react-native-library` / bob for the TurboModule package. No Expo, no backend, no Redux/Zod in this change.
- **Systems:** Android is the Fase 1 close (app opens, WebView shows the test button, library import does not crash). iOS template from the library/app scaffolds is kept but is not the demo gate.
- **Out of scope (later phases):** domain entities, RTK store, Zod parsers, list/detail navigation, real Toast/notification native code.
