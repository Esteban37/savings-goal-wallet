## ADDED Requirements

### Requirement: Page shows a create form in create mode
After receiving a native-to-web `SESSION_BOOTSTRAP` envelope whose `mode` is `create`, the micro-app SHALL display a registration form with a name control and a target-amount control (whole pesos) and MUST NOT show the deposit form. The page MUST NOT invent a goal identifier. Until create bootstrap arrives, the page MAY show a waiting state.

#### Scenario: Create bootstrap paints the form
- **WHEN** the page receives `SESSION_BOOTSTRAP` with `mode` `create`
- **THEN** the user sees name and target-amount controls and does not see the amount-to-deposit control

#### Scenario: Deposit bootstrap still paints the deposit form
- **WHEN** the page receives `SESSION_BOOTSTRAP` with `mode` `deposit` for a goal with target 100000 and deposited 25000
- **THEN** the user sees those amounts (or the equivalent percent) and the deposit form, not the create form

### Requirement: User submits a new goal from the create form
When the create form is showing and the user confirms, the page MUST post a JSON string envelope `{ "type": "CREATE_REQUESTED", "payload": { "name": "<string>", "targetAmount": <number> } }` whose `name` is the entered name and whose `targetAmount` is the number the user entered. The page MUST NOT call `fetch` or native modules to persist the goal. The page MUST NOT post `DEPOSIT_REQUESTED` from the create form.

#### Scenario: Confirm posts CREATE_REQUESTED
- **WHEN** the page has received create bootstrap and the user confirms name Viaje and target 500000
- **THEN** the host receives `CREATE_REQUESTED` with `name` Viaje and `targetAmount` 500000

### Requirement: Page reports create results
When the page receives `CREATE_SUCCEEDED`, it MUST show a visible success indication that uses the returned goal name. When the page receives `CREATE_FAILED`, it MUST show a visible failure indication and MUST keep the form editable.

#### Scenario: Success acknowledges the new goal
- **WHEN** the create form receives `CREATE_SUCCEEDED` for a goal named Viaje
- **THEN** the page shows a visible success state that includes Viaje

#### Scenario: Failure keeps the form
- **WHEN** the create form receives `CREATE_FAILED`
- **THEN** the page still shows the name and target controls and a visible error state
