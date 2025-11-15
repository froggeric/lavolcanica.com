# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.12.4] - 2025-11-15

### Fixed
- **Character encoding**: Fixed Unicode character display issues in surf spots data (Pájara, Jandía, etc.)
- **GPS coordinates**: Refined coordinates accuracy for several surf spots including Majanicho, Majanichito, and El Hierro
- **Data consistency**: Standardized coordinate precision across surf spot database

## [1.12.3] - 2025-11-15

### Changed
- **Data improvement**: Complete rewrite of surf spots descriptions.
- **Version Increment**: Updated application version to 1.12.3 for release preparation.

## [1.12.2] - 2025-11-14

### 🛠️ Data Improvements
*   **Comprehensive GPS Coordinate Research:** Completed systematic verification and enhancement of GPS coordinates for all 42 Fuerteventura surf spots with multi-language research methodology.
*   **Database Integrity Restoration:** Fixed 15+ major coordinate errors including systematic 65-70km positioning corrections and eliminated coordinate duplication issues.
*   **Professional-Grade Accuracy:** Enhanced coordinate verification rate from 0% to 74% with professional source validation and multi-language research across ES, DE, EN, IT, FR sources.
*   **Living Documentation System:** Established comprehensive research documentation with complete source attribution and methodology for ongoing maintenance.

### 🔧 Technical Improvements
*   **Systematic Error Resolution:** Identified and corrected systematic database integrity issues including placeholder coordinate usage and geographic misclassifications.
*   **Multi-Agent Research Framework:** Successfully implemented autonomous multi-agent batch processing system with 74% verification success rate across 42 surf spots.
*   **Quality Assurance Standards:** Established rigorous source validation protocols with minimum 3 independent sources required for coordinate verification.

## [1.12.1] - 2025-11-13

### ✨ Enhancements
*   **Enhanced Mouse Interactions:** Added comprehensive cursor feedback system with proper visual states for all mouse interactions.
*   **Smart Cursor Management:** Implemented intelligent cursor state management with priority system (marker hover > drag > idle).

### 🎨 UI/UX Enhancements
*   **Visual Cursor Feedback:** Added grab/grabbing/pointer cursor states that properly indicate current interaction mode.
*   **Cross-Browser Compatibility:** Enhanced cursor styles with vendor prefixes for consistent behavior across all browsers.
*   **Professional User Experience:** Improved visual feedback provides clear indication of map state and interaction capabilities.

### 🛠️ Technical Improvements
*   **Drag State Tracking:** Added comprehensive drag state management in interaction handler for proper cursor lifecycle.
*   **CSS Class-Based Approach:** Migrated from inline styles to CSS classes for better maintainability and performance.
*   **Hover State Coordination:** Enhanced hover logic to properly coordinate between drag states and marker hover interactions.

### 🔧 Accessibility Features
*   **Enhanced Visual Feedback:** Improved accessibility with clear visual indicators for different interaction modes.
*   **Focus Management:** Better coordination between cursor states and accessibility features.

## [1.12.0] - 2025-11-13

### ✨ Enhancements
*   **Comprehensive Keyboard Navigation System:** Added full keyboard controls for surf map navigation including arrow keys for panning, +/- for zoom, 0 for reset view, Escape for panel closing, and ? for shortcuts panel.
*   **Keyboard Shortcuts Panel:** Added a discoverable keyboard shortcuts panel with visual indicators and help documentation.

### 🛠️ Technical Improvements
*   **New Keyboard Handler Module:** Created modular `KeyboardHandler` class for centralized keyboard event management with configurable options.
*   **Smart Input Detection:** Implemented intelligent typing detection to prevent keyboard shortcuts from interfering with form inputs and search functionality.
*   **Continuous Panning System:** Added smooth, hardware-accelerated continuous panning when holding arrow keys with performance optimizations.

### 🎨 UI/UX Enhancements
*   **Visual Keyboard Shortcuts:** Added discoverable "?" button and elegantly designed shortcuts panel with proper HTML entity encoding for cross-browser compatibility.
*   **Responsive Shortcuts Panel:** Mobile-friendly keyboard shortcuts interface with smooth animations and proper positioning.
*   **Enhanced User Feedback:** Added visual and audio feedback for keyboard interactions with proper focus management.

