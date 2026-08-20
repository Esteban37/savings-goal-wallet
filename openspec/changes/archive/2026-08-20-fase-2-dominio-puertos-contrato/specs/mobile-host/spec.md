## MODIFIED Requirements

### Requirement: Feature folder skeleton is reserved
The mobile host source tree SHALL include a composition root, a shared kernel area, three feature slots (`goals`, `goal-detail`, `notifications`) with public barrels, and a shared UI area for tokens and atoms. The shared kernel MUST contain savings-goal domain types, application ports, and the postMessage contract. Feature presentation folders, feature store slots, and the composition-root DI/store modules MAY remain placeholders. The host MUST NOT configure a global application store and MUST NOT add feature navigation.

#### Scenario: Skeleton exists without domain logic
- **WHEN** a developer opens the mobile source tree after this change
- **THEN** the composition root, kernel, three feature barrels, and shared UI slots exist, the kernel contains savings-goal domain types, ports, and the message contract, and there is no configured Redux store and no navigation stack between features

### Requirement: Host screen loads the local micro-app
On launch, the host SHALL present a full-screen web view that loads the bundled `web` micro-app from a local `file` URI (Android asset path). The host MUST enable JavaScript in that view and MUST accept `postMessage` events from the page. The launch screen MAY log received messages. The launch screen MUST NOT invoke the kernel message parser; schema validation belongs to the postMessage contract and is tested independently of this screen.

#### Scenario: WebView shows the test micro-app
- **WHEN** the Android application finishes launching
- **THEN** the user sees the local micro-app, including its test control for requesting a deposit

#### Scenario: Host accepts a message from the page
- **WHEN** the micro-app posts a message to the host
- **THEN** the host receives the message without crashing

#### Scenario: Launch screen does not parse envelopes
- **WHEN** the micro-app posts a message to the host
- **THEN** the launch screen still does not have to validate that payload against the contract schema
