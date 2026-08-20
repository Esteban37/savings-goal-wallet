## Context

See `proposal.md` for motivation. The repo currently has `docs/`, OpenSpec, and Cursor rules only — no `package.json`, no `mobile/`, `libreria/`, or `web/`. Architecture and folder tree are frozen in `docs/PLAN_EJECUCION.md` sections 2–3 and 6–8. This change implements that tree and the wiring; it does not fill domain, Redux, or Zod.

Constraints that shape the approach: React Native **0.81.x** (not 0.82+), React 19, Community CLI (no Expo), npm workspaces first, New Architecture, Hermes, Android as the Fase 1 demo gate.

## Goals / Non-Goals

**Goals:**

- Produce a cold-start Android demo: app opens, WebView shows the test button, `rn-savings-notifier` import/call does not crash.
- Freeze Metro, autolinking, Gradle asset copy, and the `mobile/src` skeleton so later phases only add files.
- Keep the library as a real workspace TurboModule package (spec + stubs), not a JS file inside `mobile/`.

**Non-Goals:**

- How domain entities, RTK `extraArgument`, or Zod parsers are shaped (Fase 2–3).
- Real Toast / `POST_NOTIFICATIONS` / `AlertDialog` (Fase 5).
- iOS as a demo gate (template MUST exist; a green iOS run is stretch).
- Full product README completeness (Fase 8). Fase 1 only needs enough root docs to install and run Android.

## Decisions

### 1. Scaffold `mobile/` with Community CLI 0.81, not Expo and not latest RN

Pin `react-native` to the newest **0.81.x** patch published at apply time (verify with `npm view react-native versions --json`). Init into `mobile/` so existing `docs/` and `openspec/` are not overwritten:

```bash
npx @react-native-community/cli@latest init SavingsGoalWallet \
  --version 0.81.<patch> \
  --directory mobile \
  --pm npm \
  --skip-git \
  --skip-install
```

Then point the app entry at `src/app/App.tsx` (adjust `index.js` / `app.json` as the 0.81 template requires). Confirm `newArchEnabled=true` in `mobile/android/gradle.properties` and Hermes on. Do not add Expo packages.

**Alternatives considered:** Expo (out of product scope). RN 0.82+ (plan freeze). Hand-written `android/` (slower, easy to miss New Architecture defaults).

### 2. Scaffold `libreria/` with `create-react-native-library`, package name `rn-savings-notifier`

Official RN docs point at `create-react-native-library` for TurboModule libraries. Do **not** use `--local` (that drops a module under the app’s `modules/` folder and fights the required `libreria/` root). Scaffold a TurboModule with Kotlin + Objective-C, no nested example app (the host is `mobile/`):

```bash
npx create-react-native-library@latest libreria \
  --no-interactive \
  --yes \
  --slug rn-savings-notifier \
  --description "Native savings-goal notifier for the Savings Goal Wallet host" \
  --type turbo-module \
  --languages kotlin-objc \
  --example none \
  --no-git
```

If `--example none` or `--slug` is missing on the installed CLI, run `npx create-react-native-library@latest --help` and map to the equivalent flags; delete a generated `example/` if one appears. Set `"name": "rn-savings-notifier"` if the folder name leaked into the package name.

Public JS (`libreria/src/index.ts`): thin wrappers over the Codegen spec — `notifyGoalCompleted(goalName: string): Promise<void>` and `showConfirmDialog(input: { title: string; message: string }): Promise<boolean>`. Native Android/iOS implementations resolve immediately (`true` for the dialog). No domain rules in the wrapper.

**Alternatives considered:** `--local` under `mobile/modules` (wrong folder contract). Legacy NativeModule template (the product library is a TurboModule). C++ shared lib (no platform Toast later). Nested example app (duplicates the host and Metro config).

### 3. npm workspaces at the repo root, with Metro + autolinking tuned for RN

Root `package.json`:

- `"private": true`
- `"workspaces": ["mobile", "libreria", "web"]`
- scripts that delegate: `start`, `android`, `test` → `npm run -w mobile …`

`mobile` depends on `rn-savings-notifier` with `"*"`. `web` can be a private package with no dependencies.

**Hoisting:** the execution plan mentions `hoistingLimits: workspaces` (Yarn). npm does not honor that field. Prefer staying on npm: add `.npmrc` with `install-strategy=nested` so `react-native` stays resolvable from `mobile/node_modules` for autolinking. If nested install still breaks Metro or Gradle, fall back to Yarn 1 workspaces + `nohoist` for `react-native` (documented in the root README stub). Do not introduce pnpm unless both npm and Yarn fail.

**Metro** (`mobile/metro.config.js`), extending the RN 0.81 defaults:

