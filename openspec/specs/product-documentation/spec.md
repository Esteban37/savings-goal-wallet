# product-documentation Specification

## Purpose

Defines the delivery-grade documentation surface for Savings Goal Wallet: root README, light-mode preview, architecture and runtime maps, testing/coverage instructions, package READMEs, and honest remaining gaps.

## Requirements

### Requirement: Root README follows the product documentation shape
The repository-root README SHALL include, in this order of sections (additional sections MAY appear after these): product title and badges; a **Vista previa** (preview) with light-mode screenshots; highlights; implemented functionality; technology stack; architecture summary with named patterns; how to run on Android and iOS including Node and React Native 0.81 versions; how to run tests and view coverage; a documentation index; an **Uso de IA** section; Git workflow; author. The README MUST name Clean Architecture feature-first, Container-Presenter, explicit DI via factory plus Redux Toolkit `extraArgument`, TurboModule, and atomic design only where components are reused. The README MUST include a catalog of supported `postMessage` types. The README MUST NOT describe the product as an exam, kata, or homework.

#### Scenario: Preview uses existing light screenshots
- **WHEN** a reviewer opens the root README Vista previa section
- **THEN** it shows the light-mode images `docs/assets/screenshots/metas-de-ahorro.png`, `docs/assets/screenshots/nueva-meta.png`, and `docs/assets/screenshots/abonar.png` with captions for list, create, and deposit

#### Scenario: Architecture and contract are named
- **WHEN** a reviewer reads the architecture and documentation sections of the root README
- **THEN** the named patterns above appear and a `postMessage` catalog lists the web-to-native and native-to-web types the product supports

#### Scenario: Run and test paths are complete
- **WHEN** a developer follows the root README
- **THEN** they can install, run Android, run iOS Simulator, run the test command, and see how to collect coverage for `mobile/` and `libreria/`

### Requirement: Supporting engineering docs exist
The repository SHALL include `docs/architecture.md` (layers, features, DI, patterns), `docs/runtime-design.md` (bridge, store, persistence, native library at runtime), and `docs/testing-strategy.md` (layers tested, no tests in `web/`, coverage gate). `docs/PLAN_EJECUCION.md` MUST remain the freeze of scope and phase order and MUST mark Fase 10 and Fase 11 as delivered by this change. The documentation index in the root README MUST link these files and `docs/ia/USO_IA.md`.

#### Scenario: Docs index is complete
- **WHEN** a reviewer opens the documentation table in the root README
- **THEN** it links at least the plan, architecture, runtime design, testing strategy, AI usage, OpenSpec specs, and archived phase changes

#### Scenario: Plan closes phases 10 and 11
- **WHEN** a reviewer reads the phase table in `docs/PLAN_EJECUCION.md`
- **THEN** Fase 10 (IA gobernada) and Fase 11 (documentación y cierre) are marked as this change rather than pending future vehicles

### Requirement: Honest remaining gaps are listed
The root README SHALL list work that is intentionally out of scope or not a merge gate: editing an existing goal; App Store / TestFlight / physical-device signing; automated tests inside `web/`; instrumented native Toast/overlay tests. Each gap MUST state what exists today and how it would be extended if needed.

#### Scenario: Gaps are explicit
- **WHEN** a reviewer reads the root README remaining-gaps or equivalent section
- **THEN** edit-goal, store distribution, and `web/` tests are named as absent with a one-line extension path
