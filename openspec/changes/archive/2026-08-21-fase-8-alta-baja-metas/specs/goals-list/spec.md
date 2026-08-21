## ADDED Requirements

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
