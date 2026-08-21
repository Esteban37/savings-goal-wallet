## Context

See `proposal.md` for motivation and `specs/goal-detail/spec.md`, `specs/goals-list/spec.md`, `specs/mobile-host/spec.md`, and `specs/web-micro-app/spec.md` for behavior. Fase 3 is archived: RTK store with `extra.getGoals` / unused-from-UI `makeDeposit`, native list, `depositApplied` reducer, `parseBridgeMessage` in `core/`, and `web/` still a scaffold button. Architecture for this phase is frozen in `docs/PLAN_EJECUCION.md` §§2.2–2.6, §4 (catalog + sequence), and §8 (Fase 4).

Constraints: TypeScript strict, RN 0.81 / React 19, no Expo, no persistence package, no tests in `web/`. Presentation does not instantiate adapters. Features import other features only through `public.ts`. Reducers stay pure; I/O lives in thunks via `extraArgument`.

## Goals / Non-Goals

**Goals:**

- Ship HU 2–3: list → immersive local WebView → `MakeDeposit` → list shows new acumulado on back without reload.
- Keep one store instance across the stack; `depositApplied` is the list update path (not a second `fetchGoals` after every abono).
- Reuse the existing Zod catalog and parser; add only encode + inject + `onMessage` wiring.
- Register the HU 4 listener against `NoopGoalNotifier` so Fase 5 only swaps the adapter.

**Non-Goals:**

- Real Toast / `POST_NOTIFICATIONS` / native confirm dialog (Fase 5).
- AsyncStorage (Fase 6).
- Changing `MakeDeposit` rules, seed rows, or the closed message catalog.
- Tests in `web/` or instrumented WebView E2E as a merge gate.
- Tabs, deep links, or a notifications UI screen.

## Decisions

### 1. Minimal React Navigation native stack in `app/`, not a feature-owned router

Add `@react-navigation/native`, `@react-navigation/native-stack`, and `react-native-screens` (required peer). `react-native-safe-area-context` is already in `mobile`. Enable screens on Android as the library docs require for RN 0.81.

`app/navigation` owns the stack (composition root). Two routes only:

| Route | Params | Screen |
| --- | --- | --- |
| `GoalList` | none | thin wrapper: `GoalListContainer` + `onGoalPress` → `navigation.navigate('GoalDetail', { goalId })` |
| `GoalDetail` | `{ goalId: string }` | `GoalDetailContainer` from `features/goal-detail/public.ts` |

`NavigationContainer` sits inside Redux `Provider` so both screens share the store created at module scope (same as Fase 3). Header: native stack header with back on detail; title from the selected goal name (selector). No tab navigator.

`features/goals` MUST NOT import `goal-detail`. `GoalListContainer` takes `onGoalPress?: (goalId: string) => void` (tests omit it or pass a mock).

**Alternatives considered:** Boolean/`selectedId` in Redux instead of a navigator (works, but back/gesture/header are worse and the plan calls for a stack). React Native `Modal` (not a back stack). Copy a hand-rolled card stack (more code than one well-known dependency).

### 2. Native→web via `injectJavaScript` + `window.__onHostMessage`; web→native via `onMessage`

Do **not** reuse `window.postMessage` for host→page: on Android/iOS it collides with the WebView `message` event and with RN’s own bridge.

Frozen protocol:

1. Web→native: `ReactNativeWebView.postMessage(JSON.stringify(envelope))` as today. Container `onMessage` passes `event.nativeEvent.data` to `parseBridgeMessage`.
2. Native→web: stringify a **already-typed** catalog object, then:

```js
webviewRef.injectJavaScript(
  `window.__onHostMessage(${json}); true;`
);
```

3. `web/app.js` assigns `window.__onHostMessage` and switches on `type` (`SESSION_BOOTSTRAP`, `DEPOSIT_SUCCEEDED`, `DEPOSIT_FAILED`). Ignore unknown/malformed payloads.

Encode helper in `features/goal-detail/infrastructure` (not `core/`): `serializeNativeToWeb(message: NativeToWebMessage): string` using `JSON.stringify` after constructing objects that match the Zod native-to-web schemas. Optionally `safeParse` before inject in debug; production injects the typed object.

