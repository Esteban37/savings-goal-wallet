# rn-savings-notifier Specification

## Purpose

Defines the workspace native library that exposes a TurboModule-backed JavaScript API for goal-completion notification and a confirm dialog, with stubs that resolve in Fase 1.

## Requirements

### Requirement: Published JavaScript API
The library package SHALL be named `rn-savings-notifier` and SHALL export at least:

- `notifyGoalCompleted(goalName)` — accepts a string and returns a Promise that settles
- `showConfirmDialog({ title, message })` — accepts title and message strings and returns a Promise that settles to a boolean

Callers in the mobile host MUST import these symbols from the package name, not from relative paths into `libreria/android` or `libreria/ios`.

#### Scenario: notifyGoalCompleted settles
- **WHEN** the mobile host calls `notifyGoalCompleted` with a non-empty goal name
- **THEN** the returned Promise settles and the application does not crash

#### Scenario: showConfirmDialog settles to a boolean
- **WHEN** the mobile host calls `showConfirmDialog` with a title and a message
- **THEN** the returned Promise settles to a boolean (`true` is acceptable for the stub)

### Requirement: TurboModule spec, not a legacy NativeModule
The library SHALL declare a New Architecture TurboModule spec that Codegen can consume. New native entry points MUST NOT use a legacy NativeModule-only registration path as the public implementation.

#### Scenario: Spec file exists for Codegen
- **WHEN** a reviewer inspects the library sources
- **THEN** a TurboModule spec is present and the Android/iOS projects are wired as a native module package for autolinking

### Requirement: Stub native behavior in this change
Android and iOS native implementations SHALL exist so autolinking succeeds. In this change they MAY no-op or immediately resolve. They MUST NOT be required to show a real Toast, system notification, or platform alert yet.

#### Scenario: Stub does not block launch
- **WHEN** the Android host starts and invokes a public library method
- **THEN** missing real Toast or notification UI does not prevent the Promise from settling or the host from remaining open

### Requirement: Library is a first-class workspace package
The library SHALL live under `libreria/` with its own package manifest, TypeScript sources, and native `android/` and `ios/` trees. It MUST remain consumable as a workspace dependency of `mobile`.

#### Scenario: Package can be required by name
- **WHEN** `mobile` declares a dependency on `rn-savings-notifier` using the workspace protocol
- **THEN** JavaScript import of `rn-savings-notifier` resolves after a root install
