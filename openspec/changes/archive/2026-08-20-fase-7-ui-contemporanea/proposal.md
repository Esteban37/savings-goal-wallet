## Why

The native list repeats “Metas de ahorro” in the stack header and in the template, and the micro-app repeats the goal name under a header that already shows it. The chrome is a light-only scaffold. Fase 6 closed persistence; the demo now needs a contemporary, theme-aware shell before IA docs and product closure.

## What Changes

- Insert this work as **Fase 7** in `docs/PLAN_EJECUCION.md`. Shift today’s Fase 7 (IA gobernada) to **Fase 8** and Fase 8 (documentación y cierre) to **Fase 9**. Update the phase diagram, the OpenSpec table, and README phase mentions so later phases are not overwritten.
- Make native chrome (list, stack header, list cards, tokens) feel contemporary without adding a design-system of unused atoms.
- Show each screen title **once**: the native stack header is the title surface. The list template MUST NOT repeat “Metas de ahorro”. The web micro-app MUST NOT repeat the bootstrapped goal name as a page heading.
- Add an appearance control on the **top-right of the stack header**. First launch follows the OS color scheme (`system`). The user can switch to light or dark; that choice MUST persist across relaunch.
- Apply the resolved scheme (light or dark) to native screens, the stack header, `StatusBar`, and the bundled micro-app so the WebView does not stay stuck on a light page inside a dark host.

## Capabilities

### New Capabilities

- `appearance-theme`: appearance preference (`system` | `light` | `dark`), default `system`, header control, persistence, and resolved light/dark tokens for native chrome.

### Modified Capabilities

- `goals-list`: list body MUST NOT duplicate the stack header title; list rows MUST use the resolved appearance tokens.
- `mobile-host`: stack header is the single native title surface; header-right appearance control on list and detail; `NavigationContainer` and status bar follow the resolved scheme.
- `web-micro-app`: MUST NOT repeat the goal name as a heading already shown in the native header; page chrome MUST follow the host’s resolved appearance; visual layout MAY be refreshed without changing `postMessage` behavior.

## Impact

- **Code:** `mobile/src/shared/ui/tokens` (light/dark palettes), `mobile/src/app/` (appearance context/preference + header control), list template/item/progress atoms, stack `options` (`headerRight`, themed header), `web/index.html` (no duplicate `h1` name; theme-aware CSS). Domain, use cases, `postMessage` catalog, Redux snapshots, `libreria/`, and AsyncStorage goals envelope stay unchanged.
- **APIs:** no change to `GoalsRepository`, `postMessage`, or `rn-savings-notifier`. New preference key on the existing key-value store (separate from `sgw.goals.v1`).
- **Dependencies:** no new npm packages. Use React Native `Appearance` / `useColorScheme` and React Navigation header options already in the host. No Expo.
- **Systems:** Android demo: list header titled once; theme control top-right; toggling appearance restyles list and WebView; kill/relaunch keeps the user’s choice (or keeps following the OS when preference is `system`).
- **Docs:** `docs/PLAN_EJECUCION.md` phase numbers 7→8 (IA) and 8→9 (cierre). README phase table MAY be updated so Fase 7 is this UI work.
- **Out of scope:** design-system atoms with a single consumer, custom fonts, iOS-only polish as a blocker, IA docs (new Fase 8), full README closure (new Fase 9), changing deposit rules or persistence.
