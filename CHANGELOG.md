# Changelog

All notable changes to the La Sonora Volcánica website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.1] - 2025-10-18

### Changed
- **Surf Spot Hero Images**: Updated the surf spot details side panel to use custom images from the `images/surf-spots/` directory instead of generic fallback images.
- **Image Aspect Ratio**: Changed the hero image display to use a 3:2 aspect ratio to match the supplied surf spot images.

### Technical Details
- Modified the `SurfSpotPanel` class to attempt loading spot-specific images using the spot ID as the filename.
- Added error handling to fall back to `surf-spot-placeholder.webp` when a spot-specific image doesn't exist.
- Updated CSS styling to use `aspect-ratio: 3/2` for proper image display.

### Files Modified
- `scripts/surf-map/surf-spot-panel.js`: Updated hero image loading logic and aspect ratio.
- `data/config/app-config.js`: Updated version to 1.8.1.
- `script.js`: Updated version to 1.8.1.
- `CHANGELOG.md`: Updated with new version information.

## [1.8.0] - 2025-10-18

### Fixed
- **Surf Map Layout Gap**: Resolved a persistent unwanted gap above the main surf map on the `surf-map.html` page. The map now correctly fills the entire viewport height below the main header.

### Changed
- **Surf Map UI Refactoring**: Removed the redundant `.surf-map-header` element from `surf-map.html` and its associated CSS. The map controls are now integrated directly into the map wrapper for a cleaner layout and improved code maintainability.

### Technical Details
- Refactored the HTML structure of `#surf-map-section` in `surf-map.html` by removing the `.surf-map-header` and moving the `.surf-map-controls` inside the `.surf-map-wrapper`.
- Cleaned up `style.css` by removing all CSS rules related to `.surf-map-header` and `.surf-map-title`, and adjusting responsive styles accordingly.
- This change simplifies the layout logic and removes the source of the visual gap without affecting the functionality of the map controls.

### Files Modified
- `surf-map.html`: Refactored HTML structure to remove the header and relocate map controls.
- `style.css`: Removed outdated CSS rules and cleaned up responsive styles.
- `data/config/app-config.js`: Updated version to 1.8.0.
- `index.html`: Updated version to 1.8.0.
- `script.js`: Updated version to 1.8.0.
- `CHANGELOG.md`: Updated with new version information.

## [1.7.1] - 2025-10-16

### Changed
- **Surf Map Data Structure Update**: Updated the surf map codebase to fully support the new standardized JSON structure for surf spots data.
- **Enhanced Search Functionality**: Extended search capabilities to include all surf spot properties from the standardized data structure.
- **Improved Modal Display**: Enhanced the surf spot detail modal to display all available information from the new data structure.
- **Fixed Coordinate Handling**: Corrected coordinate handling to use the proper lat/lng format from the standardized structure.

### Fixed
- **Search Functionality**: Fixed search functionality to properly handle the new standardized JSON structure with array-valued fields.
- **Modal Display**: Fixed modal display to correctly show all surf spot properties, including newly added fields.
- **Coordinate Conversion**: Resolved issues with coordinate conversion and display to match the new format.

### Technical Details
- Updated `scripts/surf-map/surf-search.js` to handle all fields from the standardized JSON structure.
- Updated `scripts/surf-map/surf-spot-modal.js` to properly display all fields, including array-valued fields and new properties.
- Added proper handling for new fields like `directionNotes`, `tideNotes`, and `crowdNotes`.
- Fixed coordinate handling to use `spot.location.coordinates.lat/lng` instead of the previous format.
- Added fallback text for missing values in the modal display.

### Files Modified
- `scripts/surf-map/surf-search.js`: Updated to handle all fields from the standardized JSON structure.
- `scripts/surf-map/surf-spot-modal.js`: Updated to display all properties with proper handling for arrays and new fields.
- `data/config/app-config.js`: Updated version to 1.7.1.
- `script.js`: Updated version to 1.7.1.
- `index.html`: Updated version to 1.7.1.
- `CHANGELOG.md`: Updated with new version information.

## [1.7.0] - 2025-10-14

