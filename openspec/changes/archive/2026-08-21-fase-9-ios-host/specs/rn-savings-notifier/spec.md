## ADDED Requirements

### Requirement: iOS shows native completion UI
On iOS, `notifyGoalCompleted` SHALL show native, non-blocking feedback that includes the given goal name. The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the iOS main thread. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host. The copy MUST NOT reuse the registration wording.

#### Scenario: Completion feedback appears for a completed goal name
- **WHEN** the iOS host calls `notifyGoalCompleted` with a non-empty goal name (for example after a deposit that reaches 100%)
- **THEN** native feedback is visible to the user, includes that goal name, does not say the goal was registered, and the Promise settles without crashing the host

#### Scenario: Empty completed name still settles on iOS
- **WHEN** `notifyGoalCompleted` is called with an empty string on iOS
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: iOS shows native registration UI
On iOS, `notifyGoalCreated` SHALL show native, non-blocking feedback that includes the given goal name and MUST NOT reuse the completion copy (“Meta completada”). The returned Promise MUST still settle after the native UI is requested. Native UI MUST run on the iOS main thread. The implementation MUST remain a TurboModule in the library package; it MUST NOT be reimplemented inside the mobile host.

#### Scenario: Registration feedback appears for a created goal name
- **WHEN** the iOS host calls `notifyGoalCreated` with a non-empty goal name
- **THEN** native feedback is visible to the user, includes that goal name, does not say the goal is completed, and the Promise settles without crashing the host

#### Scenario: Empty created name still settles on iOS
- **WHEN** `notifyGoalCreated` is called with an empty string on iOS
- **THEN** the Promise still settles and the host does not crash (native UI MAY be omitted)

### Requirement: iOS confirm dialog is a real cancel-or-confirm prompt
On iOS, `showConfirmDialog` SHALL show a native confirm/cancel dialog with the given title and message. Confirm MUST settle the Promise to `true`. Cancel MUST settle the Promise to `false`. The dialog MUST NOT auto-resolve to `true` without user input. The implementation MUST remain a TurboModule in the library package.

#### Scenario: iOS confirm returns true
- **WHEN** the iOS host calls `showConfirmDialog` and the user confirms
- **THEN** the Promise settles to `true`

#### Scenario: iOS cancel returns false
- **WHEN** the iOS host calls `showConfirmDialog` and the user cancels
- **THEN** the Promise settles to `false`

## REMOVED Requirements

### Requirement: iOS native may remain a resolving stub
**Reason**: Fase 9 makes iOS a runnable product host. A silent stub that auto-resolves confirm to `true` would skip delete confirmation and hide HU 4.
**Migration**: Follow **iOS shows native completion UI**, **iOS shows native registration UI**, and **iOS confirm dialog is a real cancel-or-confirm prompt**. Keep the iOS native module inside `libreria/`; do not copy it into `mobile/`.
