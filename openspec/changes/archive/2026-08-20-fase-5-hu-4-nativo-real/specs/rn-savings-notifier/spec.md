## ADDED Requirements

### Requirement: Android shows native completion UI
On Android, `notifyGoalCompleted` SHALL show a native Toast (or a local system notification) that includes the given goal name. The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the Android main thread when required by the platform. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host.

#### Scenario: Toast appears for a completed goal name
- **WHEN** the Android host calls `notifyGoalCompleted` with a non-empty goal name (for example after a deposit that reaches 100%)
- **THEN** a native Toast or system notification is visible to the user and includes that goal name, and the Promise settles without crashing the host

#### Scenario: Empty name still settles
- **WHEN** `notifyGoalCompleted` is called with an empty string
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: JavaScript wrappers are unit-tested
The library workspace SHALL include automated JavaScript tests for the public wrappers. Those tests MUST mock the TurboModule and MUST NOT require an emulator or instrumented Android run as the merge gate.

#### Scenario: notifyGoalCompleted forwards the goal name
- **WHEN** the unit suite calls `notifyGoalCompleted` with a fixture goal name against a mocked TurboModule
- **THEN** the mock native method is invoked with that same name and the returned Promise settles

#### Scenario: showConfirmDialog forwards title and message
- **WHEN** the unit suite calls `showConfirmDialog` with a fixture title and message against a mocked TurboModule
- **THEN** the mock native method is invoked with those strings and the returned Promise settles to a boolean

### Requirement: iOS native may remain a resolving stub
iOS native implementations SHALL continue to exist for autolinking. They MAY resolve without showing Toast, notification, or a platform alert. A real iOS dialog or notification is stretch and MUST NOT block Android HU 4.

#### Scenario: iOS stub still links
- **WHEN** a reviewer inspects the iOS native module
- **THEN** `notifyGoalCompleted` and `showConfirmDialog` still settle and the iOS project remains part of the library package

## REMOVED Requirements

### Requirement: Stub native behavior in this change
**Reason**: Fase 5 requires a real Android Toast (or native notification) for HU 4. A no-op Android implementation no longer meets the product close.
**Migration**: Follow **Android shows native completion UI**. iOS may keep resolving without UI per **iOS native may remain a resolving stub**.
