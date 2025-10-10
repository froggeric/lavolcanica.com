# Changelog

All notable changes to the La Sonora Volcánica website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.5] - 2025-10-10

### Added
- **Smart Navigation History System**: Implemented intelligent navigation back functionality for release info panels
- **URL Parameter-Based Context Tracking**: Added navigation context tracking using `?returnTo=` URL parameters
- **Context-Aware Panel Navigation**: Release info panels now intelligently return users to their previous context:
  - From discography panel → returns to discography panel
  - From collaborator panel → returns to same collaborator panel  
  - From main screen → returns to main screen
- **Extensible Navigation Architecture**: System designed to accommodate future panels (e.g., surf map)
- **Session Storage Integration**: Maintains collaborator state across navigation transitions

### Changed
- **Panel Close Behavior**: Enhanced release info panel close handler with smart navigation logic
- **Event Delegation**: Updated release panel opening to capture and store navigation context
- **Version Management**: Improved version tracking system with centralized configuration

### Technical Details
- Navigation history managed through URL parameters without complex state management
- Session storage used for maintaining collaborator context
- No transition animations or performance impact
- Backward compatible with existing navigation patterns

### Files Modified
- `script.js` - Added navigation history management system
- `data/config/app-config.js` - Updated version and added version management documentation
- `index.html` - Updated version comment, removed footer version display
- `style.css` - Updated version comment

## [1.3.4] - Previous Release

### Features
- Audio player with custom controls
- Responsive design with mobile navigation
- Internationalization support (EN, ES, FR)
- Dynamic content population from JSON modules
- Side panels for discography and collaborator details
- Skeleton loading states for improved UX
- Accessibility features (keyboard navigation, ARIA attributes)

---

## Version Management

This project follows semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes that require updates to implementation
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes and minor improvements

The authoritative version number is maintained in `data/config/app-config.js`. When updating versions, ensure consistency across:
- `data/config/app-config.js` (source of truth)
- `index.html` (HTML comment)
- `script.js` (JSDoc comment)
- `style.css` (CSS comment)