### Added
- **Dynamic Surf Spots Counter**: Implemented a real-time counter that displays the number of visible surf spots based on current search results.
- **Enhanced Search Functionality**: Extended search capabilities to work across all surf spot properties including name, description, difficulty, and location details.
- **Left-Side Search Control**: Relocated search control to the left side of the screen for improved accessibility and user experience.
- **Mobile Search Toggle Button**: Added a dedicated mobile search toggle button for better responsive behavior.

### Changed
- **Surf Map Interface Redesign**: Completely redesigned the surf map interface with a focus on improved usability and accessibility.
- **Removed Filter Functionality**: Removed the filter functionality completely to simplify the interface and improve performance.
- **Search Control Positioning**: Moved search control from right side to left side of the screen for better visual hierarchy.
- **Responsive Behavior Enhancement**: Improved responsive behavior across all device sizes with better breakpoints and layout adjustments.
- **Accessibility Improvements**: Enhanced accessibility features including proper ARIA labels, keyboard navigation, and screen reader support.
- **Styling Consistency**: Updated styling throughout the surf map interface for better design consistency with the overall application.

## [1.6.2] - 2025-10-14

### Changed
- **Surf Map Data Structure Update**: Updated the surf map codebase to fully support the new standardized JSON structure for surf spots data.
- **Enhanced Search Functionality**: Extended search capabilities to include all surf spot properties from the standardized data structure.
- **Improved Modal Display**: Enhanced the surf spot detail modal to display all available information from the new data structure.
- **Fixed Coordinate Handling**: Corrected coordinate handling to use the proper lat/lng format from the standardized structure.

### Fixed
- **Search Functionality**: Fixed search functionality to properly handle the new standardized JSON structure with array-valued fields.
- **Modal Display**: Fixed modal display to correctly show all surf spot properties, including newly added fields.
- **Coordinate Conversion**: Resolved issues with coordinate conversion and display to match the new format.

### Technical Details
- Updated `scripts/surf-map/surf-search.js` to handle all fields from the standardized JSON structure.
- Updated `scripts/surf-map/surf-spot-modal.js` to properly display all fields, including array-valued fields and new properties.
- Added proper handling for new fields like `directionNotes`, `tideNotes`, and `crowdNotes`.
- Fixed coordinate handling to use `spot.location.coordinates.lat/lng` instead of the previous format.
- Added fallback text for missing values in the modal display.

### Files Modified
- `scripts/surf-map/surf-search.js`: Updated to handle all fields from the standardized JSON structure.
- `scripts/surf-map/surf-spot-modal.js`: Updated to display all properties with proper handling for arrays and new fields.
- `data/config/app-config.js`: Updated version to 1.6.2.
- `script.js`: Updated version to 1.6.2.
- `CHANGELOG.md`: Updated with new version information.

## [1.6.1] - 2025-10-13

### Patch
- **UI Consistency Improvement**: Improved hover effects for close buttons across the application for better user experience.

### Added
- **Dynamic Surf Spots Counter**: Implemented a real-time counter that displays the number of visible surf spots based on current search results.
- **Enhanced Search Functionality**: Extended search capabilities to work across all surf spot properties including name, description, difficulty, and location details.
- **Left-Side Search Control**: Relocated search control to the left side of the screen for improved accessibility and user experience.
- **Mobile Search Toggle Button**: Added a dedicated mobile search toggle button for better responsive behavior.

### Changed
- **Surf Map Interface Redesign**: Completely redesigned the surf map interface with a focus on improved usability and accessibility.
- **Removed Filter Functionality**: Removed the filter functionality completely to simplify the interface and improve performance.
- **Search Control Positioning**: Moved search control from right side to left side of the screen for better visual hierarchy.
- **Responsive Behavior Enhancement**: Improved responsive behavior across all device sizes with better breakpoints and layout adjustments.
- **Accessibility Improvements**: Enhanced accessibility features including proper ARIA labels, keyboard navigation, and screen reader support.
- **Styling Consistency**: Updated styling throughout the surf map interface for better design consistency with the overall application.

### Technical Details
- Refactored surf map search system to work with a unified search interface that queries multiple data fields.
- Implemented a new counter component that dynamically updates based on search results and map viewport.
- Removed filter-related components and dependencies from the surf map module.
- Restructured CSS layout to accommodate the new left-side search control.
- Enhanced mobile experience with a collapsible search interface.
- Improved accessibility with proper semantic HTML, ARIA attributes, and keyboard navigation patterns.

