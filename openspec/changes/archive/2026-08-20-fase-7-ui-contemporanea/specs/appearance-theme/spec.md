## Purpose

Lets the user keep a system-following or explicit light/dark appearance for native chrome, with the choice restored after relaunch.

## ADDED Requirements

### Requirement: Default appearance follows the system
The host SHALL treat the appearance preference as system until the user chooses light or dark. When the preference is system, the resolved scheme MUST match the operating system’s color scheme.

#### Scenario: First launch follows the OS
- **WHEN** the application launches and the user has never chosen light or dark
- **THEN** native screens use the operating system’s current color scheme (light or dark)

#### Scenario: System preference tracks OS changes
- **WHEN** the preference is system and the operating system color scheme changes from light to dark
- **THEN** native screens switch to the dark scheme without requiring a relaunch

### Requirement: User can override the system scheme
The host SHALL let the user choose light or dark independently of the operating system. The chosen preference MUST remain until the user changes it again. Choosing system MUST resume following the operating system.

#### Scenario: User selects dark while OS is light
- **WHEN** the operating system color scheme is light and the user selects dark
- **THEN** native screens use the dark scheme

#### Scenario: User returns to system
- **WHEN** the user had selected dark and then selects system
- **THEN** native screens again follow the operating system color scheme

### Requirement: Appearance preference survives relaunch
When the user has selected light or dark, a later application launch MUST restore that preference. When the preference is system, a later launch MUST still follow the operating system.

#### Scenario: Dark choice remains after process restart
- **WHEN** the user selected dark and the process is killed
- **THEN** the next launch still uses the dark scheme even if the operating system is light

#### Scenario: System choice still follows the OS after process restart
- **WHEN** the preference is system and the process is killed
- **THEN** the next launch uses the operating system’s current color scheme

### Requirement: Header control changes appearance
The native stack header MUST show an appearance control in the upper-right. Activating the control MUST let the user choose among system, light, and dark. The control MUST be available on the list screen and on the goal-detail screen.

#### Scenario: Control is on the list header
- **WHEN** the list screen is visible
- **THEN** an appearance control is present in the top-right of the native header

#### Scenario: Control is on the detail header
- **WHEN** the goal-detail screen is visible
- **THEN** an appearance control is present in the top-right of the native header

#### Scenario: Activating the control changes the scheme
- **WHEN** the user activates the header appearance control and selects a different preference
- **THEN** the resolved scheme changes and native screens restyle to match
