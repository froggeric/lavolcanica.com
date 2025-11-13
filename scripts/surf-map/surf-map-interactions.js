import { InteractionManager } from './interaction-manager.js';

/**
 * @fileoverview Optimized interaction handler for the SurfMap component.
 * @description Provides the smoothest possible pan/zoom experience with direct
 * state updates during drag and physics-based momentum. Mobile-first with
 * excellent desktop support.
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
        
        this.options = {
            momentumEnabled: true,
            momentumFriction: 0.92,
            momentumMinVelocity: 0.5, // px/ms
            momentumMaxVelocity: 50, // px/frame
            zoomSensitivity: 1.0, // Direct multiplier (no extra reduction)
            doubleTapZoomFactor: 1.5,
            ...options
        };
        
        // Momentum state
        this.momentum = {
            active: false,
            velocityX: 0,
            velocityY: 0,
            animationFrame: null
        };
        
        // Zoom animation state
        this.zoomAnimation = {
            active: false,
            startZoom: 0,
            targetZoom: 0,
            startTime: 0,
            duration: 200, // ms
            centerX: 0,
            centerY: 0,
            imageX: 0,
            imageY: 0,
            animationFrame: null
        };
        
        // Cached viewport for performance
        this.cachedViewport = null;
        this.viewportDirty = true;
        
        // Initialize interaction manager
        this.interactionManager = new InteractionManager(canvas, null, state);
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners.
     */
    setupEventListeners() {
        this.canvas.addEventListener('tap', this.handleTap.bind(this));
        this.canvas.addEventListener('doubletap', this.handleDoubleTap.bind(this));
        this.canvas.addEventListener('drag', this.handleDrag.bind(this));
        this.canvas.addEventListener('dragend', this.handleDragEnd.bind(this));
        this.canvas.addEventListener('zoom', this.handleZoom.bind(this));
        this.canvas.addEventListener('pinch', this.handlePinch.bind(this));
        this.canvas.addEventListener('pinchend', this.handlePinchEnd.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    /**
     * Gets cached viewport or recalculates if dirty.
     */
    getViewport() {
        if (this.viewportDirty || !this.cachedViewport) {
            this.cachedViewport = this.surfMap.viewport.getVisibleRect();
            this.viewportDirty = false;
        }
        return this.cachedViewport;
    }

    /**
     * Marks viewport cache as dirty.
     */
    invalidateViewport() {
        this.viewportDirty = true;
    }

    /**
     * Handles mouse move for hover effects.
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
        if (this.surfMap.markersManager) {
            this.surfMap.markersManager.handleTap({ detail });
        }
    }

    /**
     * Handles double tap - zoom in at tap location.
     */
    handleDoubleTap(event) {
        const { detail } = event;
        const { clientX, clientY } = detail;
        
        this.stopMomentum();
        
        const newZoom = Math.min(
            this.state.zoom * this.options.doubleTapZoomFactor,
            this.surfMap.options.maxZoom
        );
        
        const rect = this.getViewport();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;
        
        this.state.zoom = newZoom;
        this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
        this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
        
        this.surfMap.constrainPan();
        this.surfMap.forceRender();
        this.invalidateViewport();
        this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
    }

    /**
     * Handles drag - DIRECT state update for immediate response.
     */
    handleDrag(event) {
        const { detail } = event;
        const { deltaX, deltaY } = detail;
        
        // Stop any momentum
        this.stopMomentum();
        
        // Direct state update - zero overhead
        this.state.panX += deltaX;
        this.state.panY += deltaY;
        
        // Constrain and render immediately
        this.surfMap.constrainPan();
        this.surfMap.forceRender();
        this.invalidateViewport();
    }

    /**
     * Handles drag end - start momentum if velocity is sufficient.
     */
    handleDragEnd(event) {
        const { detail } = event;
        const { velocityX, velocityY } = detail;
        
        if (this.options.momentumEnabled && velocityX !== undefined && velocityY !== undefined) {
            // Convert velocity from px/ms to px/frame (60fps)
            const vx = velocityX * 16;
            const vy = velocityY * 16;
            const speed = Math.sqrt(vx * vx + vy * vy);
            
            if (speed >= this.options.momentumMinVelocity) {
                // Cap velocity
                let finalVX = vx;
                let finalVY = vy;
                
                if (speed > this.options.momentumMaxVelocity) {
                    const scale = this.options.momentumMaxVelocity / speed;
                    finalVX *= scale;
                    finalVY *= scale;
                }
                
                this.startMomentum(finalVX, finalVY);
                return;
            }
        }
        
        this.surfMap.emit('panChanged', {
            panX: this.state.panX,
            panY: this.state.panY
        });
    }

    /**
     * Starts momentum animation - SINGLE LOOP for smooth deceleration.
     */
    startMomentum(velocityX, velocityY) {
        this.stopMomentum();
        
        this.momentum.active = true;
        this.momentum.velocityX = velocityX;
        this.momentum.velocityY = velocityY;
        
        this.animateMomentum();
    }

    /**
     * Animates momentum with physics-based deceleration.
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
        
        // Stop if too slow
        if (speed < 0.1) {
            this.stopMomentum();
            this.surfMap.emit('panChanged', {
                panX: this.state.panX,
                panY: this.state.panY
            });
            return;
        }
        
        // Apply momentum to state
        this.state.panX += this.momentum.velocityX;
        this.state.panY += this.momentum.velocityY;
        
        // Constrain and render
        this.surfMap.constrainPan();
        this.surfMap.forceRender();
        this.invalidateViewport();
        
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
     * Handles pinch zoom - update every frame for smooth scaling.
     */
    handlePinch(event) {
        const { detail } = event;
        const { scale, centerX, centerY } = detail;
        
        this.stopMomentum();
        
        const rect = this.getViewport();
        const mouseX = centerX - rect.left;
        const mouseY = centerY - rect.top;
        
        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;
        
        // Calculate target zoom and strictly enforce limits
        const targetZoom = this.state.zoom * scale;
        const newZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, targetZoom)
        );
        
        // Only update if within valid range and actually changed
        if (Math.abs(newZoom - this.state.zoom) > 1e-6) {
            this.state.zoom = newZoom;
            this.state.panX = (mouseX - rect.width / 2) - imageX * newZoom;
            this.state.panY = (mouseY - rect.height / 2) - imageY * newZoom;
            
            this.surfMap.constrainPan();
            this.surfMap.forceRender();
            this.invalidateViewport();
        }
    }

    /**
     * Handles pinch end.
     */
    handlePinchEnd(event) {
        this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
    }

    /**
     * Handles wheel zoom with smooth animation.
     */
    handleZoom(event) {
        const { detail } = event;
        const { delta, clientX, clientY } = detail;
        
        this.stopMomentum();
        
        const rect = this.getViewport();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        const imageX = (mouseX - rect.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (mouseY - rect.height / 2 - this.state.panY) / this.state.zoom;
        
        // Calculate target zoom
        const zoomFactor = 1 + delta * this.options.zoomSensitivity;
        const targetZoom = Math.max(
            this.surfMap.options.minZoom,
            Math.min(this.surfMap.options.maxZoom, this.state.zoom * zoomFactor)
        );
        
        if (Math.abs(targetZoom - this.state.zoom) > 1e-6) {
            // Start smooth zoom animation
            this.startZoomAnimation(targetZoom, mouseX, mouseY, imageX, imageY);
        }
    }

    /**
     * Starts a smooth zoom animation.
     */
    startZoomAnimation(targetZoom, centerX, centerY, imageX, imageY) {
        // Stop any existing zoom animation
        this.stopZoomAnimation();
        
        this.zoomAnimation.active = true;
        this.zoomAnimation.startZoom = this.state.zoom;
        this.zoomAnimation.targetZoom = targetZoom;
        this.zoomAnimation.startTime = performance.now();
        this.zoomAnimation.centerX = centerX;
        this.zoomAnimation.centerY = centerY;
        this.zoomAnimation.imageX = imageX;
        this.zoomAnimation.imageY = imageY;
        
        this.animateZoom();
    }

    /**
     * Animates the zoom transition.
     */
    animateZoom() {
        if (!this.zoomAnimation.active) return;
        
        const now = performance.now();
        const elapsed = now - this.zoomAnimation.startTime;
        const progress = Math.min(elapsed / this.zoomAnimation.duration, 1);
        
        // easeOutCubic for smooth deceleration
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate zoom
        const currentZoom = this.zoomAnimation.startZoom + 
            (this.zoomAnimation.targetZoom - this.zoomAnimation.startZoom) * easedProgress;
        
        // Update state
        this.state.zoom = currentZoom;
        
        const rect = this.getViewport();
        this.state.panX = (this.zoomAnimation.centerX - rect.width / 2) - 
            this.zoomAnimation.imageX * currentZoom;
        this.state.panY = (this.zoomAnimation.centerY - rect.height / 2) - 
            this.zoomAnimation.imageY * currentZoom;
        
        this.surfMap.constrainPan();
        this.surfMap.forceRender();
        this.invalidateViewport();
        
        if (progress < 1) {
            this.zoomAnimation.animationFrame = requestAnimationFrame(() => this.animateZoom());
        } else {
            this.stopZoomAnimation();
            this.surfMap.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    /**
     * Stops zoom animation.
     */
    stopZoomAnimation() {
        if (this.zoomAnimation.animationFrame) {
            cancelAnimationFrame(this.zoomAnimation.animationFrame);
            this.zoomAnimation.animationFrame = null;
        }
        this.zoomAnimation.active = false;
    }

    /**
     * Destroys the interaction handler.
     */
    destroy() {
        this.stopMomentum();
        this.stopZoomAnimation();
        
        if (this.interactionManager) {
            this.interactionManager.destroy();
        }
        
        this.canvas = null;
        this.state = null;
        this.surfMap = null;
        this.interactionManager = null;
        this.cachedViewport = null;
    }
}
