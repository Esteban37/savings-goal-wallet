# goals-list Specification

## Purpose

Defines the native savings-goal list (HU 1): seeded goals rendered from the application store with name, target, accumulated amount, and progress percent, without opening the web micro-app or applying deposits.

## Requirements

### Requirement: Native list shows seeded goals
The host SHALL present a native list of savings goals. Each visible goal MUST show its name, target amount in whole pesos, deposited amount in whole pesos, and progress percent. On first launch, when no persisted goals exist, the list MUST contain at least two and at most three seeded goals. Progress percent MUST be the domain-derived value in the range 0 through 100 (100 when deposited is greater than or equal to target). Amounts MUST NOT be shown with fractional pesos.

#### Scenario: Seeded goals are visible after launch
- **WHEN** the application finishes launching and no persisted goals exist
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

### Requirement: List shows persisted amounts after relaunch
After a successful deposit has been saved through the goals repository, a later application launch MUST show that goal’s stored deposited amount and derived progress percent. The list MUST NOT reset persisted goals to the original seed when stored goals are present. Rows MUST still come from the application store after get-goals loads the persisted list.

#### Scenario: Deposit remains visible after process restart
- **WHEN** `goal-vacaciones` has deposited 35000 persisted (35 percent) and the application launches again
- **THEN** that row shows 35000 and 35 percent, not the original seed of 25000 and 25 percent

#### Scenario: Seed is not reapplied over stored goals
- **WHEN** persisted storage already contains the seeded identifiers with at least one deposited amount different from the original seed
- **THEN** launching the application does not reset that deposited amount to the original seed

### Requirement: List behavior is tested without an emulator
Automated tests SHALL cover: a store update that writes list snapshots; a selector that exposes name, amounts, and progress percent; a rendered list that shows at least one seeded goal’s name and progress percent; and a store update that changes a row’s deposited amount and percent after a deposit snapshot is applied. Those tests MUST run under the mobile workspace test runner without opening an emulator.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the list store, selector, list UI, and deposit-snapshot update tests execute and pass without opening an emulator

### Requirement: List body does not repeat the screen title
The list body MUST NOT render a heading whose text duplicates the native stack header title for the list. Goal names on individual rows are not screen titles and MUST still be visible.

#### Scenario: Title appears only in the header
- **WHEN** the list screen is visible
- **THEN** “Metas de ahorro” appears in the native header and does not appear again as a heading inside the list body

#### Scenario: Goal names remain on rows
- **WHEN** the list is showing a seeded goal named Vacaciones
- **THEN** that row still shows Vacaciones

### Requirement: List rows follow the resolved appearance
The list background, row surfaces, amounts, and progress track MUST use the resolved light or dark appearance palette. Changing the resolved scheme MUST restyle the list without reloading the application.

#### Scenario: Dark scheme restyles rows
- **WHEN** the resolved scheme is dark and the list is showing seeded goals
- **THEN** row surfaces and body text use the dark palette (dark surfaces and light text), not the light-only scaffold palette

#### Scenario: Light scheme keeps a light list
- **WHEN** the resolved scheme is light and the list is showing seeded goals
- **THEN** row surfaces and body text use the light palette (light surfaces and dark text)

### Requirement: FAB opens create without applying a deposit
The list screen SHALL show a floating action control that starts registration of a new savings goal. Pressing that control MUST navigate to the create-mode immersive web view. The control MUST remain available when the list is empty. The list MUST NOT apply a deposit when the FAB is pressed.

#### Scenario: FAB opens create
- **WHEN** the user presses the floating action control on the list
- **THEN** the host presents the create-mode web view and the list is no longer the only visible screen

#### Scenario: FAB remains when the list is empty
- **WHEN** the store holds zero goals
- **THEN** the floating action control is still visible

### Requirement: Long-press on a card starts confirmed deletion
A long press on a visible goal card MUST start deletion of that goal and MUST NOT open the detail screen. The host MUST show a confirmation dialog before removing the goal. If the user cancels, the list MUST remain unchanged. If the user confirms, that goal MUST disappear from the list without reloading the application.

#### Scenario: Long-press does not open detail
- **WHEN** the user long-presses the row for `goal-vacaciones`
- **THEN** the host shows a confirmation dialog and does not present the immersive detail for that identifier

#### Scenario: Cancel keeps the row
- **WHEN** the user long-presses a visible goal and then cancels the confirmation dialog
- **THEN** that goal’s row remains on the list with the same name, amounts, and percent

#### Scenario: Confirm removes the row
- **WHEN** the user long-presses `goal-vacaciones` and confirms deletion
- **THEN** that row is no longer visible and the other rows remain

### Requirement: List reflects created and deleted goals from the shared store
After a successful create is recorded in the application store, the list MUST show the new row (name, target, deposited 0, progress 0 percent) without reloading the application. After a successful delete is recorded in the store, the list MUST omit that identifier. Rows MUST still come from the same store instance used by the detail and create flows. An empty store MUST render an empty list, not a seed overlay.

#### Scenario: New row appears after create
- **WHEN** the store gains a goal named Viaje with target 500000 and deposited 0
- **THEN** that row is visible with 0 percent without a process restart

#### Scenario: Empty list is allowed
- **WHEN** the store holds zero goals
- **THEN** the user sees no goal cards and does not see the original seed rows
