# Developer Guide

Welcome to the La Sonora Volcánica project! This guide is designed to help you understand the new modular architecture and how to add new content to the application. The primary goal of this refactoring is to separate the core application logic from the content, making it easier to manage and extend.

## 1. Technology Stack

The application is intentionally built with a "vanilla" technology stack, prioritizing performance, longevity, and minimal dependencies.

- **HTML5:** Serves as the structural foundation.
- **CSS3:** Provides all styling, responsive design, and animations.
- **JavaScript (ES6+):** Manages all application state, dynamic content rendering, user interactions, and audio playback.

## 2. Project Structure

The core of the new architecture is the `/data` directory. All application content, from music releases to language translations, is stored in this directory as JavaScript modules.

```
/
├── audio/
├── data/
│   ├── collaborators/
│   ├── config/
│   ├── content/
│   ├── i18n/
│   ├── releases/
│   └── surfspots/ # New directory for individual surf spot data (deprecated)
├── images/
├── scripts/
│   └── surf-map/ # New directory for surf map related scripts
├── style.css
├── script.js
├── index.html
├── DESIGN.md
├── DEVELOPER_GUIDE.md
└── README.md
```

## 3. Build System and Environment Setup

The project does not require a complex build system. However, a local server is needed to handle module loading correctly.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Python 3](https://www.python.org/downloads/) (for the local web server)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lavolcanica.git
    cd lavolcanica
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the local server:**
    ```bash
    python3 -m http.server 8000
    ```

4.  **Open in your browser:**
    Navigate to `http://localhost:8000` to view the website.

## 4. Content Management System (CMS) Architecture

The application uses a "Git-based" or "flat-file" CMS. All content is stored in JavaScript modules within the `/data` directory.

### Data Models

- **Releases**: `data/releases/release-data.js`
- **Collaborators**: `data/collaborators/collaborator-data.js`
- **Content (Stories, Lyrics, Bios)**: `data/content/`
- **UI Translations**: `data/i18n/`
- **Configuration**: `data/config/`
- **Surf Spots**: [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json)

## 5. API Documentation

The `scripts/data-loader.js` module serves as the central API for accessing all application data. It provides functions for loading translations, resolving content, and querying data.

## 6. Component Architecture

The application employs a component-based architecture implemented in vanilla JavaScript. Key components include:

- `createMusicCard()`
- `createCollaboratorCard()`
- `populateFeaturedGrid()`
- `populateCollabsGrid()`
- `showDiscography()`
- `showCollaborator()`
- `showReleaseInfo()`

### 6.1. Fuerteventura Surf Map Architecture

The Fuerteventura Surf Map is a significant new feature designed to provide an interactive and detailed exploration of surf spots. It is built with a modular and performant architecture, leveraging vanilla JavaScript and HTML Canvas.

#### Core Components
- **[`SurfMap`](scripts/surf-map/surf-map-core.js)**: The central class managing the map's state, rendering, and interactions. It orchestrates all sub-components.
- **[`SurfMapRenderer`](scripts/surf-map/surf-map-renderer.js)**: Handles the drawing of the map image and other visual elements onto the HTML Canvas.
- **[`InteractionManager`](scripts/surf-map/interaction-manager.js)**: A centralized class that handles all raw user input (mouse, wheel, and touch events). It translates these inputs into semantic gestures like `tap`, `drag`, and `pinch`. To ensure maximum performance and prevent UI blocking, it registers `mousemove` and other frequent events with `{ passive: true }`, which is critical for smooth hover effects and avoiding potential infinite loops during rapid mouse movement.
- **[`SurfMapInteractions`](scripts/surf-map/surf-map-interactions.js)**: Consumes the semantic events from the `InteractionManager` and applies them to the map's state with significant performance and UX enhancements:
    - **Zero-Latency Panning:** The drag-to-pan interaction is optimized to update the map's position within the same animation frame as the user's input, eliminating any perceptible lag.
    - **Animated & Responsive Zoom:** Both mouse wheel and UI button zooming are now smoothly animated over 200ms with a pleasant easing curve. The mouse wheel zoom also features intelligent acceleration based on scroll speed.
    - **Refined Momentum Physics:** The "flick-to-scroll" momentum effect uses an exponential weighting system for velocity, resulting in a smoother and more accurate coasting motion.
    - **Critical Fixes:** Resolves a stack overflow error caused by improper event handling during rapid mouse movement and corrects coordinate calculations on high-DPI displays for UI button zooming.
- **[`SurfSpotsManager`](scripts/surf-map/surf-spots.js)**: Loads and manages the surf spots data from [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json), including coordinate conversion between GPS and image pixels.
- **[`SurfMarkersManager`](scripts/surf-map/surf-markers.js)**: Renders and manages interactive markers for each surf spot on the map, handling their visibility and click events.
- **[`SurfSpotModal`](scripts/surf-map/surf-spot-modal.js)**: Displays detailed information about a surf spot when its marker is clicked.
- **[`SurfMinimap`](scripts/surf-map/surf-minimap.js)**: Provides a smaller, overview map that shows the current viewport and all active surf spots, facilitating navigation.
- **[`SurfSearch`](scripts/surf-map/surf-search.js)**: Implements search functionality for surf spots, allowing users to find spots by name or other criteria.
- **[`SurfFilters`](scripts/surf-map/surf-filters.js)**: Provides filtering capabilities, enabling users to narrow down surf spots based on various attributes like ability level, wave type, and location.

#### Data Structure
All surf spot data is consolidated into a single JSON file: [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json). This file contains an array of objects, each representing a surf spot with detailed information such as `id`, `primaryName`, `location` (including `lat` and `lng` coordinates), `waveDetails`, `characteristics`, and `practicalities`. A full schema is available in [`surf-spots-data-structure.md`](surf-spots-data-structure.md).

#### Configuration
The visibility of the surf map feature in the main navigation is controlled by the `surfMapEnabled` flag in [`data/config/app-config.js`](data/config/app-config.js:57).

#### Coordinate System and Tooling

The accurate placement of surf spot markers on the map depends on a precise mapping between the raster image (`images/surf-map.webp`) and the real-world GPS coordinates of its boundaries.

**Configuration:**

The single source of truth for the map's geographical boundaries is the `mapBounds` object located in `data/config/app-config.js`. This object defines the exact latitude and longitude of the image's four corners.

**The GPS Boundary Calculator Tool:**

To facilitate updates, a dedicated tool, `gps-calculator.html`, is included in the repository.

-   **Purpose:** This tool allows an operator to upload a new map image and visually align four boundary lines with the edges of the landmass. It then automatically calculates the precise GPS coordinates for the image's four corners.
-   **Workflow:** When the main surf map image is replaced, the operator must use this tool to generate the new `mapBounds` values. These values are then manually copied into the `data/config/app-config.js` configuration file. This ensures that all surf spot GPS coordinates are correctly translated into pixel positions on the new map.

### 6.2. Collapsible Search Panel Feature

The collapsible search panel is a responsive UI enhancement that improves the user experience on both desktop and mobile devices by providing intelligent panel management for the surf map search interface.

#### Core Components

- **[`SurfMap.searchPanelCollapsed`](scripts/surf-map/surf-map-core.js:77)**: Boolean state tracking manual collapse state on desktop
- **[`SurfMap.searchPanelAutoCollapsed`](scripts/surf-map/surf-map-core.js:78)**: Boolean state tracking automatic collapse state on mobile
- **[`SurfMap.toggleSearchPanel()`](scripts/surf-map/surf-map-core.js:634)**: Manually toggles the search panel collapsed state
- **[`SurfMap.collapseSearchPanel()`](scripts/surf-map/surf-map-core.js:659)**: Auto-collapses the panel on mobile when surf spot details are opened
- **[`SurfMap.expandSearchPanel()`](scripts/surf-map/surf-map-core.js:675)**: Re-expands the panel when returning from surf spot details

#### Desktop Functionality

- **Manual Toggle Button**: A chevron button in the top-right corner of the search panel allows users to manually collapse/expand the panel
- **Visual Indicators**:
  - Rotating chevron icon indicates panel state
  - Pulsing glow effect on the collapsed edge provides visual feedback
  - Smooth CSS transitions with hardware acceleration
- **Keyboard Accessibility**: Ctrl+/ keyboard shortcut for power users
- **High Contrast Mode**: Enhanced visual indicators for users with high contrast preferences

#### Mobile Functionality

- **Auto-Collapse Behavior**: The search panel automatically collapses when surf spot details are opened, maximizing screen space
- **Smart Expansion**: The panel automatically re-expands when users return from surf spot details
- **Touch Optimization**: Improved touch targets and gesture handling
- **Performance**: Adaptive frame rates optimized for mobile devices

#### CSS Implementation

The collapsible panel functionality is implemented through extensive CSS additions (130+ lines) in [`style.css`](style.css:3557-3705):

- **`.search-panel-toggle`**: Toggle button styling with hover and focus states
- **`.left-side-search-container.collapsed`**: Collapsed state with transform animations
- **`.left-side-search-container.auto-collapsed`**: Mobile auto-collapse state
- **Responsive Breakpoints**: Different behavior patterns for desktop vs mobile
- **Accessibility Features**: Reduced motion support, high contrast mode, screen reader optimizations

#### Event Integration

The collapsible panel integrates seamlessly with existing surf map events:

- **`searchPanelToggle`**: Emitted when manual toggle is activated
- **`searchPanelAutoCollapse`**: Emitted when mobile auto-collapse occurs
- **Panel State Coordination**: Works with marker click events and panel open/close workflows
- **Search State Preservation**: Search queries and results are maintained during collapse/expand cycles

#### Accessibility Features

- **ARIA Attributes**: Proper `aria-expanded`, `aria-label`, and `aria-controls` attributes
- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and shortcut keys
- **Screen Reader Support**: Live region announcements for state changes
- **Reduced Motion**: Respects user's motion preferences with `prefers-reduced-motion`
- **High Contrast**: Enhanced visual indicators in high contrast mode
- **Focus Management**: Proper focus trapping and visible focus indicators

### 6.3. Multi-Language Lyrics Feature

The multi-language lyrics feature allows users to switch between different language versions of song lyrics within the release information panel. This system is designed for flexibility, performance, and accessibility.

#### Core Components

- **[`LyricsLanguageManager`](script.js:1639)**: Manages the state and preferences for lyrics language selection.
  - **Purpose**: Handles session storage for user language preferences, determines the initial language to display, and coordinates language changes.
  - **Key Methods**:
    - [`constructor(defaultLanguage, cacheManager)`](script.js:1645): Initializes with a default language and a `LyricsCacheManager` instance.
    - [`getStoredLanguagePreference(releaseId)`](script.js:1660): Retrieves a user's stored language preference for a specific release.
    - [`storeLanguagePreference(releaseId, languageCode)`](script.js:1678): Stores the user's selected language for a release.
    - [`getInitialLanguage(releaseId, availableLanguages)`](script.js:1698): Determines which language to display first based on preferences and availability.
    - [`initializeForRelease(releaseId, availableLanguages, contentId, loadLyricsFunction)`](script.js:1727): Sets up the manager for a given release, including preloading lyrics.
    - [`changeLanguage(releaseId, newLanguage)`](script.js:1754): Updates the current language and stores the preference.
    - [`getCachedLyrics(releaseId, language)`](script.js:1808): Retrieves lyrics from the cache.
    - [`hasCachedLyrics(releaseId, language)`](script.js:1817): Checks if lyrics are available in the cache.

- **[`LyricsCacheManager`](script.js:2383)**: Manages efficient caching of lyric translations using a multi-level strategy.
  - **Purpose**: Stores lyric content in both in-memory and session storage to provide instant language switching and minimize network requests. Implements an LRU (Least Recently Used) eviction policy.
  - **Key Methods**:
    - [`constructor(config)`](script.js:2391): Configures cache sizes and storage key.
    - [`getLyrics(releaseId, language)`](script.js:2444): Retrieves lyrics from cache (memory first, then session storage).
    - [`setLyrics(releaseId, language, lyrics)`](script.js:2478): Stores lyrics in both caches, performing cleanup if limits are exceeded.
    - [`preloadAllLanguages(releaseId, contentId, availableLanguages, loadLyricsFunction)`](script.js:2511): Fetches and caches all available translations for a release.
    - [`invalidateRelease(releaseId)`](script.js:2607): Removes all cached lyrics for a specific release.
    - [`invalidateAll()`](script.js:2634): Clears all cached lyrics.
    - [`getStats()`](script.js:2646): Provides statistics on cache hits and misses.

- **[`createLyricsLanguageSelector`](script.js:2367)**: A utility function that creates an accessible UI component for language selection.
  - **Purpose**: Generates interactive buttons for each available language, handles click and keyboard events, and provides visual feedback.
  - **Accessibility**: Includes ARIA attributes for screen readers, keyboard navigation (Arrow keys, Home/End, Enter/Space), and focus management.
  - **Responsiveness**: Adapts to different screen sizes and includes scroll indicators for overflow content.

#### Integration in [`script.js`](script.js:1)

- **Initialization**: In `initializeApp`, `LyricsCacheManager` and `LyricsLanguageManager` are instantiated.
- **Release Panel**: The [`showReleaseInfo`](script.js:863) function now:
  - Calls [`lyricsLanguageManager.initializeForRelease`](script.js:1727) to set up language preferences and preload lyrics.
  - Creates a language selector using [`createLyricsLanguageSelector`](script.js:2367) if multiple languages are available.
  - Attaches a callback to the selector to update the displayed lyrics when the language changes, leveraging the cache.

#### Data Structure for Lyrics

Lyrics content is expected to be managed within the `data/content/release-lyrics.js` file, with each entry potentially having multiple language keys. The `data-loader.js` module is responsible for resolving the correct language version.

#### Future Enhancements

- **Dynamic Loading of Language Files**: Explore dynamically importing language-specific lyric files only when needed, rather than preloading all, to optimize initial load times for releases with many translations.
- **User Interface for Language Addition**: Develop a simple UI or command-line tool to streamline the process of adding new lyric translations for content editors.

### 6.2. Smart Navigation History System

The application includes an intelligent navigation history system that enhances user experience when navigating between panels:

#### Navigation Context Tracking
- **URL Parameter-Based**: Uses `?returnTo=` URL parameters to track navigation context
- **Context Detection**: Automatically detects current panel context (discography, collaborator, main)
- **Session Storage**: Maintains collaborator state across navigation transitions

#### Smart Navigation Behavior
When users close a release info panel, they are intelligently returned to their previous context:
- From discography panel → returns to discography panel
- From collaborator panel → returns to same collaborator panel
- From main screen → returns to main screen

#### Implementation Details
- **navigationHistory Object**: Manages URL parameter context (`setContext()`, `getContext()`, `clearContext()`)
- **navigationHelpers Object**: Provides context detection and collaborator state management
- **Enhanced Event Delegation**: Captures navigation context when opening release panels
- **Smart Panel Close Handler**: Checks context and navigates accordingly on close

#### Extensibility
The system is designed to accommodate future panels, such as the now-implemented surf map, by adding new context types to the navigation mapping. The `SurfMap` integrates with this system to manage its own navigation state.

### 6.3. Key UX/UI Enhancements for Developers

Recent updates have significantly refined the user experience and interface, with several technical considerations for developers:

#### 1. Advanced Tide Chart
- **Description**: A completely redesigned, best-in-class tide chart that provides a clear and accurate visualization of tide conditions.
- **Technical Implementation**: The tide chart is implemented as a 6-section layout (mh, hi, mh, ml, lo, ml) with a proper sine wave curve. It uses a sophisticated mapping logic to highlight the recommended tide sections based on the surf spot's data. The real-time tide indicator is updated dynamically. The entire component is built with vanilla JavaScript and SVG, and is fully responsive and accessible.
- **Data Structure**: The `bestTide` property in the surf spot data is an array of strings (e.g., `['Low', 'Mid']`). The `realTimeTide` object contains a `level` property (a number between 0 and 1).
- **CSS Architecture**: The tide chart styling is located in `style/surf-spot-panel-optimized.css` under the "Tide Chart - Advanced 6-Section Implementation" section. It uses a BEM-like naming convention and is designed to be easily customizable.
- **Extending Real-Time Data**: To extend the real-time data functionality, you can add more properties to the `realTimeTide` object in `data/surf-spot-real-time.json` and update the `_createTideChart` function in `scripts/surf-map/surf-spot-panel-optimized.js` to handle the new data.

#### 2. Unified Panel Layout
- **Description**: The collaborator panel now consistently appears on the right side, mirroring other information panels. This required refactoring of CSS and JavaScript to manage panel display in a unified manner.
- **Technical Implementation**: Developers should ensure any new panels adhere to the established CSS classes and JavaScript functions for right-side panel display to maintain consistency.

#### 2. Interactive Album Art in Release Panel
- **Description**: The album artwork in the release information panel is now clickable to initiate audio playback.
- **Technical Implementation**: The [`initReleasePanel()`](script.js:LXXX) function (or equivalent) now includes an event listener on the album art image that triggers the audio playback mechanism (e.g., [`playTrack()`](script.js:LXXX)).

#### 3. Mini Player Navigation
- **Description**: Both the album art and track title in the mini player are interactive, linking to the full release information panel.
- **Technical Implementation**: The mini player's rendering logic (e.g., in [`updateMiniPlayer()`](script.js:LXXX)) now attaches event listeners to both the album art and title elements, calling [`showReleaseInfo()`](script.js:LXXX) with the appropriate release ID when clicked.

#### 4. Intelligent Playback Resumption
- **Description**: The audio playback system prevents unnecessary restarts when attempting to play a track that is already active.
- **Technical Implementation**: The [`playTrack()`](script.js:LXXX) function (or the primary audio control function) includes a check to compare the `trackId` of the requested track with the `currentPlayingTrackId`. If they match, the function should gracefully exit without restarting playback.

## 7. State Management

- **Application State:** All content and configuration are stored in plain JavaScript objects in the `/data` directory, including surf spot data in [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json) and surf map configuration in [`data/config/app-config.js`](data/config/app-config.js).
- **UI State:** The state of the UI is managed via classes on DOM elements. The `SurfMap` class also maintains its internal state for zoom, pan, and other interactive elements.

## 8. Coding Standards and Style Guide

- **JavaScript:** The code follows the principles of "clean code," with an emphasis on readability, modularity, and maintainability. An IIFE is used to create a private scope and prevent polluting the global namespace.
- **CSS:** A BEM-like naming convention is used for component-specific styles.
- **HTML:** The HTML structure is semantic, accessible, and optimized for SEO.

## 9. Testing Framework

The project includes a suite of tests to ensure data integrity and component functionality. The testing strategy covers unit testing, integration testing, manual testing, and performance validation. To run the tests, use:

```bash
npm test
```

## 10. Performance Optimization

- **Image Lazy Loading**
- **Image Optimization**
- **Debouncing**
- **Intersection Observer**

## 11. Security

- **`noopener noreferrer`:** Used on all external links to prevent tab-nabbing.
- **HTML Sanitization:** A `sanitizeHTML` utility function is included to prevent XSS attacks.

## 12. Debugging and Troubleshooting

- **Browser Console:** Check the browser's developer console for errors.
- **Test Functions:** The `TEST_FUNCTIONS_ANALYSIS.md` document provides insights into the test functions available in `script.js` for debugging.

### 12.1. Debugging Canvas Rendering

When working with the HTML Canvas, especially in `SurfMarkersManager`, be aware of **context state pollution**.

-   **The Problem**: Bugs like "ghosting" (e.g., shadows appearing on the wrong objects) often happen because the canvas context (`ctx`) is not properly reset between drawing different objects in the same render loop. Properties like `shadowBlur` or `globalAlpha` can persist unexpectedly.
-   **The Solution**: Do not rely solely on `ctx.save()` and `ctx.restore()` to manage state between individual components within a single, complex object. After drawing a part of an object that uses a specific state (like a shadow), **explicitly reset those properties** before drawing the next part.

**Example (from `SurfMarkersManager`):**

```javascript
// 1. Set shadow for the main marker body
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 6;

// 2. Draw the main marker body
ctx.beginPath();
ctx.arc(0, 0, radius, 0, Math.PI * 2);
ctx.fill();

// 3. CRITICAL: Reset shadow state immediately after
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;

// 4. Now, draw other parts (like hover rings) that should NOT have a shadow
if (isHovered) {
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
}
```

## 13. Contribution Workflow

Contributions are welcome! For significant changes, please open an issue first to discuss your ideas. All content updates should be made according to this guide.