### 🔧 Accessibility Features
*   **Full Keyboard Support:** Complete keyboard navigation for all surf map functions without requiring mouse/touch input.
*   **Screen Reader Optimization:** Enhanced ARIA labels and live regions for keyboard navigation state changes.
*   **Focus Management:** Proper focus trapping and visual indicators for keyboard users.

### 📚 Documentation Updates
*   **Keyboard Navigation Documentation:** Added comprehensive documentation for all keyboard shortcuts and accessibility features.

## [1.11.0] - 2025-11-13

### ✨ Enhancements
*   **Collapsible Search Panel (Desktop & Mobile):** Implemented a sophisticated collapsible search panel for the surf map with manual toggle on desktop and intelligent auto-collapse on mobile devices.
*   **Smooth Zoom Animations:** Added hardware-accelerated smooth zoom animations with customizable easing curves for mouse wheel zoom interactions.
*   **Surf Map Navigation Control:** Added configuration-based visibility control for surf map navigation entries, allowing the feature to be safely hidden when disabled.
*   **Enhanced Map State Management:** Implemented map state preservation and restoration when opening/closing surf spot detail panels, maintaining zoom and pan positions.

### 🛠️ Technical Improvements
*   **Advanced Zoom Control:** Refactored zoom system with `zoomToPoint()` method for precise zoom centering and strict zoom boundary enforcement.
*   **Performance Optimizations:** Enhanced viewport culling, coordinate caching, and animation frame management for improved rendering performance.
*   **Responsive Design:** Added comprehensive CSS for collapsible panel functionality with proper breakpoint handling and mobile optimization.

### 🎨 UI/UX Enhancements
*   **Keyboard Accessibility:** Added Ctrl+/ keyboard shortcut to toggle the search panel, improving accessibility for power users.
*   **Visual Feedback:** Implemented pulsing glow indicators for collapsed state and smooth transitions with proper ARIA attributes.
*   **Mobile Optimization:** Auto-collapse behavior on mobile maximizes screen space when viewing surf spot details.

### 📱 Mobile Enhancements
*   **Auto-Collapse Behavior:** Search panel automatically collapses when surf spot details are opened, providing more screen space for content.
*   **Smart Expansion:** Panel automatically re-expands when returning from surf spot details, maintaining seamless user flow.
*   **Touch Optimization:** Improved touch targets and gesture handling for better mobile user experience.

### 🔧 Accessibility Features
*   **Full ARIA Support:** Proper `aria-expanded`, `aria-label`, and `aria-controls` attributes throughout the collapsible panel.
*   **Screen Reader Support:** Live region announcements for state changes and comprehensive keyboard navigation.
*   **Reduced Motion:** Respects user's motion preferences with `prefers-reduced-motion` support.
*   **High Contrast Mode:** Enhanced visual indicators for users with high contrast preferences.

### 📚 Documentation Updates
*   **Developer Guide:** Added comprehensive documentation for the new collapsible search panel feature in the developer guide.
*   **Architecture Documentation:** Updated technical documentation to reflect new interaction patterns and state management.

## [1.10.7] - 2025-11-13

### Changed
- **Version Increment**: Updated application version to 1.10.7 for release preparation.
- **Code Quality**: General maintenance and optimization of existing features.

## [1.10.6] - 2025-11-13

### ✨ Enhancements
*   **Collapsible Search Panel (Desktop):** Added a manual toggle button that allows users to collapse the search panel on desktop for better map visibility. Features smooth animations and a pulsing glow indicator when collapsed.
*   **Auto-Collapse Search Panel (Mobile):** Implemented intelligent auto-collapse of the search panel on mobile devices when viewing surf spot details, providing more screen space for the content.
*   **Keyboard Accessibility:** Added Ctrl+/ keyboard shortcut to toggle the search panel, improving accessibility for power users.
*   **Enhanced Visual Feedback:** Implemented smooth GPU-accelerated animations for all panel transitions with proper easing curves.

### 🛠️ Fixes
*   **CRITICAL FIX:** Resolved a stack overflow error in the interaction manager that could occur during rapid mouse movement by changing the mousemove listener to passive mode.
*   **Fixed:** Corrected zoom button coordinate calculations for high-DPI (Retina) displays, ensuring proper centering of zoom operations.
*   **Fixed:** Improved mouse wheel zoom with smooth animations and intelligent acceleration based on scroll speed.

