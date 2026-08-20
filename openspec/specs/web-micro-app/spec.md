# web-micro-app Specification

## Purpose

Defines the static HTML micro-app that talks to the native host only through `postMessage` envelopes used later for session bootstrap and deposits.

## Requirements

### Requirement: Micro-app is static and host-only
The micro-app SHALL ship as static HTML and JavaScript in the `web` workspace. It MUST communicate with the native host solely via `postMessage`. It MUST NOT call network endpoints, MUST NOT load remote scripts as the primary application, and MUST NOT invoke native modules.

#### Scenario: No network or native-module usage
- **WHEN** a reviewer inspects the micro-app sources
- **THEN** there is no `fetch`, XHR, or native-module usage, and the page is written to run inside a local file web view

### Requirement: Page announces readiness
On load, the micro-app SHALL post a JSON string envelope `{ "type": "WEB_READY", "payload": { "goalId": "<string>" } }` to the native host. The `goalId` MAY be a placeholder in this change.

#### Scenario: WEB_READY on load
- **WHEN** the micro-app finishes loading in the host web view
- **THEN** the host receives a `WEB_READY` message whose payload includes a `goalId` string

### Requirement: Test control requests a deposit
The micro-app SHALL show a visible control that, when activated, posts a JSON string envelope `{ "type": "DEPOSIT_REQUESTED", "payload": { "goalId": "<string>", "amount": <number> } }` to the native host. The amount MAY be a hardcoded test value in this change.

#### Scenario: Test button posts DEPOSIT_REQUESTED
- **WHEN** the user activates the test control
- **THEN** the host receives a `DEPOSIT_REQUESTED` message with a `goalId` string and a numeric `amount`

### Requirement: Web workspace has no tests
The `web` workspace MUST NOT include a test runner, test files, or a coverage target. Quality of the micro-app is demonstrated by loading it in the host.

#### Scenario: No web tests
- **WHEN** a developer lists files under `web/`
- **THEN** there are no `*.test.*`, `*.spec.*`, or test-runner config files for that workspace
