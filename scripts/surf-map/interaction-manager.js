/**
 * @fileoverview Enhanced Interaction Manager for the Surf Map.
 * @description This module provides a high-performance, mobile-first interaction
 * system with smooth gesture recognition for tap, drag, pinch, and zoom operations.
 * Designed to provide crisp, responsive gesture detection as the foundation for
 * momentum scrolling and natural interactions.
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
            // Gesture recognition thresholds
            dragThreshold: 5,
            doubleTapDelay: 300,
            
            // Zoom configuration
            zoomSpeed: 0.002, // Mouse wheel zoom speed
            
            ...options
        };

        // Interaction state machine
        this.interactionState = {
            mode: 'idle', // idle, dragging, pinching
            isTap: true,
            
            // Touch/mouse tracking
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            lastX: 0,
            lastY: 0,
            
            // Velocity tracking for momentum (in pixels per millisecond)
            velocityX: 0,
            velocityY: 0,
            lastVelocityX: 0,
            lastVelocityY: 0,
            velocityHistory: [], // Store last few velocity samples
            maxVelocityHistory: 5,
            
            // Pinch gesture
            pinchStartDistance: 0,
            pinchLastDistance: 0,
            pinchCenterX: 0,
            pinchCenterY: 0,
            
            // Tap detection
            lastTouchTime: 0,
            tapCount: 0,
            doubleTapTimeout: null,
            
            // Timestamps
            lastMoveTime: 0,
            gestureStartTime: 0
        };

        // Bind event handlers
        this.boundHandlers = {
            handleStart: this.handleStart.bind(this),
            handleMove: this.handleMove.bind(this),
            handleEnd: this.handleEnd.bind(this),
            handleWheel: this.handleWheel.bind(this),
            handleContextMenu: this.handleContextMenu.bind(this)
        };

        this.initEventListeners();
    }

    /**
     * Initializes all event listeners with proper passive flags.
     */
    initEventListeners() {
        // Touch events - must be non-passive to allow preventDefault
        this.canvas.addEventListener('touchstart', this.boundHandlers.handleStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.boundHandlers.handleMove, { passive: false });
        this.canvas.addEventListener('touchend', this.boundHandlers.handleEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', this.boundHandlers.handleEnd, { passive: false });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', this.boundHandlers.handleStart, { passive: false });
        this.canvas.addEventListener('mousemove', this.boundHandlers.handleMove, { passive: false });
        this.canvas.addEventListener('mouseup', this.boundHandlers.handleEnd, { passive: false });
        this.canvas.addEventListener('mouseleave', this.boundHandlers.handleEnd, { passive: false });
        
        // Wheel for zoom
        this.canvas.addEventListener('wheel', this.boundHandlers.handleWheel, { passive: false });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', this.boundHandlers.handleContextMenu, { passive: false });
        
        // Minimap events (if exists)
        if (this.minimapCanvas) {
            this.minimapCanvas.addEventListener('touchstart', this.boundHandlers.handleStart, { passive: false });
            this.minimapCanvas.addEventListener('touchmove', this.boundHandlers.handleMove, { passive: false });
            this.minimapCanvas.addEventListener('touchend', this.boundHandlers.handleEnd, { passive: false });
            this.minimapCanvas.addEventListener('mousedown', this.boundHandlers.handleStart, { passive: false });
        }
    }

    /**
     * Handles the start of an interaction (touchstart or mousedown).
     */
    handleStart(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        const now = Date.now();
        
        if (event.type === 'touchstart') {
            const touches = event.touches;
            
            if (touches.length === 1) {
                // Single touch - prepare for pan or tap
                this.startSingleTouch(touches[0], target, now);
            } else if (touches.length === 2) {
                // Two fingers - pinch zoom
                this.startPinch(touches, target);
            }
        } else {
            // Mouse down - start pan or prepare for click
            this.startSingleTouch(event, target, now);
        }
    }

    /**
     * Starts a single touch/mouse interaction.
     */
    startSingleTouch(point, target, now) {
        const coords = { x: point.clientX, y: point.clientY };
        
        this.interactionState.mode = 'dragging';
        this.interactionState.isTap = true;
        this.interactionState.startX = coords.x;
        this.interactionState.startY = coords.y;
        this.interactionState.currentX = coords.x;
        this.interactionState.currentY = coords.y;
        this.interactionState.lastX = coords.x;
        this.interactionState.lastY = coords.y;
        this.interactionState.gestureStartTime = now;
        this.interactionState.lastMoveTime = now;
        
        // Reset velocity tracking
        this.interactionState.velocityX = 0;
        this.interactionState.velocityY = 0;
        this.interactionState.lastVelocityX = 0;
        this.interactionState.lastVelocityY = 0;
        this.interactionState.velocityHistory = [];
        
        // Handle double tap detection
        if (now - this.interactionState.lastTouchTime < this.options.doubleTapDelay) {
            this.interactionState.tapCount++;
            if (this.interactionState.tapCount === 2) {
                this.emit('doubletap', { clientX: coords.x, clientY: coords.y, target });
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
    }

    /**
     * Starts a pinch gesture.
     */
    startPinch(touches, target) {
        this.interactionState.mode = 'pinching';
        this.interactionState.isTap = false;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Calculate initial distance
        const distance = this.getTouchDistance(touch1, touch2);
        this.interactionState.pinchStartDistance = distance;
        this.interactionState.pinchLastDistance = distance;
        
        // Calculate pinch center
        this.interactionState.pinchCenterX = (touch1.clientX + touch2.clientX) / 2;
        this.interactionState.pinchCenterY = (touch1.clientY + touch2.clientY) / 2;
        
        this.emit('pinchstart', { target });
    }

    /**
     * Handles move events (touchmove or mousemove).
     */
    handleMove(event) {
        event.preventDefault();
        
        if (this.interactionState.mode === 'idle') {
            // Allow mousemove for hover effects even when idle
            if (event.type === 'mousemove') {
                this.canvas.dispatchEvent(new MouseEvent('mousemove', event));
            }
            return;
        }
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        const now = Date.now();
        const timeDelta = Math.max(now - this.interactionState.lastMoveTime, 1); // Avoid division by zero
        
        if (event.type === 'touchmove') {
            const touches = event.touches;
            
            if (touches.length === 1 && this.interactionState.mode === 'dragging') {
                this.handleDragMove(touches[0], target, timeDelta);
            } else if (touches.length === 2 && this.interactionState.mode === 'pinching') {
                this.handlePinchMove(touches, target);
            }
        } else if (this.interactionState.mode === 'dragging') {
            // Mouse move while dragging
            this.handleDragMove(event, target, timeDelta);
        }
        
        this.interactionState.lastMoveTime = now;
    }

    /**
     * Handles drag movement.
     */
    handleDragMove(point, target, timeDelta) {
        const coords = { x: point.clientX, y: point.clientY };
        
        // Calculate delta from last position
        const deltaX = coords.x - this.interactionState.lastX;
        const deltaY = coords.y - this.interactionState.lastY;
        
        // Update positions
        this.interactionState.currentX = coords.x;
        this.interactionState.currentY = coords.y;
        
        // Check if movement exceeds drag threshold
        const totalDeltaX = coords.x - this.interactionState.startX;
        const totalDeltaY = coords.y - this.interactionState.startY;
        const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
        
        if (distance > this.options.dragThreshold) {
            this.interactionState.isTap = false;
        }
        
        // Calculate instantaneous velocity (pixels per millisecond)
        if (timeDelta > 0) {
            const velocityX = deltaX / timeDelta;
            const velocityY = deltaY / timeDelta;
            
            // Add to velocity history for smoothing
            this.interactionState.velocityHistory.push({ x: velocityX, y: velocityY, time: timeDelta });
            if (this.interactionState.velocityHistory.length > this.interactionState.maxVelocityHistory) {
                this.interactionState.velocityHistory.shift();
            }
            
            // Calculate weighted average velocity (more recent = more weight)
            const { avgX, avgY } = this.getWeightedAverageVelocity();
            this.interactionState.velocityX = avgX;
            this.interactionState.velocityY = avgY;
        }
        
        // Emit drag event with delta
        this.emit('drag', { deltaX, deltaY, target });
        
        // Update last position
        this.interactionState.lastX = coords.x;
        this.interactionState.lastY = coords.y;
    }

    /**
     * Handles pinch movement.
     */
    handlePinchMove(touches, target) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Calculate current distance
        const currentDistance = this.getTouchDistance(touch1, touch2);
        
        // Calculate scale relative to last distance (incremental)
        const scale = currentDistance / this.interactionState.pinchLastDistance;
        
        // Update last distance for next frame
        this.interactionState.pinchLastDistance = currentDistance;
        
        // Calculate current pinch center
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Emit pinch event with INCREMENTAL scale (not absolute zoom)
        this.emit('pinch', {
            scale: scale, // Multiplicative factor (1.0 = no change)
            clientX: centerX,
            clientY: centerY,
            target
        });
    }

    /**
     * Handles the end of an interaction (touchend, mouseup, or leave).
     */
    handleEnd(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        
        if (this.interactionState.mode === 'dragging') {
            // If it's still a tap, emit tap event
            if (this.interactionState.isTap) {
                this.emit('tap', {
                    clientX: this.interactionState.startX,
                    clientY: this.interactionState.startY,
                    x: this.interactionState.startX,
                    y: this.interactionState.startY,
                    target
                });
            } else {
                // End of drag - emit velocity for momentum
                this.emit('dragend', {
                    velocityX: this.interactionState.velocityX,
                    velocityY: this.interactionState.velocityY,
                    target
                });
            }
        } else if (this.interactionState.mode === 'pinching') {
            this.emit('pinchend', { target });
        }
        
        // Reset state
        this.resetInteractionState();
    }

    /**
     * Handles wheel events for zooming.
     */
    handleWheel(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        
        // Calculate zoom delta
        const delta = -event.deltaY * this.options.zoomSpeed;
        
        this.emit('zoom', {
            delta: delta,
            clientX: event.clientX,
            clientY: event.clientY,
            target
        });
    }

    /**
     * Prevents context menu.
     */
    handleContextMenu(event) {
        event.preventDefault();
    }

    /**
     * Calculates distance between two touch points.
     */
    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates weighted average velocity from recent history.
     * More recent samples have higher weight.
     */
    getWeightedAverageVelocity() {
        if (this.interactionState.velocityHistory.length === 0) {
            return { avgX: 0, avgY: 0 };
        }
        
        let totalWeight = 0;
        let weightedSumX = 0;
        let weightedSumY = 0;
        
        // Apply exponential weighting (more recent = higher weight)
        this.interactionState.velocityHistory.forEach((sample, index) => {
            const weight = Math.pow(2, index); // Exponential: 1, 2, 4, 8, 16
            weightedSumX += sample.x * weight;
            weightedSumY += sample.y * weight;
            totalWeight += weight;
        });
        
        return {
            avgX: weightedSumX / totalWeight,
            avgY: weightedSumY / totalWeight
        };
    }

    /**
     * Resets the interaction state.
     */
    resetInteractionState() {
        // Preserve velocity for momentum
        this.interactionState.lastVelocityX = this.interactionState.velocityX;
        this.interactionState.lastVelocityY = this.interactionState.velocityY;
        
        this.interactionState.mode = 'idle';
        this.interactionState.isTap = true;
        this.interactionState.velocityX = 0;
        this.interactionState.velocityY = 0;
        this.interactionState.velocityHistory = [];
    }

    /**
     * Emits a custom event.
     */
    emit(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.canvas.dispatchEvent(event);
    }

    /**
     * Destroys the interaction manager and cleans up resources.
     */
    destroy() {
        // Remove event listeners
        this.canvas.removeEventListener('touchstart', this.boundHandlers.handleStart);
        this.canvas.removeEventListener('touchmove', this.boundHandlers.handleMove);
        this.canvas.removeEventListener('touchend', this.boundHandlers.handleEnd);
        this.canvas.removeEventListener('touchcancel', this.boundHandlers.handleEnd);
        this.canvas.removeEventListener('mousedown', this.boundHandlers.handleStart);
        this.canvas.removeEventListener('mousemove', this.boundHandlers.handleMove);
        this.canvas.removeEventListener('mouseup', this.boundHandlers.handleEnd);
        this.canvas.removeEventListener('mouseleave', this.boundHandlers.handleEnd);
        this.canvas.removeEventListener('wheel', this.boundHandlers.handleWheel);
        this.canvas.removeEventListener('contextmenu', this.boundHandlers.handleContextMenu);
        
        if (this.minimapCanvas) {
            this.minimapCanvas.removeEventListener('touchstart', this.boundHandlers.handleStart);
            this.minimapCanvas.removeEventListener('touchmove', this.boundHandlers.handleMove);
            this.minimapCanvas.removeEventListener('touchend', this.boundHandlers.handleEnd);
            this.minimapCanvas.removeEventListener('mousedown', this.boundHandlers.handleStart);
        }
        
        // Clear timeouts
        if (this.interactionState.doubleTapTimeout) {
            clearTimeout(this.interactionState.doubleTapTimeout);
        }
    }
}
