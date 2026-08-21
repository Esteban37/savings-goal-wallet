## ADDED Requirements

### Requirement: List body does not repeat the screen title
The list body MUST NOT render a heading whose text duplicates the native stack header title for the list. Goal names on individual rows are not screen titles and MUST still be visible.

#### Scenario: Title appears only in the header
- **WHEN** the list screen is visible
- **THEN** “Metas de ahorro” appears in the native header and does not appear again as a heading inside the list body

#### Scenario: Goal names remain on rows
- **WHEN** the list is showing a seeded goal named Vacaciones
- **THEN** that row still shows Vacaciones

### Requirement: List rows follow the resolved appearance
The list background, row surfaces, amounts, and progress track MUST use the resolved light or dark appearance palette. Changing the resolved scheme MUST restyle the list without reloading the application.

#### Scenario: Dark scheme restyles rows
- **WHEN** the resolved scheme is dark and the list is showing seeded goals
- **THEN** row surfaces and body text use the dark palette (dark surfaces and light text), not the light-only scaffold palette

#### Scenario: Light scheme keeps a light list
- **WHEN** the resolved scheme is light and the list is showing seeded goals
- **THEN** row surfaces and body text use the light palette (light surfaces and dark text)
