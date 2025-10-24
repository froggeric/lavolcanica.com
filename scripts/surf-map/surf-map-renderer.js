/**
 * @fileoverview Renderer for the SurfMap component.
 * @description This module contains the SurfMapRenderer class that handles all canvas
 * rendering operations for the surf map, including drawing the image and applying
 * transformations for zoom and pan.
 */

/**
 * Renderer class for the SurfMap component.
 */
export class SurfMapRenderer {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to render on.
     * @param {Object} state - The map state object.
     */
    constructor(canvas, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        
        // Rendering options
        this.options = {
            enableSmoothing: true,
            backgroundColor: '#1a1a1a',
            transitionDuration: 300, // ms
            transitionEasing: 'ease-out'
        };
        
        // Animation state
        this.animationFrame = null;
        this.transitioning = false;
        this.transitionStart = null;
        this.transitionStartState = null;
        this.transitionEndState = null;
        
        // Performance optimization
        this.lastRenderTime = 0;
        this.renderThrottle = 1000 / 60; // 60 FPS
        
        // Device pixel ratio for high-DPI displays
        this.dpr = window.devicePixelRatio || 1;
        
        // Initialize canvas size
        this.resize();
    }

    /**
     * Renders the map on the canvas.
     * @param {boolean} [force=false] - Whether to force rendering even if throttled.
     */
    render(force = false) {
        // Throttle rendering for performance
        const now = performance.now();
        if (!force && now - this.lastRenderTime < this.renderThrottle) {
            return;
        }
        this.lastRenderTime = now;

        // Clear the canvas
        this.clear();
        
        // If image is not loaded, show loading state
        if (!this.state.imageLoaded) {
            this.renderLoadingState();
            return;
        }
        
        // Check if we're in a transition
        if (this.transitioning) {
            // Update transition progress
            const now = performance.now();
            const elapsed = now - this.transitionStart;
            const progress = Math.min(elapsed / this.options.transitionDuration, 1);
            
            // Apply easing function
            const easedProgress = this.easeOut(progress);
            
            // Update state
            this.state.zoom = this.lerp(
                this.transitionStartState.zoom,
                this.transitionEndState.zoom,
                easedProgress
            );
            this.state.panX = this.lerp(
                this.transitionStartState.panX,
                this.transitionEndState.panX,
                easedProgress
            );
            this.state.panY = this.lerp(
                this.transitionStartState.panY,
                this.transitionEndState.panY,
                easedProgress
            );
            
            // Check if transition is complete
            if (progress >= 1) {
                this.transitioning = false;
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                    this.animationFrame = null;
                }
            }
        }
        
        // Save context state
        this.ctx.save();
        
        // Apply transformations
        this.applyTransformations();
        
        // Draw the image
        this.drawImage();
        
        // Restore context state
        this.ctx.restore();
        
        // UI elements are now in the DOM, no longer drawn on canvas
    }

    /**
     * Clears the canvas.
     */
    clear() {
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Renders a loading state.
     */
    renderLoadingState() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Roboto, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Loading map...', this.canvas.width / 2, this.canvas.height / 2);
    }

    /**
     * Applies zoom and pan transformations.
     */
    applyTransformations() {
        // Scale for high-DPI displays
        this.ctx.scale(this.dpr, this.dpr);
        
        // Move to center of canvas (in CSS pixels)
        const cssWidth = this.canvas.width / this.dpr;
        const cssHeight = this.canvas.height / this.dpr;
        this.ctx.translate(cssWidth / 2, cssHeight / 2);
        
        // Apply pan
        this.ctx.translate(this.state.panX, this.state.panY);
        
        // Apply zoom
        this.ctx.scale(this.state.zoom, this.state.zoom);
        
        // Move to center of image
        this.ctx.translate(-this.state.image.width / 2, -this.state.image.height / 2);
    }

    /**
     * Draws the map image.
     */
    drawImage() {
        if (!this.state.image) {
            return;
        }
        
        // Set image smoothing for better quality
        this.ctx.imageSmoothingEnabled = this.options.enableSmoothing;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Draw the image
        this.ctx.drawImage(
            this.state.image,
            0, 0,
            this.state.image.width,
            this.state.image.height
        );
    }


    /**
     * Starts a transition to a new state.
     * @param {Object} endState - The target state.
     */
    startTransition(endState) {
        this.transitioning = true;
        this.transitionStart = performance.now();
        this.transitionStartState = {
            zoom: this.state.zoom,
            panX: this.state.panX,
            panY: this.state.panY
        };
        this.transitionEndState = { ...endState };
        
        // Cancel any existing animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Start the animation
        this.animateTransition();
    }

    /**
     * Animates the transition.
     */
    animateTransition() {
        const now = performance.now();
        const elapsed = now - this.transitionStart;
        const progress = Math.min(elapsed / this.options.transitionDuration, 1);
        
        // Apply easing function
        const easedProgress = this.easeOut(progress);
        
        // Update state
        this.state.zoom = this.lerp(
            this.transitionStartState.zoom,
            this.transitionEndState.zoom,
            easedProgress
        );
        this.state.panX = this.lerp(
            this.transitionStartState.panX,
            this.transitionEndState.panX,
            easedProgress
        );
        this.state.panY = this.lerp(
            this.transitionStartState.panY,
            this.transitionEndState.panY,
            easedProgress
        );
        
        // Render
        this.render(true);
        
        // Continue animation if not complete
        if (progress < 1) {
            this.animationFrame = requestAnimationFrame(() => this.animateTransition());
        } else {
            this.transitioning = false;
            this.animationFrame = null;
        }
    }

    /**
     * Ease-out easing function.
     * @param {number} t - The progress value (0-1).
     * @returns {number} The eased value.
     */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Linear interpolation between two values.
     * @param {number} start - The start value.
     * @param {number} end - The end value.
     * @param {number} t - The interpolation factor (0-1).
     * @returns {number} The interpolated value.
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Resizes the canvas to match its container.
     */
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        
        // Set the actual size in memory (scaled for device pixel ratio)
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        
        // Scale the canvas down using CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Re-render with throttling (not forced)
        this.render();
    }

    /**
     * Destroys the renderer and cleans up resources.
     */
    destroy() {
        // Cancel any ongoing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear references
        this.canvas = null;
        this.ctx = null;
    }
}