### 🎨 UI/UX Improvements
*   **Responsive Design:** Enhanced mobile responsiveness with better breakpoint handling and touch-optimized interactions.
*   **Accessibility:** Full ARIA support, high contrast mode compatibility, and reduced motion preferences for the collapsible panel.
*   **Visual Polish:** Added subtle visual indicators including a pulsing glow effect for collapsed state and smooth hover transitions.

### 📱 Mobile Enhancements
*   **Auto-Collapse Behavior:** Search panel automatically collapses when surf spot details are opened, maximizing available screen space.
*   **Touch Optimization:** Improved touch targets and gesture handling for better mobile user experience.
*   **Performance:** Optimized rendering performance for mobile devices with adaptive frame rates.

### 🔧 Technical Improvements
*   **CSS Architecture:** Added 130+ lines of specialized CSS for collapsible panel functionality with proper cascade management.
*   **Event Handling:** Enhanced event listener management with proper cleanup and performance optimization.
*   **Animation System:** Implemented hardware-accelerated animations using CSS transforms and proper timing functions.

## [1.10.5] - 2025-11-09

### ⚡ Performance
*   **Zero-Latency Panning:** The drag-to-pan interaction has been fundamentally optimized to update the map's position in the same frame as the user's input.
*   **Optimized Event Listeners:** The `mousemove` event listener is now configured as `{ passive: true }`, which prevents it from blocking the browser's main thread.
*   **Refined Momentum Physics:** The momentum calculation now uses an exponential weighting system for velocity, resulting in a smoother and more accurate "flick-to-scroll" effect.

### ✨ Enhancements
*   **Animated Mouse Wheel Zoom:** Mouse wheel zooming is now animated smoothly over 200ms with a pleasant easing curve.
*   **Improved Zoom Responsiveness:** The mouse wheel zoom now features intelligent acceleration, scaling its speed based on how fast the user is scrolling.
*   **Improved Zoom Button Feel:** The zoom-in/out UI buttons now have a slightly larger zoom increment and are animated.

### 🛠️ Fixes
*   **CRITICAL FIX:** Fixed a stack overflow error that could occur during rapid mouse movement.
*   **Fixed:** The zoom-in/out UI buttons now correctly center the map on high-DPI (Retina) displays.
*   **Fixed:** The underlying mathematics for mouse wheel zooming have been corrected to use multiplicative scaling.

## [1.10.4] - 2025-11-09

### Fixed
- Centralized the surf map's GPS boundary configuration into `data/config/app-config.js`.
- Refactored `scripts/surf-map/surf-spots.js` to use the new centralized configuration.
- Updated `README.md` and `docs/DEVELOPER_GUIDE.md` with instructions for the new configuration and the `gps-calculator.html` tool.

## [1.10.3] - 2025-11-08

### Enhancements
*   **Momentum Panning:** The map now supports "flick-to-scroll" gestures.
*   **Animated Zooming:** All zoom actions (mouse wheel, UI buttons, double-tap) are now smoothly animated.
*   **Double-Tap to Zoom:** Users can now double-tap on the map to zoom in, centered on the tap location.
*   **Improved Pinch-to-Zoom:** The pinch-to-zoom gesture is now perfectly centered on the midpoint of the user's fingers.

### Fixes
*   **Fixed** a potential regression where marker click/tap coordinates would be inaccurate when the side search panel was visible.
*   **Fixed** a potential regression where desktop hover tooltips on surf spots would have been disabled.
*   **Fixed** an issue in the interaction layer where pinch-to-zoom gestures were not scaling smoothly.
*   **Fixed** a potential JavaScript error by ensuring click detection logic uses the correct `getMarkerAtPosition` method.

### Refactoring & Internal
*   **Refactor:** The `InteractionManager` has been replaced with a more advanced version that includes velocity tracking and a state machine.
*   **Refactor:** The `SurfMapInteractions` class has been enhanced to integrate the new momentum and advanced gesture capabilities.
*   **Performance:** The new momentum system uses a single, interruptible `requestAnimationFrame` loop.

## [1.10.2] - 2025-11-08

