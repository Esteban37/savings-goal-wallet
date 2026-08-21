## ADDED Requirements

### Requirement: Host ships a product README
The `mobile/` package SHALL include a `README.md` written for Savings Goal Wallet (not only the Community CLI getting-started template). That README MUST describe how to start Metro, run Android, run iOS Simulator, and run host tests with coverage. It MUST point to the repository-root README for architecture and to `docs/ia/USO_IA.md` for governed AI.

#### Scenario: Mobile README is product-specific
- **WHEN** a reviewer opens `mobile/README.md`
- **THEN** the document describes this host (list, WebView, library consumption) and is not solely the unmodified CLI template

#### Scenario: Mobile README documents tests and coverage
- **WHEN** a developer follows `mobile/README.md` or the root README test section
- **THEN** they can run the host test suite and collect coverage without opening an emulator

### Requirement: Host contains governed-AI artifacts
The `mobile/` package SHALL contain at least one Cursor skill (or a pointer to a skill that applies to the host) and at least one boundary-review agent (or a pointer to that agent).

#### Scenario: Host skill or pointer exists
- **WHEN** a reviewer inspects `mobile/` for AI skills
- **THEN** a `.cursor/skills/` skill or a documented pointer to the shared product skill is present

### Requirement: Host coverage is runnable from the documented command
The host test runner SHALL support a coverage collection command whose documented threshold for domain plus pure use-case modules is at least 70 percent. Unjustified TypeScript `any` MUST NOT remain in domain, `postMessage` contracts, Redux slices, or business-logic modules.

#### Scenario: Coverage command is documented
- **WHEN** a developer runs the coverage command documented in the root or mobile README
- **THEN** a coverage report is produced for the mobile workspace including the domain/core gate

#### Scenario: Typed core has no unjustified any
- **WHEN** a reviewer searches domain, contract, slice, and use-case TypeScript for `any`
- **THEN** no `any` remains unless a comment next to it states a justified exception
