## Why

Fase 1 left `core/` and feature application slots empty so Metro and the Android host could land first. HU 1–4 still need a pure domain, typed ports, and a Zod `postMessage` catalog before any store or screen, otherwise later phases would mix business rules with Redux and the WebView. This change fills that kernel and proves it with tests that do not touch UI.

## What Changes

- Add immutable domain types in `mobile/src/core/domain`: `Money`, `Progress`, and `SavingsGoal` (including `applyDeposit`).
- Add application ports in `mobile/src/core/application/ports`: `GoalsRepository`, `GoalNotifier`, and `ConfirmDialog`.
- Add use cases `GetGoals` and `MakeDeposit` that depend only on those ports, exercised with in-memory / no-op fakes.
- Add a Zod catalog and parser in `mobile/src/core/contracts` for the closed `postMessage` envelope (`unknown` → discriminated union or typed parse error).
- Add Jest coverage for domain, parser, and use cases (domain coverage ≥70%). Depend on `zod` from the `mobile` workspace.
- Keep `App.tsx`, the RTK store, `createAppDependencies`, feature screens, and `web/` behavior unchanged. Application code MUST NOT import `rn-savings-notifier`; that stays behind `GoalNotifier`.

## Capabilities

### New Capabilities

- `savings-goal-domain`: savings-goal entities and value objects, application ports, `GetGoals` / `MakeDeposit`, and fake-backed unit tests with no React Native UI.
- `postmessage-contract`: Zod schemas for Web→Native and Native→Web envelopes and a parser that accepts `unknown` and returns a discriminated union or a parse error.

### Modified Capabilities

- `mobile-host`: the reserved kernel slots MAY now contain domain, ports, and contracts; the host MUST still omit a configured store, feature navigation, and Zod parsing inside `App.tsx` (the parser lives in `core/contracts` and is tested in isolation).

## Impact

- **Code:** files under `mobile/src/core/domain`, `mobile/src/core/application/ports`, `mobile/src/core/contracts`, `mobile/src/features/goals/application`, `mobile/src/features/goal-detail/application`, plus colocated `*.test.ts`. Test fakes only (no production InMemory adapter wired into DI).
- **APIs:** typed domain operations and port interfaces; `parseNativeBridgeMessage` (name may vary) for `{ type, payload }` JSON. No change to the `rn-savings-notifier` public JS API or to `web/` emitters.
- **Dependencies:** add `zod` to `mobile`. Jest stays the runner. No Redux, no WebView adapter, no TurboModule adapter in this change.
- **Systems:** `npm test` (root → `mobile`) covers domain + parser + use cases. Android launch behavior is unchanged.
- **Out of scope (later phases):** RTK `extraArgument` and list UI (Fase 3), bridge `injectJavaScript` / WebView wiring (Fase 4), real Toast / confirm dialog native (Fase 5), persisted `GoalsRepository` (Fase 6).
