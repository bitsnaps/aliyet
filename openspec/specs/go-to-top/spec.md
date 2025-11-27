# go-to-top Specification

## Purpose
TBD - created by archiving change fix-go-to-top-feature. Update Purpose after archive.
## Requirements
### Requirement: Go To Top Button Visibility

The "Go to Top" button SHALL become visible when the user scrolls down the page.

#### Scenario: Page Load
- **Given** the user has just loaded a page
- **When** the page is not scrolled
- **Then** the "Go to Top" button is not visible.

#### Scenario: User Scrolls Down
- **Given** the user is on a page
- **When** the user scrolls down more than 50 pixels
- **Then** the "Go to Top" button becomes visible.

#### Scenario: User Scrolls Back to Top
- **Given** the "Go to Top" button is visible
- **When** the user scrolls back to the top of the page (less than 50 pixels from the top)
- **Then** the "Go to Top" button is hidden.

### Requirement: Go To Top Button Action

Clicking the "Go to Top" button SHALL scroll the user to the top of the page.

#### Scenario: Click Go to Top button
- **Given** the "Go to Top" button is visible
- **When** the user clicks the "Go to Top" button
- **Then** the page smoothly scrolls to the top.
- **And** the "Go to Top" button becomes hidden.

### Requirement: Go To Top Icon

The "Go to Top" button SHALL display an upward-pointing chevron icon.

#### Scenario: Button is visible
- **Given** the "Go to Top" button is visible
- **When** the button is rendered
- **Then** it contains an upward-pointing chevron icon.

