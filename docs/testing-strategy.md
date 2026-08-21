# Testing strategy

Aligned with explicit DI. Freeze: [`PLAN_EJECUCION.md`](PLAN_EJECUCION.md) §7 and §9.

## What is tested

| Layer | What | How |
|-------|------|-----|
| Domain | Money, progress, deposit, create/delete rules | Unit, no mocks |
| Parser | Bad JSON, extra types, valid envelope | Zod + `parseBridgeMessage` |
| Use cases | `MakeDeposit`, `GetGoals`, `CreateGoal`, `DeleteGoal` | Fake `GoalsRepository` |
| Slice / selectors | `depositApplied` updates acumulado | Pure reducer |
| Container | List shows percent | RNTL + `createTestStore(fakeDeps)` |
| Presenter | Tap callback | Props, no store |
| Library JS | Wrappers call TurboModule spec | Jest mock of `NativeRnSavingsNotifier` |
| **web/** | — | **No test runner** (quality = handshake in the host) |

Fixture names: `inputX`, `mockX`, `actualX`, `expectedX`.

Instrumented Toast/overlay tests are **not** a merge gate. JS of the library is.

## Commands

From the repository root (no emulator):

```bash
npm test
npm run test:coverage
```

Workspaces:

```bash
npm test -w mobile
npm run test:coverage -w mobile
npm test -w libreria
npm run test:coverage -w libreria
```

## Coverage gate

- **mobile:** Jest `coverageThreshold` ≥70% on `collectCoverageFrom` (domain, contracts, use cases, slices, adapters listed in `mobile/jest.config.js`).
- **libreria:** ≥70% lines/functions/branches/statements on `src/**/*.ts` excluding tests.
- Declared product bar: **≥70% on domain + pure use cases**.

## What we do not test here

- `web/` HTML/JS (no Jest in that workspace)
- XCUITest / Detox / Espresso as CI gate
- App Store / TestFlight flows
