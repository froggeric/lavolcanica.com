# La Sonora Volcánica - Official Website

[![Version](https://img.shields.io/badge/version-1.12.1-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red.svg)](NOTICE.txt)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)](https://lavolcanica.com)

## Version Management

This project uses a centralized version management system:

- **Single Source of Truth**: Version number is stored only in `data/config/app-config.js`
- **Dynamic Display**: Version is automatically displayed in the footer and available programmatically
- **No Version Drift**: Eliminates inconsistencies between files
- **Easy Updates**: Version changes only require updating one file

### Updating the Version

1. Update the `version` property in `data/config/app-config.js`
2. The version will automatically appear in the footer and be available throughout the application
3. No other files need to be updated

### Version History

For detailed version history and changelog, see [CHANGELOG.md](CHANGELOG.md).

This repository contains the source code for the official website of La Sonora Volcánica, a musical project by Frédéric Guigand. The site is a modern, single-page application designed to showcase the artist's music, stories, and collaborations.

## Website Purpose and Capabilities

This website serves as the official digital presence for the musical artist "La Sonora Volcánica." It is a single-page application (SPA) designed to be an immersive, content-rich experience for fans. The primary objectives are to showcase the artist's music, provide biographical and collaborative context, facilitate discovery of the full discography, and serve as a central hub for all official streaming and contact links. The site also features an interactive Fuerteventura Surf Map, offering detailed information on local surf spots. The application is architected to be highly dynamic and easily updatable by modifying a central data source, without requiring direct manipulation of the DOM structure in the HTML.

## Workflows

### Content Management

All content is managed through a structured set of JavaScript modules located in the `/data` directory. This approach allows for content changes to be made without touching the main application script, streamlining the development workflow.

- **Releases**: To add a new single or album, open `data/releases/release-data.js` and add a new object to the `releaseData` array.
- **Lyrics**: To add lyrics for a release, open `data/content/release-lyrics.js` and add a new entry.
- **Audio Assets**: Audio files are stored in the `audio/` directory and referenced in `data/releases/release-data.js`.
- **Text Content**: Stories and biographies are managed in `data/content/release-stories.js` and `data/content/collaborator-bios.js`.
- **Collaborators**: To add a new collaborator, open `data/collaborators/collaborator-data.js` and add a new object to the `collaboratorData` array.
- **External Links**: Links to streaming platforms are managed in `data/config/platform-config.js` and `data/config/artist-data.js`.
- **Surf Spots**: Information about Fuerteventura surf spots, including their characteristics and GPS coordinates, is managed in [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json).

For a detailed guide on how to add or modify content, please see the [**Developer Guide**](docs/DEVELOPER_GUIDE.md).

## Technical Specifications

- **Audio Standards**: Audio files should be in AAC format at 256kbps.
- **Image Workflow**: Images should be optimized using a tool like [Squoosh](https://squoosh.app/) to ensure they are compressed for the web to reduce their file size without significant quality loss.

## Site Architecture

The application employs a **Component-based architecture** and a **data-driven, declarative rendering** pattern, implemented entirely in vanilla JavaScript. This approach mimics the core principles of modern front-end frameworks like React or Vue, but without the associated overhead. The architecture can be described as a custom, lightweight **Model-View-Controller (MVC)** or, more accurately, **Model-View-Update** pattern.

- **Model**: The "single source of truth" is a set of JavaScript objects and arrays located in the `/data` directory.
- **View**: The view is represented by the initial HTML structure in `index.html`.
- **Controller/Update Logic**: A collection of JavaScript functions in `script.js` serves as the controller and update mechanism.

### Smart Navigation System

The website includes an intelligent navigation history system that enhances user experience when navigating between panels:

- **Context-Aware Navigation**: Automatically tracks where users came from (discography, collaborator panels, or main screen)
- **Smart Return Navigation**: When closing release info panels, users are returned to their previous context
- **URL Parameter Tracking**: Uses `?returnTo=` parameters for navigation state management
- **Extensible Architecture**: Designed to accommodate future panels and navigation flows

## UX/UI Enhancements

Several recent updates have significantly improved the user experience and interface:

### 1. Unified Panel Layout
- **Description**: The collaborator panel has been repositioned to consistently appear on the right side of the screen, aligning with the display of other information panels (e.g., release details). This provides a more predictable and intuitive user interface.
- **User Interaction**: Users will now find all supplementary information panels (release info, collaborator bios) appearing from the right, creating a consistent navigational flow.
- **Technical Details**: This involved adjustments to CSS positioning and JavaScript logic for panel display management to ensure a unified user experience across different content types.

### 2. Interactive Album Art in Release Panel
- **Description**: The album artwork displayed within the detailed release information panel is now interactive. Clicking on it initiates playback of the associated track or album.
- **User Interaction**: From any release info panel, users can click the main album art to instantly start listening to the music.
- **Technical Details**: Event listeners were added to the album art element within the release info panel, triggering the audio playback function upon interaction.

### 3. Mini Player Navigation
- **Description**: The mini player, which provides persistent playback controls, now offers enhanced navigation. Both the album art and the track title within the mini player are clickable.
- **User Interaction**: Clicking the album art or title in the mini player will now open the corresponding full release information panel, allowing users to quickly access details about the currently playing track.
- **Technical Details**: Modifications were made to the mini player's DOM elements to include event listeners on the album art and title, linking them to the `showReleaseInfo()` function with the appropriate release ID.

### 4. Intelligent Playback Resumption
- **Description**: The audio playback system has been refined to prevent unnecessary restarts. If a user attempts to play a track that is already active and currently playing, the playback will continue seamlessly from its current position without restarting.
- **User Interaction**: Users can repeatedly click on a currently playing track without interrupting the audio, providing a smoother listening experience.
- **Technical Details**: The playback logic in [`script.js`](script.js:1) was updated to include a check for the currently playing track's ID. If the requested track matches the active track, the playback state is maintained rather than re-initializing the audio.

- **Technical Details**: The playback logic in [`script.js`](script.js:1) was updated to include a check for the currently playing track's ID. If the requested track matches the active track, the playback state is maintained rather than re-initializing the audio.

### 5. Multi-Language Lyrics Support
- **Description**: The website now supports displaying lyrics in multiple languages for individual releases. This feature enhances accessibility and provides a richer experience for a global audience.
- **User Interaction**: Within the release information panel, if multiple lyric languages are available for a song, a language selector will appear. Users can click on the language codes (e.g., "EN", "ES", "FR") to instantly switch between translations. The system remembers the user's last selected language for each release.
- **Technical Details**: This feature is powered by two new JavaScript classes: `LyricsLanguageManager` (manages language preferences and state) and `LyricsCacheManager` (handles efficient caching of lyric translations for instant switching). The `script.js` file now dynamically generates a language selector and integrates with the data loader to fetch and display the appropriate lyric content.

For a more detailed overview of the architecture, see the [**Developer Guide**](docs/DEVELOPER_GUIDE.md).

### 6. Fuerteventura Surf Map
- **Description**: An interactive surf map showcasing detailed information about various surf spots across Fuerteventura. Users can explore spots, view their characteristics, and get practical information.
- **User Interaction**: Navigate to the "Surf Map" section to view an interactive map. Clicking on surf spot markers reveals detailed information in a modal. Search and filter functionalities allow users to find spots based on criteria like ability level, wave type, and location.
- **Technical Details**: The surf map is implemented using a custom `SurfMap` class in [`scripts/surf-map/surf-map-core.js`](scripts/surf-map/surf-map-core.js), leveraging HTML Canvas for rendering. It uses a consolidated JSON data structure for surf spots ([`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json)) and includes components for markers, a minimap, search, and filtering. The feature's visibility is controlled by the `surfMapEnabled` flag in [`data/config/app-config.js`](data/config/app-config.js:57).

### Updating the Surf Map Image

When the main raster image for the surf map is updated (located at `images/surf-map.webp`), the corresponding GPS boundaries must be recalculated and updated in the application's configuration.

**Workflow:**

1.  **Launch the GPS Calculator Tool:** A dedicated tool is provided to calculate the new coordinates.
    *   [**Launch the Image Boundary GPS Calculator**](gps-calculator.html)

2.  **Calculate New Coordinates:** Upload the new surf map image into the calculator. The tool will automatically detect the boundaries and display the four corner GPS coordinates (North, South, East, West).

3.  **Update the Configuration:** Copy the four new decimal degree values from the calculator and paste them into the `mapBounds` object in the `data/config/app-config.js` file.

    ```javascript
    // file: data/config/app-config.js

    const appConfig = {
      // ... other configurations
      surfMap: {
        mapBounds: {
            north: 28.815195, // <-- New North coordinate
            south: 27.984300, // <-- New South coordinate
            east: -13.706680,  // <-- New East coordinate
            west: -14.641998   // <-- New West coordinate
        }
      }
    };
    ```

### 7. Advanced Tide Chart
- **Description**: A completely redesigned, best-in-class tide chart that provides a clear and accurate visualization of tide conditions.
- **User Interaction**: The tide chart is displayed within the surf spot details panel and shows the optimal tide conditions for that spot. It also includes a real-time indicator of the current tide level.
- **Technical Details**: The tide chart is implemented as a 6-section layout (mh, hi, mh, ml, lo, ml) with a proper sine wave curve. It uses a sophisticated mapping logic to highlight the recommended tide sections based on the surf spot's data. The real-time tide indicator is updated dynamically. The entire component is built with vanilla JavaScript and SVG, and is fully responsive and accessible.

## Local Development

To run this project locally, follow these steps:

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
    This project uses `eslint` for code linting and `jest` for testing.
    ```bash
    npm install
    ```

3.  **Run the local server:**
    The website is a static application but requires a server to handle module loading correctly. A simple Python HTTP server is recommended.
    ```bash
    python3 -m http.server 8000
    ```

4.  **Open in your browser:**
    Navigate to `http://localhost:8000` to view the website.

### Testing

The project includes a suite of tests to ensure data integrity and component functionality. To run the tests, use:

```bash
npm test
```

## Deployment

Deployment procedures for all environments are streamlined. The site is static and can be deployed to any static hosting provider.

## Maintenance and Troubleshooting

- **Maintenance**: Regularly update the data files in the `/data` directory, including surf spots data in [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json), to keep the content fresh.
- **Troubleshooting**: If you encounter issues, check the browser's developer console for errors. The `TEST_FUNCTIONS_ANALYSIS.md` document provides insights into the test functions available in `script.js` for debugging.

For more detailed maintenance and troubleshooting solutions, refer to the [**Developer Guide**](docs/DEVELOPER_GUIDE.md).
