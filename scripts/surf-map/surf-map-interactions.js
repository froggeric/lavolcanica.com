import { InteractionManager } from './interaction-manager.js';

/**
 * @fileoverview Interaction handler for the SurfMap component.
 * @description This module contains the SurfMapInteractions class that handles all
 * user interactions with the surf map, including pan, zoom, and touch gestures.
 */

/**
 * Interaction handler class for the SurfMap component.
 */
export class SurfMapInteractions {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Object} state - The map state object.
     * @param {SurfMap} surfMap - The SurfMap instance.
     */
    constructor(canvas, state, surfMap) {
        this.canvas = canvas;
        this.state = state;
        this.surfMap = surfMap;
        this.interactionManager = new InteractionManager(canvas, null, state);
        this.panVelocity = { x: 0, y: 0 };
        this.isPanning = false;

        this.canvas.addEventListener('tap', this.handleTap.bind(this));
        this.canvas.addEventListener('drag', this.handleDrag.bind(this));
        this.canvas.addEventListener('dragend', this.handleDragEnd.bind(this));
        this.canvas.addEventListener('zoom', this.handleZoom.bind(this));
        this.canvas.addEventListener('pinch', this.handlePinch.bind(this));
        this.canvas.addEventListener('doubletap', this.handleDoubleTap.bind(this));
    }

    handleTap({ detail }) {
        if (this.surfMap.markersManager) {
            this.surfMap.markersManager.handleTap(detail);
        }
    }

    handleDrag({ detail }) {
        this.state.panX += detail.deltaX;
        this.state.panY += detail.deltaY;
        this.surfMap.constrainPan();
        this.surfMap.render();
    }

    handleDragEnd() {
        // No inertia for now, just emit the final pan position
        this.surfMap.emit('panChanged', {
            panX: this.state.panX,
            panY: this.state.panY
        });
    }

    handlePinch({ detail }) {
        const { scale } = detail;
        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom * scale)
        );

        if (newZoom !== this.state.zoom) {
            this.state.zoom = newZoom;
            this.surfMap.constrainPan();
            this.surfMap.render();
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    handleZoom({ detail }) {
        const { delta, clientX, clientY } = detail;
        const zoomSensitivity = 0.01;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const dpr = this.surfMap.devicePixelRatio || 1;
        const scaledMouseX = mouseX * dpr;
        const scaledMouseY = mouseY * dpr;

        const imageX = (scaledMouseX - this.state.panX * dpr) / (this.state.zoom * dpr);
        const imageY = (scaledMouseY - this.state.panY * dpr) / (this.state.zoom * dpr);

        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom + delta * zoomSensitivity)
        );

        if (newZoom !== this.state.zoom) {
            this.state.zoom = newZoom;
            this.state.panX = (scaledMouseX - imageX * this.state.zoom * dpr) / dpr;
            this.state.panY = (scaledMouseY - imageY * this.state.zoom * dpr) / dpr;
            this.surfMap.constrainPan();
            this.surfMap.render();
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    handleDoubleTap({ detail }) {
        this.handleZoom({ detail: { ...detail, delta: 1 } });
    }

    destroy() {
        this.interactionManager.destroy();
    }
}
