# Surf Map Refinement Plan

This plan outlines the steps to fix the remaining issues with the surf map implementation.

## Phase 1: Fix Core Functionality

### 1.1. Implement GPS Coordinate System
- [ ] Create a new configuration file `data/config/map-config.js` to store the GPS boundaries of the map image.
- [ ] Update all surf spot `.json` files in `data/surfspots/` with realistic GPS coordinates within Fuerteventura's coastal boundaries.
- [ ] Refine the `gpsToPixel` function in `scripts/surf-map/surf-spots.js` to use the new map boundary configuration for accurate coordinate conversion.
- [ ] Update the `SurfSpotsManager` to load the map configuration and use it for coordinate conversion.

### 1.2. Fix Marker Rendering
- [ ] Ensure `SurfMarkersManager` in `scripts/surf-map/surf-markers.js` creates markers with the correct pixel coordinates from the `SurfSpotsManager`.
- [ ] Add logging to verify that markers are being created and that their coordinates are within the map's dimensions.

### 1.3. Fix Minimap Navigation
- [ ] In `scripts/surf-map/surf-minimap.js`, modify `handleMouseDown` to check if the click is within the viewport indicator's bounds before initiating a drag.
- [ ] Refine the drag logic in `handleMouseMove` to accurately move the viewport based on the mouse's movement.

## Phase 2: Fix UI and Interaction Issues

### 2.1. Fix Filter Functionality
- [ ] In `scripts/surf-map/surf-map-core.js`, ensure the event listener for the filter toggle button is correctly attached.
- [ ] Debug the `togglePanel` method in `scripts/surf-map/surf-filters.js` to ensure the filter panel is displayed when the icon is clicked.

### 2.2. Configure Maximum Zoom Level
- [ ] Add a `surfMap` configuration object with a `maxZoom` property to `data/config/app-config.js`.
- [ ] Modify `script.js` to read the `maxZoom` value and pass it to the `SurfMap` constructor.

## Phase 3: Testing and Validation
- [ ] Switch to `test-engineer` mode.
- [ ] Systematically test all fixed functionalities:
    - Marker visibility on initial load.
    - Minimap navigation accuracy.
    - Filter panel toggling and functionality.
    - Search result marker display.
    - Configurable maximum zoom.
- [ ] Perform regression testing on all other map features.