# goal-detail Specification

## Purpose

Defines the immersive goal-detail host (HU 2–3): a full-screen local WebView that bootstraps the selected savings goal, applies deposits through the native make-deposit use case, and returns results on the same application store without reloading the list.

## Requirements

### Requirement: Detail is an immersive local web view
When the user opens a savings goal from the list, the host SHALL present a full-screen detail screen whose primary content is a web view loading the bundled local micro-app. The screen MUST include a way to go back to the list. The web view MUST load a local file URI under the Android `web` asset path, not a remote URL. The detail screen MUST NOT add a tab bar or a second native form that duplicates the deposit UI.

#### Scenario: Opening a goal shows the micro-app
- **WHEN** the user selects a seeded goal from the native list
- **THEN** the host presents a full-screen web view of the bundled micro-app and a back control that returns to the list

#### Scenario: Web view is local only
- **WHEN** the detail screen loads
- **THEN** the web view source is a local file URI under the bundled `web` asset path and is not an `https` URL

### Requirement: Host bootstraps the selected goal after web ready
After the micro-app announces readiness, the host SHALL send a native-to-web `SESSION_BOOTSTRAP` message whose `goalId` and `goal` match the goal the user selected. The bootstrap `goal` MUST include `id`, `name`, `targetAmount`, `depositedAmount`, and `progressPercent` taken from the application store (not invented by the web view). The host MUST use the selected list identifier as the session goal even if the readiness message carries a different `goalId`.

#### Scenario: Bootstrap follows WEB_READY
- **WHEN** the micro-app posts `WEB_READY` on a detail screen opened for goal `goal-vacaciones`
- **THEN** the host sends `SESSION_BOOTSTRAP` whose `goalId` is `goal-vacaciones` and whose `goal` matches that store snapshot

#### Scenario: Readiness goalId is not the source of truth
- **WHEN** `WEB_READY` carries a placeholder `goalId` different from the selected goal
- **THEN** the bootstrap still uses the selected goal from the list navigation, not the placeholder

### Requirement: Deposit requests run through make-deposit and update the store
When the host receives a valid `DEPOSIT_REQUESTED` message, it MUST invoke the make-deposit use case via injected application dependencies (not a direct repository call from the screen). On success it MUST record the updated goal snapshot in the application store and MUST send `DEPOSIT_SUCCEEDED` with `goalId`, `depositedAmount`, `progressPercent`, and `isCompleted`. On a domain or use-case failure it MUST send `DEPOSIT_FAILED` with `goalId` and a `reason`, and MUST NOT change other goals’ snapshots. The host MUST ignore malformed messages (parse failures) without applying a deposit.

#### Scenario: Valid deposit updates store and web
- **WHEN** the web view posts `DEPOSIT_REQUESTED` for `goal-vacaciones` with amount 10000 and make-deposit succeeds
- **THEN** the store snapshot for that id shows deposited 35000 and progress 35 percent, and the web view receives `DEPOSIT_SUCCEEDED` with those values

#### Scenario: Invalid amount fails without store change
- **WHEN** the web view posts `DEPOSIT_REQUESTED` with amount 0 or a non-positive amount
- **THEN** the host sends `DEPOSIT_FAILED` with a reason and the stored deposited amount for that goal is unchanged

#### Scenario: Unknown goal does not invent a row
- **WHEN** the web view posts `DEPOSIT_REQUESTED` for an identifier that is not in the store
- **THEN** the host sends `DEPOSIT_FAILED` and does not add a new list row

#### Scenario: Malformed envelope is ignored
- **WHEN** the web view posts a string that is not a catalog message
- **THEN** no deposit is applied and no `DEPOSIT_SUCCEEDED` is sent

### Requirement: Returning to the list does not reload the app
After a successful deposit, navigating back to the list MUST show the updated accumulated amount and progress percent for that goal. The update MUST come from the same in-memory application store instance. The host MUST NOT require killing the process, relaunching the application, or treating get-goals as the deposit update path.

#### Scenario: Back shows new accumulated amount
- **WHEN** the user applies a successful deposit and then goes back to the list
- **THEN** that goal’s row shows the new deposited amount and percent without relaunching the application

### Requirement: Detail behavior is tested without an emulator
Automated tests SHALL cover: parsing a web-to-native deposit envelope then applying make-deposit and producing a success or failure native-to-web envelope; dispatching a successful deposit so the goals store snapshot changes. Those tests MUST run under the mobile workspace test runner without opening an emulator. The `web` workspace MUST remain without automated tests.

#### Scenario: Bridge and store tests pass without a device
- **WHEN** a developer runs the repository-root test command
- **THEN** goal-detail bridge and store-update tests execute and pass without opening an emulator

### Requirement: Create is an immersive local web view
When the user starts registration from the list FAB, the host SHALL present a full-screen create screen whose primary content is a web view loading the same bundled local micro-app used for deposits. The screen MUST include a way to go back to the list. The web view MUST load a local file URI under the Android `web` asset path, not a remote URL. The create screen MUST NOT add a native form that duplicates the web registration fields.

#### Scenario: FAB shows the micro-app in create mode
- **WHEN** the user presses the list FAB
- **THEN** the host presents a full-screen web view of the bundled micro-app and a back control that returns to the list

#### Scenario: Create web view is local only
- **WHEN** the create screen loads
- **THEN** the web view source is a local file URI under the bundled `web` asset path and is not an `https` URL

### Requirement: Host bootstraps create mode after web ready
After the micro-app announces readiness on the create screen, the host SHALL send a native-to-web `SESSION_BOOTSTRAP` message whose `mode` is `create` and that MUST NOT include a `goal` object. The host MUST treat create mode as the source of truth even if the readiness message carries a leftover deposit `goalId`.

#### Scenario: Create bootstrap follows WEB_READY
- **WHEN** the micro-app posts `WEB_READY` on the create screen
- **THEN** the host sends `SESSION_BOOTSTRAP` whose `mode` is `create` and whose payload has no `goal`

#### Scenario: Deposit bootstrap is unchanged
- **WHEN** the micro-app posts `WEB_READY` on a detail screen opened for goal `goal-vacaciones`
- **THEN** the host sends `SESSION_BOOTSTRAP` whose `mode` is `deposit` and whose `goalId` is `goal-vacaciones`

### Requirement: Create requests run through create-goal and update the store
When the host receives a valid `CREATE_REQUESTED` message on the create screen, it MUST invoke the create-goal use case via injected application dependencies (not a direct repository call from the screen). On success it MUST record the new goal snapshot in the application store and MUST send `CREATE_SUCCEEDED` with the created `goal`. On a domain or use-case failure it MUST send `CREATE_FAILED` with a `reason` and MUST NOT add a list row. The host MUST ignore malformed messages without creating a goal. After a successful create, navigating back to the list MUST show the new row from the same in-memory store instance.

#### Scenario: Valid create updates store and web
- **WHEN** the web view posts `CREATE_REQUESTED` with name Viaje and target 500000 and create-goal succeeds
- **THEN** the store contains a new snapshot named Viaje with deposited 0, the web view receives `CREATE_SUCCEEDED` for that goal, and going back shows that row without relaunching the application

#### Scenario: Invalid target fails without store change
- **WHEN** the web view posts `CREATE_REQUESTED` with target 0 or a non-positive amount
- **THEN** the host sends `CREATE_FAILED` with a reason and the store goal count is unchanged

#### Scenario: Malformed envelope is ignored
- **WHEN** the web view on the create screen posts a string that is not a catalog message
- **THEN** no goal is created and no `CREATE_SUCCEEDED` is sent
