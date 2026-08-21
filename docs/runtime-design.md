# Runtime design

How Savings Goal Wallet behaves at runtime. Catalog and phase freeze: [`PLAN_EJECUCION.md`](PLAN_EJECUCION.md) §4–§6.

## Source of truth

The **native Redux store** holds the goal list and the result of deposits/creates/deletes. The WebView is a form surface. Killing the app keeps goals via AsyncStorage behind `GoalsRepository` (seed three goals only when storage is empty; an empty list is not re-seeded).

## WebView

`web/index.html` + `web/app.js` ship as local files (`file://`). Android copies them to assets; iOS copies them into the app bundle. The launch screen is the native list. Detail and create load a **platform-local** URI (never `https`, never `file:///android_asset/...` on iOS).

Communication is **only** `postMessage` / `injectJavaScript`. No `fetch`.

## `postMessage` catalog

Envelope: `{ type, payload }` JSON. Native validates with Zod (`parseBridgeMessage`).

### Web → native

| `type` | `payload` | When |
|--------|-----------|------|
| `WEB_READY` | `{ goalId }` | Micro-app loaded |
| `DEPOSIT_REQUESTED` | `{ goalId, amount }` | User confirms a deposit |
| `CREATE_REQUESTED` | `{ name, targetAmount }` | User confirms a new goal |

The web **requests**; `MakeDeposit` / `CreateGoal` decide. A web-side “confirmed” event is not the source of truth.

### Native → web

| `type` | `payload` | When |
|--------|-----------|------|
| `SESSION_BOOTSTRAP` | `{ sessionId, goalId, userInfo, mode, goal? }` | After `WEB_READY`. `mode`: `deposit` \| `create` |
| `DEPOSIT_SUCCEEDED` | `{ goalId, depositedAmount, progressPercent, isCompleted }` | Use case OK |
| `DEPOSIT_FAILED` | `{ goalId, reason }` | Invalid amount or rule |
| `CREATE_SUCCEEDED` | `{ goal }` | Create OK |
| `CREATE_FAILED` | `{ reason }` | Invalid name or target |

## Store wiring

`createAppDependencies()` builds ports and use cases. `configureStore` injects them as `thunk.extraArgument`. `depositApplied` / `goalCreated` / `goalDeleted` update the `goals` slice. The list re-renders from selectors **without** reloading the WebView host.

`registerNotificationsListeners` (app composition root) reacts to a completed deposit → `GoalNotifier.notifyGoalCompleted`. Create success → `notifyGoalCreated`. Delete uses `ConfirmDialog` **before** `DeleteGoal`.

## Native library at runtime

Package `rn-savings-notifier`:

- Android: Toast on the main thread
- iOS: non-blocking overlay; `UIAlertController` for confirm

Empty goal names resolve without UI. Cancel or missing presenter → `false` (do not delete). Native rebuild after Kotlin/ObjC changes.

## Appearance

Host follows system / light / dark (control in the stack header, persisted). The micro-app follows the resolved scheme with `data-theme` on bootstrap (no extra `postMessage` type).
