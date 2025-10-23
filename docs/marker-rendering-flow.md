# Surf Map Marker Rendering Flow Analysis

This document diagrams the rendering flow to identify the source of the marker duplication issue.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant InteractionManager
    participant SurfMapInteractions
    participant SurfMap
    participant SurfMapRenderer
    participant SurfMarkersManager

    User->>+InteractionManager: wheel (zoom) / pinch
    InteractionManager->>+SurfMapInteractions: emit('zoom') / emit('pinch')
    SurfMapInteractions->>+SurfMap: handleZoom() / handlePinch()
    Note over SurfMapInteractions,SurfMap: State is updated (zoom, panX, panY)
    SurfMapInteractions->>SurfMap: throttledRender()
    
    subgraph Throttled Render Logic
        SurfMap->>SurfMap: render()
    end

    SurfMap->>+SurfMapRenderer: render()
    SurfMapRenderer->>SurfMapRenderer: clear()
    SurfMapRenderer->>SurfMapRenderer: drawImage()
    SurfMap->>-SurfMap: updateMarkerVisibility()
    SurfMap->>+SurfMarkersManager: updateVisibility()
    SurfMarkersManager-->>-SurfMap: 
    
    SurfMap->>+SurfMarkersManager: render()
    SurfMarkersManager->>SurfMarkersManager: clear marker layer (ctx.save/restore)
    SurfMarkersManager->>SurfMarkersManager: renderMarker() for each visible marker
    SurfMarkersManager-->>-SurfMap: 

    Note over SurfMap: Main render loop (requestAnimationFrame) also runs in parallel.

    participant MainLoop as "Render Loop (rAF)"
    MainLoop->>+SurfMap: render()
    Note over MainLoop,SurfMap: This is the second, independent render call!
    SurfMap->>+SurfMapRenderer: render()
    SurfMapRenderer->>SurfMapRenderer: clear()
    SurfMapRenderer->>SurfMapRenderer: drawImage()
    SurfMap->>-SurfMap: updateMarkerVisibility()
    SurfMap->>+SurfMarkersManager: updateVisibility()
    SurfMarkersManager-->>-SurfMap: 
    
    SurfMap->>+SurfMarkersManager: render()
    SurfMarkersManager->>SurfMarkersManager: clear marker layer
    SurfMarkersManager->>SurfMarkersManager: renderMarker()
    SurfMarkersManager-->>-SurfMap: 

```

## Analysis from Diagram

The diagram reveals two independent paths that trigger a full render cycle:

1.  **Interaction Path:** `SurfMapInteractions` calls `throttledRender()` directly in response to a zoom or pinch event.
2.  **Animation Loop Path:** The `startRenderLoop()` in `surf-map-core.js` sets up a `requestAnimationFrame` loop that continuously calls `render()` on its own schedule.

**The Root Cause:**

When a user zooms, the `handleZoom` function in `SurfMapInteractions` updates the map state and calls `throttledRender()`. This triggers the first render. Almost immediately after, the independent `requestAnimationFrame` loop in `SurfMap` fires and sees that the state has changed (because `zoom` and `pan` values are different from the last frame). It then initiates a *second* render.

Even with throttling on the interaction side, the main render loop is not aware of it and proceeds with its own render, causing the markers to be drawn twice. My previous fix on the `SurfMarkersManager` to clear the canvas prevents *infinite* duplication, but it doesn't stop these two distinct render calls from happening in quick succession.

## Proposed Solution

The solution is to have a single source of truth for rendering. The `requestAnimationFrame` loop should be the *only* thing that calls `render()`. The interaction handlers should only update the state and flag that a render is needed.

1.  **Modify `SurfMapInteractions`:** Remove the `throttledRender()` call from `handleZoom` and `handlePinch`. Instead, just update the state and ensure the main loop knows it needs to re-render.
2.  **Modify `SurfMap` (core):** Ensure the main `render()` method in the `requestAnimationFrame` loop correctly picks up the state changes and renders a single, authoritative frame. The `forceRender()` method, which sets `this.needsRender = true`, is the correct way to signal this.

This will ensure a single, coordinated render pipeline, completely eliminating the duplication.

I will now proceed with implementing this fix.
