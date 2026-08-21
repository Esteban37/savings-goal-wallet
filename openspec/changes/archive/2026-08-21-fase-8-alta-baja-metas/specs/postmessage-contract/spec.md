## MODIFIED Requirements

### Requirement: Web-to-native catalog
The Web-to-native catalog SHALL include exactly:

- `WEB_READY` with payload `{ goalId: string }` (non-empty string)
- `DEPOSIT_REQUESTED` with payload `{ goalId: string, amount: number }` where `goalId` is a non-empty string and `amount` is a finite number
- `CREATE_REQUESTED` with payload `{ name: string, targetAmount: number }` where `name` is a non-empty string and `targetAmount` is a finite number

No other Web-to-native types are allowed.

#### Scenario: WEB_READY
- **WHEN** the parser receives a JSON string `{"type":"WEB_READY","payload":{"goalId":"goal-scaffold"}}`
- **THEN** the result is `WEB_READY` with that `goalId`

#### Scenario: DEPOSIT_REQUESTED
- **WHEN** the parser receives `{ "type": "DEPOSIT_REQUESTED", "payload": { "goalId": "g1", "amount": 10000 } }`
- **THEN** the result is `DEPOSIT_REQUESTED` with that `goalId` and `amount`

#### Scenario: DEPOSIT_REQUESTED missing amount
- **WHEN** the parser receives `{ "type": "DEPOSIT_REQUESTED", "payload": { "goalId": "g1" } }`
- **THEN** the result is a parse error

#### Scenario: CREATE_REQUESTED
- **WHEN** the parser receives `{ "type": "CREATE_REQUESTED", "payload": { "name": "Viaje", "targetAmount": 500000 } }`
- **THEN** the result is `CREATE_REQUESTED` with that `name` and `targetAmount`

#### Scenario: CREATE_REQUESTED missing name
- **WHEN** the parser receives `{ "type": "CREATE_REQUESTED", "payload": { "targetAmount": 500000 } }`
- **THEN** the result is a parse error

### Requirement: Native-to-web catalog
The Native-to-web catalog SHALL include exactly:

- `SESSION_BOOTSTRAP` with payload `{ sessionId: string, goalId: string, userInfo: object, mode: "deposit" | "create", goal?: object }` where `mode` is required. When `mode` is `deposit`, `goal` MUST be present and MUST include `id`, `name`, `targetAmount`, `depositedAmount`, and `progressPercent`. When `mode` is `create`, `goal` MUST be omitted
- `DEPOSIT_SUCCEEDED` with payload `{ goalId: string, depositedAmount: number, progressPercent: number, isCompleted: boolean }`
- `DEPOSIT_FAILED` with payload `{ goalId: string, reason: string }`
- `CREATE_SUCCEEDED` with payload `{ goal: object }` where `goal` includes `id`, `name`, `targetAmount`, `depositedAmount`, and `progressPercent`
- `CREATE_FAILED` with payload `{ reason: string }`

No other Native-to-web types are allowed.

#### Scenario: SESSION_BOOTSTRAP
- **WHEN** the parser receives a `SESSION_BOOTSTRAP` envelope whose `mode` is `deposit` and whose `goal` includes id, name, targetAmount, depositedAmount, and progressPercent
- **THEN** the result is a successful Native-to-web message of that type with those fields available

#### Scenario: SESSION_BOOTSTRAP create mode
- **WHEN** the parser receives `{ "type": "SESSION_BOOTSTRAP", "payload": { "sessionId": "s1", "goalId": "pending", "userInfo": {}, "mode": "create" } }`
- **THEN** the result is `SESSION_BOOTSTRAP` with `mode` `create` and no `goal`

#### Scenario: SESSION_BOOTSTRAP missing mode
- **WHEN** the parser receives a `SESSION_BOOTSTRAP` envelope that omits `mode`
- **THEN** the result is a parse error

#### Scenario: DEPOSIT_SUCCEEDED
- **WHEN** the parser receives `{ "type": "DEPOSIT_SUCCEEDED", "payload": { "goalId": "g1", "depositedAmount": 30000, "progressPercent": 30, "isCompleted": false } }`
- **THEN** the result is `DEPOSIT_SUCCEEDED` with those values

#### Scenario: DEPOSIT_FAILED
- **WHEN** the parser receives `{ "type": "DEPOSIT_FAILED", "payload": { "goalId": "g1", "reason": "invalid-amount" } }`
- **THEN** the result is `DEPOSIT_FAILED` with that `goalId` and `reason`

#### Scenario: CREATE_SUCCEEDED
- **WHEN** the parser receives `{ "type": "CREATE_SUCCEEDED", "payload": { "goal": { "id": "g-new", "name": "Viaje", "targetAmount": 500000, "depositedAmount": 0, "progressPercent": 0 } } }`
- **THEN** the result is `CREATE_SUCCEEDED` with that goal

#### Scenario: CREATE_FAILED
- **WHEN** the parser receives `{ "type": "CREATE_FAILED", "payload": { "reason": "invalid-target" } }`
- **THEN** the result is `CREATE_FAILED` with that `reason`
