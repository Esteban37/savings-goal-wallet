# ai-governance Specification

## Purpose

Defines how AI assistance is constrained, recorded, and reviewable for the evaluated packages of Savings Goal Wallet (`libreria/` and `mobile/`), so implementation stays inside the author’s architecture contract.

## Requirements

### Requirement: Repeatable skills exist in evaluated packages
The repository SHALL include at least one Cursor skill that encodes a repeatable engineering flow of this product (typed `postMessage` handler with contract validation and test, or a Redux Toolkit slice with selector and test following project conventions). That skill MUST be present under the `libreria/` tree and under the `mobile/` tree (a package-local `.cursor/skills/` copy, or a package-local pointer that names the shared skill that applies to that package). The `web/` workspace MUST NOT be required to ship a skill.

#### Scenario: Mobile package has a skill
- **WHEN** a reviewer inspects `mobile/` for governed-AI artifacts
- **THEN** a skill file exists under that package or a documented pointer in that package names a skill that applies to the host

#### Scenario: Library package has a skill
- **WHEN** a reviewer inspects `libreria/` for governed-AI artifacts
- **THEN** a skill file exists under that package or a documented pointer in that package names a skill that applies to the library

#### Scenario: Skill encodes a product flow
- **WHEN** a reviewer reads the skill body
- **THEN** it describes a concrete, repeatable task of this codebase (bridge/contract or store/test), not a generic “write code” prompt

### Requirement: Boundary-review agent exists
The repository SHALL include at least one Cursor agent or subagent whose purpose is to review architecture boundaries: domain without React Native or Redux imports, cross-feature imports only through public barrels, no unjustified `any`, and core coverage remaining at or above the declared gate. The agent MUST be reachable from both evaluated packages (package-local file or documented pointer).

#### Scenario: Reviewer agent is discoverable
- **WHEN** a reviewer looks for an AI agent in `mobile/` and `libreria/`
- **THEN** each package has the agent definition or a pointer to the shared boundary-review agent

#### Scenario: Agent purpose is boundaries not product rewrite
- **WHEN** a reviewer reads the agent instructions
- **THEN** the stated job is review of layer and typing rules, not implementing new user stories

### Requirement: AI usage is documented with human ownership
The repository SHALL include `docs/ia/USO_IA.md` that states: which architecture and patterns the author defined; which work AI accelerated; which tool and model were used (Cursor with Cursor Grok 4.6); that effort varied by phase; that each phase used an independent agent; which prompts or skills were used; and at least one concrete rejection or correction of AI output. Evaluated packages MUST point to that document. The document MUST NOT present the product as an exam, kata, or proof-of-concept homework.

#### Scenario: Canonical AI-usage document exists
- **WHEN** a reviewer opens `docs/ia/USO_IA.md`
- **THEN** the file names author-owned decisions, AI-assisted work, Cursor Grok 4.6, per-phase independent agents, and at least one rejected or rewritten proposal

#### Scenario: Packages point at the AI-usage document
- **WHEN** a reviewer opens `mobile/README.md` and `libreria/README.md`
- **THEN** each README links to `docs/ia/USO_IA.md` or to an equivalent in-package IA note that links there

#### Scenario: Product framing stays professional
- **WHEN** a reviewer reads `docs/ia/USO_IA.md` and the root README AI section
- **THEN** the text describes Savings Goal Wallet engineering practice and MUST NOT label the work as a test, exam, or kata
