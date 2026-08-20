## Context

See `proposal.md` for motivation. Fase 1 is merged: `mobile/src/core/{domain,application/ports,contracts}` and feature `application/` barrels are `export {}`. `createAppDependencies` returns `{}`; `createAppStore` returns `null`; `App.tsx` still logs WebView messages and does not parse them. Architecture and the `postMessage` catalog are frozen in `docs/PLAN_EJECUCION.md` §§2, 4, 5, and 8 (Fase 2). Specs for this change: `savings-goal-domain`, `postmessage-contract`, and the `mobile-host` kernel/launch-screen delta.

Constraints: TypeScript strict, no `any` in the parser, domain modules must not import React / RN / Redux / `rn-savings-notifier`, tests run with the existing RN Jest preset, Android launch behavior stays as Fase 1.

## Goals / Non-Goals

**Goals:**

- Land a pure kernel (values, entity, ports, two use cases, Zod catalog + parser) that Fase 3–5 can import without reshaping types.
- Prove it with Jest: domain + parser + use cases, coverage ≥70% on that set, no emulator.
- Keep the composition root and launch WebView untouched so Metro/Android wiring is not reopened.

**Non-Goals:**

- Wiring `extraArgument`, slices, or replacing the WebView launch screen (Fase 3).
- `injectJavaScript` / outbound bootstrap from the host (Fase 4). The parser exists; `App.tsx` must not call it.
- Production InMemory seed in DI, AsyncStorage, or real Toast/AlertDialog adapters.
- Changing `web/` emitters or adding tests under `web/`.

## Decisions

### 1. Integer `Money` in whole COP, two construction paths

Store amounts as `number` integers (pesos), not floats and not a decimal library. COP has no circulating centavos in this product; `docs/PLAN_EJECUCION.md` already prefers integers.

- `Money.zero()` and `Money.ofNonNegative(amount)` for **deposited** (0 allowed).
- `Money.ofPositive(amount)` for **deposits** and **target** (must be `Number.isInteger`, finite, `> 0`).

Reject fractional, `NaN`, and `±Infinity` with a typed error (`invalid-amount`). Do not use `bigint` (JSON and Zod stay simple).

**Alternatives considered:** Decimal.js (overkill). Store centavos (no COP cents). Allow float and round (hidden money bugs).

### 2. Discriminated `Result` instead of throw for domain and use cases

Share a tiny helper (no extra package):

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

`SavingsGoal.applyDeposit`, `GetGoals`/`MakeDeposit`, and the bridge parser all return `Result`. Error values are string-literal unions (`invalid-amount` | `goal-not-found` | `invalid-goal` | `invalid-message`), not `Error` subclasses and not `any`. Callers in Fase 3 map these onto `DEPOSIT_FAILED.reason`.

**Alternatives considered:** Throw (harder to type, easy to miss in thunks). `neverthrow` (new dependency for two use cases).

### 3. `Progress` is derived, not persisted

`SavingsGoal` keeps `id`, `name`, `target: Money`, `deposited: Money`. `progress(): Progress` computes percent as `Math.min(100, floor(deposited * 100 / target))` with integer arithmetic, and `isCompleted` when `deposited >= target`. Cap at 100 if deposited exceeds target (overshoot allowed; do not reject a completing deposit).

**Alternatives considered:** Store percent on the entity (can drift). Reject deposits past target (blocks HU 4 “reach 100%” if the last abono overshoots).

### 4. Use cases live in features; ports and fakes live in `core/`

Per the frozen tree:

| Unit | Path |
| --- | --- |
| `GetGoals` | `features/goals/application/get-goals.ts` |
| `MakeDeposit` | `features/goal-detail/application/make-deposit.ts` |
| Ports | `core/application/ports/` |
| Test fakes | `core/application/ports/fakes/` |

Factories take ports: `createGetGoals({ repository })`, `createMakeDeposit({ repository })`. `MakeDeposit` MUST NOT take `GoalNotifier` (notifications are a later listener). Fakes (`InMemoryGoalsRepository`, `NoopGoalNotifier`, `AlwaysConfirmDialog`) are imported from tests only. `createAppDependencies.ts` stays an empty record.

