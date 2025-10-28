---
Date: 2025-10-24
TaskRef: "Fix canvas marker rendering bugs (hover, selection, shadow)"

Learnings:
- **Canvas Context State Management:** When rendering multiple objects in a loop on an HTML canvas, `ctx.save()` and `ctx.restore()` are critical for isolating transformations (translate, scale). However, they can also unintentionally persist state like shadows across iterations if not managed carefully.
- **Resetting Canvas State:** A common bug ("ghosting" shadows) occurs when shadow properties (`shadowBlur`, `shadowColor`) are not explicitly reset after an object that uses them is drawn. The `ctx.restore()` call might revert the context to a state that *still has the shadow enabled* from a previous frame or a higher-level save, causing subsequent objects in the same render loop to incorrectly inherit the shadow.
- **Robust Shadow Reset:** The most reliable way to disable a shadow before drawing subsequent objects (like hover rings) is to reset all shadow properties explicitly (e.g., `ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;`). Simply setting `shadowBlur = 0` is not always sufficient. This should be done *after* drawing the shadowed object and *before* drawing any non-shadowed objects within the same `save`/`restore` block.

Difficulties:
- The initial diagnosis of the "ghost shadow" bug was difficult. It appeared intermittent because it depended on the state of the canvas context from the *previous* render cycle. The fix was not just to reset the shadow at the end of the function, but to reset it at the correct point *within* the rendering logic for a single marker.

Successes:
- The fix of resetting shadow properties immediately after drawing the main marker circle and before drawing the hover/selection rings was effective in solving both the "ghost shadow" bug and preventing the rings themselves from having an unwanted shadow.
- The logic for handling marker selection state across different user interactions (direct tap, search result click, panel close) is now consistent. The key was ensuring `selectMarker()` is called immediately and that closing the panel does not call `deselectAllMarkers()`.

Improvements_Identified_For_Consolidation:
- General pattern: When debugging canvas rendering, always suspect state pollution. Explicitly reset properties (`shadow`, `globalAlpha`, etc.) within a render loop rather than relying solely on `save()`/`restore()` to manage state between drawn objects.
- Project Specific: The `renderIndividualMarker` function in this project is a good example of complex, stateful canvas drawing that requires careful ordering of operations and state resets.
---
---
Date: 2025-10-25
TaskRef: "Fix surf map marker selection indicator rendering order"

Learnings:
- **Async UI Race Conditions:** Identified a classic race condition where a synchronous state update (`selectMarker`) was not visually rendered before a subsequent action (`showSurfSpotPanel`) was triggered, because the rendering itself happens asynchronously via `requestAnimationFrame`.
- **Ensuring Paint Before Action:** The most robust solution is to make the event handler `async` and `await` a promise that resolves after the next paint cycle. Waiting for two `requestAnimationFrame` calls provides a stronger guarantee that the browser has completed the paint operation.
- **State Locking for UI Flows:** For user-triggered asynchronous operations, implementing a simple boolean state lock (e.g., `isPanelOpening`) is crucial to prevent new interactions from starting before the current one completes. This avoids unpredictable behavior from rapid clicks or taps.

Difficulties:
- The initial plan correctly identified the need for an `async` approach but was incomplete. It overlooked the necessity of waiting for a full paint cycle and the potential for regressions from rapid user input. The critical review step was vital for identifying these gaps and creating a more resilient solution.

Successes:
- The final implementation was clean and contained within a single file (`surf-map-core.js`), respecting the existing architecture where `SurfMap` acts as the central orchestrator.
- The `forceRenderAndWait` method is a reusable and clear utility for handling similar timing issues in the future.
- A dedicated test file (`test-surf-map-marker-fix.html`) was created, providing a straightforward way to manually verify the fix and prevent future regressions.

Improvements_Identified_For_Consolidation:
- **General Pattern:** When a UI state change must be visually confirmed before a subsequent action, the handler should be `async`. It should `await` a promise that resolves after at least one `requestAnimationFrame`, and ideally two, to ensure the paint has occurred.
- **General Pattern:** Protect user-triggered async UI flows with a state lock to prevent race conditions from multiple, rapid inputs.
---
