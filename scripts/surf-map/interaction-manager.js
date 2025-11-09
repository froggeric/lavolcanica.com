/**
 * @fileoverview Optimized Interaction Manager for the Surf Map.
 * @description High-performance gesture recognition system optimized for smooth,
 * immediate response. Focuses on clean gesture detection with minimal overhead.
 * Mobile-first design with excellent desktop support.
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
            zoomSpeed: 0.005, // Increased from 0.002 for better responsiveness
            ...options
        };

        // Interaction state
        this.interactionState = {
            mode: 'idle', // idle, dragging, pinching
            isTap: true,
            startX: 0,
            startY: 0,
            lastX: 0,
            lastY: 0,
            
            // Velocity tracking for momentum
            velocitySamples: [],
            maxSamples: 3,
            lastMoveTime: 0,
            
            // Pinch state
            pinchStartDistance: 0,
            pinchLastDistance: 0,
            
            // Tap detection
            lastTouchTime: 0,
            tapCount: 0,
            doubleTapTimeout: null
        };

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
     * Initializes event listeners.
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
        
        // Wheel zoom
        this.canvas.addEventListener('wheel', this.boundHandlers.handleWheel, { passive: false });
        
        // Context menu
        this.canvas.addEventListener('contextmenu', this.boundHandlers.handleContextMenu, { passive: false });
        
        // Minimap
        if (this.minimapCanvas) {
            this.minimapCanvas.addEventListener('touchstart', this.boundHandlers.handleStart, { passive: false });
            this.minimapCanvas.addEventListener('touchmove', this.boundHandlers.handleMove, { passive: false });
            this.minimapCanvas.addEventListener('touchend', this.boundHandlers.handleEnd, { passive: false });
            this.minimapCanvas.addEventListener('mousedown', this.boundHandlers.handleStart, { passive: false });
        }
    }

    /**
     * Handles interaction start.
     */
    handleStart(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        const now = Date.now();
        
        if (event.type === 'touchstart') {
            const touches = event.touches;
            
            if (touches.length === 1) {
                this.startSingleTouch(touches[0], target, now);
            } else if (touches.length === 2) {
                this.startPinch(touches, target);
            }
        } else {
            this.startSingleTouch(event, target, now);
        }
    }

    /**
     * Starts single touch/mouse interaction.
     */
    startSingleTouch(point, target, now) {
        const { clientX, clientY } = point;
        
        this.interactionState.mode = 'dragging';
        this.interactionState.isTap = true;
        this.interactionState.startX = clientX;
        this.interactionState.startY = clientY;
        this.interactionState.lastX = clientX;
        this.interactionState.lastY = clientY;
        this.interactionState.lastMoveTime = now;
        this.interactionState.velocitySamples = [];
        
        // Double tap detection
        if (now - this.interactionState.lastTouchTime < this.options.doubleTapDelay) {
            this.interactionState.tapCount++;
            if (this.interactionState.tapCount === 2) {
                this.emit('doubletap', { clientX, clientY, target });
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
     * Starts pinch gesture.
     */
    startPinch(touches, target) {
        this.interactionState.mode = 'pinching';
        this.interactionState.isTap = false;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        const distance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );
        
        this.interactionState.pinchStartDistance = distance;
        this.interactionState.pinchLastDistance = distance;
        
        this.emit('pinchstart', {
            centerX: (touch1.clientX + touch2.clientX) / 2,
            centerY: (touch1.clientY + touch2.clientY) / 2,
            target
        });
    }

    /**
     * Handles move events.
     */
    handleMove(event) {
        // Don't prevent default on idle mousemove - let hover effects work
        if (this.interactionState.mode === 'idle') {
            return; // Just return, don't re-dispatch
        }
        
        // Only prevent default when actively interacting
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        const now = Date.now();
        
        if (event.type === 'touchmove') {
            const touches = event.touches;
            
            if (touches.length === 1 && this.interactionState.mode === 'dragging') {
                this.handleDragMove(touches[0], target, now);
            } else if (touches.length === 2 && this.interactionState.mode === 'pinching') {
                this.handlePinchMove(touches, target);
            }
        } else if (this.interactionState.mode === 'dragging') {
            this.handleDragMove(event, target, now);
        }
    }

    /**
     * Handles drag movement.
     */
    handleDragMove(point, target, now) {
        const { clientX, clientY } = point;
        
        // Calculate delta
        const deltaX = clientX - this.interactionState.lastX;
        const deltaY = clientY - this.interactionState.lastY;
        
        // Check drag threshold
        const totalDeltaX = clientX - this.interactionState.startX;
        const totalDeltaY = clientY - this.interactionState.startY;
        const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);
        
        if (distance > this.options.dragThreshold) {
            this.interactionState.isTap = false;
        }
        
        // Track velocity for momentum
        const timeDelta = Math.max(now - this.interactionState.lastMoveTime, 1);
        this.interactionState.velocitySamples.push({
            x: deltaX / timeDelta,
            y: deltaY / timeDelta,
            weight: 1.0
        });
        
        if (this.interactionState.velocitySamples.length > this.interactionState.maxSamples) {
            this.interactionState.velocitySamples.shift();
        }
        
        // Emit drag event immediately
        this.emit('drag', { deltaX, deltaY, target });
        
        // Update state
        this.interactionState.lastX = clientX;
        this.interactionState.lastY = clientY;
        this.interactionState.lastMoveTime = now;
    }

    /**
     * Handles pinch movement.
     */
    handlePinchMove(touches, target) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        const currentDistance = Math.hypot(
            touch1.clientX - touch2.clientX,
            touch1.clientY - touch2.clientY
        );
        
        const scale = currentDistance / this.interactionState.pinchLastDistance;
        this.interactionState.pinchLastDistance = currentDistance;
        
        this.emit('pinch', {
            scale: scale,
            centerX: (touch1.clientX + touch2.clientX) / 2,
            centerY: (touch1.clientY + touch2.clientY) / 2,
            target
        });
    }

    /**
     * Handles interaction end.
     */
    handleEnd(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        
        if (this.interactionState.mode === 'dragging') {
            if (this.interactionState.isTap) {
                this.emit('tap', {
                    clientX: this.interactionState.startX,
                    clientY: this.interactionState.startY,
                    x: this.interactionState.startX,
                    y: this.interactionState.startY,
                    target
                });
            } else {
                // Calculate final velocity for momentum
                const velocity = this.calculateAverageVelocity();
                this.emit('dragend', {
                    velocityX: velocity.x,
                    velocityY: velocity.y,
                    target
                });
            }
        } else if (this.interactionState.mode === 'pinching') {
            this.emit('pinchend', { target });
        }
        
        this.resetState();
    }

    /**
     * Calculates average velocity from samples.
     */
    calculateAverageVelocity() {
        if (this.interactionState.velocitySamples.length === 0) {
            return { x: 0, y: 0 };
        }
        
        let totalWeight = 0;
        let sumX = 0;
        let sumY = 0;
        
        // Apply exponential weighting (recent samples matter more)
        this.interactionState.velocitySamples.forEach((sample, index) => {
            const weight = Math.pow(2, index);
            sumX += sample.x * weight;
            sumY += sample.y * weight;
            totalWeight += weight;
        });
        
        return {
            x: sumX / totalWeight,
            y: sumY / totalWeight
        };
    }

    /**
     * Handles wheel zoom.
     */
    handleWheel(event) {
        event.preventDefault();
        
        const target = event.target === this.minimapCanvas ? 'minimap' : 'map';
        
        // Calculate zoom delta with acceleration for fast scrolling
        const absDeltaY = Math.abs(event.deltaY);
        let zoomSpeed = this.options.zoomSpeed;
        
        // Add acceleration for faster scrolling
        if (absDeltaY > 100) {
            zoomSpeed *= 2.0; // 2x speed for fast scrolling
        } else if (absDeltaY > 50) {
            zoomSpeed *= 1.5; // 1.5x speed for medium scrolling
        }
        
        const delta = -event.deltaY * zoomSpeed;
        
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
     * Resets interaction state.
     */
    resetState() {
        this.interactionState.mode = 'idle';
        this.interactionState.isTap = true;
        this.interactionState.velocitySamples = [];
    }

    /**
     * Emits custom event.
     */
    emit(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.canvas.dispatchEvent(event);
    }

    /**
     * Destroys the interaction manager.
     */
    destroy() {
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
        
        if (this.interactionState.doubleTapTimeout) {
            clearTimeout(this.interactionState.doubleTapTimeout);
        }
    }
}
