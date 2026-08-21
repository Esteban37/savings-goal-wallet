## ADDED Requirements

### Requirement: Successful create triggers native registration notification
When the application store records a successful create, the host SHALL request a native registration notification using that goal’s name. Create-goal application logic MUST NOT itself show UI or call the notifier; notification is a reaction to the created result. The host MUST NOT request a completion notification for a newly created incomplete goal.

#### Scenario: Created goal notifies once per create result
- **WHEN** a successful create result is applied to the store
- **THEN** the host requests a native registration notification with that goal’s name

#### Scenario: Create does not use the completion notification
- **WHEN** a successful create result is applied to the store for a goal at 0 percent
- **THEN** the host does not request a native completion notification for that event

## MODIFIED Requirements

### Requirement: Notifier is the workspace library, not a copy
The host SHALL fulfill completion-notification and registration-notification requests by calling the public JavaScript API of the `rn-savings-notifier` workspace package. The host MUST NOT copy native library sources into the mobile tree. Features other than the notifications feature MUST NOT import the library for these notification paths. Presentation MUST NOT instantiate the library or the notifier.

#### Scenario: Production path uses the package name
- **WHEN** a completed deposit triggers notification
- **THEN** the call goes to `rn-savings-notifier` imported by package name from the notifications feature’s infrastructure, not from a copied native module under `mobile/`

#### Scenario: Created-goal path uses the package name
- **WHEN** a successful create triggers notification
- **THEN** the call goes to `rn-savings-notifier` imported by package name from the notifications feature’s infrastructure, not from a copied native module under `mobile/`
