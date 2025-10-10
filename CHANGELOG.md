# Changelog

All notable changes to the La Sonora Volcánica website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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