# Surf Spot Detail Panel: Design & Implementation Plan

## 1. Objective

To create a surf spot detail panel that is visually and functionally consistent with the existing side panels on the website. The panel will display detailed information about a selected surf spot in a clear, elegant, and user-friendly manner.

## 2. Design Principles

- **Consistency**: The panel will use the existing `.side-panel` and `.side-panel-overlay` HTML structure and CSS classes to ensure identical animations, transitions, and responsive behavior.
- **Information Hierarchy**: Content will be prioritized for a surfer's needs: at-a-glance info first, followed by detailed conditions and practicalities.
- **Clarity & Scannability**: Use of headings, icons, and tags to make information easy to digest.
- **Modern UI/UX**: A clean, professional design that matches the website's aesthetic.

## 3. Panel Content & Layout

The panel will be structured into three main sections:

### 3.1. Hero Section

- **Element**: A `div` with a background image.
- **Content**: A high-quality photo of the surf spot. A placeholder will be used initially.
- **Overlay**: The spot's `primaryName` will be displayed as an `h1` title overlaid on the image.

### 3.2. Primary Details Section

- **Location**: Directly below the hero image.
- **Content**:
    - A row of tag-like elements for quick, scannable information:
        - **Difficulty Level**: A color-coded tag (e.g., `Beginner`, `Intermediate`).
        - **Wave Type**: e.g., `Reef Break`.
        - **Wave Direction**: e.g., `Right`, `Left`.
    - **Description**: The full `description` of the spot.

### 3.3. Tabbed Information Section

A tabbed interface will be used to organize detailed information cleanly.

- **Tab 1: Conditions**
    - A grid layout displaying the "best" conditions for the spot.
    - Each item will feature an icon and the corresponding value.
        - **Best Swell Direction**
        - **Best Wind Direction**
        - **Best Tide**
        - **Best Season**

- **Tab 2: Practicalities**
    - **Access**: Text description.
    - **Parking**: Text description.
    - **Facilities**: Text description.
    - **Hazards**: A list of prominent, color-coded warning tags (e.g., "Shallow Reef", "Strong Currents").

## 4. Implementation Plan

### Step 1: Create the Surf Spot Panel Module

- **File**: Create a new file `scripts/surf-map/surf-spot-panel.js`.
- **Class**: Create a `SurfSpotPanel` class.
- **Methods**:
    - `constructor()`: Initialize DOM element references.
    - `open(spot)`: The main method to populate and show the panel. It will call helper methods to build the content.
    - `close()`: Hide the panel and overlay.
    - `_buildContent(spot)`: A private method to generate the entire inner HTML for the panel based on the spot data.
    - `_createHeroSection(spot)`
    - `_createPrimaryDetails(spot)`
    - `_createTabs(spot)`
    - `_createConditionsTab(spot)`
    - `_createPracticalitiesTab(spot)`
    - `addEventListeners()`: To handle close button clicks and overlay clicks.

### Step 2: Integrate with the Main Application

- **File**: `script.js`
    - Import `SurfSpotPanel`.
    - Instantiate it.
    - Create a new function `showSurfSpotPanel(spot)` that calls `panel.open(spot)`.
    - Make this function globally available (e.g., `window.showSurfSpotPanel = showSurfSpotPanel`).

- **File**: `scripts/surf-map/surf-map-core.js`
    - In `handleMarkerClick(spot)`, replace the call to `this.spotModal.open(spot)` with `window.showSurfSpotPanel(spot)`.
    - In `handleSearchResultClick(spot)`, do the same.

### Step 3: Add New CSS Styles

- **File**: `style.css`
    - Add new styles for the specific elements within the surf spot panel (e.g., `.spot-details-grid`, `.condition-item`, `.hazard-tag`).
    - The styles will be designed to be consistent with the existing site theme.

### Step 4: Deprecate Old Modal

- The old `scripts/surf-map/surf-spot-modal.js` file and its corresponding CSS (`.surf-spot-modal`, etc.) will no longer be used and can be marked for deletion.

## 5. Handover to Code Agent

The coding agent will now proceed with the implementation based on this plan, starting with the creation of the `SurfSpotPanel` class.