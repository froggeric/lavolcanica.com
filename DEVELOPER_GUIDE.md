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
│   └── releases/
├── images/
├── scripts/
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

### 6.1. Multi-Language Lyrics Feature

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
The system is designed to accommodate future panels (e.g., surf map) by adding new context types to the navigation mapping.

### 6.3. Key UX/UI Enhancements for Developers

Recent updates have significantly refined the user experience and interface, with several technical considerations for developers:

#### 1. Unified Panel Layout
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

- **Application State:** All content and configuration are stored in plain JavaScript objects in the `/data` directory.
- **UI State:** The state of the UI is managed via classes on DOM elements.

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

## 13. Contribution Workflow

Contributions are welcome! For significant changes, please open an issue first to discuss your ideas. All content updates should be made according to this guide.