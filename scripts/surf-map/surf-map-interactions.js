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
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleMouseMove(event) {
        if (this.surfMap.markersManager) {
            this.surfMap.markersManager.handleHover(event);
        }
    }

    handleTap({ detail }) {
        if (this.surfMap.markersManager) {
            this.surfMap.markersManager.handleTap(detail);
        }
    }

    handleDrag({ detail }) {
        this.panVelocity.x = detail.deltaX;
        this.panVelocity.y = detail.deltaY;
        if (!this.isPanning) {
            this.isPanning = true;
            this.startPanning();
        }
    }

    handleDragEnd() {
        this.isPanning = false;
    }

    startPanning() {
        if (!this.panAnimationFrame) {
            this.panAnimationFrame = requestAnimationFrame(() => {
                if (this.isPanning) {
                    this.state.panX += this.panVelocity.x;
                    this.state.panY += this.panVelocity.y;
                    this.panVelocity.x *= 0.92; // Damping
                    this.panVelocity.y *= 0.92; // Damping
                    this.surfMap.constrainPan();
                    this.surfMap.render();
                    this.panAnimationFrame = null;
                    this.startPanning();
                } else {
                    this.surfMap.emit('panChanged', {
                        panX: this.state.panX,
                        panY: this.state.panY
                    });
                    this.panAnimationFrame = null;
                }
            });
        }
    }

    handlePinch({ detail }) {
        const { scale, clientX, clientY } = detail;
        const rect = this.surfMap.viewport.getVisibleRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;

        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom * scale)
        );

        if (Math.abs(newZoom - this.state.zoom) > 1e-6) {
            this.state.zoom = newZoom;
            this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
            this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
            this.surfMap.constrainPan();
            this.surfMap.forceRender();
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    handleZoom({ detail }) {
        const { delta, clientX, clientY } = detail;
        const zoomSensitivity = 0.01;
        const rect = this.surfMap.viewport.getVisibleRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;

        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom + delta * zoomSensitivity)
        );

        if (Math.abs(newZoom - this.state.zoom) > 1e-6) {
            this.state.zoom = newZoom;
            this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
            this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
            this.surfMap.constrainPan();
            this.surfMap.forceRender();
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
