## ADDED Requirements

### Requirement: iOS is a first-class launch target
The mobile host SHALL launch on iOS Simulator with Metro running, using the official Community CLI. Hermes MUST be enabled on iOS. The New Architecture MUST be enabled on iOS. A repository-root command MUST start that iOS host the same way the existing Android command starts the Android host. The host MUST NOT depend on Expo.

#### Scenario: iOS application launches
- **WHEN** a developer starts the iOS host from the repository with Metro running
- **THEN** the application opens on an iOS Simulator without crashing at startup

#### Scenario: iOS New Architecture is enabled
- **WHEN** a reviewer inspects the iOS native project configuration
- **THEN** the New Architecture is enabled and Hermes is enabled

### Requirement: Bundled local web assets are available on iOS
The host SHALL keep the `web` micro-app files (`index.html` and `app.js`) bundled as local iOS application resources under a `web` path. This change MUST NOT remove the existing Android asset copy. The launch screen MUST NOT load those resources. The goal-detail and create screens MUST load those resources as a local file web view.

#### Scenario: iOS build includes web files
- **WHEN** the iOS application is built
- **THEN** the files from `web/` are available to the host as bundled local resources under a `web` path

#### Scenario: iOS launch does not load the web URI
- **WHEN** the iOS application finishes launching
- **THEN** the launch screen does not load the bundled `web/index.html` file URI

## MODIFIED Requirements

### Requirement: Official CLI host without Expo
The mobile host SHALL be a React Native 0.81.x application generated with the official Community CLI, using React 19 and TypeScript. The host MUST NOT depend on Expo. Hermes MUST be enabled. The New Architecture MUST be enabled on Android (`newArchEnabled` true) and on iOS.

#### Scenario: Android application launches
- **WHEN** a developer starts the Android host from the mobile workspace with Metro running
- **THEN** the application opens on an emulator or device without crashing at startup

#### Scenario: Expo is absent
- **WHEN** a developer inspects the mobile workspace dependencies
- **THEN** no Expo runtime, Expo application framework, or Expo storage package is declared

### Requirement: Launch screen is the native goal list
On launch, the host SHALL present the native savings-goal list as the first screen. The launch screen MUST NOT be a full-screen web view.

#### Scenario: List is the first screen
- **WHEN** the Android application finishes launching
- **THEN** the user sees the native goal list and does not see the bundled micro-app as the launch screen

#### Scenario: iOS list is the first screen
- **WHEN** the iOS application finishes launching
- **THEN** the user sees the native goal list and does not see the bundled micro-app as the launch screen

### Requirement: Bundled local web assets remain available
The host SHALL keep the `web` micro-app files bundled as local Android assets under a `web` asset path. This change MUST NOT remove that copy step. The launch screen MUST NOT load those assets. The goal-detail screen MUST load those assets as a local file web view.

#### Scenario: Android build still includes web files
- **WHEN** the Android application is built
- **THEN** the files from `web/` are available to the host as bundled local assets under a `web` asset path

#### Scenario: Launch does not load the asset URI
- **WHEN** the application finishes launching
- **THEN** the launch screen does not load `file:///android_asset/web/index.html`

#### Scenario: Detail loads the asset URI
- **WHEN** the user opens a goal’s detail screen
- **THEN** the web view loads the bundled local `web/index.html` asset

### Requirement: Host imports the savings notifier library
The host SHALL depend on `rn-savings-notifier` as a workspace package and MUST keep it autolinked so the Android and iOS applications launch without a missing-module crash. The composition root MUST supply a production `GoalNotifier` that uses that package. The host MUST NOT invoke `notifyGoalCompleted`, `notifyGoalCreated`, or `showConfirmDialog` on startup or first render solely as a scaffold ping. Production invocation of `notifyGoalCompleted` MUST occur only through the notifications feature when a deposit completes a goal. Production invocation of `notifyGoalCreated` MUST occur only through the notifications feature when a create succeeds.

#### Scenario: Library import does not crash
- **WHEN** the Android application launches with the library linked through the production notifier adapter
- **THEN** the application remains running without an unhandled native crash from a missing TurboModule

#### Scenario: iOS library import does not crash
- **WHEN** the iOS application launches with the library linked through the production notifier adapter
- **THEN** the application remains running without an unhandled native crash from a missing TurboModule

#### Scenario: Library remains linked without a launch ping
- **WHEN** the Android application launches
- **THEN** the user does not see a completion Toast for a synthetic scaffold goal name

#### Scenario: iOS library remains linked without a launch ping
- **WHEN** the iOS application launches
- **THEN** the user does not see a completion notification for a synthetic scaffold goal name

#### Scenario: Completed deposit still reaches the library
- **WHEN** a deposit result applied to the store marks a goal completed
- **THEN** the host requests native completion notification through the injected notifier (backed by `rn-savings-notifier`) without the list or detail screens importing the library

#### Scenario: Created goal reaches the library
- **WHEN** a create result is applied to the store
- **THEN** the host requests native created notification through the injected notifier without the list or create screens importing the library

### Requirement: Production confirm-dialog uses the native library
The composition root MUST supply a production `ConfirmDialog` that calls `showConfirmDialog` on the `rn-savings-notifier` package. Presentation MUST NOT instantiate the library or the dialog adapter. List deletion MUST go through that injected port (not React Native `Alert`). The host MUST NOT invoke `showConfirmDialog` on startup solely as a scaffold ping.

#### Scenario: Delete confirmation uses the library
- **WHEN** the user long-presses a goal card
- **THEN** the confirmation dialog is requested through the injected confirm-dialog port backed by `rn-savings-notifier`, and the list screen does not import the library

#### Scenario: No confirm ping at launch
- **WHEN** the Android application launches
- **THEN** the user does not see a confirmation dialog for a synthetic scaffold message

#### Scenario: No confirm ping at iOS launch
- **WHEN** the iOS application launches
- **THEN** the user does not see a confirmation dialog for a synthetic scaffold message
