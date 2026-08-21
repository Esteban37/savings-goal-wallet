## Context

See `proposal.md` for motivation and `specs/appearance-theme/spec.md`, `specs/goals-list/spec.md`, `specs/mobile-host/spec.md`, plus `specs/web-micro-app/spec.md` for behavior. Native list chrome is a light-only token set (`shared/ui/tokens`) with “Metas de ahorro” in both the stack header and `GoalListTemplate`. Detail sets the stack title to the goal name while `web/index.html` repeats it as `h1#goal-name`. `Appearance` / React Navigation themes are unused. Architecture for chrome stays feature-first: tokens in `shared/ui`, composition in `app/`, no domain or `postMessage` catalog change. Fase numbering lives in `docs/PLAN_EJECUCION.md` §8 and §13 (today’s 7 = IA, 8 = docs).

Constraints: TypeScript strict, RN 0.81 / React 19, no Expo, no new npm packages, no empty design-system atoms (plan §2.6 / §12). Reducers stay pure. Presentation does not own the goals repository. Tests without an emulator for preference resolve/persist and list heading absence.

## Goals / Non-Goals

**Goals:**

- Resolve `system | light | dark` from OS + stored preference; style native chrome and the open WebView from that scheme.
- Keep a single title per screen (stack header) and a header-right appearance control on both stack screens.
- Shift plan phases so this work is Fase 7 and IA/cierre move to 8/9.

**Non-Goals:**

- A Redux slice for appearance, a new `postMessage` type, or extending `SESSION_BOOTSTRAP`.
- New Button/Icon atoms, custom fonts, or a Davivienda design-system kit.
- Changing `sgw.goals.v1`, use cases, or `libreria/`.
- IA docs (new Fase 8) or full README closure (new Fase 9) beyond the phase-table rename.

## Decisions

### 1. Appearance lives in `app/`, not Redux and not `goals` infrastructure

Preference and resolved scheme are host chrome, not application state. Wrap the tree in an `AppearanceProvider` in `app/` (sibling of the store `Provider`) that:

1. Reads OS scheme via `useColorScheme` / `Appearance`.
2. Holds preference `system | light | dark` (default `system` until storage hydrates).
3. Exposes `{ preference, resolvedScheme, setPreference }` plus a pure `resolveScheme(preference, osScheme)`.

List atoms/templates consume tokens through a `useThemeTokens()` hook. Do **not** add an RTK slice: plan §2.5 forbids duplicating the same source of truth, and appearance is not the goals store.

**Alternatives considered:** Redux slice (wires every atom to the store, mixes chrome with HU state). React Navigation theme alone (styles the header, not `GoalListItem` / `ProgressBar`). `Appearance.setColorScheme` as the only API (RN 0.81 can override, but stored preference + explicit resolve is easier to test and to push into the WebView).

### 2. Persist preference under `sgw.appearance.v1`, not the goals envelope

JSON `{ version: 1, preference: 'system' | 'light' | 'dark' }` in AsyncStorage (already on `mobile`). Missing, corrupt, or unknown preference → treat as `system` (do not throw). Do **not** import `features/goals/infrastructure` (`KeyValueStore` is goals-owned). A tiny helper in `app/appearance/` is enough; Jest already mocks AsyncStorage.

**Alternatives considered:** Reuse `KeyValueStore` from goals (cross-feature internals; forbidden). Persist on the goals envelope (unrelated write-through, pollutes `GoalsRepository`). Session-only preference (fails the relaunch scenarios).

### 3. Header-right cycles system → light → dark; stack header owns titles

`Stack.Navigator` `screenOptions` supplies `headerRight` so both list and detail get the control. Press cycles the three preferences; `accessibilityLabel` states the current one (`Apariencia: sistema|claro|oscuro`). Icon/glyph MAY change with the current preference; no settings screen.

Titles: keep `options.title: 'Metas de ahorro'` on the list; keep `navigation.setOptions({ title: goal.name })` on detail. Remove the template `<Text>Metas de ahorro</Text>` and drop extra `paddingTop: insets.top` on the list (the native header already owns the status-bar inset). Do not add a native heading in `ImmersiveWebViewTemplate`.

**Alternatives considered:** Boolean dark toggle (cannot return to system without a third state). `Alert` with three buttons (extra tap, heavier than a header control). Hide the stack header and paint a custom one (duplicates SafeArea/back/title that native-stack already does).

