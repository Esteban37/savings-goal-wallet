## Why

Fase 2 left a tested kernel (`GetGoals`, `GoalsRepository`, domain types) disconnected from any store or screen, so HU 1 still has no native list. Wiring Redux Toolkit and the `goals` feature now makes the store the applicative source of truth before Fase 4 adds the WebView deposit cycle.

## What Changes

- Wire `createAppDependencies` with a seeded in-memory `GoalsRepository`, `GetGoals`, and the existing no-op notifier / confirm-dialog fakes.
- Configure the RTK store (`configureStore`, typed thunks, `extraArgument = dependencies`) and wrap the host with `react-redux` `Provider`.
- Add the `goals` slice (serializable snapshots, load via `GetGoals`, selector for the list) plus Container / Presenter / `GoalListTemplate`.
- Add shared UI tokens and atoms (`MoneyText`, `ProgressBar`) used by the list; `GoalListItem` stays in the `goals` feature.
- Replace the WebView launch screen with the native list (2–3 seed goals showing name, target, deposited, and progress percent). Bundled `web/` assets and the library import stay; no stack navigation and no deposit bridge.

## Capabilities

### New Capabilities

- `goals-list`: native savings-goal list (HU 1) — seeded data, RTK slice, Container-Presenter, and tests for reducer, selector, and list UI.

### Modified Capabilities

- `mobile-host`: the composition root MUST configure the application store and DI; the launch screen MUST be the native goal list instead of the full-screen WebView. Feature navigation and Zod parsing of WebView messages remain out of this change. The host MUST still import the savings-notifier library. Bundled local web assets MUST remain available for later phases.

## Impact

- **Code:** `mobile/src/app/{di,store,App.tsx}`, `mobile/src/features/goals/{store,infrastructure,presentation,public.ts}`, `mobile/src/shared/ui/{tokens,atoms}`, plus colocated tests. `GetGoals` and domain types are reused, not rewritten.
- **APIs:** no change to `rn-savings-notifier` or to `web/` emitters. Store exposes list snapshots and a load thunk; `depositApplied` may exist on the slice so Fase 4 can dispatch without reshaping state, but this change MUST NOT run `MakeDeposit` or talk to the WebView.
- **Dependencies:** add `@reduxjs/toolkit`, `react-redux`, and `@testing-library/react-native` to `mobile`. No Expo, no navigation library, no persistence package.
- **Systems:** `npm test` covers slice/selector plus an RNTL list test. Android launch shows the list, not the test micro-app. HTML remains in Android assets.
- **Out of scope (later phases):** list → detail navigation and bridge (Fase 4), real Toast / confirm adapters (Fase 5), AsyncStorage repository (Fase 6).
