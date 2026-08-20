## Purpose

Defines the native savings-goal list (HU 1): seeded goals rendered from the application store with name, target, accumulated amount, and progress percent, without opening the web micro-app or applying deposits.

## ADDED Requirements

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

### Requirement: List does not open the micro-app or apply deposits
Selecting a goal MUST NOT open the web micro-app and MUST NOT apply a deposit. The list screen MUST NOT parse postMessage envelopes and MUST NOT invoke the make-deposit use case.

#### Scenario: Goal press stays on the list
- **WHEN** the user presses a goal row
- **THEN** the list remains visible and no web view is presented

#### Scenario: No deposit from the list
- **WHEN** the list has been shown
- **THEN** deposited amounts remain the seed values unless an in-store snapshot update is applied by a later phase

### Requirement: List behavior is tested without an emulator
Automated tests SHALL cover: a store update that writes list snapshots; a selector that exposes name, amounts, and progress percent; and a rendered list that shows at least one seeded goal’s name and progress percent. Those tests MUST run under the mobile workspace test runner without opening an emulator.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the list store, selector, and list UI tests execute and pass without opening an emulator
