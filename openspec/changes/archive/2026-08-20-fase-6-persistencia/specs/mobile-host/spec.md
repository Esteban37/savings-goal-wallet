## MODIFIED Requirements

### Requirement: Official CLI host without Expo
The mobile host SHALL be a React Native 0.81.x application generated with the official Community CLI, using React 19 and TypeScript. The host MUST NOT depend on Expo. Hermes MUST be enabled. The New Architecture MUST be enabled (`newArchEnabled` true on Android).

#### Scenario: Android application launches
- **WHEN** a developer starts the Android host from the mobile workspace with Metro running
- **THEN** the application opens on an emulator or device without crashing at startup

#### Scenario: Expo is absent
- **WHEN** a developer inspects the mobile workspace dependencies
- **THEN** no Expo runtime, Expo application framework, or Expo storage package is declared

## ADDED Requirements

### Requirement: Production goals repository is durable
The composition root MUST supply a production goals repository that stores goals on the device across process restarts. Get-goals and make-deposit MUST keep receiving that repository through injected dependencies. Presentation MUST NOT instantiate the storage adapter. The host MUST NOT use an Expo storage SDK.

#### Scenario: Composition root injects durable storage
- **WHEN** the Android application launches in production
- **THEN** listing goals is backed by on-device storage (seeded only if storage is empty), not by a process-only in-memory map that forgets deposits when the process is killed

#### Scenario: Screens do not own storage
- **WHEN** a reviewer inspects list and detail presentation modules
- **THEN** those modules do not import the on-device storage package
