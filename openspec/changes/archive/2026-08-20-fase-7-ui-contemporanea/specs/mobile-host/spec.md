## ADDED Requirements

### Requirement: Stack header is the native title surface
The host SHALL show the list title “Metas de ahorro” only in the native stack header. The goal-detail header SHALL show the selected goal’s name. The host MUST NOT render a second native heading with the same text below that header on either screen.

#### Scenario: List title is only in the header
- **WHEN** the list is the visible screen
- **THEN** the native header title is “Metas de ahorro” and the list body does not repeat that heading

#### Scenario: Detail title is the goal name
- **WHEN** the user opens a goal named Vacaciones
- **THEN** the native header title is Vacaciones and the detail chrome does not render a second native heading with that name

### Requirement: Host chrome follows the resolved appearance
The native stack header, status bar, and screen backgrounds MUST follow the resolved light or dark scheme. The appearance control remains in the top-right of the header on both screens of the list/detail stack.

#### Scenario: Dark scheme themes the header
- **WHEN** the resolved scheme is dark
- **THEN** the stack header and status bar use dark chrome with light title and icons

#### Scenario: Light scheme themes the header
- **WHEN** the resolved scheme is light
- **THEN** the stack header and status bar use light chrome with dark title and icons
