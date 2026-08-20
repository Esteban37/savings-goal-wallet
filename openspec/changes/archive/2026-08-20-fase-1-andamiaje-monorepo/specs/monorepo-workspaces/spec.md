## Purpose

Defines the three-package workspace layout and install/link rules so `mobile`, `libreria`, and `web` live in one repository and resolve without copying native sources.

## ADDED Requirements

### Requirement: Three workspace packages at the repository root
The repository SHALL expose exactly three workspace packages named `mobile`, `libreria`, and `web` as first-class directories at the repository root. A single install from the repository root MUST install and link all three. The `web` package SHALL contain only static HTML and JavaScript (no package test suite).

#### Scenario: Root install links all workspaces
- **WHEN** a developer runs the repository-root install command
- **THEN** the `mobile`, `libreria`, and `web` packages are present as workspaces and `mobile` can resolve the library package by its published name without a copied native tree inside `mobile/`

#### Scenario: Web workspace stays static
- **WHEN** a developer inspects the `web` workspace
- **THEN** it contains the micro-app HTML and script and MUST NOT contain an automated test suite

### Requirement: Local web assets reach the mobile host
The system SHALL bundle the `web` workspace files into the Android application as local assets so the host can load them without a network server. The copy or asset mapping MUST originate from the `web/` workspace, not from a duplicate copy maintained by hand inside `mobile/src`.

#### Scenario: Android build includes web files
- **WHEN** the Android application is built
- **THEN** the files from `web/` are available to the host as bundled local assets under a `web` asset path

### Requirement: Native library is autolinked, not vendored
The mobile workspace SHALL consume the library workspace through the package manager and native autolinking. The mobile native projects MUST NOT contain a duplicated copy of the library’s Android or iOS sources.

#### Scenario: Library sources stay in libreria
- **WHEN** a developer searches the `mobile` native projects for the library’s native implementation files
- **THEN** those files are absent from `mobile/` and present only under `libreria/`
