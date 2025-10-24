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
        let visible = {
            left: mapRect.left,
            top: mapRect.top,
            right: mapRect.right,
            bottom: mapRect.bottom
        };

        this.overlayElements.forEach(element => {
            if (!element) return;
            const elementRect = element.getBoundingClientRect();

            // Check if the element is actually visible and has dimensions
            if (elementRect.width > 0 && elementRect.height > 0) {
                const intersection = this.getIntersection(visible, elementRect);

                if (intersection) {
                    // If the overlay is at the top, move the visible top down
                    if (Math.abs(intersection.top - visible.top) < 1) {
                        visible.top = intersection.bottom;
                    }
                    // If the overlay is at the bottom, move the visible bottom up
                    if (Math.abs(intersection.bottom - visible.bottom) < 1) {
                        visible.bottom = intersection.top;
                    }
                    // If the overlay is on the left, move the visible left over
                    if (Math.abs(intersection.left - visible.left) < 1) {
                        visible.left = intersection.right;
                    }
                    // If the overlay is on the right, move the visible right over
                    if (Math.abs(intersection.right - visible.right) < 1) {
                        visible.right = intersection.left;
                    }
                }
            }
        });

        return {
            left: visible.left,
            top: visible.top,
            right: visible.right,
            bottom: visible.bottom,
            width: visible.right - visible.left,
            height: visible.bottom - visible.top
        };
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