Fase 3 may promote the in-memory fake into `features/goals/infrastructure` and wire it in DI; that move is out of this change.

**Alternatives considered:** Both use cases in `core/` (violates feature-first). InMemory already in `app/di` (pulls Fase 3 into Fase 2).

### 5. Zod catalog: two discriminated unions, one `parseBridgeMessage`

Add `zod` to the `mobile` workspace. Define:

- `webToNativeMessageSchema` — `WEB_READY` | `DEPOSIT_REQUESTED`
- `nativeToWebMessageSchema` — `SESSION_BOOTSTRAP` | `DEPOSIT_SUCCEEDED` | `DEPOSIT_FAILED`
- `bridgeMessageSchema` — union of both (closed catalog)

`parseBridgeMessage(input: unknown)`:

1. If `typeof input === 'string'`, `JSON.parse` inside try/catch; invalid JSON → `{ ok: false, error: 'invalid-message' }`.
2. `bridgeMessageSchema.safeParse` (or equivalent). Use **strict** object schemas so extra payload keys fail rather than pass through unvalidated.
3. Map Zod failure to `{ ok: false, error: 'invalid-message' }` without exposing `any` or raw Zod types at the ports of the function.

`userInfo` on bootstrap: `z.record(z.string(), z.unknown())` (or an empty strict object plus later fields). Do not invent PII fields.

Export inferred types from the schemas. `core/contracts` MUST NOT import `core/domain` so the wire catalog can evolve without pulling entity constructors (Fase 4 maps `SavingsGoal` → bootstrap `goal` DTO).

**Alternatives considered:** Hand-written type guards (weaker, more `any`). Separate inbound-only parser (host still does not call it; one catalog function is enough to test Native→Web too). `passthrough()` extra keys (spec forbids unvalidated pass-through).

### 6. Tests colocated, fixtures named, coverage scoped

- Colocate `*.test.ts` next to the unit (`money.test.ts`, `parse-bridge-message.test.ts`, `get-goals.test.ts`, `make-deposit.test.ts`).
- Fixture names: `inputX`, `mockX`, `actualX`, `expectedX` (`docs/PLAN_EJECUCION.md` §9).
- Keep `mobile/__tests__/App.test.tsx` as-is (WebView + library mocks).
- Jest: `collectCoverageFrom` for `src/core/domain/**`, `src/core/contracts/**`, `src/features/goals/application/**`, `src/features/goal-detail/application/**` (exclude `index.ts` barrels and `ports/fakes` if they are trivial). Set `coverageThreshold` global or per those globs to 70. Root `npm test` already delegates to `mobile`.

Do not add a second test runner. Do not test `App.tsx` parsing (it must not parse).

### 7. Leave the host and DI frozen

Do not edit `App.tsx`, `store.ts`, `listener-middleware.ts`, or `create-app-dependencies.ts` except if a type-only import is required (it is not). Launch screen continues to `console.log` `onMessage`. Domain barrels replace `export {}` with real re-exports.

## Risks / Trade-offs

- **[Risk] RN Jest preset pulls native mocks into pure tests** → Mitigation: keep tests free of RN imports; if a file accidentally imports RN, the test fails fast. Domain files must not import `react-native`.
- **[Risk] Integer percent truncates (e.g. 1/3 → 33)** → Mitigation: acceptable for HU 1 display; document `Math.floor`. Do not round up to 100 until deposited ≥ target.
- **[Risk] Strict Zod rejects a future web field** → Mitigation: catalog is frozen for HU 1–4; adding a type is a new change. Prefer fail-closed.
- **[Risk] Fase 3 duplicates InMemory if the fake stays test-only** → Mitigation: keep the fake small and importable; Fase 3 moves it to infrastructure in one file rename, no behavior change.
- **[Risk] Existing `App.test.tsx` still mounts the WebView mock** → Mitigation: leave it; coverage threshold applies only to the globs above, not to `App.tsx`.

## Migration Plan

Additive only. Install `zod` in `mobile`, add files under reserved folders, extend Jest coverage config. No data migration (no persistence). Rollback: revert the change branch; remove `zod` if unused. Android/iOS binaries are unaffected.

## Open Questions

None. Catalog, integer COP, and “parser exists but App does not call it” are frozen in the execution plan.
