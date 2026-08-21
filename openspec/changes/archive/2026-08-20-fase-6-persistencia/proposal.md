## Why

Abonos already go through `MakeDeposit` and the `GoalsRepository` port, but production still injects an in-memory seed. Killing the app resets every deposit, so the list and WebView demo cannot show a durable wallet. Fase 5 closed HU 4; the port is already exercised, so this stretch phase can swap the adapter without touching domain or use cases.

## What Changes

- Add a production `GoalsRepository` adapter that persists goals with `@react-native-async-storage/async-storage` (CLI package, not Expo).
- Keep `GetGoals` and `MakeDeposit` unchanged; they keep talking to the port.
- Seed only when storage is empty; after a successful deposit, a later launch MUST show the updated deposited amounts without re-seeding over user data.
- Validate persisted JSON with Zod and map snapshot ↔ `SavingsGoal` with unit tests (fake key-value store, no emulator).
- Wire the persisted adapter in `createAppDependencies`. Keep `InMemoryGoalsRepository` for use-case tests.

## Capabilities

### New Capabilities

- `goals-persistence`: durable goals storage behind `GoalsRepository` — AsyncStorage adapter, persisted snapshot schema, seed-if-empty, snapshot ↔ domain mapper tests.

### Modified Capabilities

- `goals-list`: first launch still shows the two-to-three seeded goals when storage is empty; after a persisted deposit and process restart, the list MUST show the stored deposited amounts and percents (not the original seed).
- `mobile-host`: composition root MUST inject the persisted repository in production. The host MUST NOT add Expo or any Expo storage SDK.

## Impact

- **Code:** `mobile/src/features/goals/infrastructure` (persisted adapter, snapshot schema/mapper, seed-if-empty), `mobile/src/app/di/create-app-dependencies.ts`, colocated mapper/adapter tests. Domain, use cases, slice, WebView, `web/`, and `libreria/` stay unchanged.
- **APIs:** `GoalsRepository` (`list` / `getById` / `save`) is unchanged. No change to `postMessage`, `rn-savings-notifier`, or RTK snapshot shape used by the list.
- **Dependencies:** add `@react-native-async-storage/async-storage` to `mobile`. No Expo. Jest tests MUST inject a fake key-value store (or mock AsyncStorage); they MUST NOT require an emulator.
- **Systems:** Android demo: deposit → kill app → relaunch → list shows the new acumulado. First install still shows the frozen seed.
- **Out of scope:** CRUD of goals, encryption, backend sync, MMKV, Expo SecureStore, IA docs (Fase 7), README closure (Fase 8). A one-line README note that persistencia landed MAY be included so the phase table is not stale.
