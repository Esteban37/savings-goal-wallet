## Purpose

Defines durable on-device storage for savings goals behind the existing goals-repository port, so deposits survive process restart without changing use cases.

## ADDED Requirements

### Requirement: Goals survive process restart
The production goals repository SHALL store goals on the device so that a later process can list the same identifiers, names, target amounts, and deposited amounts. Listing, getting by identifier, and saving MUST remain the same port operations already used by get-goals and make-deposit. Use cases MUST NOT import a concrete storage library.

#### Scenario: Saved deposit is listed after a new process
- **WHEN** a known goal with deposited 25000 is saved with deposited 35000 and a later process lists goals from empty memory
- **THEN** that identifier is returned with deposited 35000 and the derived progress percent is 35

#### Scenario: Get by id reads the stored copy
- **WHEN** a goal was saved with deposited 35000 and a later process asks the repository for that identifier
- **THEN** the repository returns that goal with deposited 35000 (not the original seed amount)

### Requirement: Empty storage is seeded once
When the production repository finds no stored goals, it MUST write the same two-to-three seed goals used by the native list (including a 25 percent case and a 0 percent case) and then return those goals. When stored goals are already present, listing MUST return those stored goals and MUST NOT overwrite them with the original seed.

#### Scenario: First launch writes the seed
- **WHEN** stored goals are absent and a caller lists goals
- **THEN** the repository returns two or three seed goals and a later list in a new process returns the same identifiers and amounts

#### Scenario: Existing storage is not reseeded
- **WHEN** stored goals already include `goal-vacaciones` with deposited 35000
- **THEN** listing does not reset that deposited amount to 25000

### Requirement: Stored records omit derived progress
A persisted goal record SHALL include identifier, name, integer target amount, and integer deposited amount. Progress percent and completed flag MUST NOT be stored as independent writable fields. Reconstructing a goal MUST derive progress from deposited and target.

#### Scenario: Round-trip reconstructs derived progress
- **WHEN** a stored record has target 100000 and deposited 25000
- **THEN** the reconstructed goal reports progress of 25 percent and is not completed, even if the stored JSON omitted percent

#### Scenario: Stored percent cannot override domain
- **WHEN** a stored record has target 100000, deposited 25000, and a stray percent field of 99
- **THEN** the reconstructed goal still reports progress of 25 percent

### Requirement: Invalid stored payload is replaced with seed
If stored data is missing, not valid JSON, or fails the persisted-record schema, the production repository MUST NOT crash the application. It MUST treat storage as empty, write the seed goals, and return those seed goals.

#### Scenario: Corrupt JSON reseeds
- **WHEN** stored data is not valid JSON and a caller lists goals
- **THEN** the repository returns the seed goals and the application remains running

#### Scenario: Schema-invalid record reseeds
- **WHEN** stored data is JSON that lacks a required identifier or uses a non-integer amount and a caller lists goals
- **THEN** the repository returns the seed goals instead of throwing to the UI

### Requirement: Persistence mapping is tested without an emulator
Automated tests SHALL cover: mapping a domain goal to a persisted record and back; listing after save through a fake key-value store; seeding when storage is empty; not overwriting stored goals with the seed; and replacing corrupt or schema-invalid storage with the seed. Those tests MUST run under the mobile workspace test runner without opening an emulator and without a real device storage module.

#### Scenario: Tests pass without launching the app
- **WHEN** a developer runs the repository-root test command
- **THEN** the persisted-record mapper and production-repository tests execute and pass without opening an emulator
