# mobile-host Specification

## Purpose

Defines the React Native CLI Android host that launches with New Architecture and Hermes, reserves the feature folder skeleton, and displays the local web micro-app.

## Requirements

### Requirement: Official CLI host without Expo
The mobile host SHALL be a React Native 0.81.x application generated with the official Community CLI, using React 19 and TypeScript. The host MUST NOT depend on Expo. Hermes MUST be enabled. The New Architecture MUST be enabled (`newArchEnabled` true on Android).

#### Scenario: Android application launches
- **WHEN** a developer starts the Android host from the mobile workspace with Metro running
- **THEN** the application opens on an emulator or device without crashing at startup

#### Scenario: Expo is absent
- **WHEN** a developer inspects the mobile workspace dependencies
- **THEN** no Expo runtime or Expo application framework package is declared

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
The host SHALL import the library’s public JavaScript API and invoke at least one of `notifyGoalCompleted` or `showConfirmDialog` during startup or first render. That call MUST settle without crashing the application (stub native implementations are acceptable).

#### Scenario: Library import does not crash
- **WHEN** the Android application launches with the library imported and a public API method invoked
- **THEN** the application remains running and the returned promise fulfills or rejects without an unhandled native crash

### Requirement: Minimal stack between list and detail
The host SHALL present a two-screen stack whose root is the native savings-goal list and whose second screen is the immersive goal-detail web view. The composition root MUST still wrap the tree with the application store provider so both screens share one store instance. The host MUST NOT introduce a tab navigator, a remote linking scheme, or navigation between `notifications` internals and other features.

#### Scenario: List is the stack root
- **WHEN** the Android application finishes launching
- **THEN** the user sees the native goal list as the first screen of the stack

#### Scenario: Detail is pushed on the same store
- **WHEN** the user opens a goal and the detail screen is visible
- **THEN** the detail screen reads and writes the same application store instance as the list
