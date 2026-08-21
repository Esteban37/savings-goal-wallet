---
name: typed-postmessage-handler
description: >-
  Adds or extends a typed WebView postMessage handler for Savings Goal Wallet.
  Use when changing parseBridgeMessage, Zod bridge schemas, WEB_READY,
  DEPOSIT_REQUESTED, CREATE_REQUESTED, SESSION_BOOTSTRAP, or native-to-web
  injectJavaScript envelopes.
---

# Typed postMessage handler

Repeatable flow for the **mobile** host: validate `unknown` (object or JSON string) with the Zod envelope, return a discriminated union or a typed error, and cover it with Jest. Domain stays native; the web only **requests**.

## Where it lives

- Schemas: `mobile/src/core/contracts/schemas.ts` (`bridgeMessageSchema`)
- Parser: `mobile/src/core/contracts/parse-bridge-message.ts` (`parseBridgeMessage`)
- Tests: `mobile/src/core/contracts/parse-bridge-message.test.ts`
- Adapter that calls the parser: `mobile/src/features/goal-detail/infrastructure/`

Do **not** put Zod or React Native in `core/domain`. Do **not** add a `web/` test suite. Do **not** invent types outside the frozen catalog in `docs/PLAN_EJECUCION.md` §4.

## Envelope

Single shape: `{ type, payload }`. Parser accepts a parsed object **or** a JSON string. Invalid JSON or schema failure → `err('invalid-message')` via `Result` from `core/domain/result`. Success → `ok(parsed.data)` with a discriminated `type`.

Catalog (closed):

**Web → native:** `WEB_READY`, `DEPOSIT_REQUESTED`, `CREATE_REQUESTED`  
**Native → web:** `SESSION_BOOTSTRAP`, `DEPOSIT_SUCCEEDED`, `DEPOSIT_FAILED`, `CREATE_SUCCEEDED`, `CREATE_FAILED`

Use `DEPOSIT_REQUESTED` (the web asks). Do **not** treat a web `DEPOSIT_CONFIRMED` as the source of truth.

## Steps

1. Add or extend the Zod schema in `schemas.ts` (discriminated union on `type`). No `any`.
2. Keep `parseBridgeMessage(input: unknown)` as the only public parse entry.
3. Wire the adapter: parse → use case via thunk `extra` → `injectJavaScript` of the matching native-to-web type.
4. Tests (fixture names `inputX` / `actualX` / `expectedX`):
   - valid object envelope
   - valid JSON string
   - unknown `type`
   - missing required payload field
   - malformed JSON string → `invalid-message`

## Reject

- Confirming the deposit inside `web/` and skipping `MakeDeposit`
- `as any` on `event.nativeEvent.data`
- Fetch/HTTP instead of `postMessage`
- Tests under `web/`
