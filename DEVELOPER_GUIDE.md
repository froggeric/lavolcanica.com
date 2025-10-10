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

### 6.1. Smart Navigation History System

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