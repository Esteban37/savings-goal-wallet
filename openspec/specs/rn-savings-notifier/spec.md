# rn-savings-notifier Specification

## Purpose

Defines the workspace native library that exposes a TurboModule-backed JavaScript API for goal-completion notification and a confirm dialog, with stubs that resolve in Fase 1.

## Requirements

### Requirement: Published JavaScript API
The library package SHALL be named `rn-savings-notifier` and SHALL export at least:

- `notifyGoalCompleted(goalName)` — accepts a string and returns a Promise that settles
- `notifyGoalCreated(goalName)` — accepts a string and returns a Promise that settles
- `showConfirmDialog({ title, message })` — accepts title and message strings and returns a Promise that settles to a boolean

Callers in the mobile host MUST import these symbols from the package name, not from relative paths into `libreria/android` or `libreria/ios`.

#### Scenario: notifyGoalCompleted settles
- **WHEN** the mobile host calls `notifyGoalCompleted` with a non-empty goal name
- **THEN** the returned Promise settles and the application does not crash

#### Scenario: notifyGoalCreated settles
- **WHEN** the mobile host calls `notifyGoalCreated` with a non-empty goal name
- **THEN** the returned Promise settles and the application does not crash

#### Scenario: showConfirmDialog settles to a boolean
- **WHEN** the mobile host calls `showConfirmDialog` with a title and a message
- **THEN** the returned Promise settles to a boolean

### Requirement: TurboModule spec, not a legacy NativeModule
The library SHALL declare a New Architecture TurboModule spec that Codegen can consume. New native entry points MUST NOT use a legacy NativeModule-only registration path as the public implementation.

#### Scenario: Spec file exists for Codegen
- **WHEN** a reviewer inspects the library sources
- **THEN** a TurboModule spec is present and the Android/iOS projects are wired as a native module package for autolinking

### Requirement: Android shows native completion UI
On Android, `notifyGoalCompleted` SHALL show a native Toast (or a local system notification) that includes the given goal name. The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the Android main thread when required by the platform. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host.

#### Scenario: Toast appears for a completed goal name
- **WHEN** the Android host calls `notifyGoalCompleted` with a non-empty goal name (for example after a deposit that reaches 100%)
- **THEN** a native Toast or system notification is visible to the user and includes that goal name, and the Promise settles without crashing the host

#### Scenario: Empty name still settles
- **WHEN** `notifyGoalCompleted` is called with an empty string
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: iOS shows native completion UI
On iOS, `notifyGoalCompleted` SHALL show native, non-blocking feedback that includes the given goal name. The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the iOS main thread. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host. The copy MUST NOT reuse the registration wording.

#### Scenario: Completion feedback appears for a completed goal name
- **WHEN** the iOS host calls `notifyGoalCompleted` with a non-empty goal name (for example after a deposit that reaches 100%)
- **THEN** native feedback is visible to the user, includes that goal name, does not say the goal was registered, and the Promise settles without crashing the host

#### Scenario: Empty completed name still settles on iOS
- **WHEN** `notifyGoalCompleted` is called with an empty string on iOS
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: JavaScript wrappers are unit-tested
The library workspace SHALL include automated JavaScript tests for the public wrappers. Those tests MUST mock the TurboModule and MUST NOT require an emulator or instrumented Android run as the merge gate.

#### Scenario: notifyGoalCompleted forwards the goal name
- **WHEN** the unit suite calls `notifyGoalCompleted` with a fixture goal name against a mocked TurboModule
- **THEN** the mock native method is invoked with that same name and the returned Promise settles

#### Scenario: notifyGoalCreated forwards the goal name
- **WHEN** the unit suite calls `notifyGoalCreated` with a fixture goal name against a mocked TurboModule
- **THEN** the mock native method is invoked with that same name and the returned Promise settles

#### Scenario: showConfirmDialog forwards title and message
- **WHEN** the unit suite calls `showConfirmDialog` with a fixture title and message against a mocked TurboModule
- **THEN** the mock native method is invoked with those strings and the returned Promise settles to a boolean

### Requirement: Library is a first-class workspace package
The library SHALL live under `libreria/` with its own package manifest, TypeScript sources, and native `android/` and `ios/` trees. It MUST remain consumable as a workspace dependency of `mobile`.