- `watchFolders`: monorepo root (and `libreria/` if not covered)
- `resolver.nodeModulesPaths`: `mobile/node_modules` then root `node_modules`
- `resolver.extraNodeModules`: pin `react` and `react-native` to `mobile/node_modules/...` so the library does not load a second copy

**Autolinking:** `mobile/react-native.config.js` lists `rn-savings-notifier` if autolink does not pick up the workspace symlink. Never copy Kotlin/ObjC into `mobile/android` or `mobile/ios`.

**Alternatives considered:** Yarn-only from day one (allowed only if npm install is blocked). pnpm (symlink layout is the usual Metro footgun). Publishing the library to npm (unnecessary for this workspace monorepo).

### 4. Bundle `web/` into Android assets; load with `react-native-webview`

Add `react-native-webview` to `mobile`. Map or copy `../web` into `src/main/assets/web` via Gradle (`sourceSets.main.assets.srcDirs` extra dir, or a `copyWebAssets` task hooked to `preBuild`). Load:

`file:///android_asset/web/index.html`

Enable `javaScriptEnabled`, `allowFileAccess`, and `onMessage`. Do not use a remote URL or a local HTTP server.

`web/index.html` + `web/app.js`: on load, `ReactNativeWebView.postMessage` with `WEB_READY`; a visible button posts `DEPOSIT_REQUESTED` with a hardcoded `goalId` and `amount`. No Zod on either side in this phase.

**Alternatives considered:** `http://localhost` (extra process, fails in release). Duplicating HTML under `mobile/android` (drifts from `web/`). Injecting HTML as a string (harder to iterate; the product keeps a first-class `web/` workspace).

### 5. Composition-root skeleton now, empty barrels, English kebab-case

After moving the template `App.tsx` into `mobile/src/app/App.tsx`, create the tree from `docs/PLAN_EJECUCION.md` §3: `app/di`, `app/store`, `core/{domain,application/ports,contracts}`, `features/{goals,goal-detail,notifications}` with `public.ts`, `shared/ui/{tokens,atoms}`. Barrels may re-export nothing. `create-app-dependencies.ts`, `store.ts`, and `listener-middleware.ts` are placeholders (empty functions or comments), not a live RTK store.

File names: kebab-case. Code and comments: English. `App.tsx` is the only UI: WebView + a one-line library ping (e.g. `notifyGoalCompleted('scaffold')` in `useEffect`).

**Alternatives considered:** Delay the skeleton until Fase 3 (plan explicitly rejected this — avoids moving `App.tsx` / Metro again). Fill entities now (violates phase close).

### 6. Tests in Fase 1

No tests under `web/`. Do not add Jest suites for domain or RNTL. Keep the CLI template Jest config in `mobile/` and `libreria/` so later phases have a runner. A single library JS test is optional and not a close criterion.

## Risks / Trade-offs

- **[Risk] npm hoisting breaks autolinking or Metro (duplicate `react-native`)** → Mitigation: nested install strategy, Metro `extraNodeModules` singletons, `react-native.config.js` explicit dependency. Yarn 1 + nohoist as documented fallback.
- **[Risk] `create-react-native-library` flag names differ by version** → Mitigation: run `--help` at apply time; keep type `turbo-module` and languages `kotlin-objc` regardless of flag spelling; delete `example/` if generated.
- **[Risk] `file://` WebView blocks JS or `postMessage` on newer Android** → Mitigation: `allowFileAccess`, mixed-content/file-access settings as required by the WebView version; verify `onMessage` with the test button before calling Fase 1 done.
- **[Risk] Codegen / New Architecture mismatch between 0.81 host and library template** → Mitigation: align library peer `react-native` with the 0.81.x pin; enable New Architecture on the host before the first Android build.
- **[Trade-off] iOS project exists but is not the gate** → Saves time; iOS native Toast remains stretch (Fase 5). The ObjC stub still ships so autolinking is complete.
- **[Trade-off] Empty feature barrels** → Slight noise in the tree; prevents later Metro/path churn, which is the point of Fase 1.

## Migration Plan

- Apply on the current branch; keep `docs/` and `openspec/` intact.
- Init order: root workspace manifest (minimal) → `mobile/` CLI init → `libreria/` library init → `web/` files → Metro/Gradle/WebView → skeleton → Android smoke run.
- Rollback: delete `mobile/`, `libreria/`, `web/`, and root `package.json` / lockfile if the scaffold is abandoned; OpenSpec artifacts stay.
- No production deploy. Success is a local Android install.

## Open Questions

None. Patch selection for 0.81.x and exact CLI flags are resolved at apply time without changing specs or this approach.
