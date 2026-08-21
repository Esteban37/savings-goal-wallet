# goals-list Specification

## Purpose

Defines the native savings-goal list (HU 1): seeded goals rendered from the application store with name, target, accumulated amount, and progress percent, without opening the web micro-app or applying deposits.

## Requirements

### Requirement: Native list shows seeded goals
The host SHALL present a native list of savings goals. Each visible goal MUST show its name, target amount in whole pesos, deposited amount in whole pesos, and progress percent. On first launch the list MUST contain at least two and at most three seeded goals. Progress percent MUST be the domain-derived value in the range 0 through 100 (100 when deposited is greater than or equal to target). Amounts MUST NOT be shown with fractional pesos.

#### Scenario: Seeded goals are visible after launch
- **WHEN** the application finishes launching with the in-memory seed
- **THEN** the user sees two or three goals, each with name, target, deposited amount, and progress percent

#### Scenario: Partial progress is visible
- **WHEN** a seeded goal has target 100000 and deposited 25000
- **THEN** that row shows progress of 25 percent and is not treated as completed

#### Scenario: Zero progress is visible
- **WHEN** a seeded goal has a positive target and deposited 0
- **THEN** that row shows progress of 0 percent

### Requirement: List rows come from the application store
Goal rows MUST be rendered from the application store. Loading the list MUST go through the get-goals use case via injected application dependencies, not a direct repository call from the screen. The store MUST hold serializable goal snapshots (identifier, name, integer amounts, progress percent, completed flag). The store MUST NOT hold domain class instances.

#### Scenario: Store populate then render
- **WHEN** get-goals returns the seeded goals and the store records them
- **THEN** the list displays those same identifiers, names, amounts, and percents

#### Scenario: Same store instance is the source of truth
- **WHEN** the list is showing seeded goals
- **THEN** a later in-store update to a goal’s deposited amount and percent is enough for that row to reflect the new values without reloading the application

### Requirement: Selecting a goal opens the immersive detail
Selecting a visible goal MUST navigate to the goal-detail screen for that goal’s identifier. The list screen MUST NOT apply a deposit and MUST NOT parse postMessage envelopes. The list MUST NOT invoke the make-deposit use case.

#### Scenario: Goal press opens detail
- **WHEN** the user presses the row for `goal-vacaciones`
- **THEN** the host presents the immersive detail for that identifier and the list is no longer the only visible screen

#### Scenario: No deposit from the list itself
- **WHEN** the list is shown and the user does not confirm a deposit in the web view
- **THEN** deposited amounts remain the values currently in the application store

### Requirement: List reflects deposits from the shared store
After a successful deposit is recorded in the application store, the list MUST show the new deposited amount and progress percent for that goal without reloading the application. The list MUST keep reading rows from the same store instance used by the detail flow.

#### Scenario: Row updates after depositApplied
- **WHEN** the store snapshot for `goal-vacaciones` changes from deposited 25000 (25 percent) to deposited 35000 (35 percent)
- **THEN** that row shows 35000 and 35 percent without a process restart

### Requirement: List behavior is tested without an emulator
Automated tests SHALL cover: a store update that writes list snapshots; a selector that exposes name, amounts, and progress percent; a rendered list that shows at least one seeded goal’s name and progress percent; and a store update that changes a row’s deposited amount and percent after a deposit snapshot is applied. Those tests MUST run under the mobile workspace test runner without opening an emulator.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the list store, selector, list UI, and deposit-snapshot update tests execute and pass without opening an emulator
