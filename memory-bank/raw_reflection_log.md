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
