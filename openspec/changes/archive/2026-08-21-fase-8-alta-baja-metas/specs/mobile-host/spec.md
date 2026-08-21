## ADDED Requirements

### Requirement: Production confirm-dialog uses the native library
The composition root MUST supply a production `ConfirmDialog` that calls `showConfirmDialog` on the `rn-savings-notifier` package. Presentation MUST NOT instantiate the library or the dialog adapter. List deletion MUST go through that injected port (not React Native `Alert`). The host MUST NOT invoke `showConfirmDialog` on startup solely as a scaffold ping.

#### Scenario: Delete confirmation uses the library
- **WHEN** the user long-presses a goal card
- **THEN** the confirmation dialog is requested through the injected confirm-dialog port backed by `rn-savings-notifier`, and the list screen does not import the library

#### Scenario: No confirm ping at launch
- **WHEN** the Android application launches
- **THEN** the user does not see a confirmation dialog for a synthetic scaffold message

### Requirement: Create screen shares the application store
The host SHALL present a create screen on the same stack as the list and detail. The composition root MUST still wrap the tree with the application store provider so the create screen shares one store instance with the list. The host MUST NOT introduce a tab navigator for this flow.

#### Scenario: Create is pushed on the same store
- **WHEN** the user opens create from the FAB and the create screen is visible
- **THEN** the create screen reads and writes the same application store instance as the list

#### Scenario: Create header is not a goal name
- **WHEN** the create screen is visible
- **THEN** the native header title is a registration title (not an existing goal name) and the create chrome does not render a second native heading with that same text

## MODIFIED Requirements

### Requirement: Host imports the savings notifier library
The host SHALL depend on `rn-savings-notifier` as a workspace package and MUST keep it autolinked so the Android application launches without a missing-module crash. The composition root MUST supply a production `GoalNotifier` that uses that package. The host MUST NOT invoke `notifyGoalCompleted`, `notifyGoalCreated`, or `showConfirmDialog` on startup or first render solely as a scaffold ping. Production invocation of `notifyGoalCompleted` MUST occur only through the notifications feature when a deposit completes a goal. Production invocation of `notifyGoalCreated` MUST occur only through the notifications feature when a create succeeds.

#### Scenario: Library import does not crash
- **WHEN** the Android application launches with the library linked through the production notifier adapter
- **THEN** the application remains running without an unhandled native crash from a missing TurboModule

#### Scenario: Library remains linked without a launch ping
- **WHEN** the Android application launches
- **THEN** the user does not see a completion Toast for a synthetic scaffold goal name

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