### Added
- **Momentum-Based Panning**: Users can now "flick" the map to scroll with friction-based deceleration.
- **Animated Zoom**: All zoom actions are now smoothly animated.
- **Double-Tap to Zoom**: Double-tapping on the map now smoothly zooms in on that point.

### Changed
- **`InteractionManager` Rewrite**: Complete rewrite of user interaction logic with a sophisticated gesture and physics engine.
- **Fixed Pinch-to-Zoom Centering**: Pinch-to-zoom is now centered on the midpoint of the user's fingers.
- **Fixed Jerky Panning**: Replaced with a smooth, `requestAnimationFrame`-based system.

### Internal & Refactoring
- **Architectural Improvement**: Decoupled `SurfMap` core from gesture detection logic.
- **Code Simplification**: Removed the intermediary `SurfMapInteractions` class.

## [1.10.1] - 2025-10-30

### Fixed
- **Tide Chart Logic**: Corrected the tide mapping logic for "Low, Mid" and "Mid, High" combinations.
- **Tide Chart UI**: Removed unnecessary labels and the section indicator bar.
- **Tide Notes Styling**: Updated the tide notes to use the same styling as other informational text.
- **Tide Marker Animation**: Removed the animation from the real-time tide marker.
- **Tide Chart Styling**: Unified the background and border styling of the tide chart with the wind and wave direction indicators.

### Changed
- **Tide Chart Layout**: The tide chart now extends to the full width of the panel's usable area.

## [1.10.0] - 2025-10-29

### Added
- **Surf Spot Panel Real-Time Data**: Implemented the data structure and display logic for future real-time weather information.
- **Graphical Data Displays**: Added dynamic SVG charts for visualizing best season, swell/wind direction, and tides.
- **New Icons**: Added new SVG icons for crowds, seabed, and hazards.

### Changed
- **Surf Spot Panel Redesign**: Complete architectural and visual overhaul of the surf spot details panel.
- **Information Architecture**: Re-organized surf spot details into three logical tabs: "The Vibe", "The Wave", and "The Trip".
- **Visual Hierarchy**: Refined typography, spacing, and element sizing.

### Fixed
- **Paddle Out Title**: Added the missing title for the "Paddle Out" section.

## [1.9.6] - 2025-10-28
*(No changes recorded)*

## [1.9.5] - 2025-10-24

### Fixed
- **Canvas Rendering**: Resolved a "ghost shadow" bug on surf map markers by implementing an explicit shadow reset.
- **Marker Interaction**: Corrected the styling for hover (teal) and selection (gold) indicators.
- **Selection Persistence**: Ensured the marker selection state persists correctly when the details panel is closed.

## [1.9.4] - 2025-10-23

### Fixed
- **Surf Map Marker Duplication**: Resolved a persistent issue where surf spot markers would duplicate during zoom operations.
- **Mobile Panning Restriction**: Fixed a bug where panning on mobile devices was incorrectly restricted when zoomed in.

## [1.9.3] - 2025-10-23

### Fixed
- **Footer Character Encoding**: Resolved UTF-8 encoding issue in the footer copyright text.
- **Footer Layout Structure**: Fixed footer layout to display version information after the copyright text.

### Changed
- **Centralized Footer Configuration**: Implemented centralized footer management through `data/config/app-config.js`.
- **Footer Content Management**: Moved all footer text to central configuration.
- **Dynamic Footer Generation**: Refactored `populateFooterLinks()` function to generate footer content dynamically.

## [1.9.2] - 2025-10-23

### Fixed
- **Map Viewport Calculation**: Corrected the initial zoom and minimum zoom calculations to account for overlaying UI elements.
- **Zoom Centering**: Fixed the zoom centering logic to use the visible map area.
- **"Stuck Zoom" Issue**: Resolved an issue where zooming out would get stuck near the minimum zoom level.

### Changed
- **Panning Inertia**: Fine-tuned the damping factor for panning.
- **Smooth Zooming**: Implemented a new `zoomTo` method that animates zoom transitions.

## [1.9.1] - 2025-10-22

### Changed
- **Map Controls**: Refactored the surf map's panning and zooming controls to be smoother and more responsive.
- **InteractionManager**: The `InteractionManager` now correctly calculates drag deltas for smoother panning.
- **Zoom Sensitivity**: Zoom sensitivity is now calibrated to be proportional to the current zoom level.