WebView URI: `file:///android_asset/web/index.html`. Restore Fase 1 flags needed for local JS (`originWhitelist`, `allowFileAccess`, `allowingReadAccessToURL` as required by the current `react-native-webview`). `javaScriptEnabled`. Do not load `https`.

**Alternatives considered:** `injectedJavaScriptBeforeContentLoaded` for bootstrap (races `WEB_READY`; the spec requires bootstrap **after** ready). Query-string `goalId` on the file URI (file URIs and asset paths are brittle; store + handshake is the source of truth).

### 3. Handshake ignores `WEB_READY.goalId`; route param + store snapshot win

On `WEB_READY`, build `SESSION_BOOTSTRAP`:

- `sessionId`: unique per WebView mount (`${Date.now()}-${random}`).
- `goalId`: `route.params.goalId`.
- `userInfo`: `{}` (no PII).
- `goal`: `selectGoalById` snapshot mapped to catalog fields (`id`, `name`, `targetAmount`, `depositedAmount`, `progressPercent`).

If the id is missing from the store, inject `DEPOSIT_FAILED` is wrong; instead go back or show a native empty state and do not bootstrap. Web keeps a handshake `goalId` in `WEB_READY` (e.g. `pending`) so the catalog stays valid.

On `DEPOSIT_REQUESTED`, prefer **route** `goalId` if it disagrees with the payload (spec: host selected goal is source of truth). Still pass that id into `MakeDeposit`.

**Alternatives considered:** Trust web `goalId` (allows the scaffold placeholder to debit the wrong row). Put `goalId` only in JS init without `WEB_READY` (breaks the closed catalog and the sequence diagram).

### 4. `requestDeposit` thunk in `goal-detail`; `depositApplied` stays on `goals` public API

```
onMessage → parseBridgeMessage
  WEB_READY → inject SESSION_BOOTSTRAP
  DEPOSIT_REQUESTED → dispatch requestDeposit({ goalId, amount })
  parse error → no-op
```

`requestDeposit` (`createAsyncThunk` in `features/goal-detail/store`):

1. `extra.makeDeposit({ goalId, amount })`.
2. If `ok`: `dispatch(depositApplied(toGoalSnapshot(result.value)))` then return a `DEPOSIT_SUCCEEDED` payload.
3. If `err`: return / reject with `DEPOSIT_FAILED` `{ goalId, reason }` (`invalid-amount` | `goal-not-found`).

Container injects the native-to-web envelope from the thunk result (fulfilled/rejected). Do not run `MakeDeposit` inside the reducer.

Cross-feature import: export from `features/goals/public.ts` the actions/selectors detail needs (`depositApplied`, `selectGoalById`, `toGoalSnapshot` or a mapper colocated in goals). `goal-detail` MUST NOT import `features/goals/store/*` internals.

Do not add a second `goalDetail` slice for balances; the goals slice remains the applicative source of truth. A tiny `goal-detail` slice is allowed only for bridge UI (`injecting` / last error) if the presenter needs it — default to local React state in the container (`webReady`, last failure reason) to avoid a second source of money.

**Alternatives considered:** Put `requestDeposit` inside `goals` (then goals would own WebView types). Call `repository.save` from the container (violates extraArgument DI). `fetchGoals` after every deposit (reload path; forbidden by HU 3).

### 5. Container-Presenter for detail; web page owns the form chrome

```
App stack
  GoalListScreen → GoalListContainer → … (existing)
  GoalDetailScreen → GoalDetailContainer → WebViewHostPresenter → ImmersiveWebViewTemplate
```

- Container: `goalId` from route, selector snapshot, `WebView` ref, `onMessage`, dispatch thunk, `injectJavaScript`.
- Presenter: props only (`sourceUri`, `onMessage`, `onWebViewRef`, title, onBack if not using stack header).
- Template: SafeArea + WebView filling the rest; no native amount `TextInput`.

`web/index.html` + `app.js` (Spanish copy, no i18n package): waiting state until bootstrap; then name, amounts, percent, number input (whole pesos), confirm button; success paints new totals; failure shows an inline error. No `fetch`. No tests under `web/`.

