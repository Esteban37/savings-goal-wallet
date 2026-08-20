## Purpose

Defines the React Native CLI Android host that launches with New Architecture and Hermes, reserves the feature folder skeleton, and displays the local web micro-app.

## ADDED Requirements

### Requirement: Official CLI host without Expo
The mobile host SHALL be a React Native 0.81.x application generated with the official Community CLI, using React 19 and TypeScript. The host MUST NOT depend on Expo. Hermes MUST be enabled. The New Architecture MUST be enabled (`newArchEnabled` true on Android).

#### Scenario: Android application launches
- **WHEN** a developer starts the Android host from the mobile workspace with Metro running
- **THEN** the application opens on an emulator or device without crashing at startup

#### Scenario: Expo is absent
- **WHEN** a developer inspects the mobile workspace dependencies
- **THEN** no Expo runtime or Expo application framework package is declared

### Requirement: Feature folder skeleton is reserved
The mobile host source tree SHALL include a composition root, a shared kernel area, three feature slots (`goals`, `goal-detail`, `notifications`) with public barrels, and a shared UI area for tokens and atoms. Those slots MAY be empty or re-export only placeholders. The host MUST NOT add domain entities, a global store, or feature navigation in this change.

#### Scenario: Skeleton exists without domain logic
- **WHEN** a developer opens the mobile source tree after Fase 1
- **THEN** the composition root, kernel, three feature barrels, and shared UI slots exist, and they do not contain savings-goal entities, reducers, or a navigation stack between features

### Requirement: Host screen loads the local micro-app
On launch, the host SHALL present a full-screen web view that loads the bundled `web` micro-app from a local `file` URI (Android asset path). The host MUST enable JavaScript in that view and MUST accept `postMessage` events from the page. The host MAY log received messages; it MUST NOT parse them with a runtime schema validator in this change.

#### Scenario: WebView shows the test micro-app
- **WHEN** the Android application finishes launching
- **THEN** the user sees the local micro-app, including its test control for requesting a deposit

#### Scenario: Host accepts a message from the page
- **WHEN** the micro-app posts a message to the host
- **THEN** the host receives the message without crashing

### Requirement: Host imports the savings notifier library
The host SHALL import the library’s public JavaScript API and invoke at least one of `notifyGoalCompleted` or `showConfirmDialog` during startup or first render. That call MUST settle without crashing the application (stub native implementations are acceptable).

#### Scenario: Library import does not crash
- **WHEN** the Android application launches with the library imported and a public API method invoked
- **THEN** the application remains running and the returned promise fulfills or rejects without an unhandled native crash