### Fixed
- **Panning Animation**: Fixed an issue where the panning animation was not being properly cancelled.
- **Pinch-to-Zoom**: Implemented the missing logic for pinch-to-zoom.

## [1.9.0] - 2025-10-22

### Fixed
- **Marker Click/Touch Interaction**: Resolved a critical bug where click and touch events on surf spot markers were not being correctly detected on mobile and tablet devices.

### Changed
- **Coordinate Transformation Logic**: Replaced the faulty inverse coordinate transformation in the marker hit detection.
- **Unified Hit Detection**: Consolidated device-specific hit detection functions into a single, unified `getMarkerAtPosition` function.
- **Touch Handling**: Improved touch event handling to reliably distinguish between `tap` and `drag` gestures.

## [1.8.9] - 2025-10-22

### Fixed
- **Centralized Version Management**: Streamlined version tracking by removing redundant version comments and establishing a single source of truth.
- **Version Display System**: Implemented dynamic version display in the footer that reads from the central configuration.

### Changed
- **Version Management Architecture**: Completely restructured version management to use a centralized approach.

### Added
- **GitHub Shields**: Added Version, License, and Status shields to `README.md`.

## [1.8.8] - 2025-10-22

### Fixed
- **Device-Specific Click Detection**: Resolved critical issue where surf spot marker click areas were misaligned on mobile and tablet devices.
- **Touch Interface Optimization**: Fixed touch coordinate handling to ensure click areas match visual markers exactly.
- **Cross-Platform Consistency**: Eliminated discrepancies between desktop mouse interactions and mobile/tablet touch interactions.

### Changed
- **Complete Click Detection Rewrite**: Rewrote the marker click detection system with device-specific implementations.
- **Enhanced Device Detection**: Improved device detection to properly separate desktop, mobile, and tablet devices.
- **Marker Size Optimization**: Optimized marker sizes and click areas for each device type.

## [1.8.7] - 2025-10-21

### Fixed
- **Marker Sizing System**: Resolved issue where surf spot markers were scaling with the map zoom level.
- **Style Consistency**: Fixed LOD (Level of Detail) system that was changing marker style at low zoom levels.
- **Cross-Device Compatibility**: Ensured marker fixes work consistently across all viewports.

## [1.8.6] - 2025-10-21

### Fixed
- **Coordinate Positioning System**: Resolved fundamental coordinate system mismatch between raster map renderer and surf spot markers.
- **Marker Rendering Transformation**: Fixed transformation sequence in marker rendering to match raster map renderer exactly.
- **Hit Detection Accuracy**: Updated marker hit detection to use inverse transformations for precise coordinate conversion.

### Performance
- **Coordinate Transformation Caching**: Implemented efficient caching system for coordinate transformations.
- **Shared Transformation Logic**: Extracted common transformation sequence into a shared method.
- **Memory Management Optimization**: Added lazy evaluation and early termination for debug reporting.
- **Level of Detail (LOD) System**: Enhanced marker rendering with adaptive simplification at low zoom levels.

### Added
- **Comprehensive Coordinate Validation**: Added `validateCoordinateConversion()` method.
- **Bidirectional Conversion Testing**: Implemented `pixelToGPS()` method for validation.
- **Enhanced Error Handling**: Added robust error handling with recovery mechanisms.
- **Performance Monitoring Tools**: Added transformation matrix caching and coordinate system debugging utilities.
- **Enhanced Documentation**: Comprehensive JSDoc documentation.

## [1.8.3] - 2025-10-20

### Fixed
- **Rapid Marker Refresh Issue**: Resolved excessive marker re-initialization.
- **Search Result Click Issue**: Fixed search result click functionality.
- **Missing Image Placeholder**: Added proper fallback to placeholder image.

## [1.8.2] - 2025-10-19

### Added
- Comprehensive performance optimizations for the surf spot details panel.
- Lazy loading for images using Intersection Observer API.
- Progressive content loading with skeleton screens.
- Optimized DOM manipulation with document fragments.
- Debounced event handlers for resize and scroll events.
- Memory management with proper cleanup methods.
- `requestAnimationFrame`-based animations.
- Data processing and caching system.
- Performance monitoring and metrics collection.
- Multiple performance modes.
- Performance test page for validation and benchmarking.

