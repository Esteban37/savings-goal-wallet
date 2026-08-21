## Context

See `proposal.md` for motivation and the delta specs under `specs/` for behavior. Fase 7 is archived: native list, immersive deposit WebView, RTK store, AsyncStorage (`sgw.goals.v1`), HU 4 Toast, appearance. `GoalsRepository` has `list` / `getById` / `save` only. `parseStoredGoals` treats a valid empty `goals` array as missing and reseeds. `confirmDialog` is `AlwaysConfirmDialog`. `showConfirmDialog` on Android resolves `true` without UI. `notifyGoalCompleted` Toast copy is “Meta completada”. Architecture stays the frozen plan: feature-first, `extraArgument` DI, closed `{ type, payload }` catalog, no fourth feature, no Expo.

Constraints: TypeScript strict, RN 0.81 / React 19, no new npm packages, no tests in `web/`. Presentation does not instantiate adapters or the repository. Use cases do not call notifier or confirm-dialog. Reducers stay pure.

## Goals / Non-Goals

**Goals:**

- Same handshake as deposits: `WEB_READY` → `SESSION_BOOTSTRAP` → request → native use case → succeeded/failed inject, one store instance, list updates without reload.
- Distinguish first-launch missing storage (seed) from a user-emptied list (keep empty).
- Native library Toast for create (`notifyGoalCreated`) and native confirm/cancel for delete (`showConfirmDialog`).

**Non-Goals:**

- A `goal-create` feature or a second HTML asset.
- Edit-goal, native create form, or RN `Alert` for create/delete.
- IA docs (new Fase 9) or full README closure (new Fase 10) beyond phase-table rename.
- Real iOS Toast/dialog as a blocker; instrumented Toast E2E.

## Decisions

### 1. Create reuses `goal-detail` + one HTML file; `mode` on bootstrap

Do not add a fourth feature. `app/navigation` adds `GoalCreate` (no params) next to `GoalDetail`. Both screens render the existing immersive WebView template against `file:///android_asset/web/index.html`.

`GoalDetailContainer` takes `mode: 'deposit' | 'create'`. After `WEB_READY`:

- `deposit`: today’s bootstrap plus required `mode: 'deposit'` and the selected `goal`.
- `create`: `mode: 'create'`, handshake `goalId` (e.g. `pending`), **no** `goal` object.

`web/index.html` keeps one page with two sections (`#detail`, `#create`). `app.js` switches on `payload.mode`. Deposit messages MUST be ignored in create mode and vice versa.

Parser: `SESSION_BOOTSTRAP.mode` is required (`deposit` | `create`). Existing fixtures that omit `mode` MUST be updated. That is an additive catalog expansion for new types plus a required field on bootstrap; the host is the only producer.

**Alternatives considered:** Second `create.html` (second Gradle copy, duplicated handshake). Query-string `?mode=` on the file URI (brittle on `file://` assets; duplicates bootstrap). Native create form (violates “same communication flow”). Fourth `goal-create` feature (plan §2.2 is three features + kernel).

### 2. Use cases live in `goals`; WebView thunks stay in `goal-detail`

`CreateGoal` and `DeleteGoal` sit in `features/goals/application` (collection ownership). `createAppDependencies` adds `createGoal` and `deleteGoal` beside `getGoals` / `makeDeposit`.

Create-goal: trim name; reject empty; `Money` for target (positive integer); deposited 0; id `goal-${Date.now().toString(36)}-${random}` (non-empty, unique vs current list — retry once on collision). MUST NOT notify.

Delete-goal: `repository.remove(id)`; typed miss if absent. MUST NOT confirm or notify.

`goal-detail` `requestCreate` thunk: `extra.createGoal` → `dispatch(goalCreated(snapshot))` → return `CREATE_SUCCEEDED` / `CREATE_FAILED` (`invalid-name` | `invalid-target`). On success the create screen `goBack()` after inject so the new row is visible under the Toast.

`goals` `requestDelete` thunk: `extra.confirmDialog.confirm({ title, message })` first; if `false`, no-op; if `true`, `extra.deleteGoal` then `goalDeleted(id)`. Presentation only dispatches. Spanish copy, e.g. title “Eliminar meta”, message includes the goal name.

Slice: `goalCreated` appends; `goalDeleted` filters. Export both from `goals/public.ts`. Do not `fetchGoals` after create/delete as the update path (reload). Persist still write-through on `save`/`remove`.

**Alternatives considered:** Put `CreateGoal` in `goal-detail` (delete would still belong to `goals`). Confirm inside `DeleteGoal` (couples a use case to a UI port). `Alert.alert` in the list container (bypasses `ConfirmDialog` / library).

### 3. Empty persisted list is valid; only a missing/corrupt envelope seeds

Today `parseStoredGoals` returns `null` when `goals.length === 0`, which reseeds. Change: `null` only for missing key, empty string, invalid JSON, or schema/record failure. A valid `{ version: 1, goals: [] }` hydrates an empty `InMemoryGoalsRepository`.

