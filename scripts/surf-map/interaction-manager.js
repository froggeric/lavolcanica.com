/**
 * @fileoverview Enhanced Interaction Manager for the Surf Map.
 * @description This module provides a high-performance, mobile-first interaction
 * system with momentum scrolling, natural pinch-to-zoom, and smooth animations.
 * Designed to feel as fluid as native mapping applications.
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
            
            // Momentum physics
            momentumEnabled: true,
            momentumFriction: 0.92, // Deceleration factor per frame (0-1)
            momentumMinVelocity: 0.5, // Minimum velocity to trigger momentum
            momentumMaxVelocity: 50, // Cap maximum velocity
            
            // Zoom configuration
            zoomSpeed: 0.002, // Mouse wheel zoom speed
            pinchZoomSpeed: 1.0, // Pinch zoom sensitivity
            minZoom: 0.5,
            maxZoom: 3.0,
            
            // Animation
            animationDuration: 300,
            
            ...options
        };

        // Interaction state machine
        this.interactionState = {
            mode: 'idle', // idle, panning, pinching, animating
            isTap: true,
            
            // Touch/mouse tracking
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            lastX: 0,
            lastY: 0,
            
            // Velocity tracking for momentum
            velocityX: 0,
            velocityY: 0,
            velocityHistory: [], // Store last few velocity samples
            maxVelocityHistory: 5,
            
            // Pinch gesture
            pinchStartDistance: 0,
            pinchStartZoom: 0,
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

        // Momentum animation state
        this.momentum = {
            active: false,
            velocityX: 0,
            velocityY: 0,
            animationFrame: null
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
        // Touch events
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
        
        // Stop any ongoing momentum animation
        this.stopMomentum();
        
        if (event.type === 'touchstart') {
            const touches = event.touches;
            
            if (touches.length === 1) {
                // Single touch - prepare for pan
                this.startSingleTouch(touches[0], target, now);
            } else if (touches.length === 2) {
                // Two fingers - pinch zoom
                this.startPinch(touches, target);
            }
        } else {
            // Mouse down - start pan
            this.startSingleTouch(event, target, now);
        }
    }

    /**
     * Starts a single touch/mouse interaction.
     */
    startSingleTouch(point, target, now) {
        const coords = this.getCanvasCoordinates(point);
        
        this.interactionState.mode = 'panning';
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
        this.interactionState.velocityHistory = [];
        
        // Handle double tap detection
        if (now - this.interactionState.lastTouchTime < this.options.doubleTapDelay) {
            this.interactionState.tapCount++;
            if (this.interactionState.tapCount === 2) {
                this.emit('doubletap', { x: coords.x, y: coords.y, target });
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
        this.interactionState.pinchStartDistance = this.getTouchDistance(touch1, touch2);
        this.interactionState.pinchStartZoom = this.state.zoom;
        
        // Calculate pinch center in canvas coordinates
        const center = this.getPinchCenter(touch1, touch2);
        this.interactionState.pinchCenterX = center.x;
        this.interactionState.pinchCenterY = center.y;
        
        this.emit('pinchstart', { target });
    }

    /**
     * Handles move events (touchmove or mousemove).
     */
    handleMove(event) {
        event.preventDefault();
        
        if (this.interactionState.mode === 'idle') return;
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        const now = Date.now();
        const timeDelta = now - this.interactionState.lastMoveTime;
        
        if (event.type === 'touchmove') {
            const touches = event.touches;
            
            if (touches.length === 1 && this.interactionState.mode === 'panning') {
                this.handlePanMove(touches[0], target, timeDelta);
            } else if (touches.length === 2 && this.interactionState.mode === 'pinching') {
                this.handlePinchMove(touches, target);
            }
        } else if (this.interactionState.mode === 'panning') {
            // Mouse move while dragging
            this.handlePanMove(event, target, timeDelta);
        }
        
        this.interactionState.lastMoveTime = now;
    }

    /**
     * Handles pan movement.
     */
    handlePanMove(point, target, timeDelta) {
        const coords = this.getCanvasCoordinates(point);
        
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
        
        // Calculate velocity (pixels per millisecond)
        if (timeDelta > 0) {
            const velocityX = deltaX / timeDelta;
            const velocityY = deltaY / timeDelta;
            
            // Add to velocity history
            this.interactionState.velocityHistory.push({ x: velocityX, y: velocityY });
            if (this.interactionState.velocityHistory.length > this.interactionState.maxVelocityHistory) {
                this.interactionState.velocityHistory.shift();
            }
            
            // Calculate average velocity from recent history
            this.interactionState.velocityX = this.getAverageVelocity('x');
            this.interactionState.velocityY = this.getAverageVelocity('y');
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
        
        // Calculate current distance and scale
        const currentDistance = this.getTouchDistance(touch1, touch2);
        const scale = currentDistance / this.interactionState.pinchStartDistance;
        
        // Calculate new zoom
        const newZoom = this.interactionState.pinchStartZoom * scale;
        
        // Get current pinch center (it may move during the gesture)
        const center = this.getPinchCenter(touch1, touch2);
        
        // Emit pinch event with zoom and center information
        this.emit('pinch', {
            zoom: newZoom,
            centerX: center.x,
            centerY: center.y,
            scale: scale,
            target
        });
    }

    /**
     * Handles the end of an interaction (touchend, mouseup, or leave).
     */
    handleEnd(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        
        if (this.interactionState.mode === 'panning') {
            // If it's still a tap, emit tap event
            if (this.interactionState.isTap) {
                this.emit('tap', {
                    x: this.interactionState.startX,
                    y: this.interactionState.startY,
                    target
                });
            } else {
                // End of drag - check for momentum
                this.emit('dragend', { target });
                
                if (this.options.momentumEnabled) {
                    this.startMomentum();
                }
            }
        } else if (this.interactionState.mode === 'pinching') {
            this.emit('pinchend', { target });
        }
        
        // Reset state
        this.resetInteractionState();
    }

    /**
     * Starts momentum animation after a pan gesture.
     */
    startMomentum() {
        // Get final velocity
        const velocityX = this.interactionState.velocityX * 16; // Convert to pixels per frame (assuming 60fps)
        const velocityY = this.interactionState.velocityY * 16;
        
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        
        // Only start momentum if velocity is significant
        if (speed < this.options.momentumMinVelocity) {
            return;
        }
        
        // Cap velocity
        let finalVelocityX = velocityX;
        let finalVelocityY = velocityY;
        
        if (speed > this.options.momentumMaxVelocity) {
            const scale = this.options.momentumMaxVelocity / speed;
            finalVelocityX *= scale;
            finalVelocityY *= scale;
        }
        
        // Start momentum animation
        this.momentum.active = true;
        this.momentum.velocityX = finalVelocityX;
        this.momentum.velocityY = finalVelocityY;
        
        this.animateMomentum();
    }

    /**
     * Animates momentum deceleration.
     */
    animateMomentum() {
        if (!this.momentum.active) return;
        
        // Apply friction
        this.momentum.velocityX *= this.options.momentumFriction;
        this.momentum.velocityY *= this.options.momentumFriction;
        
        // Calculate speed
        const speed = Math.sqrt(
            this.momentum.velocityX * this.momentum.velocityX +
            this.momentum.velocityY * this.momentum.velocityY
        );
        
        // Stop if velocity is too low
        if (speed < 0.1) {
            this.stopMomentum();
            return;
        }
        
        // Emit momentum drag event
        this.emit('momentum', {
            deltaX: this.momentum.velocityX,
            deltaY: this.momentum.velocityY
        });
        
        // Continue animation
        this.momentum.animationFrame = requestAnimationFrame(() => this.animateMomentum());
    }

    /**
     * Stops momentum animation.
     */
    stopMomentum() {
        if (this.momentum.animationFrame) {
            cancelAnimationFrame(this.momentum.animationFrame);
            this.momentum.animationFrame = null;
        }
        this.momentum.active = false;
        this.momentum.velocityX = 0;
        this.momentum.velocityY = 0;
    }

    /**
     * Handles wheel events for zooming.
     */
    handleWheel(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        const coords = this.getCanvasCoordinates(event);
        
        // Calculate zoom delta
        const delta = -event.deltaY * this.options.zoomSpeed;
        
        this.emit('zoom', {
            delta: delta,
            x: coords.x,
            y: coords.y,
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
     * Gets canvas coordinates from a mouse or touch event.
     */
    getCanvasCoordinates(point) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: point.clientX - rect.left,
            y: point.clientY - rect.top
        };
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
     * Calculates the center point between two touches in canvas coordinates.
     */
    getPinchCenter(touch1, touch2) {
        const rect = this.canvas.getBoundingClientRect();
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
        return { x: centerX, y: centerY };
    }

    /**
     * Calculates average velocity from recent history.
     */
    getAverageVelocity(axis) {
        if (this.interactionState.velocityHistory.length === 0) return 0;
        
        const sum = this.interactionState.velocityHistory.reduce((acc, v) => acc + v[axis], 0);
        return sum / this.interactionState.velocityHistory.length;
    }

    /**
     * Resets the interaction state.
     */
    resetInteractionState() {
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
        // Stop any ongoing animations
        this.stopMomentum();
        
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
