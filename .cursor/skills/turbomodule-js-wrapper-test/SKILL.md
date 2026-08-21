---
name: turbomodule-js-wrapper-test
description: >-
  Adds or extends typed JavaScript wrappers and Jest tests for the
  rn-savings-notifier TurboModule. Use when changing notifyGoalCompleted,
  notifyGoalCreated, showConfirmDialog, NativeRnSavingsNotifier spec, or
  library Jest mocks.
---

# TurboModule JS wrapper + test

Repeatable flow for **`libreria/`** (`rn-savings-notifier`): thin typed wrappers over the Codegen spec, Jest with the native module mocked. Native UI stays in `libreria/android` and `libreria/ios`. Never copy those sources into `mobile/`.

## Where it lives

- Spec: `libreria/src/NativeRnSavingsNotifier.ts` (`TurboModuleRegistry.getEnforcing`)
- Wrappers: `libreria/src/index.ts`
- Tests: `libreria/src/index.test.ts`
- Host adapters import the **package name** `rn-savings-notifier`, not relative paths into `libreria/android` or `libreria/ios`

## Public API (keep typed)

- `notifyGoalCompleted(goalName: string): Promise<void>`
- `notifyGoalCreated(goalName: string): Promise<void>`
- `showConfirmDialog({ title, message }): Promise<boolean>`

Wrappers only forward to the spec. Empty names are a native concern (resolve without UI). Do not reimplement Toast/`Alert` in JS.

## Steps

1. Extend the TurboModule `Spec` in `NativeRnSavingsNotifier.ts` if a new native method is required. Prefer TurboModule, not a legacy NativeModule registration.
2. Export a typed wrapper from `index.ts`. No `any`.
3. Mock `./NativeRnSavingsNotifier` in Jest (`jest.fn` resolving Promises). Do not require a simulator for JS tests.
4. Tests (fixture names `inputX` / `actualX` / `expectedX`):
   - wrapper called with fixture name → mock received the same string
   - `showConfirmDialog` forwards `title` and `message` and settles to a boolean
5. Host consumption: `mobile` workspace dependency + autolinking. After Kotlin/ObjC changes, native rebuild (`npm run android` / `npm run ios`); Metro is not enough.

## Reject

- Copying `.kt` / `.mm` into `mobile/`
- React Native `Alert.alert` as the production confirm path
- Untyped `TurboModuleRegistry.get` without the spec generic