**Alternatives considered:** Native deposit form with WebView only for “detail chrome” (violates HU 2). Shared RN atoms inside the HTML (impossible without a bundler; out of scope).

### 6. Notifications listener now, adapter still no-op

Replace `createAppListenerMiddleware(): null` with RTK `createListenerMiddleware`. `features/notifications/public.ts` exports `registerNotificationsListeners(middleware)` that listens to `depositApplied` (or `requestDeposit.fulfilled` if that action is public) and when `isCompleted` calls `listenerApi.extra.goalNotifier.notifyGoalCompleted(name)`.

`createAppStore` prepends that middleware. DI keeps `NoopGoalNotifier`. Do not import `rn-savings-notifier` from `notifications` in this change.

Keep `notifyGoalCompleted('scaffold')` on App mount so the existing library-import requirement still holds until Fase 5 moves the only call to the listener + real adapter.

**Alternatives considered:** Skip the listener until Fase 5 (then store wiring reopens). Call the notifier from `MakeDeposit` (forbidden by domain spec).

### 7. Dependencies and tests

Install from repo root into `mobile`: `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`. Align versions to RN 0.81 / React 19 at apply time.

Tests (fixtures `inputX` / `mockX` / `actualX` / `expectedX`):

| Unit | How |
| --- | --- |
| Bridge adapter | `parseBridgeMessage` + encode native-to-web JSON; invalid string → no deposit |
| `requestDeposit` thunk | fake `makeDeposit` ok → `depositApplied` snapshot; fake err → failed payload, store unchanged |
| Selector `selectGoalById` | fixture snapshots |
| List HU 3 | existing slice test already covers `depositApplied`; add or extend so 25000/25 → 35000/35 |
| Presenter (optional) | props, no store |
| `App.test.tsx` | still renders without crash; mock navigation + WebView as needed |

Do **not** mount a real WebView in Jest as the merge gate. Mock `react-native-webview`. Extend `collectCoverageFrom` with `src/features/goal-detail/{store,infrastructure}/**` (exclude barrels). Keep presentation out of the 70% domain gate.

**Alternatives considered:** Detox/E2E for the cycle (not in the test strategy table). Testing `web/app.js` with jsdom (plan: zero tests in `web/`).

## Risks / Trade-offs

- **[Risk] `file://` WebView blocks JS or `__onHostMessage` on newer Android** → Mitigation: restore Fase 1 file-access props; smoke-check `WEB_READY` then bootstrap on emulator as closure, not as the unit-test gate.
- **[Risk] React Navigation + RNTL breaks `App.test.tsx`** → Mitigation: wrap tests with `NavigationContainer` or mock `@react-navigation/native`; keep a shallow “renders without crash” assertion.
- **[Risk] `injectJavaScript` race before `app.js` assigns `__onHostMessage`** → Mitigation: only inject after `WEB_READY` (page finished its load handler).
- **[Risk] Feature boundary leak (`goal-detail` importing `goals/store`)** → Mitigation: export a narrow public surface from `goals/public.ts`; grep internals from `goal-detail`.
- **[Risk] Listener + scaffold `notifyGoalCompleted` double-calls on 100%** → Mitigation: seed has no completed goal; scaffold ping stays a startup smoke call; listener is no-op until Fase 5.
- **[Trade-off] Trusting host `goalId` over web payload** → Safer against the scaffold placeholder; document in README that the web `goalId` is informational after bootstrap.
- **[Trade-off] No E2E of HTML** → Unit tests prove parse → use case → store; demo on device proves the form.

## Migration Plan

Additive: navigation wrapper in `app/`, fill reserved `goal-detail` folders, extend `goals/public.ts` and list `onGoalPress`, replace `web/` dummy UI, wire listener middleware. Gradle copy of `web/` stays. Rollback: revert the change branch; in-memory seed has no user data to migrate. After merge, demo path is list → detail → abono → back.

## Open Questions

None. Stack vs local state, inject channel, handshake vs web `goalId`, thunk placement, and stub listener are decided above and match the specs.