#### Scenario: Package can be required by name
- **WHEN** `mobile` declares a dependency on `rn-savings-notifier` using the workspace protocol
- **THEN** JavaScript import of `rn-savings-notifier` resolves after a root install

### Requirement: Android shows native registration UI
On Android, `notifyGoalCreated` SHALL show a native Toast (or a local system notification) that includes the given goal name and MUST NOT reuse the completion copy (“Meta completada”). The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the Android main thread when required by the platform. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host.

#### Scenario: Toast appears for a created goal name
- **WHEN** the Android host calls `notifyGoalCreated` with a non-empty goal name
- **THEN** a native Toast or system notification is visible to the user, includes that goal name, does not say the goal is completed, and the Promise settles without crashing the host

#### Scenario: Empty created name still settles
- **WHEN** `notifyGoalCreated` is called with an empty string
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: iOS shows native registration UI
On iOS, `notifyGoalCreated` SHALL show native, non-blocking feedback that includes the given goal name and MUST NOT reuse the completion copy (“Meta completada”). The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the iOS main thread. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host.

#### Scenario: Registration feedback appears for a created goal name
- **WHEN** the iOS host calls `notifyGoalCreated` with a non-empty goal name
- **THEN** native feedback is visible to the user, includes that goal name, does not say the goal is completed, and the Promise settles without crashing the host

#### Scenario: Empty created name still settles on iOS
- **WHEN** `notifyGoalCreated` is called with an empty string on iOS
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: Android confirm dialog is a real cancel-or-confirm prompt
On Android, `showConfirmDialog` SHALL show a native confirm/cancel dialog with the given title and message. Confirm MUST settle the Promise to `true`. Cancel MUST settle the Promise to `false`. The dialog MUST NOT auto-resolve to `true` without user input. The implementation MUST remain a TurboModule in the library package.

#### Scenario: Confirm returns true
- **WHEN** the Android host calls `showConfirmDialog` and the user confirms
- **THEN** the Promise settles to `true`

#### Scenario: Cancel returns false
- **WHEN** the Android host calls `showConfirmDialog` and the user cancels
- **THEN** the Promise settles to `false`

### Requirement: iOS confirm dialog is a real cancel-or-confirm prompt
On iOS, `showConfirmDialog` SHALL show a native confirm/cancel dialog with the given title and message. Confirm MUST settle the Promise to `true`. Cancel MUST settle the Promise to `false`. The dialog MUST NOT auto-resolve to `true` without user input. The implementation MUST remain a TurboModule in the library package.

#### Scenario: iOS confirm returns true
- **WHEN** the iOS host calls `showConfirmDialog` and the user confirms
- **THEN** the Promise settles to `true`

#### Scenario: iOS cancel returns false
- **WHEN** the iOS host calls `showConfirmDialog` and the user cancels
- **THEN** the Promise settles to `false`

### Requirement: Library ships a package README
The `libreria/` package SHALL include a `README.md` that documents installation as a workspace dependency, autolinking, the typed public JavaScript API (`notifyGoalCompleted`, `notifyGoalCreated`, `showConfirmDialog`), a short usage example, and how to run the library’s unit tests. The README MUST state that native sources stay in `libreria/` and MUST NOT be copied into `mobile/`.

#### Scenario: Library README covers install and API
- **WHEN** a reviewer opens `libreria/README.md`
- **THEN** the file describes workspace install, autolinking, the three public functions, an example call, and the test command

#### Scenario: Library README forbids vendoring
- **WHEN** a reviewer reads the consumption section of `libreria/README.md`
- **THEN** it states that the host consumes the package by name and does not copy Android or iOS sources into `mobile/`

### Requirement: Library contains governed-AI artifacts
The `libreria/` package SHALL contain at least one Cursor skill (or a pointer to a skill that applies to the library) and at least one boundary-review agent (or a pointer to that agent). The package README MUST link `docs/ia/USO_IA.md`.

#### Scenario: Library skill or pointer exists
- **WHEN** a reviewer inspects `libreria/` for AI skills
- **THEN** a `.cursor/skills/` skill or a documented pointer to the shared product skill is present

#### Scenario: Library points to AI usage
- **WHEN** a reviewer opens `libreria/README.md`
- **THEN** it links to `docs/ia/USO_IA.md`