### Files Modified
- `scripts/surf-map/surf-search.js`: Completely refactored to support enhanced search functionality.
- `scripts/surf-map/surf-counter.js`: New component for dynamic surf spots counting.
- `scripts/surf-map/surf-filters.js`: Removed as filter functionality is no longer needed.
- `scripts/surf-map/surf-map-core.js`: Updated to integrate with new search and counter components.
- `scripts/surf-map/surf-map-interactions.js`: Modified to support new interface layout.
- `style.css`: Updated with new styles for left-side search, counter, and improved responsive design.
- `index.html`: Updated version to 1.7.0 and modified HTML structure for new interface layout.

## [1.6.1] - 2025-10-13

### Patch
- **UI Consistency Improvement**: Improved hover effects for close buttons across the application for better user experience.

## [1.6.0] - 2025-10-13

### Added
- **Surf Map Toggle Configuration**: Implemented a configuration option to toggle the visibility of the surf map feature.
- **Surf Spots Data Structure Documentation**: Created detailed documentation for the consolidated surf spots data structure.
- **Extended GPS Coordinates**: Added GPS coordinates for 21 previously missing surf spots.

### Changed
- **Surf Spot Data Consolidation**: Consolidated 42 individual surf spot JSON files into a single, unified data file for improved performance and manageability.
- **Surf Map Code Update**: Updated the surf map codebase to utilize the newly consolidated surf spot data structure.
- **Navigation Menu Modification**: Modified the main navigation menu to dynamically adapt based on the surf map toggle configuration.
- **Version Increment**: Updated the application version to `1.6.0`.
- **Documentation Updates**: Performed general updates and improvements to existing project documentation.

### Technical Details
- Consolidated individual surf spot JSON files from [`data/surfspots/`](data/surfspots/) into [`data/fuerteventura-surf-spots.json`](data/fuerteventura/fuerteventura-surf-spots.json).
- Created [`surf-spots-data-structure.md`](surf-spots-data-structure.md) to document the new unified data format.
- Modified [`scripts/surf-map/surf-spots.js`](scripts/surf-map/surf-spots.js) and other related surf map scripts to consume data from the consolidated JSON.
- Updated GPS coordinates in the consolidated data file to include 21 missing spots.
- Implemented `surfMapToggle` in [`data/config/app-config.js`](data/config/app-config.js) to control surf map visibility.
- Adjusted navigation menu rendering logic in [`script.js`](script.js) based on the `surfMapToggle` configuration.

### Files Modified
- [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json): New consolidated surf spot data file.
- [`data/surfspots/*.json`](data/surfspots/): 42 individual surf spot JSON files removed (consolidated).
- [`surf-spots-data-structure.md`](surf-spots-data-structure.md): New documentation for the surf spots data structure.
- [`scripts/surf-map/surf-spots.js`](scripts/surf-map/surf-spots.js): Updated to use consolidated data.
- [`scripts/surf-map/surf-map-core.js`](scripts/surf-map/surf-map-core.js): Potentially updated for data integration.
- [`scripts/surf-map/surf-map-renderer.js`](scripts/surf-map/surf-map-renderer.js): Potentially updated for data integration.
- [`scripts/surf-map/surf-map-interactions.js`](scripts/surf-map/surf-map-interactions.js): Potentially updated for data integration.
- [`data/config/app-config.js`](data/config/app-config.js): Added `surfMapToggle` configuration and updated version to `1.6.0`.
- [`script.js`](script.js): Modified navigation menu logic and updated version to `1.6.0`.
- [`index.html`](index.html): Updated version comment to `1.6.0`.
- [`style.css`](style.css): Updated version comment to `1.6.0`.
- [`surf_spots_gps_coordinates.md`](surf_spots_gps_coordinates.md): Updated with new GPS coordinate information.
- Other documentation files (e.g., `README.md`, `DEVELOPER_GUIDE.md`, `DESIGN.md`): General updates.

## [1.5.0] - 2025-10-11

