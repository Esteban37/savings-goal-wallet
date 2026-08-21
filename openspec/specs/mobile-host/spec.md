# mobile-host Specification

## Purpose

Defines the React Native CLI Android and iOS host that launches with New Architecture and Hermes, reserves the feature folder skeleton, and displays the local web micro-app.

## Requirements

### Requirement: Official CLI host without Expo
The mobile host SHALL be a React Native 0.81.x application generated with the official Community CLI, using React 19 and TypeScript. The host MUST NOT depend on Expo. Hermes MUST be enabled. The New Architecture MUST be enabled on Android (`newArchEnabled` true) and on iOS.

#### Scenario: Android application launches
- **WHEN** a developer starts the Android host from the mobile workspace with Metro running
- **THEN** the application opens on an emulator or device without crashing at startup

#### Scenario: Expo is absent
- **WHEN** a developer inspects the mobile workspace dependencies
- **THEN** no Expo runtime, Expo application framework, or Expo storage package is declared

### Requirement: iOS is a first-class launch target
The mobile host SHALL launch on iOS Simulator with Metro running, using the official Community CLI. Hermes MUST be enabled on iOS. The New Architecture MUST be enabled on iOS. A repository-root command MUST start that iOS host the same way the existing Android command starts the Android host. The host MUST NOT depend on Expo.

#### Scenario: iOS application launches
- **WHEN** a developer starts the iOS host from the repository with Metro running
- **THEN** the application opens on an iOS Simulator without crashing at startup

#### Scenario: iOS New Architecture is enabled
- **WHEN** a reviewer inspects the iOS native project configuration
- **THEN** the New Architecture is enabled and Hermes is enabled

### Requirement: Feature folder skeleton is reserved
The mobile host source tree SHALL include a composition root, a shared kernel area, three feature slots (`goals`, `goal-detail`, `notifications`) with public barrels, and a shared UI area for tokens and atoms. The shared kernel MUST contain savings-goal domain types, application ports, and the postMessage contract. The composition root MUST configure application dependencies and a global application store. The host MAY add a minimal stack whose only feature screens are the goals list and goal-detail. Features MUST still import other features only through `public` barrels.

#### Scenario: Skeleton exists without domain logic
- **WHEN** a developer opens the mobile source tree after this change
- **THEN** the composition root, kernel, three feature barrels, and shared UI slots exist, the kernel contains savings-goal domain types, ports, and the message contract, the composition root configures dependencies and the application store, and a minimal stack exists between the list and goal-detail only

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

### Requirement: Bundled local web assets are available on iOS
The host SHALL keep the `web` micro-app files (`index.html` and `app.js`) bundled as local iOS application resources under a `web` path. This change MUST NOT remove the existing Android asset copy. The launch screen MUST NOT load those resources. The goal-detail and create screens MUST load those resources as a local file web view.

#### Scenario: iOS build includes web files
- **WHEN** the iOS application is built
- **THEN** the files from `web/` are available to the host as bundled local resources under a `web` path

#### Scenario: iOS launch does not load the web URI
- **WHEN** the iOS application finishes launching
- **THEN** the launch screen does not load the bundled `web/index.html` file URI

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

### Requirement: Minimal stack between list and detail
The host SHALL present a stack whose root is the native savings-goal list, whose detail screen is the immersive goal-detail web view, and whose create screen is the immersive create web view. The composition root MUST still wrap the tree with the application store provider so those screens share one store instance. The host MUST NOT introduce a tab navigator, a remote linking scheme, or navigation between `notifications` internals and other features.

#### Scenario: List is the stack root
- **WHEN** the Android application finishes launching
- **THEN** the user sees the native goal list as the first screen of the stack

#### Scenario: Detail is pushed on the same store
- **WHEN** the user opens a goal and the detail screen is visible
- **THEN** the detail screen reads and writes the same application store instance as the list

### Requirement: Production goals repository is durable
The composition root MUST supply a production goals repository that stores goals on the device across process restarts. Get-goals, make-deposit, create-goal, and delete-goal MUST keep receiving that repository through injected dependencies. Presentation MUST NOT instantiate the storage adapter. The host MUST NOT use an Expo storage SDK.

#### Scenario: Composition root injects durable storage
- **WHEN** the Android application launches in production
- **THEN** listing goals is backed by on-device storage (seeded only if storage is empty), not by a process-only in-memory map that forgets deposits when the process is killed

#### Scenario: Screens do not own storage
- **WHEN** a reviewer inspects list and detail presentation modules
- **THEN** those modules do not import the on-device storage package

### Requirement: Stack header is the native title surface
The host SHALL show the list title “Metas de ahorro” only in the native stack header. The goal-detail header SHALL show the selected goal’s name. The host MUST NOT render a second native heading with the same text below that header on either screen.

#### Scenario: List title is only in the header
- **WHEN** the list is the visible screen
- **THEN** the native header title is “Metas de ahorro” and the list body does not repeat that heading

#### Scenario: Detail title is the goal name
- **WHEN** the user opens a goal named Vacaciones
- **THEN** the native header title is Vacaciones and the detail chrome does not render a second native heading with that name

### Requirement: Host chrome follows the resolved appearance
The native stack header, status bar, and screen backgrounds MUST follow the resolved light or dark scheme. The appearance control remains in the top-right of the header on both screens of the list/detail stack.

#### Scenario: Dark scheme themes the header
- **WHEN** the resolved scheme is dark
- **THEN** the stack header and status bar use dark chrome with light title and icons

#### Scenario: Light scheme themes the header
- **WHEN** the resolved scheme is light
- **THEN** the stack header and status bar use light chrome with dark title and icons

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

### Requirement: Create screen shares the application store
The host SHALL present a create screen on the same stack as the list and detail. The composition root MUST still wrap the tree with the application store provider so the create screen shares one store instance with the list. The host MUST NOT introduce a tab navigator for this flow.

#### Scenario: Create is pushed on the same store
- **WHEN** the user opens create from the FAB and the create screen is visible
- **THEN** the create screen reads and writes the same application store instance as the list

#### Scenario: Create header is not a goal name
- **WHEN** the create screen is visible
- **THEN** the native header title is a registration title (not an existing goal name) and the create chrome does not render a second native heading with that same text
