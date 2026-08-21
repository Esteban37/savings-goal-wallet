## Why

Fase 3 shipped HU 1 (native list + RTK store) with a no-op row press, while `web/` is still a dummy test button and `MakeDeposit` is wired in DI but never invoked. HU 2 and HU 3 require the immersive WebView detail, a typed `postMessage` cycle, and the list reflecting the new accumulated amount **without reload** on the same store.

## What Changes

- Add a minimal native stack: list → immersive WebView detail (back returns to the list).
- Fill `features/goal-detail`: Container / Presenter / `ImmersiveWebViewTemplate`, bridge adapter (Zod parse → `MakeDeposit` thunk → inject result), and public barrel.
- Wire `onGoalPress` to navigate with the selected `goalId`; load bundled `file:///android_asset/web/index.html`.
- After `WEB_READY`, the host injects `SESSION_BOOTSTRAP` with the selected goal from the store. On `DEPOSIT_REQUESTED`, run `MakeDeposit` via `extra`, dispatch `depositApplied`, and inject `DEPOSIT_SUCCEEDED` or `DEPOSIT_FAILED`.
- Replace the `web/` dummy page with detail UI driven by bootstrap data plus a deposit form (still static HTML/JS, `postMessage` only, no tests in `web/`).
- Register a notifications listener against the existing no-op notifier if a deposit completes a goal (stub only; no real Toast).

## Capabilities

### New Capabilities

- `goal-detail`: immersive WebView host for HU 2–3 — session bootstrap, deposit request handling through `MakeDeposit`, native-to-web result messages, and the list remaining the store source of truth after going back.

### Modified Capabilities

- `goals-list`: selecting a row MUST open the goal-detail WebView instead of staying on the list; after a successful deposit the row MUST show the new accumulated amount and percent without reloading the app or re-running get-goals as the update path.
- `mobile-host`: the host MUST provide a minimal stack (list as root, detail as the second screen) and MUST load the bundled local web assets on the detail screen only.
- `web-micro-app`: the page MUST render goal data from `SESSION_BOOTSTRAP`, MUST collect a deposit amount from the user (not a hardcoded test amount as the only path), MUST emit `DEPOSIT_REQUESTED` with the bootstrapped `goalId`, and MUST update its local UI on `DEPOSIT_SUCCEEDED` / `DEPOSIT_FAILED`. `WEB_READY` remains required on load.

## Impact

- **Code:** `mobile/src/app/App.tsx` (navigator), `mobile/src/features/goals` (navigate on press), `mobile/src/features/goal-detail/{infrastructure,store,presentation,public.ts}`, `mobile/src/app/store` (optional listener registration), `web/index.html` and `web/app.js`. Reuse `parseBridgeMessage`, `MakeDeposit`, `depositApplied`, and bundled Android `web/` assets. Do not rewrite domain or the Zod catalog.
- **APIs:** no change to `rn-savings-notifier` native implementations. Web emitters stay the closed catalog. Host injects Native-to-web envelopes via `injectJavaScript`.
- **Dependencies:** add a single stack navigator (`@react-navigation/native` + `@react-navigation/native-stack`) and its RN peer (`react-native-screens`). No Expo, no persistence package, no extra event bus.
- **Systems:** `npm test` covers bridge adapter, deposit thunk / `depositApplied` path, and an RNTL or unit test of list update after dispatch. Demo closure: tap goal → WebView form → abono → back → list shows new acumulado without reload. Android still copies `web/` into assets.
- **Out of scope (later phases):** real Toast / `AlertDialog` (Fase 5), AsyncStorage (Fase 6), CRUD of goals, remote URLs, tests in `web/`.
