/**
 * @fileoverview Viewport class for the Surf Map.
 * @description This module provides a class to calculate the visible area of the map,
 * taking into account any overlaying UI elements.
 */

export class Viewport {
    /**
     * @param {HTMLElement} mapContainer - The main map container element.
     * @param {Array<HTMLElement>} overlayElements - An array of elements that overlay the map.
     */
    constructor(mapContainer, overlayElements = []) {
        this.mapContainer = mapContainer;
        this.overlayElements = overlayElements;
    }

    /**
     * Calculates the visible rectangle of the map.
     * @returns {Object} An object with x, y, width, and height properties.
     */
    getVisibleRect() {
        const mapRect = this.mapContainer.getBoundingClientRect();
        let visibleRect = {
            left: mapRect.left,
            top: mapRect.top,
            right: mapRect.right,
            bottom: mapRect.bottom,
            width: mapRect.width,
            height: mapRect.height
        };

        this.overlayElements.forEach(element => {
            const elementRect = element.getBoundingClientRect();
            const intersection = this.getIntersection(visibleRect, elementRect);

            if (intersection) {
                // For simplicity, we'll just reduce the size of the viewport
                // A more complex implementation could handle multiple, non-overlapping overlays
                if (intersection.width > 0 && intersection.height > 0) {
                    if (intersection.left > visibleRect.left) {
                        visibleRect.width -= intersection.width;
                    }
                    if (intersection.top > visibleRect.top) {
                        visibleRect.height -= intersection.height;
                    }
                }
            }
        });

        return visibleRect;
    }

    /**
     * Calculates the intersection of two rectangles.
     * @param {Object} rect1 - The first rectangle.
     * @param {Object} rect2 - The second rectangle.
     * @returns {Object|null} The intersection rectangle, or null if they don't intersect.
     */
    getIntersection(rect1, rect2) {
        const x1 = Math.max(rect1.left, rect2.left);
        const y1 = Math.max(rect1.top, rect2.top);
        const x2 = Math.min(rect1.right, rect2.right);
        const y2 = Math.min(rect1.bottom, rect2.bottom);

        if (x1 < x2 && y1 < y2) {
            return { left: x1, top: y1, right: x2, bottom: y2, width: x2 - x1, height: y2 - y1 };
        } else {
            return null;
        }
    }
}
