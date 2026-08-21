## MODIFIED Requirements

### Requirement: Page renders the bootstrapped goal
After receiving a native-to-web `SESSION_BOOTSTRAP` envelope, the micro-app SHALL display the goal’s target amount, deposited amount, and progress percent from that payload. The page MUST NOT invent those values when bootstrap data is present. Until bootstrap arrives, the page MAY show a waiting state and MUST NOT treat the dummy scaffold copy as the selected goal’s data. The page MUST NOT render the bootstrapped goal name as a page heading, because the native stack header already shows that name.

#### Scenario: Bootstrap paints the selected goal
- **WHEN** the page receives `SESSION_BOOTSTRAP` for a goal named Vacaciones with target 100000 and deposited 25000
- **THEN** the user sees those amounts (or the equivalent percent) in the page

#### Scenario: Goal name is not repeated as a heading
- **WHEN** the page receives `SESSION_BOOTSTRAP` for a goal named Vacaciones
- **THEN** the page does not show a heading whose text is Vacaciones

## ADDED Requirements

### Requirement: Micro-app chrome follows the host appearance
The micro-app page MUST use a light or dark visual scheme that matches the host’s resolved appearance. Changing the host appearance while the detail screen is visible MUST restyle the page. The page MUST NOT call network endpoints to load a theme and MUST NOT add a new `postMessage` catalog type for appearance.

#### Scenario: Dark host yields a dark page
- **WHEN** the host resolved scheme is dark and the detail screen is showing the bootstrapped goal
- **THEN** the micro-app page background is dark and text is light

#### Scenario: Switching appearance restyles an open detail
- **WHEN** the detail screen is visible and the user changes the host appearance from light to dark
- **THEN** the micro-app page switches to the dark scheme without posting a new catalog message type
