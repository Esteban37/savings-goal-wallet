## 1. Dependencies and navigation shell

- [x] 1.1 Add `@react-navigation/native`, `@react-navigation/native-stack`, and `react-native-screens` to the `mobile` workspace (versions compatible with RN 0.81 / React 19) and verify `mobile/package.json` lists all three and the install exits 0
- [x] 1.2 Enable `react-native-screens` on Android as required by the library for RN 0.81 and verify the host still typechecks (`npx tsc --noEmit` in `mobile` or the project’s existing typecheck path) without adding Expo packages
- [x] 1.3 Add `app/navigation` with a native stack (`GoalList` root, `GoalDetail` with `{ goalId: string }`), wrap it in `NavigationContainer` inside the existing Redux `Provider` in `App.tsx`, keep `notifyGoalCompleted` on mount, and verify `App.tsx` still does not load the web asset as the launch screen

## 2. Goals public surface and list navigation

- [x] 2.1 Export `depositApplied`, `toGoalSnapshot`, and `selectGoalById` from `features/goals/public.ts` (implement `selectGoalById`) and verify a colocated selector test with fixture snapshots `inputX` / `expectedX` returns the matching id and `undefined` for an unknown id
- [x] 2.2 Change `GoalListContainer` to call `onGoalPress(goalId)` from props (optional; default no-op for existing tests) and verify the list RNTL test still finds `Vacaciones` and `25` and that `goal-detail` does not import `features/goals/store/` internals (`rg "features/goals/store" mobile/src/features/goal-detail` is empty)
- [x] 2.3 Wire the list stack screen so row press navigates to `GoalDetail` with that `goalId` and verify `GoalListContainer` / presenter still do not import `parseBridgeMessage`, `MakeDeposit`, or `react-native-webview`

## 3. Bridge adapter and deposit thunk

- [x] 3.1 Add `serializeNativeToWeb` (and inject helper if needed) under `features/goal-detail/infrastructure` using the existing Zod native-to-web types and verify a colocated test round-trips `SESSION_BOOTSTRAP`, `DEPOSIT_SUCCEEDED`, and `DEPOSIT_FAILED` JSON that `parseBridgeMessage` accepts
- [x] 3.2 Implement `requestDeposit` thunk in `features/goal-detail/store`: `extra.makeDeposit`, on ok `dispatch(depositApplied(toGoalSnapshot(...)))` and return success payload, on err return `DEPOSIT_FAILED` reason without changing other snapshots, then verify colocated tests: fake ok 10000 on `goal-vacaciones` yields deposited 35000 / 35 percent in the goals store; amount 0 yields failed payload and unchanged deposited 25000
- [x] 3.3 Confirm malformed envelopes never call `makeDeposit` (pure function or thin handler over `parseBridgeMessage`) and verify a test with fixture `{not json` applies no deposit

## 4. Goal-detail presentation

- [x] 4.1 Implement `ImmersiveWebViewTemplate`, `WebViewHostPresenter`, and `GoalDetailContainer` (route `goalId`, local WebView URI `file:///android_asset/web/index.html`, file-access flags, `onMessage` → parse → bootstrap after `WEB_READY` using store snapshot not the web `goalId`, `DEPOSIT_REQUESTED` → `requestDeposit` → `injectJavaScript` of `__onHostMessage(...)`) and verify the container does not instantiate adapters or import `rn-savings-notifier`
- [x] 4.2 Export `GoalDetailContainer` from `features/goal-detail/public.ts`, connect the `GoalDetail` stack screen, and verify `App.tsx` / navigation import it only from `public.ts`
- [x] 4.3 Mock `react-native-webview` in Jest as needed and verify `npm test -w mobile -- App.test.tsx` still passes without an emulator

## 5. Web micro-app

- [x] 5.1 Replace `web/index.html` and `web/app.js` with waiting state, bootstrap-driven name/amounts/percent, amount input plus confirm, `__onHostMessage` handling, `WEB_READY` on load, and `DEPOSIT_REQUESTED` using the bootstrapped `goalId` and entered amount, then verify the sources contain those catalog `type` strings, assign `__onHostMessage`, and contain no `fetch` / XHR / native-module usage
- [x] 5.2 Confirm `web/` still has no test runner or `*.test.*` / `*.spec.*` files and verify `find web -name '*test*' -o -name '*spec*'` (or equivalent) shows none
- [x] 5.3 Confirm the Android Gradle copy of `web/` into assets is unchanged so detail can load the new HTML and verify `git diff -- mobile/android` does not delete the web asset mapping

## 6. Notifications listener (stub)

- [x] 6.1 Implement `createAppListenerMiddleware` with RTK `createListenerMiddleware`, export `registerNotificationsListeners` from `features/notifications/public.ts` that on completed `depositApplied` calls `extra.goalNotifier.notifyGoalCompleted(name)`, prepend it in `createAppStore`, keep `NoopGoalNotifier` in DI, and verify a unit test with a mock notifier is invoked when a snapshot has `isCompleted: true` and is not invoked when false
- [x] 6.2 Confirm `features/notifications` still does not import `rn-savings-notifier` and verify `rg "rn-savings-notifier" mobile/src/features/notifications` is empty

## 7. Coverage and freeze

- [x] 7.1 Extend `mobile/jest.config.js` `collectCoverageFrom` with `src/features/goal-detail/{store,infrastructure}/**` (exclude barrels) without putting presentation or `web/` into the 70% gate, then verify `npm test -w mobile -- --coverage --coverageReporters=text-summary` still meets 70% on the collected set
- [x] 7.2 Confirm `core/` domain and Zod catalog files are unchanged (no new message types) and verify `git diff -- mobile/src/core` is empty except if a task above required a documented no-op
- [x] 7.3 Run `npm test` from the repository root and verify it exits 0 (existing domain/list tests plus bridge, thunk, selector, listener, App render) without starting an emulator
