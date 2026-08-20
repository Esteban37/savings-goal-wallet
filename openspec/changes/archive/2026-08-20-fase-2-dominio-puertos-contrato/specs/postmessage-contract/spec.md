## Purpose

Defines the closed `{ type, payload }` postMessage catalog between the web micro-app and the native host, and a parser from unknown input to a typed envelope or a parse error.

## ADDED Requirements

### Requirement: Envelope shape is type plus payload
Every catalog message SHALL be an object with a string `type` discriminant and a `payload` object. The catalog MUST be closed: types other than those listed in this specification MUST be rejected. The wire form MAY be a JSON string; the parser MUST accept `unknown`.

#### Scenario: Valid object envelope is accepted
- **WHEN** the parser receives `{ "type": "WEB_READY", "payload": { "goalId": "g1" } }`
- **THEN** the result is a successful Web-to-native message of type `WEB_READY`

#### Scenario: Unknown type is rejected
- **WHEN** the parser receives `{ "type": "PING", "payload": {} }`
- **THEN** the result is a parse error and no message value is produced

### Requirement: Web-to-native catalog
The Web-to-native catalog SHALL include exactly:

- `WEB_READY` with payload `{ goalId: string }` (non-empty string)
- `DEPOSIT_REQUESTED` with payload `{ goalId: string, amount: number }` where `goalId` is a non-empty string and `amount` is a finite number

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

### Requirement: Native-to-web catalog
The Native-to-web catalog SHALL include exactly:

- `SESSION_BOOTSTRAP` with payload `{ sessionId: string, goalId: string, userInfo: object, goal: object }` where `goal` includes `id`, `name`, `targetAmount`, `depositedAmount`, and `progressPercent`
- `DEPOSIT_SUCCEEDED` with payload `{ goalId: string, depositedAmount: number, progressPercent: number, isCompleted: boolean }`
- `DEPOSIT_FAILED` with payload `{ goalId: string, reason: string }`

No other Native-to-web types are allowed.

#### Scenario: SESSION_BOOTSTRAP
- **WHEN** the parser receives a `SESSION_BOOTSTRAP` envelope whose `goal` includes id, name, targetAmount, depositedAmount, and progressPercent
- **THEN** the result is a successful Native-to-web message of that type with those fields available

#### Scenario: DEPOSIT_SUCCEEDED
- **WHEN** the parser receives `{ "type": "DEPOSIT_SUCCEEDED", "payload": { "goalId": "g1", "depositedAmount": 30000, "progressPercent": 30, "isCompleted": false } }`
- **THEN** the result is `DEPOSIT_SUCCEEDED` with those values

#### Scenario: DEPOSIT_FAILED
- **WHEN** the parser receives `{ "type": "DEPOSIT_FAILED", "payload": { "goalId": "g1", "reason": "invalid-amount" } }`
- **THEN** the result is `DEPOSIT_FAILED` with that `goalId` and `reason`

### Requirement: Parser rejects malformed input
The parser SHALL return a typed parse error (not an untyped catch-all, and not `any`) when input is not valid JSON, is not an object envelope, has a missing or empty `type`, has a payload that fails the matching schema, or uses a type outside the catalog. Successful results MUST be a discriminated union on `type`.

#### Scenario: Invalid JSON string
- **WHEN** the parser receives the string `{not json`
- **THEN** the result is a parse error

#### Scenario: Null and non-object
- **WHEN** the parser receives `null` or a number
- **THEN** the result is a parse error

#### Scenario: Extra unknown keys on payload may fail
- **WHEN** the parser receives a known type whose payload includes required fields plus unexpected keys
- **THEN** the parser either strips unknown keys according to the schema or returns a parse error; it MUST NOT pass the payload through unvalidated

### Requirement: Parser is tested without the WebView
Automated tests SHALL cover valid catalog members, unknown types, invalid JSON, and missing required payload fields. Those tests MUST NOT mount a WebView or the launch screen.

#### Scenario: Catalog tests run in unit runner
- **WHEN** a developer runs the mobile workspace tests
- **THEN** parser tests execute without a device or emulator
