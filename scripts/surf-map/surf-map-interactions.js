import { InteractionManager } from './interaction-manager.js';

/**
 * @fileoverview Enhanced interaction handler for the SurfMap component.
 * @description This module contains the SurfMapInteractions class that handles all
 * user interactions with the surf map, including pan, zoom, touch gestures, and
 * momentum scrolling with physics-based deceleration.
 */

/**
 * Interaction handler class for the SurfMap component.
 */
export class SurfMapInteractions {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Object} state - The map state object.
     * @param {SurfMap} surfMap - The SurfMap instance.
     * @param {Object} options - Configuration options.
     */
    constructor(canvas, state, surfMap, options = {}) {
        this.canvas = canvas;
        this.state = state;
        this.surfMap = surfMap;
        
        // Configuration options
        this.options = {
            // Momentum physics
            momentumEnabled: true,
            momentumFriction: 0.92, // Deceleration factor per frame (0-1)
            momentumMinVelocity: 0.5, // Minimum velocity to trigger momentum (px/ms)
            momentumMaxVelocity: 50, // Cap maximum velocity (px/frame at 60fps)
            
            // Zoom configuration
            zoomSensitivity: 0.01, // Mouse wheel zoom sensitivity
            doubleTapZoomFactor: 1.5, // How much to zoom on double tap
            
            ...options
        };
        
        // Initialize the low-level interaction manager
        this.interactionManager = new InteractionManager(canvas, null, state, {
            dragThreshold: 5,
            doubleTapDelay: 300,
            zoomSpeed: 0.002
        });
        
        // Panning state
        this.panState = {
            isPanning: false,
            velocityX: 0,
            velocityY: 0,
            animationFrame: null
        };
        
        // Momentum state
        this.momentum = {
            active: false,
            velocityX: 0,
            velocityY: 0,
            animationFrame: null
        };
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for interaction events.
     */
    setupEventListeners() {
        // Tap events
        this.canvas.addEventListener('tap', this.handleTap.bind(this));
        
        // Double tap events
        this.canvas.addEventListener('doubletap', this.handleDoubleTap.bind(this));
        
        // Drag events
        this.canvas.addEventListener('drag', this.handleDrag.bind(this));
        this.canvas.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        // Zoom events
        this.canvas.addEventListener('zoom', this.handleZoom.bind(this));
        
        // Pinch events
        this.canvas.addEventListener('pinch', this.handlePinch.bind(this));
        this.canvas.addEventListener('pinchend', this.handlePinchEnd.bind(this));
        
        // Mouse move for hover effects (desktop only)
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    /**
     * Handles mouse move events for hover effects.
     */
    handleMouseMove(event) {
        if (this.surfMap.markersManager) {
            this.surfMap.markersManager.handleHover(event);
        }
    }

    /**
     * Handles tap events.
     */
    handleTap(event) {
        const { detail } = event;
        
        // Forward to markers manager for marker click detection
        if (this.surfMap.markersManager) {
            this.surfMap.markersManager.handleTap({ detail });
        }
    }

    /**
     * Handles double tap events (zoom in at tap location).
     */
    handleDoubleTap(event) {
        const { detail } = event;
        const { clientX, clientY } = detail;
        
        // Stop any ongoing momentum
        this.stopMomentum();
        
        // Calculate new zoom level
        const newZoom = Math.min(
            this.state.zoom * this.options.doubleTapZoomFactor,
            this.surfMap.options.maxZoom
        );
        
        // Get viewport for coordinate calculation
        const rect = this.surfMap.viewport.getVisibleRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        // Calculate image coordinates at tap point
        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;
        
        // Apply zoom while keeping tap point fixed
        this.state.zoom = newZoom;
        this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
        this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
        
        // Constrain pan and render
        this.surfMap.constrainPan();
        this.surfMap.forceRender();
        this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
    }

    /**
     * Handles drag events.
     */
    handleDrag(event) {
        const { detail } = event;
        const { deltaX, deltaY } = detail;
        
        // Stop any ongoing momentum
        this.stopMomentum();
        
        // Update velocity for this frame
        this.panState.velocityX = deltaX;
        this.panState.velocityY = deltaY;
        
        // Start panning animation if not already started
        if (!this.panState.isPanning) {
            this.panState.isPanning = true;
            this.startPanningAnimation();
        }
    }

    /**
     * Handles drag end events.
     */
    handleDragEnd(event) {
        const { detail } = event;
        
        // Stop panning animation
        this.panState.isPanning = false;
        
        // Start momentum if enabled and velocity is significant
        if (this.options.momentumEnabled && detail.velocityX !== undefined && detail.velocityY !== undefined) {
            const velocityX = detail.velocityX * 16; // Convert ms to frame (60fps)
            const velocityY = detail.velocityY * 16;
            const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            
            if (speed >= this.options.momentumMinVelocity) {
                // Cap velocity to maximum
                let finalVelocityX = velocityX;
                let finalVelocityY = velocityY;
                
                if (speed > this.options.momentumMaxVelocity) {
                    const scale = this.options.momentumMaxVelocity / speed;
                    finalVelocityX *= scale;
                    finalVelocityY *= scale;
                }
                
                // Start momentum
                this.startMomentum(finalVelocityX, finalVelocityY);
            } else {
                // Emit pan changed event
                this.surfMap.emit('panChanged', {
                    panX: this.state.panX,
                    panY: this.state.panY
                });
            }
        } else {
            // Emit pan changed event
            this.surfMap.emit('panChanged', {
                panX: this.state.panX,
                panY: this.state.panY
            });
        }
    }

    /**
     * Starts the panning animation loop.
     */
    startPanningAnimation() {
        if (this.panState.animationFrame) {
            return; // Already running
        }
        
        const animate = () => {
            if (this.panState.isPanning) {
                // Apply velocity with damping
                this.state.panX += this.panState.velocityX;
                this.state.panY += this.panState.velocityY;
                
                // Apply damping
                this.panState.velocityX *= 0.92;
                this.panState.velocityY *= 0.92;
                
                // Constrain pan and render
                this.surfMap.constrainPan();
                this.surfMap.forceRender();
                
                // Continue animation
                this.panState.animationFrame = requestAnimationFrame(animate);
            } else {
                // Panning stopped
                this.panState.animationFrame = null;
                this.surfMap.emit('panChanged', {
                    panX: this.state.panX,
                    panY: this.state.panY
                });
            }
        };
        
        this.panState.animationFrame = requestAnimationFrame(animate);
    }

    /**
     * Starts momentum animation.
     */
    startMomentum(velocityX, velocityY) {
        // Stop any existing momentum
        this.stopMomentum();
        
        this.momentum.active = true;
        this.momentum.velocityX = velocityX;
        this.momentum.velocityY = velocityY;
        
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
            this.surfMap.emit('panChanged', {
                panX: this.state.panX,
                panY: this.state.panY
            });
            return;
        }
        
        // Apply momentum to pan
        this.state.panX += this.momentum.velocityX;
        this.state.panY += this.momentum.velocityY;
        
        // Constrain and render
        this.surfMap.constrainPan();
        this.surfMap.forceRender();
        
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
     * Handles pinch zoom events.
     */
    handlePinch(event) {
        const { detail } = event;
        const { scale, clientX, clientY } = detail;
        
        // Stop any ongoing momentum
        this.stopMomentum();
        
        // Get viewport for coordinate calculation
        const rect = this.surfMap.viewport.getVisibleRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        // Calculate image coordinates at pinch center
        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;
        
        // Calculate new zoom (scale is incremental, not absolute)
        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom * scale)
        );
        
        // Only update if zoom actually changed
        if (Math.abs(newZoom - this.state.zoom) > 1e-6) {
            this.state.zoom = newZoom;
            
            // Adjust pan to keep pinch center fixed
            this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
            this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
            
            // Constrain and render
            this.surfMap.constrainPan();
            this.surfMap.forceRender();
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    /**
     * Handles pinch end events.
     */
    handlePinchEnd(event) {
        // Emit zoom changed event
        this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
    }

    /**
     * Handles mouse wheel zoom events.
     */
    handleZoom(event) {
        const { detail } = event;
        const { delta, clientX, clientY } = detail;
        
        // Stop any ongoing momentum
        this.stopMomentum();
        
        // Get viewport for coordinate calculation
        const rect = this.surfMap.viewport.getVisibleRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        // Calculate image coordinates at mouse position
        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;
        
        // Calculate new zoom
        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom + delta * this.options.zoomSensitivity)
        );
        
        // Only update if zoom actually changed
        if (Math.abs(newZoom - this.state.zoom) > 1e-6) {
            this.state.zoom = newZoom;
            
            // Adjust pan to keep mouse position fixed
            this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
            this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
            
            // Constrain and render
            this.surfMap.constrainPan();
            this.surfMap.forceRender();
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    /**
     * Destroys the interaction handler and cleans up resources.
     */
    destroy() {
        // Stop all animations
        this.stopMomentum();
        
        if (this.panState.animationFrame) {
            cancelAnimationFrame(this.panState.animationFrame);
            this.panState.animationFrame = null;
        }
        
        // Destroy the interaction manager
        if (this.interactionManager) {
            this.interactionManager.destroy();
        }
        
        // Clear references
        this.canvas = null;
        this.state = null;
        this.surfMap = null;
        this.interactionManager = null;
    }
}