### Changed
- Enhanced surf spot panel with significant performance improvements.
- Optimized image loading with better error handling.
- Improved animation smoothness across all devices.
- Reduced memory footprint for long-running sessions.

### Fixed
- Memory leaks in event listeners and observers.
- Performance issues with large datasets.
- Animation jank on low-powered devices.

## [1.8.1] - 2025-10-18

### Changed
- **Surf Spot Hero Images**: Updated the surf spot details side panel to use custom images from `images/surf-spots/`.
- **Image Aspect Ratio**: Changed the hero image display to use a 3:2 aspect ratio.

## [1.8.0] - 2025-10-18

### Fixed
- **Surf Map Layout Gap**: Resolved a persistent unwanted gap above the main surf map.

### Changed
- **Surf Map UI Refactoring**: Removed the redundant `.surf-map-header` element for a cleaner layout.

## [1.7.1] - 2025-10-16

### Changed
- **Surf Map Data Structure Update**: Updated the surf map codebase to support the new standardized JSON structure.
- **Enhanced Search Functionality**: Extended search capabilities to include all surf spot properties.
- **Improved Modal Display**: Enhanced the surf spot detail modal to display all available information.
- **Fixed Coordinate Handling**: Corrected coordinate handling to use the proper lat/lng format.

### Fixed
- **Search Functionality**: Fixed search to properly handle the new JSON structure.
- **Modal Display**: Fixed modal to correctly show all surf spot properties.
- **Coordinate Conversion**: Resolved issues with coordinate conversion and display.

## [1.7.0] - 2025-10-14

### Added
- **Dynamic Surf Spots Counter**: Implemented a real-time counter that displays the number of visible surf spots.
- **Enhanced Search Functionality**: Extended search capabilities to work across all surf spot properties.
- **Left-Side Search Control**: Relocated search control to the left side of the screen.
- **Mobile Search Toggle Button**: Added a dedicated mobile search toggle button.

### Changed
- **Surf Map Interface Redesign**: Completely redesigned the surf map interface.
- **Removed Filter Functionality**: Removed the filter functionality completely.
- **Search Control Positioning**: Moved search control from right side to left side.
- **Responsive Behavior Enhancement**: Improved responsive behavior across all device sizes.
- **Accessibility Improvements**: Enhanced accessibility features including ARIA labels, keyboard navigation, and screen reader support.
- **Styling Consistency**: Updated styling throughout the surf map interface.

## [1.6.2] - 2025-10-14

### Changed
- **Surf Map Data Structure Update**: Updated the surf map codebase to support the new standardized JSON structure.
- **Enhanced Search Functionality**: Extended search capabilities to include all surf spot properties.
- **Improved Modal Display**: Enhanced the surf spot detail modal to display all available information.
- **Fixed Coordinate Handling**: Corrected coordinate handling to use the proper lat/lng format.

### Fixed
- **Search Functionality**: Fixed search to properly handle the new JSON structure.
- **Modal Display**: Fixed modal to correctly show all surf spot properties.
- **Coordinate Conversion**: Resolved issues with coordinate conversion and display.

## [1.6.1] - 2025-10-13

### Patch
- **UI Consistency Improvement**: Improved hover effects for close buttons across the application.

## [1.6.0] - 2025-10-13

### Added
- **Surf Map Toggle Configuration**: Implemented a configuration option to toggle the visibility of the surf map feature.
- **Surf Spots Data Structure Documentation**: Created detailed documentation for the consolidated surf spots data structure.
- **Extended GPS Coordinates**: Added GPS coordinates for 21 previously missing surf spots.

### Changed
- **Surf Spot Data Consolidation**: Consolidated 42 individual surf spot JSON files into a single, unified data file.
- **Surf Map Code Update**: Updated the surf map codebase to utilize the newly consolidated surf spot data structure.
- **Navigation Menu Modification**: Modified the main navigation menu to dynamically adapt based on the surf map toggle configuration.

## [1.5.0] - 2025-10-11

### Added
- **Multi-Language Lyrics Support**: Introduced the ability to display lyrics in multiple languages.
- **Dynamic Language Selection**: Users can now dynamically switch between available lyric languages.
- **Lyrics Caching Mechanism**: Implemented a multi-level caching system for lyrics.
- **Accessibility Enhancements for Language Selector**: The language selector includes full keyboard navigation and screen reader support.
- **Preloading of Lyric Translations**: All available lyric translations are preloaded.