### Added
- **Multi-Language Lyrics Support**: Introduced the ability to display lyrics in multiple languages for releases, enhancing accessibility and user experience for a global audience.
- **Dynamic Language Selection**: Users can now dynamically switch between available lyric languages within the release information panel using a dedicated language selector.
- **Lyrics Caching Mechanism**: Implemented a multi-level caching system (in-memory and session storage) for lyrics to ensure instant language switching and reduce API calls.
- **Accessibility Enhancements for Language Selector**: The language selector includes full keyboard navigation, screen reader announcements, and visual feedback for active/inactive states.
- **Preloading of Lyric Translations**: All available lyric translations for a release are preloaded upon panel opening to provide a seamless language switching experience.

### Changed
- **Release Info Panel**: Enhanced the release information panel to integrate the new multi-language lyrics selector and display.
- **`script.js` Structure**: Refactored `script.js` to include `LyricsLanguageManager` and `LyricsCacheManager` classes for modular and maintainable multi-language lyric functionality.
- **`data-loader.js` Integration**: Updated data loading logic to support fetching and resolving multi-language lyric content.

### Technical Details
- Implemented `LyricsLanguageManager` to manage language preferences per release, handle session storage, and determine initial language based on user preference or defaults.
- Developed `LyricsCacheManager` with LRU (Least Recently Used) eviction policy for efficient in-memory and session storage caching of lyric content.
- Integrated `createLyricsLanguageSelector` function to dynamically generate an accessible UI component for language switching.
- Modified `showReleaseInfo` function in `script.js` to initialize `LyricsLanguageManager` and `LyricsCacheManager`, and render the language selector.
- Added event listeners for language selection buttons to update displayed lyrics and cache new translations.
- Ensured proper handling of lyric content loading, including preloading and fallback mechanisms.

### Files Modified
- [`data/config/app-config.js`](data/config/app-config.js): Updated version number to `1.5.0`.
- [`index.html`](index.html): Updated version comment to `1.5.0`.
- [`script.js`](script.js):
    - Added `LyricsLanguageManager` and `LyricsCacheManager` classes.
    - Implemented `createLyricsLanguageSelector` utility function.
    - Modified `showReleaseInfo` to incorporate multi-language lyrics functionality.
    - Updated version comment to `1.5.0`.
- [`style.css`](style.css):
    - Added new styles for `.lyrics-language-selector`, `.language-btn`, and related states.
    - Enhanced responsive and accessibility styles for the language selector.
    - Updated version comment to `1.5.0`.
- [`scripts/data-loader.js`](scripts/data-loader.js): Updated to support `getAvailableLyricsLanguages` and `resolveLyricsContent` functions.
- [`multi-language-lyrics-architecture.md`](multi-language-lyrics-architecture.md): New technical documentation detailing the architecture of the multi-language lyrics feature.

## [1.4.0] - 2025-10-10

### Added
- **Clickable Album Art in Release Info Panel**: Album artwork in the release information panel is now clickable to start playback, providing a more intuitive way for users to play music.
- **Clickable Mini Player Elements**: Both the album art and track title in the mini player are now clickable, allowing users to easily open the full release information panel.
- **Smart Playback State Management**: The audio player now intelligently handles playback requests to prevent unnecessary restarts when the same track is already playing.

### Changed
- **Collaborator Panel Position**: Moved the collaborator panel to open from the right side, consistent with other panels in the application for a more uniform user experience.

### Technical Details
- Release panel album art now includes a click event listener that triggers the audio playback mechanism.
- Mini player album art and title elements now have event listeners that open the release info panel with proper navigation context.
- Playback system now compares the requested track ID with the currently playing track to prevent unnecessary restarts.
- All side panels now open from the right side for consistency in navigation patterns.

### Files Modified
- `script.js` - Added click handlers for album art and mini player elements, improved playback state management.
- `style.css` - Updated panel positioning styles for consistent right-side opening.

## [1.3.5] - 2025-10-10

### Added
- **Smart Navigation History System**: Implemented intelligent navigation back functionality for release info panels, leveraging URL parameters (`?returnTo=`) to track user context.
- **Context-Aware Panel Navigation**: Release info panels now intelligently return users to their previous context (discography, collaborator panel, or main screen) upon closing.
- **Extensible Navigation Architecture**: Designed the system to easily accommodate future panels (e.g., surf map) by adding new context types.
- **Session Storage Integration**: Utilizes session storage to maintain collaborator state across navigation transitions, ensuring a seamless return to specific collaborator details.

### Fixed
- **Mobile Responsiveness**: Resolved critical issue where the site displayed the desktop version on mobile devices by adding the missing viewport meta tag to `index.html`.

