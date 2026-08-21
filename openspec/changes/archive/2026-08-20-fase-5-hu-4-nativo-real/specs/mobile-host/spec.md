## MODIFIED Requirements

### Requirement: Host imports the savings notifier library
The host SHALL depend on `rn-savings-notifier` as a workspace package and MUST keep it autolinked so the Android application launches without a missing-module crash. The composition root MUST supply a production `GoalNotifier` that uses that package. The host MUST NOT invoke `notifyGoalCompleted` (or `showConfirmDialog`) on startup or first render solely as a scaffold ping. Production invocation of `notifyGoalCompleted` MUST occur only through the notifications feature when a deposit completes a goal.

#### Scenario: Library import does not crash
- **WHEN** the Android application launches with the library linked through the production notifier adapter
- **THEN** the application remains running without an unhandled native crash from a missing TurboModule

#### Scenario: Library remains linked without a launch ping
- **WHEN** the Android application launches
- **THEN** the user does not see a completion Toast for a synthetic scaffold goal name

#### Scenario: Completed deposit still reaches the library
- **WHEN** a deposit result applied to the store marks a goal completed
- **THEN** the host requests native completion notification through the injected notifier (backed by `rn-savings-notifier`) without the list or detail screens importing the library
