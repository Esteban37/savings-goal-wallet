## Why

The product can list, deposit, persist, and notify on completion, but the user cannot add or remove savings goals. Fase 7 closed chrome; before IA docs and product closure, the demo needs create and delete so the list is not a fixed seed. The plan already allowed leftover CRUD after HU 4; this change takes that leftover as Fase 8.

## What Changes

- Insert this work as **Fase 8** in `docs/PLAN_EJECUCION.md`. Shift today’s Fase 8 (IA gobernada) to **Fase 9** and Fase 9 (documentación y cierre) to **Fase 10**. Update the phase diagram, the OpenSpec table, README phase mentions, and the “CRUD fuera de alcance” line so later phases are not overwritten.
- Add a native FAB on the goal list that opens the bundled web micro-app in an immersive WebView to register a new goal (name + target in whole pesos; deposited starts at 0), using the same `postMessage` handshake as the deposit flow.
- On successful registration, persist the goal, append it to the shared store **without reloading**, return to the list, and show a native library Toast (not React Native `Alert`).
- Let the user delete a goal from the list with a long press on the card. A confirmation dialog MUST appear first; cancel leaves the list unchanged. Confirm removes the goal from the repository and the store. An empty list MUST stay empty (no re-seed).
- **Catalog expansion (additive):** add create envelopes to the closed `postMessage` catalog. Existing deposit types stay valid.

## Capabilities

### New Capabilities

- None. Create and delete extend the existing kernel, list, detail host, persistence, notifications, and library.

### Modified Capabilities

- `postmessage-contract`: add Web-to-native `CREATE_REQUESTED` and Native-to-web `CREATE_SUCCEEDED` / `CREATE_FAILED`; `SESSION_BOOTSTRAP` gains a `mode` of `deposit` | `create`.
- `web-micro-app`: in `create` mode, show a registration form (name + target) and post `CREATE_REQUESTED`; keep the deposit form for `deposit` mode.
- `goals-list`: FAB to start create; long-press on a card starts delete confirmation; list reflects created and deleted rows from the same store; empty list is allowed.
- `goal-detail`: host a create-mode immersive WebView (same local asset, same handshake) that runs create through a use case and updates the store.
- `mobile-host`: stack route for create; production `ConfirmDialog` uses the library; create success notifies through the injected notifier.
- `savings-goal-domain`: create-goal and delete-goal use cases; repository `remove`; notifier operation for a registered goal.
- `notifications`: react to a successful create with the native library (distinct copy from completion).
- `rn-savings-notifier`: `notifyGoalCreated(goalName)` Toast; Android `showConfirmDialog` shows a real confirm/cancel dialog.
- `goals-persistence`: persist `remove`; stored empty list MUST NOT re-seed.

## Impact

- **Code:** `core/` (ports, use cases, Zod catalog), `features/goals` (FAB, long-press, slice create/delete), `features/goal-detail` (create WebView), `features/notifications` (create listener + adapter), `web/` (create form), `libreria/` (new JS API + Android Toast/dialog), `app/` (stack route, DI).
- **APIs:** `GoalsRepository.remove`; `GoalNotifier.notifyGoalCreated`; catalog types above; library `notifyGoalCreated`. Deposit rules and `sgw.goals.v1` record shape stay the same.
- **Dependencies:** no new npm packages. FAB is a list molecule/Pressable, not a shared Button atom. No Expo.
- **Systems:** Android demo: FAB → web form → Toast “Meta registrada” → new row; long-press → native confirm → row gone; kill/relaunch keeps the new set (including empty).
- **Docs:** `docs/PLAN_EJECUCION.md` phase numbers 8→9 (IA) and 9→10 (cierre). README phase table MAY be updated so Fase 8 is this work.
- **Out of scope:** edit-goal, backend, IA docs (new Fase 9), full README closure (new Fase 10), iOS-native dialog as a blocker, instrumented Toast E2E.
