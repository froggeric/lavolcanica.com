/**
 * @fileoverview Unified Interaction Manager for the Surf Map.
 * @description This module provides a centralized class for handling all user
 * interactions (mouse and touch) for the main map and minimap. It uses a
 * state machine to distinguish between gestures like tap, double-tap, drag,
 * and pinch, and emits semantic events that other components can subscribe to.
 */

export class InteractionManager {
    /**
     * @param {HTMLCanvasElement} canvas - The main map canvas element.
     * @param {HTMLCanvasElement} minimapCanvas - The minimap canvas element.
     * @param {Object} state - The shared map state.
     * @param {Object} options - Configuration options.
     */
    constructor(canvas, minimapCanvas, state, options = {}) {
        this.canvas = canvas;
        this.minimapCanvas = minimapCanvas;
        this.state = state;

        this.options = {
            dragThreshold: 5,
            doubleTapDelay: 300,
            ...options
        };

        this.interactionState = {
            state: 'idle', // idle, dragging, pinching
            isTap: true,
            dragStartX: 0,
            dragStartY: 0,
            lastTouchTime: 0,
            tapCount: 0,
            doubleTapTimeout: null
        };

        this.boundHandlers = {
            handleEvent: this.handleEvent.bind(this)
        };

        this.initEventListeners();
    }

    /**
     * Initializes all event listeners.
     */
    initEventListeners() {
        const events = ['mousedown', 'mousemove', 'mouseup', 'wheel', 'touchstart', 'touchmove', 'touchend', 'contextmenu'];
        events.forEach(event => {
            this.canvas.addEventListener(event, this.boundHandlers.handleEvent, { passive: false });
            if (this.minimapCanvas) {
                this.minimapCanvas.addEventListener(event, this.boundHandlers.handleEvent, { passive: false });
            }
        });
    }

    /**
     * Central event handler.
     * @param {Event} event - The event object.
     */
    handleEvent(event) {
        event.preventDefault();
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';

        switch (event.type) {
            case 'mousedown':
            case 'touchstart':
                this.handleStart(event, target);
                break;
            case 'mousemove':
            case 'touchmove':
                this.handleMove(event, target);
                break;
            case 'mouseup':
            case 'touchend':
                this.handleEnd(event, target);
                break;
            case 'wheel':
                this.handleWheel(event, target);
                break;
            case 'contextmenu':
                // Prevent context menu
                break;
        }
    }

    /**
     * Handles the start of an interaction (mousedown or touchstart).
     * @param {Event} event - The event object.
     * @param {string} target - The event target ('map' or 'minimap').
     */
    handleStart(event, target) {
        const point = this.getPoint(event);
        const now = Date.now();

        this.interactionState.isTap = true;
        this.interactionState.dragStartX = point.clientX;
        this.interactionState.dragStartY = point.clientY;
        this.interactionState.lastX = point.clientX;
        this.interactionState.lastY = point.clientY;

        if (event.type === 'touchstart') {
            const touches = event.touches;
            if (touches.length === 1) {
                this.interactionState.state = 'dragging';
            } else if (touches.length === 2) {
                this.interactionState.state = 'pinching';
                this.interactionState.isTap = false;
                const touch1 = touches[0];
                const touch2 = touches[1];
                this.interactionState.pinchStartDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
            }

            // Double tap detection
            if (now - this.interactionState.lastTouchTime < this.options.doubleTapDelay) {
                this.interactionState.tapCount++;
                if (this.interactionState.tapCount === 2) {
                    this.emit('doubletap', { ...point, target });
                    this.interactionState.tapCount = 0;
                    clearTimeout(this.interactionState.doubleTapTimeout);
                    return;
                }
            } else {
                this.interactionState.tapCount = 1;
            }
            this.interactionState.lastTouchTime = now;
            this.interactionState.doubleTapTimeout = setTimeout(() => {
                this.interactionState.tapCount = 0;
            }, this.options.doubleTapDelay);

        } else { // mousedown
            this.interactionState.state = 'dragging';
        }
    }

    /**
     * Handles move events (mousemove or touchmove).
     * @param {Event} event - The event object.
     * @param {string} target - The event target.
     */
    handleMove(event, target) {
        if (this.interactionState.state === 'idle') return;

        const point = this.getPoint(event);
        const deltaX = point.clientX - this.interactionState.lastX;
        const deltaY = point.clientY - this.interactionState.lastY;
        this.interactionState.lastX = point.clientX;
        this.interactionState.lastY = point.clientY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > this.options.dragThreshold) {
            this.interactionState.isTap = false;
        }

        if (this.interactionState.state === 'dragging') {
            this.emit('drag', { deltaX, deltaY, target });
        }

        if (this.interactionState.state === 'pinching') {
            const touches = event.touches;
            if (touches.length === 2) {
                const touch1 = touches[0];
                const touch2 = touches[1];
                const distance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                const scale = distance / this.interactionState.pinchStartDistance;
                this.emit('pinch', { scale, target });
            }
        }
    }

    /**
     * Handles the end of an interaction (mouseup or touchend).
     * @param {Event} event - The event object.
     * @param {string} target - The event target.
     */
    handleEnd(event, target) {
        if (this.interactionState.isTap) {
            this.emit('tap', { x: this.interactionState.dragStartX, y: this.interactionState.dragStartY, target });
        }

        if (this.interactionState.state === 'dragging') {
            this.emit('dragend', { target });
        }

        if (this.interactionState.state === 'pinching') {
            this.emit('pinchend', { target });
        }

        this.resetInteractionState();
    }

    /**
     * Handles wheel events for zooming.
     * @param {WheelEvent} event - The wheel event.
     * @param {string} target - The event target.
     */
    handleWheel(event, target) {
        const point = this.getPoint(event);
        this.emit('zoom', { delta: -event.deltaY, ...point, target });
    }

    /**
     * Resets the interaction state.
     */
    resetInteractionState() {
        this.interactionState = {
            state: 'idle',
            isTap: true,
            dragStartX: 0,
            dragStartY: 0,
            lastTouchTime: this.interactionState.lastTouchTime,
            tapCount: this.interactionState.tapCount,
            doubleTapTimeout: this.interactionState.doubleTapTimeout
        };
    }

    /**
     * Gets the coordinates of a mouse or touch event.
     * @param {Event} event - The event object.
     * @returns {Object} The clientX and clientY coordinates.
     */
    getPoint(event) {
        if (event.touches && event.touches.length > 0) {
            return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
        }
        return { clientX: event.clientX, clientY: event.clientY };
    }

    /**
     * Emits a custom event.
     * @param {string} eventName - The name of the event.
     * @param {Object} detail - The event detail.
     */
    emit(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.canvas.dispatchEvent(event);
    }

    /**
     * Destroys the interaction manager and cleans up event listeners.
     */
    destroy() {
        const events = ['mousedown', 'mousemove', 'mouseup', 'wheel', 'touchstart', 'touchmove', 'touchend', 'contextmenu'];
        events.forEach(event => {
            this.canvas.removeEventListener(event, this.boundHandlers.handleEvent);
            if (this.minimapCanvas) {
                this.minimapCanvas.removeEventListener(event, this.boundHandlers.handleEvent);
            }
        });
    }
}
