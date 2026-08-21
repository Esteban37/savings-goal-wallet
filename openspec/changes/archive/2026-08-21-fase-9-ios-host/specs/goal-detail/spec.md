## MODIFIED Requirements

### Requirement: Detail is an immersive local web view
When the user opens a savings goal from the list, the host SHALL present a full-screen detail screen whose primary content is a web view loading the bundled local micro-app. The screen MUST include a way to go back to the list. The web view MUST load a local file URI for the bundled `web/index.html` on the current platform (Android asset path on Android, iOS application-resource path on iOS), not a remote URL. The detail screen MUST NOT add a tab bar or a second native form that duplicates the deposit UI.

#### Scenario: Opening a goal shows the micro-app
- **WHEN** the user selects a seeded goal from the native list
- **THEN** the host presents a full-screen web view of the bundled micro-app and a back control that returns to the list

#### Scenario: Web view is local only
- **WHEN** the detail screen loads
- **THEN** the web view source is a local file URI under the bundled `web` path for the current platform and is not an `https` URL

#### Scenario: iOS web view is not the Android asset URI
- **WHEN** the detail screen loads on iOS
- **THEN** the web view source is not `file:///android_asset/web/index.html` and is a local file URI to the bundled `web/index.html`

### Requirement: Create is an immersive local web view
When the user starts registration from the list FAB, the host SHALL present a full-screen create screen whose primary content is a web view loading the same bundled local micro-app used for deposits. The screen MUST include a way to go back to the list. The web view MUST load a local file URI for the bundled `web/index.html` on the current platform (Android asset path on Android, iOS application-resource path on iOS), not a remote URL. The create screen MUST NOT add a native form that duplicates the web registration fields.

#### Scenario: FAB shows the micro-app in create mode
- **WHEN** the user presses the list FAB
- **THEN** the host presents a full-screen web view of the bundled micro-app and a back control that returns to the list

#### Scenario: Create web view is local only
- **WHEN** the create screen loads
- **THEN** the web view source is a local file URI under the bundled `web` path for the current platform and is not an `https` URL

#### Scenario: iOS create web view is not the Android asset URI
- **WHEN** the create screen loads on iOS
- **THEN** the web view source is not `file:///android_asset/web/index.html` and is a local file URI to the bundled `web/index.html`
