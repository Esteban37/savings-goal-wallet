## ADDED Requirements

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