Add `remove(id)` on the port, in-memory fake, and persisted wrapper (`memory.remove` then `persistAll(list)`). Envelope record shape and `sgw.goals.v1` version stay 1.

**Alternatives considered:** Tombstone flag (overkill). Separate “seeded” boolean in the envelope (second source of truth). Reseed empty lists (user cannot clear the demo set).

### 4. Library: `notifyGoalCreated` Toast + Android `AlertDialog`

TurboModule spec + JS wrapper `notifyGoalCreated(goalName)`. Android: main-thread Toast `Meta registrada: {goalName}` (`LENGTH_LONG`); empty name resolves without UI. Do **not** reuse `notifyGoalCompleted` copy.

`showConfirmDialog`: Android `AlertDialog` on `currentActivity` (positive = `true`, negative/cancel = `false`). If no activity, resolve `false` (do not delete). Guard against double-resolve. iOS: `notifyGoalCreated` resolves; `showConfirmDialog` MAY stay a resolving stub (Android is the demo).

`GoalNotifier.notifyGoalCreated`. Adapter forwards both notify methods. Listener: `goalCreated` → `extra.goalNotifier.notifyGoalCreated(name)`. Completion listener unchanged. Native rebuild required after Kotlin/Codegen.

Replace `AlwaysConfirmDialog` in production DI with `RnConfirmDialogAdapter` (`showConfirmDialog` from the package) in `notifications/infrastructure`. Keep `AlwaysConfirmDialog` for tests that must skip UI. List/create/detail presentation MUST NOT import `rn-savings-notifier`.

**Alternatives considered:** Reuse `notifyGoalCompleted` (wrong copy on demo). RN `Alert` for delete (spec forbids it). Snackbar in the host (bypasses the library).

### 5. FAB and long-press stay in `goals` presentation

`GoalListTemplate` hosts a bottom-end FAB (`Pressable`, accent token, `accessibilityLabel` “Agregar meta”). Not a `shared/ui` Button atom. `GoalListItem` adds `onLongPress` (must not fire `onPress`). Empty list: no cards, optional muted copy, FAB still shown.

`GoalListScreen` (app navigation): `onGoalPress` → `GoalDetail`; `onCreatePress` → `GoalCreate`; `onGoalLongPress` → `dispatch(requestDelete({ id, name }))`. Create header title: “Nueva meta”. Appearance `headerRight` stays on all stack screens.

**Alternatives considered:** Header “+” (hides behind appearance control). Swipe-to-delete (platform-inconsistent, not requested). Context menu (extra chrome).

### 6. Plan documents: this change is Fase 8; IA and cierre shift

In `docs/PLAN_EJECUCION.md`: insert Fase 8 (alta/baja de metas). Rename today’s Fase 8 → **Fase 9 — IA gobernada**, Fase 9 → **Fase 10 — Documentación y cierre**. Update the ASCII diagram, intro “fases 8–9”, §8 headings, §12 CRUD line (create/delete are now this phase; edit remains out), and §13 table. README phase table: Fase 8 is this work; IA/cierre are 9/10. Do not write `docs/ia/USO_IA.md` here.

**Alternatives considered:** Keep IA as 8 and append CRUD as 10 (user asked for position 8). Renumber only OpenSpec and leave the plan stale (demo readers use the plan first).

## Risks / Trade-offs

- **[Risk] Required `mode` breaks existing bootstrap parser tests** → Mitigation: update fixtures in the same change; host always sends `mode`.
- **[Risk] Empty-list reseed undoes delete-all after relaunch** → Mitigation: stop treating `goals: []` as corrupt; add an explicit persist test.
- **[Risk] `AlertDialog` without an Activity auto-deletes or hangs** → Mitigation: resolve `false` when `currentActivity` is null; cancel listener settles `false`.
- **[Risk] FAB covers the last card** → Mitigation: list `contentContainerStyle` padding at the bottom equal to FAB size + spacing.
- **[Risk] Kotlin/Codegen change ignored by Metro** → Mitigation: native rebuild is a demo task; document it.
- **[Trade-off] Auto `goBack` after create vs staying on the web success state** → Pop so the new row and Toast share the list; the web still receives `CREATE_SUCCEEDED` first.
- **[Trade-off] iOS confirm stub** → Matches Android-first demo; if the stub still resolves `true`, iOS would skip the prompt — acceptable until iOS native lands.

## Migration Plan

Additive on `feat/fase-8-alta-baja-metas`: catalog + use cases + persist `remove` + empty-list hydrate + FAB/WebView create + long-press delete + library methods + DI/listeners + plan/README phase shift. Rollback: revert the branch. Existing `sgw.goals.v1` envelopes remain valid. After merge, demo: FAB → form → Toast “Meta registrada” → new row; long-press → native dialog → row gone; kill/relaunch keeps the set (including empty). Native rebuild required once.

## Open Questions

None. Feature placement, catalog `mode`, empty-list hydrate, library APIs, and confirm-in-thunk are decided above and match the specs.
