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
        
        // Interaction state
        this.interactionState = {
            isDragging: false,
            isPinching: false,
            dragStartX: 0,
            dragStartY: 0,
            lastPanX: 0,
            lastPanY: 0,
            pinchStartDistance: 0,
            pinchStartZoom: 1,
            lastTouchTime: 0,
            tapCount: 0,
            doubleTapTimeout: null,
            // Touch momentum state
            touchVelocityX: 0,
            touchVelocityY: 0,
            lastTouchX: 0,
            lastTouchY: 0,
            lastTouchMoveTime: 0,
            touchMomentumAnimationId: null,
            // Touch feedback state
            touchFeedbackActive: false,
            touchFeedbackTimeout: null
        };
        
        // Options
        this.options = {
            dragThreshold: 5, // Minimum distance to start dragging
            pinchThreshold: 10, // Minimum distance to start pinching
            doubleTapDelay: 300, // Maximum delay between taps for double tap
            wheelZoomSpeed: 0.001,
            touchZoomSpeed: 0.002, // Increased for better mobile responsiveness
            enableKeyboard: true,
            enableTouch: true,
            enableMouse: true,
            // Mobile-specific options
            touchDragThreshold: 8, // Higher threshold for touch to prevent accidental drags
            touchPinchSensitivity: 1.2, // Sensitivity multiplier for pinch zoom
            enableTouchFeedback: true, // Visual feedback for touch interactions
            touchMomentum: true, // Enable momentum scrolling for touch
            touchMomentumDamping: 0.95, // Damping factor for momentum
            maxTouchVelocity: 20 // Maximum velocity for momentum scrolling
        };
        
        // Bind event handlers
        this.boundHandlers = {
            mousedown: this.handleMouseDown.bind(this),
            mousemove: this.handleMouseMove.bind(this),
            mouseup: this.handleMouseUp.bind(this),
            wheel: this.handleWheel.bind(this),
            touchstart: this.handleTouchStart.bind(this),
            touchmove: this.handleTouchMove.bind(this),
            touchend: this.handleTouchEnd.bind(this),
            keydown: this.handleKeyDown.bind(this),
            click: this.handleClick.bind(this),
            contextmenu: this.handleContextMenu.bind(this)
        };
        
        // Initialize event listeners
        this.initEventListeners();
    }

    /**
     * Initializes event listeners.
     */
    initEventListeners() {
        // Mouse events
        if (this.options.enableMouse) {
            this.canvas.addEventListener('mousedown', this.boundHandlers.mousedown);
            this.canvas.addEventListener('mousemove', this.boundHandlers.mousemove);
            this.canvas.addEventListener('mouseup', this.boundHandlers.mouseup);
            this.canvas.addEventListener('wheel', this.boundHandlers.wheel);
            this.canvas.addEventListener('click', this.boundHandlers.click);
            this.canvas.addEventListener('contextmenu', this.boundHandlers.contextmenu);
        }
        
        // Touch events
        if (this.options.enableTouch) {
            this.canvas.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: false });
            this.canvas.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: false });
            this.canvas.addEventListener('touchend', this.boundHandlers.touchend, { passive: false });
        }
        
        // Keyboard events
        if (this.options.enableKeyboard) {
            document.addEventListener('keydown', this.boundHandlers.keydown);
        }
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Handles mouse down events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseDown(e) {
        // Only handle left mouse button
        if (e.button !== 0) return;
        
        // Update interaction state
        this.interactionState.isDragging = true;
        this.interactionState.dragStartX = e.clientX;
        this.interactionState.dragStartY = e.clientY;
        this.interactionState.lastPanX = this.state.panX;
        this.interactionState.lastPanY = this.state.panY;
        
        // Change cursor
        this.canvas.style.cursor = 'grabbing';
        
        // Prevent default behavior
        e.preventDefault();
    }

    /**
     * Handles mouse move events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseMove(e) {
        // Handle dragging
        if (this.interactionState.isDragging) {
            const deltaX = e.clientX - this.interactionState.dragStartX;
            const deltaY = e.clientY - this.interactionState.dragStartY;
            
            // Check if we've moved past the drag threshold
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance >= this.options.dragThreshold) {
                // Update pan position with smooth transitions
                // Use requestAnimationFrame for smoother rendering
                if (!this.interactionState.panAnimationFrame) {
                    this.interactionState.panAnimationFrame = requestAnimationFrame(() => {
                        this.state.panX = this.interactionState.lastPanX + deltaX;
                        this.state.panY = this.interactionState.lastPanY + deltaY;
                        
                        // Constrain pan
                        this.surfMap.constrainPan();
                        
                        // Render
                        this.surfMap.render();
                        
                        this.interactionState.panAnimationFrame = null;
                    });
                }
            }
        }
    }

    /**
     * Handles mouse up events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseUp(e) {
        if (this.interactionState.isDragging) {
            // Cancel any pending animation frame
            if (this.interactionState.panAnimationFrame) {
                cancelAnimationFrame(this.interactionState.panAnimationFrame);
                this.interactionState.panAnimationFrame = null;
            }
            
            // Update interaction state
            this.interactionState.isDragging = false;
            
            // Reset cursor
            this.canvas.style.cursor = 'grab';
            
            // Emit pan changed event
            this.surfMap.emit('panChanged', {
                panX: this.state.panX,
                panY: this.state.panY
            });
        }
    }

    /**
     * Handles wheel events for zooming.
     * @param {WheelEvent} e - The wheel event.
     */
    handleWheel(e) {
        // Prevent default behavior
        e.preventDefault();
        
        // Calculate zoom delta
        const delta = -e.deltaY * this.options.wheelZoomSpeed;
        
        // Get mouse position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Account for device pixel ratio
        const dpr = this.surfMap.devicePixelRatio || 1;
        const scaledMouseX = mouseX * dpr;
        const scaledMouseY = mouseY * dpr;
        
        // Calculate image coordinates at mouse position before zoom
        const imageX = (scaledMouseX - this.state.panX * dpr) / (this.state.zoom * dpr);
        const imageY = (scaledMouseY - this.state.panY * dpr) / (this.state.zoom * dpr);
        
        // Update zoom
        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom + delta)
        );
        
        if (newZoom !== this.state.zoom) {
            // Update zoom
            this.state.zoom = newZoom;
            
            // Adjust pan to keep the same point under the mouse
            // This ensures the zoom is centered on the mouse cursor
            this.state.panX = (scaledMouseX - imageX * this.state.zoom * dpr) / dpr;
            this.state.panY = (scaledMouseY - imageY * this.state.zoom * dpr) / dpr;
            
            // Constrain pan
            this.surfMap.constrainPan();
            
            // Render
            this.surfMap.render();
            
            // Emit zoom changed event
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    /**
     * Handles touch start events.
     * @param {TouchEvent} e - The touch event.
     */
    handleTouchStart(e) {
        // Prevent default behavior
        e.preventDefault();
        
        // Cancel any ongoing momentum animation
        if (this.interactionState.touchMomentumAnimationId) {
            cancelAnimationFrame(this.interactionState.touchMomentumAnimationId);
            this.interactionState.touchMomentumAnimationId = null;
        }
        
        const touches = e.touches;
        
        // Handle single touch (potential tap or drag)
        if (touches.length === 1) {
            const touch = touches[0];
            const now = Date.now();
            
            // Add touch feedback
            if (this.options.enableTouchFeedback) {
                this.showTouchFeedback(touch.clientX, touch.clientY);
            }
            
            // Check for double tap
            if (now - this.interactionState.lastTouchTime < this.options.doubleTapDelay) {
                this.interactionState.tapCount++;
                
                if (this.interactionState.tapCount === 2) {
                    // Double tap detected - zoom in
                    this.handleDoubleTap(touch.clientX, touch.clientY);
                    this.interactionState.tapCount = 0;
                    
                    // Clear timeout
                    if (this.interactionState.doubleTapTimeout) {
                        clearTimeout(this.interactionState.doubleTapTimeout);
                        this.interactionState.doubleTapTimeout = null;
                    }
                    return;
                }
            } else {
                this.interactionState.tapCount = 1;
            }
            
            this.interactionState.lastTouchTime = now;
            
            // Set timeout to reset tap count
            if (this.interactionState.doubleTapTimeout) {
                clearTimeout(this.interactionState.doubleTapTimeout);
            }
            this.interactionState.doubleTapTimeout = setTimeout(() => {
                this.interactionState.tapCount = 0;
                this.interactionState.doubleTapTimeout = null;
            }, this.options.doubleTapDelay);
            
            // Initialize touch tracking for momentum
            this.interactionState.lastTouchX = touch.clientX;
            this.interactionState.lastTouchY = touch.clientY;
            this.interactionState.lastTouchMoveTime = now;
            this.interactionState.touchVelocityX = 0;
            this.interactionState.touchVelocityY = 0;
            
            // Start drag
            this.interactionState.isDragging = true;
            this.interactionState.dragStartX = touch.clientX;
            this.interactionState.dragStartY = touch.clientY;
            this.interactionState.lastPanX = this.state.panX;
            this.interactionState.lastPanY = this.state.panY;
        }
        // Handle two touches (pinch)
        else if (touches.length === 2) {
            // Cancel any drag operation
            this.interactionState.isDragging = false;
            
            // Calculate pinch distance
            const touch1 = touches[0];
            const touch2 = touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            // Start pinch
            this.interactionState.isPinching = true;
            this.interactionState.pinchStartDistance = distance;
            this.interactionState.pinchStartZoom = this.state.zoom;
            
            // Calculate center point
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            
            // Calculate image coordinates at center point
            const rect = this.canvas.getBoundingClientRect();
            const dpr = this.surfMap.devicePixelRatio || 1;
            const scaledCenterX = (centerX - rect.left) * dpr;
            const scaledCenterY = (centerY - rect.top) * dpr;
            
            const imageX = (scaledCenterX - this.state.panX * dpr) / (this.state.zoom * dpr);
            const imageY = (scaledCenterY - this.state.panY * dpr) / (this.state.zoom * dpr);
            
            // Store center point for zoom adjustment
            this.interactionState.pinchCenterX = centerX;
            this.interactionState.pinchCenterY = centerY;
            this.interactionState.pinchImageX = imageX;
            this.interactionState.pinchImageY = imageY;
            
            // Add pinch feedback
            if (this.options.enableTouchFeedback) {
                this.showTouchFeedback(centerX, centerY);
            }
        }
    }

    /**
     * Handles touch move events.
     * @param {TouchEvent} e - The touch event.
     */
    handleTouchMove(e) {
        // Prevent default behavior
        e.preventDefault();
        
        const touches = e.touches;
        const now = Date.now();
        
        // Handle drag
        if (this.interactionState.isDragging && touches.length === 1) {
            const touch = touches[0];
            const deltaX = touch.clientX - this.interactionState.dragStartX;
            const deltaY = touch.clientY - this.interactionState.dragStartY;
            
            // Calculate velocity for momentum scrolling
            if (this.options.touchMomentum) {
                const timeDelta = now - this.interactionState.lastTouchMoveTime;
                if (timeDelta > 0) {
                    this.interactionState.touchVelocityX = (touch.clientX - this.interactionState.lastTouchX) / timeDelta * 10;
                    this.interactionState.touchVelocityY = (touch.clientY - this.interactionState.lastTouchY) / timeDelta * 10;
                    
                    // Clamp velocity to maximum
                    this.interactionState.touchVelocityX = Math.max(-this.options.maxTouchVelocity, Math.min(this.options.maxTouchVelocity, this.interactionState.touchVelocityX));
                    this.interactionState.touchVelocityY = Math.max(-this.options.maxTouchVelocity, Math.min(this.options.maxTouchVelocity, this.interactionState.touchVelocityY));
                }
                
                this.interactionState.lastTouchX = touch.clientX;
                this.interactionState.lastTouchY = touch.clientY;
                this.interactionState.lastTouchMoveTime = now;
            }
            
            // Check if we've moved past the drag threshold
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const threshold = this.options.touchDragThreshold || this.options.dragThreshold;
            
            if (distance >= threshold) {
                // Update pan position with smooth transitions
                // Use requestAnimationFrame for smoother rendering
                if (!this.interactionState.panAnimationFrame) {
                    this.interactionState.panAnimationFrame = requestAnimationFrame(() => {
                        this.state.panX = this.interactionState.lastPanX + deltaX;
                        this.state.panY = this.interactionState.lastPanY + deltaY;
                        
                        // Constrain pan
                        this.surfMap.constrainPan();
                        
                        // Render
                        this.surfMap.render();
                        
                        this.interactionState.panAnimationFrame = null;
                    });
                }
            }
        }
        // Handle pinch
        else if (this.interactionState.isPinching && touches.length === 2) {
            const touch1 = touches[0];
            const touch2 = touches[1];
            
            // Calculate current pinch distance
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            // Calculate zoom factor with sensitivity adjustment
            const scaleFactor = Math.pow(distance / this.interactionState.pinchStartDistance, this.options.touchPinchSensitivity);
            const newZoom = Math.max(
                this.surfMap.options.minZoom,
                Math.min(this.surfMap.options.maxZoom, this.interactionState.pinchStartZoom * scaleFactor)
            );
            
            if (newZoom !== this.state.zoom) {
                // Update zoom
                this.state.zoom = newZoom;
                
                // Adjust pan to keep the center point stable
                const rect = this.canvas.getBoundingClientRect();
                const centerX = this.interactionState.pinchCenterX - rect.left;
                const centerY = this.interactionState.pinchCenterY - rect.top;
                
                // Account for device pixel ratio
                const dpr = this.surfMap.devicePixelRatio || 1;
                const scaledCenterX = centerX * dpr;
                const scaledCenterY = centerY * dpr;
                
                // Adjust pan to keep the pinch center point stable
                this.state.panX = (scaledCenterX - this.interactionState.pinchImageX * this.state.zoom * dpr) / dpr;
                this.state.panY = (scaledCenterY - this.interactionState.pinchImageY * this.state.zoom * dpr) / dpr;
                
                // Constrain pan
                this.surfMap.constrainPan();
                
                // Render
                this.surfMap.render();
                
                // Emit zoom changed event
                this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
            }
        }
    }

    /**
     * Handles touch end events.
     * @param {TouchEvent} e - The touch event.
     */
    handleTouchEnd(e) {
        // Prevent default behavior
        e.preventDefault();
        
        const touches = e.touches;
        
        // End drag if no more touches
        if (touches.length === 0) {
            if (this.interactionState.isDragging) {
                // Cancel any pending animation frame
                if (this.interactionState.panAnimationFrame) {
                    cancelAnimationFrame(this.interactionState.panAnimationFrame);
                    this.interactionState.panAnimationFrame = null;
                }
                
                this.interactionState.isDragging = false;
                
                // Start momentum scrolling if enabled and velocity is significant
                if (this.options.touchMomentum &&
                    (Math.abs(this.interactionState.touchVelocityX) > 0.5 ||
                     Math.abs(this.interactionState.touchVelocityY) > 0.5)) {
                    this.startMomentumScrolling();
                }
                
                // Emit pan changed event
                this.surfMap.emit('panChanged', {
                    panX: this.state.panX,
                    panY: this.state.panY
                });
            }
            
            if (this.interactionState.isPinching) {
                this.interactionState.isPinching = false;
                
                // Emit zoom changed event
                this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
            }
            
            // Hide touch feedback
            if (this.options.enableTouchFeedback && this.interactionState.touchFeedbackActive) {
                this.hideTouchFeedback();
            }
        }
    }

    /**
     * Handles double tap events.
     * @param {number} clientX - The X coordinate.
     * @param {number} clientY - The Y coordinate.
     */
    handleDoubleTap(clientX, clientY) {
        // Get position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Account for device pixel ratio
        const dpr = this.surfMap.devicePixelRatio || 1;
        const scaledX = x * dpr;
        const scaledY = y * dpr;
        
        // Calculate image coordinates at tap position before zoom
        const imageX = (scaledX - this.state.panX * dpr) / (this.state.zoom * dpr);
        const imageY = (scaledY - this.state.panY * dpr) / (this.state.zoom * dpr);
        
        // Zoom in
        const newZoom = Math.min(this.surfMap.options.maxZoom, this.state.zoom * 2);
        
        if (newZoom !== this.state.zoom) {
            // Update zoom
            this.state.zoom = newZoom;
            
            // Adjust pan to keep the tap point centered
            // This ensures the zoom is centered on the tap position
            this.state.panX = (scaledX - imageX * this.state.zoom * dpr) / dpr;
            this.state.panY = (scaledY - imageY * this.state.zoom * dpr) / dpr;
            
            // Constrain pan
            this.surfMap.constrainPan();
            
            // Render
            this.surfMap.render();
            
            // Emit zoom changed event
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    /**
     * Handles keyboard events.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleKeyDown(e) {
        // Only handle keys if the map is visible
        if (this.canvas.style.display === 'none') return;
        
        switch (e.key) {
            case '+':
            case '=':
                // Zoom in
                this.surfMap.zoomIn(0.2);
                e.preventDefault();
                break;
            case '-':
            case '_':
                // Zoom out
                this.surfMap.zoomOut(0.2);
                e.preventDefault();
                break;
            case '0':
                // Reset view
                this.surfMap.resetView();
                e.preventDefault();
                break;
            case 'ArrowUp':
                // Pan up
                this.surfMap.pan(0, 50);
                e.preventDefault();
                break;
            case 'ArrowDown':
                // Pan down
                this.surfMap.pan(0, -50);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                // Pan left
                this.surfMap.pan(50, 0);
                e.preventDefault();
                break;
            case 'ArrowRight':
                // Pan right
                this.surfMap.pan(-50, 0);
                e.preventDefault();
                break;
        }
    }

    /**
     * Handles click events.
     * @param {MouseEvent} e - The click event.
     */
    handleClick(e) {
        // Check if the click was on a button
        if (this.surfMap.renderer) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check for zoom in button
            const buttonSize = 40;
            const padding = 20;
            const buttonX = this.canvas.width - buttonSize - padding;
            
            if (x >= buttonX && x <= buttonX + buttonSize) {
                if (y >= padding && y <= padding + buttonSize) {
                    // Zoom in button
                    this.surfMap.zoomIn(0.2);
                    return;
                } else if (y >= padding + buttonSize + 10 && y <= padding + (buttonSize + 10) * 2) {
                    // Zoom out button
                    this.surfMap.zoomOut(0.2);
                    return;
                } else if (y >= padding + (buttonSize + 10) * 2 && y <= padding + (buttonSize + 10) * 2 + buttonSize) {
                    // Reset button
                    this.surfMap.resetView();
                    return;
                }
            }
        }
        
        // Let the markers manager handle surf spot clicks
        // This is now handled by the SurfMarkersManager
    }

    /**
     * Handles context menu events.
     * @param {MouseEvent} e - The context menu event.
     */
    handleContextMenu(e) {
        // Prevent context menu
        e.preventDefault();
    }

    /**
     * Handles window resize events.
     */
    handleResize() {
        // Resize the map
        this.surfMap.resize();
    }

    /**
     * Destroys the interaction handler and cleans up event listeners.
     */
    destroy() {
        // Remove event listeners
        if (this.options.enableMouse) {
            this.canvas.removeEventListener('mousedown', this.boundHandlers.mousedown);
            this.canvas.removeEventListener('mousemove', this.boundHandlers.mousemove);
            this.canvas.removeEventListener('mouseup', this.boundHandlers.mouseup);
            this.canvas.removeEventListener('wheel', this.boundHandlers.wheel);
            this.canvas.removeEventListener('click', this.boundHandlers.click);
            this.canvas.removeEventListener('contextmenu', this.boundHandlers.contextmenu);
        }
        
        if (this.options.enableTouch) {
            this.canvas.removeEventListener('touchstart', this.boundHandlers.touchstart);
            this.canvas.removeEventListener('touchmove', this.boundHandlers.touchmove);
            this.canvas.removeEventListener('touchend', this.boundHandlers.touchend);
        }
        
        if (this.options.enableKeyboard) {
            document.removeEventListener('keydown', this.boundHandlers.keydown);
        }
        
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        // Clear timeout
        if (this.interactionState.doubleTapTimeout) {
            clearTimeout(this.interactionState.doubleTapTimeout);
            this.interactionState.doubleTapTimeout = null;
        }
        
        // Clear references
        this.canvas = null;
        this.surfMap = null;
    }

    /**
     * Starts momentum scrolling after touch end.
     */
    startMomentumScrolling() {
        const animate = () => {
            // Apply damping to velocity
            this.interactionState.touchVelocityX *= this.options.touchMomentumDamping;
            this.interactionState.touchVelocityY *= this.options.touchMomentumDamping;
            
            // Apply velocity to pan position
            this.state.panX += this.interactionState.touchVelocityX;
            this.state.panY += this.interactionState.touchVelocityY;
            
            // Constrain pan
            this.surfMap.constrainPan();
            
            // Render
            this.surfMap.render();
            
            // Continue animation if velocity is still significant
            if (Math.abs(this.interactionState.touchVelocityX) > 0.1 ||
                Math.abs(this.interactionState.touchVelocityY) > 0.1) {
                this.interactionState.touchMomentumAnimationId = requestAnimationFrame(animate);
            } else {
                this.interactionState.touchMomentumAnimationId = null;
                
                // Emit final pan changed event
                this.surfMap.emit('panChanged', {
                    panX: this.state.panX,
                    panY: this.state.panY
                });
            }
        };
        
        this.interactionState.touchMomentumAnimationId = requestAnimationFrame(animate);
    }

    /**
     * Shows touch feedback at the specified position.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     */
    showTouchFeedback(x, y) {
        if (!this.canvas) return;
        
        // Clear any existing timeout
        if (this.interactionState.touchFeedbackTimeout) {
            clearTimeout(this.interactionState.touchFeedbackTimeout);
        }
        
        // Create or update touch feedback element
        let feedback = document.getElementById('surf-map-touch-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'surf-map-touch-feedback';
            feedback.style.cssText = `
                position: fixed;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255, 77, 77, 0.3) 0%, rgba(255, 77, 77, 0) 70%);
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%) scale(0);
                transition: transform 0.2s ease-out;
                opacity: 0;
            `;
            document.body.appendChild(feedback);
        }
        
        // Position and show feedback
        feedback.style.left = x + 'px';
        feedback.style.top = y + 'px';
        feedback.style.opacity = '1';
        feedback.style.transform = 'translate(-50%, -50%) scale(1)';
        
        this.interactionState.touchFeedbackActive = true;
        
        // Auto-hide after delay
        this.interactionState.touchFeedbackTimeout = setTimeout(() => {
            this.hideTouchFeedback();
        }, 600);
    }

    /**
     * Hides touch feedback.
     */
    hideTouchFeedback() {
        const feedback = document.getElementById('surf-map-touch-feedback');
        if (feedback) {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translate(-50%, -50%) scale(0.5)';
            
            // Clear timeout
            if (this.interactionState.touchFeedbackTimeout) {
                clearTimeout(this.interactionState.touchFeedbackTimeout);
                this.interactionState.touchFeedbackTimeout = null;
            }
            
            this.interactionState.touchFeedbackActive = false;
        }
    }
}
