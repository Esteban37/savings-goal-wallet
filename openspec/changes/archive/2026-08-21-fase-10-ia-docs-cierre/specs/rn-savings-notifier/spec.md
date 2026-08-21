## ADDED Requirements

### Requirement: Library ships a package README
The `libreria/` package SHALL include a `README.md` that documents installation as a workspace dependency, autolinking, the typed public JavaScript API (`notifyGoalCompleted`, `notifyGoalCreated`, `showConfirmDialog`), a short usage example, and how to run the library’s unit tests. The README MUST state that native sources stay in `libreria/` and MUST NOT be copied into `mobile/`.

#### Scenario: Library README covers install and API
- **WHEN** a reviewer opens `libreria/README.md`
- **THEN** the file describes workspace install, autolinking, the three public functions, an example call, and the test command

#### Scenario: Library README forbids vendoring
- **WHEN** a reviewer reads the consumption section of `libreria/README.md`
- **THEN** it states that the host consumes the package by name and does not copy Android or iOS sources into `mobile/`

### Requirement: Library contains governed-AI artifacts
The `libreria/` package SHALL contain at least one Cursor skill (or a pointer to a skill that applies to the library) and at least one boundary-review agent (or a pointer to that agent). The package README MUST link `docs/ia/USO_IA.md`.

#### Scenario: Library skill or pointer exists
- **WHEN** a reviewer inspects `libreria/` for AI skills
- **THEN** a `.cursor/skills/` skill or a documented pointer to the shared product skill is present

#### Scenario: Library points to AI usage
- **WHEN** a reviewer opens `libreria/README.md`
- **THEN** it links to `docs/ia/USO_IA.md`
