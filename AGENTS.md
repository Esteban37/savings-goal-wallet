# Agent guardrails — Savings Goal Wallet

Engineering rules for humans and AI. Frozen architecture and phase order: [`docs/PLAN_EJECUCION.md`](docs/PLAN_EJECUCION.md). Readable maps: [`docs/architecture.md`](docs/architecture.md).

## Import boundaries

| From | May import | Must not import |
|------|------------|-----------------|
| `mobile/src/core/` | domain, ports, contracts only | `features/`, React Native UI, Redux |
| `features/X` | `core/`, `shared/ui`, `Y/public.ts` | Internals of another feature (`presentation/`, private `store/`) |
| `mobile/src/app/` | composition root (store, DI, listeners) | — |
| `shared/ui` | RN, tokens | Feature use cases, domain persistence |
| `web/` | static HTML/JS + `postMessage` | npm tests, native modules, `fetch` |
| `libreria/` | TurboModule spec + wrappers | Host screens |

## DI and state

- Build adapters in `createAppDependencies()`. Presentation does not `new` repositories or TurboModules.
- Inject via `thunk.extraArgument`. Reducers stay serializable (snapshots, not class entities).
- No IoC container. No Expo.

## Native library

Consume `rn-savings-notifier` by package name. Never copy `libreria/android` or `libreria/ios` into `mobile/`.

## AI

Product skills and the boundary reviewer: `.cursor/skills/`, `.cursor/agents/`, mirrored under `mobile/` and `libreria/`. Record: [`docs/ia/USO_IA.md`](docs/ia/USO_IA.md).