### Changed
- **Panel Close Behavior**: Enhanced release info panel close handler with smart navigation logic.
- **Event Delegation**: Updated release panel opening to capture and store navigation context.
- **Version Management**: Improved version tracking system with centralized configuration in `app-config.js`, including comments to ensure consistency across `index.html`, `script.js`, and `style.css`.
- **Footer Version Display**: Removed the application version display from the website footer.

### Technical Details
- Navigation history managed through URL parameters without complex state management.
- Session storage used for maintaining collaborator context.
- No transition animations or performance impact.
- Backward compatible with existing navigation patterns.

### Files Modified
- `script.js` - Added navigation history management system.
- `data/config/app-config.js` - Updated version, added version management documentation.
- `index.html` - Updated version comment, added viewport meta tag, removed footer version display.
- `style.css` - Updated version comment.
- `README.md` - Updated to include smart navigation system details.
- `DEVELOPER_GUIDE.md` - Added detailed section on the smart navigation history system.
- `DESIGN.md` - Enhanced UX strategy section with smart navigation system details.

## [1.3.4] - 2025-10-08

### Added
- **Enhanced Release Info Panel**: Implemented improvements to the release info panel, including support for large cover art and a tabbed interface for story, lyrics, and gallery content.
- **SEO Tags**: Added comprehensive SEO meta tags to `index.html` for improved search engine visibility.

### Changed
- **Content Updates**: Updated content for 'Cumbia del Barrio', including story text, media assets, and streaming links.

## [1.3.3] - 2025-10-07

### Added
- **New Artist Bio Content**: Incorporated updated artist biography and tagline content.
- **Content Slugs**: Introduced new slugs for content management.

### Changed
- **Footer Refactoring**: Refactored footer information for better maintainability.

## [1.3.0] - 2025-10-07

### Added
- **Sample Data**: Included sample data for 'Tendido Cero Sentido'.

### Changed
- **Collaborator Songs Data Refactoring**: Significant data refactoring for how collaborator songs are managed and displayed.

## [1.2.1] - 2025-10-07

### Changed
- **Discography Card Icons**: Refactored discography cards to display streaming icons in the bottom right corner.

## [1.1.8] - 2025-10-07

### Changed
- **Discography Card Redesign**: Implemented a redesign of the discography cards for improved aesthetics and user experience.

## [1.1.7] - 2025-10-05

### Added
- **Audio Format Switch**: Implemented a switch to AAC (m4a) audio format for 'Cumbia del Barrio', indicating general audio format updates for performance.

### Changed
- **General Refactoring & Panel Improvements**: Performed general code refactoring and improvements to panel functionalities.

## [1.0.9] - 2025-10-04

### Added
- **Mini Player Progress Bar**: Implemented a dynamic progress bar for the mini audio player, enhancing playback control and visual feedback.

## [1.0.7] - 2025-10-04

### Added
- **Release Info Overlay**: Introduced a dedicated overlay for displaying detailed release information.

### Fixed
- **Mini Player Regression Fixes**: Addressed several regression bugs related to the mini player.
- **Missing Icons Fix**: Corrected issues with missing icons for external links.
- **Scroll to Top Behavior**: Fixed incorrect scroll-to-top behavior when the side panel was open.
- **Mini Player Error Message**: Removed misleading error messages when closing the mini player.
- **Tooltip Adjustments**: Applied various adjustments to tooltips for better display and functionality.

### Changed
- **Collaborator and Navigation Panel Improvements**: Implemented general improvements for collaborator and navigation panels.

## Initial Release - 2025-09-21

### Added
- **Basic Website Structure**: Initial setup of `index.html`, `style.css`, and `script.js`.
- **Core Sections**: Hero, Music, About, and Collaborations sections.
- **SVG Icon Definitions**: Integrated SVG sprite for efficient icon usage.
- **Basic Navigation**: Main navigation and mobile hamburger menu.
- **Audio Player Skeleton**: Basic structure for the mini audio player.
- **Data Loading Mechanism**: Initial implementation of the data loading from `/data` directory.
- **Initial Content**: Placeholder content and basic data structures.
- **Project Documentation**: Initial `README.md`, `DEVELOPER_GUIDE.md`, and `DESIGN.md`.