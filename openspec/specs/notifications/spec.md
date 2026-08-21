# notifications Specification

## Purpose

Wires HU 4 in the mobile host: when a deposit completes a savings goal, the host shows native confirmation through the savings-notifier library, without a notifications screen or React Native Alert.

## Requirements

### Requirement: Completed deposit triggers native notification
When the application store records a successful deposit whose resulting goal is completed, the host SHALL request a native completion notification using that goal’s name. The host MUST NOT request a completion notification when the resulting goal is not completed. Deposit application logic MUST NOT itself show UI or call the notifier; notification is a reaction to the completed deposit result.

#### Scenario: Completed goal notifies once per completed deposit result
- **WHEN** a successful deposit result is applied to the store and the goal is completed
- **THEN** the host requests a native completion notification with that goal’s name

#### Scenario: Incomplete goal does not notify
- **WHEN** a successful deposit result is applied to the store and the goal is not completed
- **THEN** the host does not request a native completion notification

### Requirement: Notifier is the workspace library, not a copy
The host SHALL fulfill completion-notification and registration-notification requests by calling the public JavaScript API of the `rn-savings-notifier` workspace package. The host MUST NOT copy native library sources into the mobile tree. Features other than the notifications feature MUST NOT import the library for these notification paths. Presentation MUST NOT instantiate the library or the notifier.

#### Scenario: Production path uses the package name
- **WHEN** a completed deposit triggers notification
- **THEN** the call goes to `rn-savings-notifier` imported by package name from the notifications feature’s infrastructure, not from a copied native module under `mobile/`

#### Scenario: Created-goal path uses the package name
- **WHEN** a successful create triggers notification
- **THEN** the call goes to `rn-savings-notifier` imported by package name from the notifications feature’s infrastructure, not from a copied native module under `mobile/`

### Requirement: No React Native Alert for HU 4
The HU 4 completion confirmation MUST be native (Toast or platform notification/dialog from the library). The host MUST NOT use React Native `Alert` as the HU 4 completion UI.

#### Scenario: Completion is not an RN Alert
- **WHEN** a goal reaches 100% after a deposit on Android
- **THEN** the user sees native confirmation from the library and does not see a React Native `Alert` dialog for that event

### Requirement: No notifications screen
The notifications feature SHALL not add a user-facing list or settings screen. Cross-feature communication MUST remain store actions plus listener middleware registered at the composition root.

#### Scenario: User cannot open a notifications route
- **WHEN** a reviewer inspects the host navigation
- **THEN** there is no stack or tab route whose purpose is a notifications inbox or settings screen

### Requirement: Successful create triggers native registration notification
When the application store records a successful create, the host SHALL request a native registration notification using that goal’s name. Create-goal application logic MUST NOT itself show UI or call the notifier; notification is a reaction to the created result. The host MUST NOT request a completion notification for a newly created incomplete goal.

#### Scenario: Created goal notifies once per create result
- **WHEN** a successful create result is applied to the store
- **THEN** the host requests a native registration notification with that goal’s name

#### Scenario: Create does not use the completion notification
- **WHEN** a successful create result is applied to the store for a goal at 0 percent
- **THEN** the host does not request a native completion notification for that event
