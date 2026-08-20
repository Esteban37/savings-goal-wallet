## Purpose

Defines the savings-goal kernel: money and progress values, an immutable goal entity, application ports, and the get-list and apply-deposit use cases, all testable without UI.

## ADDED Requirements

### Requirement: Money is a positive integer amount
A money value SHALL represent an amount in whole Colombian pesos as an integer. Construction MUST reject a non-integer amount and MUST reject an amount less than or equal to zero when the value is used as a deposit. Domain code MUST NOT use floating-point types to store money.

#### Scenario: Valid deposit amount is accepted
- **WHEN** a deposit money value is constructed with a positive integer (for example 10000)
- **THEN** the value is accepted and exposes that integer amount

#### Scenario: Non-positive deposit amount is rejected
- **WHEN** a deposit money value is constructed with 0 or a negative integer
- **THEN** construction fails with a typed domain error and no money value is produced

#### Scenario: Non-integer amount is rejected
- **WHEN** a money value is constructed with a fractional number
- **THEN** construction fails with a typed domain error and no money value is produced

### Requirement: Progress is derived from deposited and target
Progress SHALL be derived from a goal’s deposited amount and target amount. The percentage MUST be deposited divided by target, expressed as a number in the range 0 through 100, using 100 when deposited is greater than or equal to target. A goal MUST be completed when deposited is greater than or equal to target. Progress MUST NOT be stored as an independent writable field.

#### Scenario: Partial progress
- **WHEN** a goal has target 100000 and deposited 25000
- **THEN** progress percent is 25 and the goal is not completed

#### Scenario: Goal is completed at or above target
- **WHEN** a goal has target 100000 and deposited 100000 or more
- **THEN** progress percent is 100 and the goal is completed

#### Scenario: Zero deposited is zero percent
- **WHEN** a goal has a positive target and deposited 0
- **THEN** progress percent is 0 and the goal is not completed

### Requirement: Savings goal is immutable under deposit
A savings goal SHALL have an identifier, a name, a target money amount, and a deposited money amount (deposited MAY be zero). Applying a deposit MUST return a new goal with the increased deposited amount, or a typed domain error. The original goal MUST remain unchanged. Applying a deposit MUST NOT invoke notification or persistence ports.

#### Scenario: Deposit increases accumulated amount
- **WHEN** a goal with deposited 10000 receives a valid deposit of 5000
- **THEN** the result is a new goal whose deposited amount is 15000 and the original goal still has deposited 10000

#### Scenario: Invalid deposit does not change the goal
- **WHEN** a goal receives a deposit that the money rules reject
- **THEN** the operation fails with a typed domain error and the original goal is unchanged

### Requirement: Goals repository port abstracts persistence
The application SHALL depend on a goals repository port that can list goals, retrieve a goal by identifier, and save a goal. Use cases MUST NOT import a concrete storage library. A fake in-memory implementation MUST be sufficient to exercise the use cases in tests.

#### Scenario: Fake repository round-trips a goal
- **WHEN** a test fake is seeded with a goal and a caller saves an updated copy of that goal
- **THEN** a subsequent list or get-by-id returns the updated goal

#### Scenario: Missing goal is visible to the caller
- **WHEN** a caller asks the repository for an identifier that was not saved
- **THEN** the port reports that the goal is absent (no throw required beyond a typed miss)

### Requirement: Goal notifier port does not couple to the native library
The application SHALL expose a goal-notifier port with an operation to notify that a named goal was completed. Use cases in this change MUST NOT call that port. A no-op fake MUST satisfy the port in tests. Application and domain modules MUST NOT import the `rn-savings-notifier` package.

#### Scenario: Make-deposit does not notify
- **WHEN** the make-deposit use case applies a valid deposit that reaches 100 percent
- **THEN** the notifier port is not invoked and the use case still returns the updated goal

#### Scenario: Domain has no native-library import
- **WHEN** a reviewer inspects domain, ports, and use-case modules
- **THEN** none of those modules import `rn-savings-notifier`

### Requirement: Confirm-dialog port is declared
The application SHALL expose a confirm-dialog port that accepts a title and a message and returns a boolean. A fake MUST be able to resolve to `true` without showing UI. Use cases in this change MUST NOT be required to call this port.

#### Scenario: Fake confirm resolves true
- **WHEN** a test fake of the confirm-dialog port is invoked with a title and a message
- **THEN** the returned promise settles to `true`

### Requirement: Get-goals returns the repository list
The get-goals use case SHALL return every goal currently held by the goals repository, without filtering by completion. It MUST NOT render UI and MUST NOT read a global store.

#### Scenario: Empty list
- **WHEN** the repository contains no goals
- **THEN** get-goals returns an empty list

#### Scenario: Seeded list
- **WHEN** the repository contains two goals
- **THEN** get-goals returns both goals with their identifiers, names, targets, deposited amounts, and derived progress

### Requirement: Make-deposit persists a valid abono
The make-deposit use case SHALL load the goal by identifier, apply a valid deposit, save the updated goal through the repository, and return the updated goal. If the goal is missing, or the deposit is rejected by domain rules, the use case MUST fail with a typed error and MUST NOT save a change. The use case MUST NOT call the notifier port and MUST NOT update a UI store.

#### Scenario: Successful deposit
- **WHEN** a known goal is deposited 20000 against deposited 10000 and target 100000
- **THEN** the repository holds deposited 30000, the returned goal matches that state, and progress is 30 percent

#### Scenario: Unknown goal
- **WHEN** make-deposit is invoked with an identifier the repository does not contain
- **THEN** the use case fails with a typed error and the repository is unchanged

#### Scenario: Rejected amount
- **WHEN** make-deposit is invoked for a known goal with amount 0
- **THEN** the use case fails with a typed error and the stored deposited amount is unchanged

### Requirement: Domain and use cases are tested without UI
Automated tests SHALL cover money construction, progress derivation, deposit application, get-goals, make-deposit, and repository-fake behavior. Those tests MUST run under the mobile workspace test runner and MUST NOT render React Native screens. Coverage of domain plus pure use cases MUST be at least 70 percent.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the domain, contract-parser, and use-case tests execute and pass without opening an emulator

#### Scenario: Domain coverage gate
- **WHEN** coverage is collected for the domain and pure use-case modules
- **THEN** the reported coverage for that set is at least 70 percent
