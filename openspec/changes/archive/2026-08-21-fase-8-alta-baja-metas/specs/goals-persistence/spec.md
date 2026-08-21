## ADDED Requirements

### Requirement: Remove persists across process restart
The production goals repository SHALL persist a remove so that a later process no longer lists that identifier. Remove MUST remain a port operation. Use cases MUST NOT import a concrete storage library.

#### Scenario: Deleted goal is absent after a new process
- **WHEN** a known goal is removed and a later process lists goals from empty memory
- **THEN** that identifier is not returned and the remaining stored goals still are

### Requirement: Stored empty list is not reseeded
When stored data is a valid envelope whose goal list is empty, listing MUST return an empty list and MUST NOT write the seed goals. Seeding MUST occur only when the stored envelope is missing, not valid JSON, or fails the persisted-record schema.

#### Scenario: Empty array survives relaunch
- **WHEN** stored goals are a valid empty list and a later process lists goals
- **THEN** the repository returns zero goals and does not restore the original seed identifiers

## MODIFIED Requirements

### Requirement: Empty storage is seeded once
When the production repository finds no stored envelope (missing key), it MUST write the same two-to-three seed goals used by the native list (including a 25 percent case and a 0 percent case) and then return those goals. When stored goals are already present, including a valid empty list, listing MUST return those stored goals and MUST NOT overwrite them with the original seed.

#### Scenario: First launch writes the seed
- **WHEN** stored goals are absent and a caller lists goals
- **THEN** the repository returns two or three seed goals and a later list in a new process returns the same identifiers and amounts

#### Scenario: Existing storage is not reseeded
- **WHEN** stored goals already include `goal-vacaciones` with deposited 35000
- **THEN** listing does not reset that deposited amount to 25000

#### Scenario: Valid empty list is not treated as absent
- **WHEN** stored data is a valid envelope with zero goal records
- **THEN** listing returns an empty list and does not write the seed

### Requirement: Persistence mapping is tested without an emulator
Automated tests SHALL cover: mapping a domain goal to a persisted record and back; listing after save through a fake key-value store; seeding when storage is empty; not overwriting stored goals with the seed; replacing corrupt or schema-invalid storage with the seed; persisting remove; and not reseeding a valid empty list. Those tests MUST run under the mobile workspace test runner without opening an emulator and without a real device storage module.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the persisted-record mapper and production-repository tests execute and pass without opening an emulator