### Changed
- **Release Info Panel**: Enhanced the release info panel to integrate the new multi-language lyrics selector.
- **`script.js` Structure**: Refactored to include `LyricsLanguageManager` and `LyricsCacheManager` classes.
- **`data-loader.js` Integration**: Updated data loading logic to support fetching multi-language lyric content.

## [1.4.0] - 2025-10-10

### Added
- **Clickable Album Art in Release Info Panel**: Album artwork in the release info panel is now clickable to start playback.
- **Clickable Mini Player Elements**: Both the album art and track title in the mini player are now clickable.
- **Smart Playback State Management**: The audio player now intelligently handles playback requests.

### Changed
- **Collaborator Panel Position**: Moved the collaborator panel to open from the right side for consistency.

## [1.3.5] - 2025-10-10

### Added
- **Smart Navigation History System**: Implemented intelligent navigation back functionality for release info panels.
- **Context-Aware Panel Navigation**: Release info panels now intelligently return users to their previous context.
- **Extensible Navigation Architecture**: Designed the system to easily accommodate future panels.
- **Session Storage Integration**: Utilizes session storage to maintain collaborator state.

### Fixed
- **Mobile Responsiveness**: Resolved critical issue by adding the missing viewport meta tag to `index.html`.

### Changed
- **Panel Close Behavior**: Enhanced release info panel close handler with smart navigation logic.
- **Event Delegation**: Updated release panel opening to capture and store navigation context.
- **Version Management**: Improved version tracking system with centralized configuration.
- **Footer Version Display**: Removed the application version display from the footer.

## [1.3.4] - 2025-10-08

### Added
- **Enhanced Release Info Panel**: Implemented improvements to the release info panel, including support for large cover art and a tabbed interface.
- **SEO Tags**: Added comprehensive SEO meta tags to `index.html`.

### Changed
- **Content Updates**: Updated content for 'Cumbia del Barrio'.

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
- **Collaborator Songs Data Refactoring**: Significant data refactoring for how collaborator songs are managed.

## [1.2.1] - 2025-10-07

### Changed
- **Discography Card Icons**: Refactored discography cards to display streaming icons in the bottom right corner.

## [1.1.8] - 2025-10-07

### Changed
- **Discography Card Redesign**: Implemented a redesign of the discography cards.

## [1.1.7] - 2025-10-05

### Added
- **Audio Format Switch**: Implemented a switch to AAC (m4a) audio format for 'Cumbia del Barrio'.

### Changed
- **General Refactoring & Panel Improvements**: Performed general code refactoring and improvements to panel functionalities.

## [1.0.9] - 2025-10-04

### Added
- **Mini Player Progress Bar**: Implemented a dynamic progress bar for the mini audio player.

## [1.0.7] - 2025-10-04

### Added
- **Release Info Overlay**: Introduced a dedicated overlay for displaying detailed release information.

### Fixed
- **Mini Player Regression Fixes**: Addressed several regression bugs related to the mini player.
- **Missing Icons Fix**: Corrected issues with missing icons for external links.
- **Scroll to Top Behavior**: Fixed incorrect scroll-to-top behavior.
- **Mini Player Error Message**: Removed misleading error messages.
- **Tooltip Adjustments**: Applied various adjustments to tooltips.

### Changed
- **Collaborator and Navigation Panel Improvements**: Implemented general improvements for collaborator and navigation panels.

## [Initial Release] - 2025-09-21

### Added
- **Basic Website Structure**: Initial setup of `index.html`, `style.css`, and `script.js`.
- **Core Sections**: Hero, Music, About, and Collaborations sections.
- **SVG Icon Definitions**: Integrated SVG sprite for efficient icon usage.
- **Basic Navigation**: Main navigation and mobile hamburger menu.
- **Audio Player Skeleton**: Basic structure for the mini audio player.
- **Data Loading Mechanism**: Initial implementation of the data loading from `/data` directory.
- **Initial Content**: Placeholder content and basic data structures.
- **Project Documentation**: Initial `README.md`, `DEVELOPER_GUIDE.md`, and `DESIGN.md`.
