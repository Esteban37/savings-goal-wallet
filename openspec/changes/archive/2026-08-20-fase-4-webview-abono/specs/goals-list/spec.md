## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: List behavior is tested without an emulator
Automated tests SHALL cover: a store update that writes list snapshots; a selector that exposes name, amounts, and progress percent; a rendered list that shows at least one seeded goal’s name and progress percent; and a store update that changes a row’s deposited amount and percent after a deposit snapshot is applied. Those tests MUST run under the mobile workspace test runner without opening an emulator.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the list store, selector, list UI, and deposit-snapshot update tests execute and pass without opening an emulator

## REMOVED Requirements

### Requirement: List does not open the micro-app or apply deposits
**Reason**: Fase 4 requires row press to open the immersive WebView detail (HU 2). Deposit application stays out of the list screen and moves to the goal-detail bridge (HU 3).
**Migration**: Use the added requirements “Selecting a goal opens the immersive detail” and “List reflects deposits from the shared store”.