### 4. Light/dark palettes in `shared/ui/tokens`; contemporary cards without new atoms

Replace the single `color` object with `palette.light` / `palette.dark` (accent stays brand red `#C4122F` in both). `spacing` and `type` stay shared. Components that today close over `color` in `StyleSheet.create` MUST apply surface/text/border colors from `useThemeTokens()` at render so a scheme change restyles without remounting the app.

Visual refresh (same components, not new layers): slightly larger card radius, light-mode elevation or a hairline, dark-mode fill without a harsh white border, tighter list padding now that the in-body title is gone. No `Button` / `Spacer` atoms.

**Alternatives considered:** NativeWind / a theme package (new dependency, out of plan). Duplicate StyleSheets per scheme as static modules (works, but a palette map is smaller). Keep module-scope `color` (cannot follow the resolved scheme).

### 5. WebView theme via `data-theme` + `injectJavaScript`, not the catalog

`web/index.html`: CSS keyed on `html[data-theme="light"]` / `html[data-theme="dark"]` (do not rely on `prefers-color-scheme` — Android WebView follows the OS, not the in-app override). Remove `h1#goal-name` (or stop filling it); keep amounts, progress, and the deposit form. Optional section label such as “Abonar” is fine because it is not the goal name.

Host: `injectedJavaScript` sets `data-theme` on first paint; when `resolvedScheme` changes, `injectJavaScript` updates the attribute. No new envelope type. `SESSION_BOOTSTRAP` stays as specified in Fase 4.

**Alternatives considered:** New `THEME_CHANGED` catalog message (spec forbids a new type). Reload `index.html?theme=` (loses in-progress amount). CSS `prefers-color-scheme` only (wrong when the user overrides the OS).

### 6. Plan documents: this change is Fase 7; IA and cierre shift

In `docs/PLAN_EJECUCION.md`: insert Fase 7 (UI contemporánea / títulos únicos / modo oscuro). Rename today’s Fase 7 → **Fase 8 — IA gobernada**, Fase 8 → **Fase 9 — Documentación y cierre**. Update the ASCII diagram, the intro “fases 7–8” sentence, §13 table, and any “Fase 7/8” out-of-scope pointers. README phase table: mark this Fase 7 as the current change (not done until apply). Do not write `docs/ia/USO_IA.md` here.

**Alternatives considered:** Keep IA as 7 and append UI as 9 (user asked for position 7). Renumber only OpenSpec and leave the plan stale (demo readers use the plan first).

## Risks / Trade-offs

- **[Risk] WebView ignores `prefers-color-scheme` or a late inject flashes light HTML** → Mitigation: default `data-theme` on `<html>` plus `injectedJavaScriptBeforeContentLoaded` (or equivalent) so the first paint matches `resolvedScheme`.
- **[Risk] List tests render the template without a stack header, so “title only in header” cannot be asserted there** → Mitigation: assert the template does **not** contain “Metas de ahorro”; keep header title on the navigator. A navigator-level RNTL test MAY check `headerRight` if it stays stable without an emulator.
- **[Risk] Corrupt appearance JSON crashes launch** → Mitigation: parse with Zod `.catch('system')` / treat failure as `system`.
- **[Risk] `StyleSheet.create` closed over old `color` leaves dark mode looking light** → Mitigation: tokens hook at render for any color that differs by scheme; review atoms/templates/items.
- **[Trade-off] Three-way cycle vs an explicit menu** → Cycle is one tap and fits `headerRight`; the accessibility label MUST name the current mode so the third state is discoverable.
- **[Trade-off] Context instead of Redux** → Extra provider in `App.tsx`; appearance tests do not need `createAppStore`.

## Migration Plan

Additive on `feat/fase-7-ui-contemporanea`: tokens, appearance module, header control, list/web copy, plan/README phase numbers. Existing installs have no `sgw.appearance.v1` → first launch is `system` (same as “follow the OS”). Rollback: revert the branch; leftover appearance key is ignored. Goals persistence and HU 1–4 flows stay on the same screens.

## Open Questions

None. Preference model, storage key, header cycle, WebView `data-theme` (no catalog change), and the 7/8/9 phase shift are decided above and match the specs.
