## ADDED Requirements

### Requirement: Page renders the bootstrapped goal
After receiving a native-to-web `SESSION_BOOTSTRAP` envelope, the micro-app SHALL display the goal’s name, target amount, deposited amount, and progress percent from that payload. The page MUST NOT invent those values when bootstrap data is present. Until bootstrap arrives, the page MAY show a waiting state and MUST NOT treat the dummy scaffold copy as the selected goal’s data.

#### Scenario: Bootstrap paints the selected goal
- **WHEN** the page receives `SESSION_BOOTSTRAP` for a goal named Vacaciones with target 100000 and deposited 25000
- **THEN** the user sees that name and those amounts (or the equivalent percent) in the page

### Requirement: User submits a deposit amount for the bootstrapped goal
The micro-app SHALL show a visible amount control and a confirm control. When the user confirms, the page MUST post a JSON string envelope `{ "type": "DEPOSIT_REQUESTED", "payload": { "goalId": "<string>", "amount": <number> } }` whose `goalId` is the bootstrapped goal identifier (not a leftover scaffold placeholder once bootstrap has arrived) and whose `amount` is the number the user entered. The page MUST NOT call `fetch` or native modules to apply the deposit.

#### Scenario: Confirm posts DEPOSIT_REQUESTED
- **WHEN** the page has received bootstrap for `goal-vacaciones` and the user confirms an amount of 10000
- **THEN** the host receives `DEPOSIT_REQUESTED` with `goalId` `goal-vacaciones` and `amount` 10000

### Requirement: Page updates after deposit results
When the page receives `DEPOSIT_SUCCEEDED`, it MUST update the displayed deposited amount and progress percent from that payload. When the page receives `DEPOSIT_FAILED`, it MUST show a visible failure indication and MUST keep the last successful displayed amounts.

#### Scenario: Success updates local totals
- **WHEN** the page showing deposited 25000 receives `DEPOSIT_SUCCEEDED` with depositedAmount 35000 and progressPercent 35
- **THEN** the page shows 35000 and 35 percent

#### Scenario: Failure keeps prior totals
- **WHEN** the page showing deposited 25000 receives `DEPOSIT_FAILED`
- **THEN** the page still shows 25000 and a visible error state

### Requirement: Page listens for native-to-web envelopes
The micro-app SHALL accept native-to-web catalog messages delivered by the host after load (bootstrap, deposit succeeded, deposit failed). It MUST ignore malformed payloads without calling network endpoints.

#### Scenario: Native message is applied locally
- **WHEN** the host delivers a valid `SESSION_BOOTSTRAP` JSON envelope to the page
- **THEN** the page uses that payload and does not request the data over HTTP

## MODIFIED Requirements

### Requirement: Page announces readiness
On load, the micro-app SHALL post a JSON string envelope `{ "type": "WEB_READY", "payload": { "goalId": "<string>" } }` to the native host. The `goalId` MUST be a non-empty string. The page MUST still function when that value is a handshake placeholder, because the host’s bootstrap is the source of the selected goal.

#### Scenario: WEB_READY on load
- **WHEN** the micro-app finishes loading in the host web view
- **THEN** the host receives a `WEB_READY` message whose payload includes a `goalId` string

## REMOVED Requirements

### Requirement: Test control requests a deposit
**Reason**: The scaffold test button with a hardcoded amount is replaced by a deposit form bound to the bootstrapped goal (HU 2–3).
**Migration**: Use the added requirement “User submits a deposit amount for the bootstrapped goal”.
