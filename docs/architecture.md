# Architecture

Readable map of Savings Goal Wallet. Frozen decisions (scope, phase order, folder tree, `postMessage` catalog) live in [`PLAN_EJECUCION.md`](PLAN_EJECUCION.md). This file names the patterns in the running codebase.

## Layers (inside each feature)

```
  Presentation  →  Application  →  Domain
                         │
                         ▼
                  Infrastructure
```

| Layer | Owns | Must not |
|-------|------|----------|
| **Domain** (`core/domain`) | `SavingsGoal`, `Money`, `Progress`, `Result` | Import React, RN, Redux, Zod UI |
| **Application** | Use cases `GetGoals`, `MakeDeposit`, `CreateGoal`, `DeleteGoal` and ports | Know WebView, Toast, AsyncStorage |
| **Infrastructure** | Persist adapter, Zod bridge adapter, RTK slice, TurboModule adapters | Business rules that belong on the entity |
| **Presentation** | Container-Presenter + templates | Instantiate adapters or call TurboModules |

Shared kernel: `mobile/src/core/` (domain, ports, contracts). Features: `goals` (HU 1 + alta/baja), `goal-detail` (HU 2–3 WebView), `notifications` (HU 4 listener). Composition root: `mobile/src/app/` (`createAppDependencies`, store, listeners).

## Cross-feature decoupling

Features import other features only through `public.ts`. Cross-feature reactions (deposit completed → native notify) are **listener middleware**, not container-to-container calls. That lets integral teams own a feature without opening another feature’s `presentation/` or internal `store/`.

## Named patterns

- **Container-Presenter** — `GoalListContainer` reads selectors / dispatches; `GoalListPresenter` is UI. Presenters are tested with props.
- **Explicit DI** — `createAppDependencies()` builds repository, use cases, notifier, confirm dialog. No Inversify/tsyringe.
- **DI with Redux Toolkit** — `configureStore({ middleware: thunk.withExtraArgument(dependencies) })`. Reducers stay serializable. Thunks take use cases from `extra`.
- **Repository** — `GoalsRepository` port; in-memory then AsyncStorage adapter (same use cases).
- **Adapter** — `parseBridgeMessage` (unknown → domain event); `RnSavingsNotifierAdapter` (port → `rn-savings-notifier`).
- **TurboModule** — native library is first-class (`libreria/`), autolinked, never vendored into `mobile/`.
- **Immersive template** — deposit/create occupy the full screen; native shell is SafeArea + back + title.
- **Atomic (pragmatic)** — tokens + `MoneyText` / `ProgressBar` in `shared/ui`. No empty `Button`/`Spacer` atoms. `GoalListItem` stays in the `goals` feature until a second consumer appears.

## Import rules

See [`AGENTS.md`](../AGENTS.md). `core/` must not import `features/`. Presentation must not `new` adapters.
