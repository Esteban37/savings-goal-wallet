## ADDED Requirements

### Requirement: Android shows native registration UI
On Android, `notifyGoalCreated` SHALL show a native Toast (or a local system notification) that includes the given goal name and MUST NOT reuse the completion copy (“Meta completada”). The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the Android main thread when required by the platform. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host.

#### Scenario: Toast appears for a created goal name
- **WHEN** the Android host calls `notifyGoalCreated` with a non-empty goal name
- **THEN** a native Toast or system notification is visible to the user, includes that goal name, does not say the goal is completed, and the Promise settles without crashing the host

#### Scenario: Empty created name still settles
- **WHEN** `notifyGoalCreated` is called with an empty string
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: Android confirm dialog is a real cancel-or-confirm prompt
On Android, `showConfirmDialog` SHALL show a native confirm/cancel dialog with the given title and message. Confirm MUST settle the Promise to `true`. Cancel MUST settle the Promise to `false`. The dialog MUST NOT auto-resolve to `true` without user input. The implementation MUST remain a TurboModule in the library package.

#### Scenario: Confirm returns true
- **WHEN** the Android host calls `showConfirmDialog` and the user confirms
- **THEN** the Promise settles to `true`

#### Scenario: Cancel returns false
- **WHEN** the Android host calls `showConfirmDialog` and the user cancels
- **THEN** the Promise settles to `false`

## MODIFIED Requirements

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

### Requirement: iOS native may remain a resolving stub
iOS native implementations SHALL continue to exist for autolinking. They MAY resolve without showing Toast, notification, or a platform alert. A real iOS dialog or notification is stretch and MUST NOT block Android create/delete.

#### Scenario: iOS stub still links
- **WHEN** a reviewer inspects the iOS native module
- **THEN** `notifyGoalCompleted`, `notifyGoalCreated`, and `showConfirmDialog` still settle and the iOS project remains part of the library package
