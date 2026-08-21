## ADDED Requirements

### Requirement: Create-goal persists a valid new goal
The create-goal use case SHALL accept a name and a target amount, construct a new savings goal with a unique identifier and deposited amount 0, save it through the repository, and return the created goal. If the name is empty or whitespace-only, or the target is rejected by money rules (non-positive or non-integer), the use case MUST fail with a typed error and MUST NOT save a goal. Duplicate names MAY be accepted. The use case MUST NOT call the notifier port and MUST NOT update a UI store.

#### Scenario: Successful create
- **WHEN** create-goal is invoked with name Viaje and target 500000
- **THEN** the repository holds a new goal with that name, target 500000, deposited 0, progress 0 percent, and a non-empty identifier distinct from any previously stored identifier

#### Scenario: Empty name is rejected
- **WHEN** create-goal is invoked with name `"   "` and a valid target
- **THEN** the use case fails with a typed error and the repository goal count is unchanged

#### Scenario: Rejected target
- **WHEN** create-goal is invoked with a valid name and target 0
- **THEN** the use case fails with a typed error and the repository goal count is unchanged

### Requirement: Delete-goal removes a known goal
The delete-goal use case SHALL load the goal by identifier, remove it through the repository, and return success. If the goal is missing, the use case MUST fail with a typed error and MUST NOT remove another goal. The use case MUST NOT call the confirm-dialog port, MUST NOT call the notifier port, and MUST NOT update a UI store.

#### Scenario: Successful delete
- **WHEN** delete-goal is invoked with an identifier the repository contains
- **THEN** a subsequent list does not include that identifier

#### Scenario: Unknown goal
- **WHEN** delete-goal is invoked with an identifier the repository does not contain
- **THEN** the use case fails with a typed error and the repository is unchanged

## MODIFIED Requirements

### Requirement: Goals repository port abstracts persistence
The application SHALL depend on a goals repository port that can list goals, retrieve a goal by identifier, save a goal, and remove a goal by identifier. Use cases MUST NOT import a concrete storage library. A fake in-memory implementation MUST be sufficient to exercise the use cases in tests.

#### Scenario: Fake repository round-trips a goal
- **WHEN** a test fake is seeded with a goal and a caller saves an updated copy of that goal
- **THEN** a subsequent list or get-by-id returns the updated goal

#### Scenario: Missing goal is visible to the caller
- **WHEN** a caller asks the repository for an identifier that was not saved
- **THEN** the port reports that the goal is absent (no throw required beyond a typed miss)

#### Scenario: Fake repository removes a goal
- **WHEN** a test fake is seeded with two goals and a caller removes one identifier
- **THEN** a subsequent list returns only the remaining goal and get-by-id for the removed identifier reports absent

### Requirement: Goal notifier port does not couple to the native library
The application SHALL expose a goal-notifier port with an operation to notify that a named goal was completed and an operation to notify that a named goal was registered. Use cases MUST NOT call that port. A no-op fake MUST satisfy the port in tests. Application and domain modules MUST NOT import the `rn-savings-notifier` package.

#### Scenario: Make-deposit does not notify
- **WHEN** the make-deposit use case applies a valid deposit that reaches 100 percent
- **THEN** the notifier port is not invoked and the use case still returns the updated goal

#### Scenario: Create-goal does not notify
- **WHEN** the create-goal use case saves a valid new goal
- **THEN** the notifier port is not invoked and the use case still returns the created goal

#### Scenario: Domain has no native-library import
- **WHEN** a reviewer inspects domain, ports, and use-case modules
- **THEN** none of those modules import `rn-savings-notifier`

### Requirement: Domain and use cases are tested without UI
Automated tests SHALL cover money construction, progress derivation, deposit application, get-goals, make-deposit, create-goal, delete-goal, and repository-fake behavior including remove. Those tests MUST run under the mobile workspace test runner and MUST NOT render React Native screens. Coverage of domain plus pure use cases MUST be at least 70 percent.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the domain, contract-parser, and use-case tests execute and pass without opening an emulator

#### Scenario: Domain coverage gate
- **WHEN** coverage is collected for the domain and pure use-case modules
- **THEN** the reported coverage for that set is at least 70 percent
