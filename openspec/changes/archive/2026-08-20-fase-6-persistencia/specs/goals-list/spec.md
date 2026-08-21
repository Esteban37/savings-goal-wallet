## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: List shows persisted amounts after relaunch
After a successful deposit has been saved through the goals repository, a later application launch MUST show that goal’s stored deposited amount and derived progress percent. The list MUST NOT reset persisted goals to the original seed when stored goals are present. Rows MUST still come from the application store after get-goals loads the persisted list.

#### Scenario: Deposit remains visible after process restart
- **WHEN** `goal-vacaciones` has deposited 35000 persisted (35 percent) and the application launches again
- **THEN** that row shows 35000 and 35 percent, not the original seed of 25000 and 25 percent

#### Scenario: Seed is not reapplied over stored goals
- **WHEN** persisted storage already contains the seeded identifiers with at least one deposited amount different from the original seed
- **THEN** launching the application does not reset that deposited amount to the original seed
