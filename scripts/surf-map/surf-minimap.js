/**
 * @fileoverview Surf map minimap module.
 * @version 1.0.0
 * @description This module handles the minimap component for navigation,
 * showing an overview map with spot indicators and viewport indicator.
 */

/**
 * Surf map minimap class.
 */
export class SurfMinimap {
    /**
     * @param {HTMLCanvasElement} canvas - The main map canvas.
     * @param {Object} state - The map state object.
     * @param {SurfSpotsManager} spotsManager - The surf spots data manager.
     * @param {Object} options - Configuration options.
     */
    constructor(canvas, state, spotsManager, options = {}) {
        this.canvas = canvas;
        this.state = state;
        this.spotsManager = spotsManager;
        
        // Configuration options
        this.options = {
            width: options.width || 150,
            height: options.height || 150,
            padding: options.padding || 20,
            backgroundColor: options.backgroundColor || 'rgba(26, 26, 26, 0.8)',
            borderColor: options.borderColor || '#FF4D4D',
            borderWidth: options.borderWidth || 2,
            viewportColor: options.viewportColor || 'rgba(255, 77, 77, 0.3)',
            viewportBorderColor: options.viewportBorderColor || '#FF4D4D',
            spotIndicatorColor: options.spotIndicatorColor || '#4CAF50',
            spotIndicatorSize: options.spotIndicatorSize || 3,
            enableClick: options.enableClick !== false,
            enableHover: options.enableHover !== false,
            ...options
        };
        
        // Minimap canvas
        this.minimapCanvas = null;
        this.minimapCtx = null;
        
        // State
        this.visible = true;
        this.hoveredSpot = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        
        // Event handlers
        this.eventHandlers = {
            click: this.handleClick.bind(this),
            mousedown: this.handleMouseDown.bind(this),
            mousemove: this.handleMouseMove.bind(this),
            mouseup: this.handleMouseUp.bind(this),
            mouseleave: this.handleMouseLeave.bind(this)
        };
        
        // Callbacks
        this.onSpotClick = null;
        this.onViewportChange = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initializes the minimap.
     */
    init() {
        this.createMinimap();
        this.addEventListeners();
        
        // Initial render
        this.render();
    }

    /**
     * Creates the minimap canvas.
     */
    createMinimap() {
        // Find the minimap container first
        const minimapContainer = document.getElementById('surf-map-minimap');
        if (!minimapContainer) {
            console.error('Minimap container (#surf-map-minimap) not found');
            return;
        }

        // Create minimap canvas
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCanvas.className = 'surf-minimap';
        
        // Calculate aspect ratio from the main map image
        if (this.state.image && this.state.image.naturalWidth && this.state.image.naturalHeight) {
            const aspectRatio = this.state.image.naturalHeight / this.state.image.naturalWidth;
            const minimapWidth = this.options.width;
            const minimapHeight = minimapWidth * aspectRatio;
            
            // Update options with the calculated height
            this.options.height = minimapHeight;
            
            // Set canvas dimensions
            this.minimapCanvas.width = minimapWidth;
            this.minimapCanvas.height = minimapHeight;
            
            // Set container dimensions to match the canvas, removing padding
            minimapContainer.style.width = `${minimapWidth}px`;
            minimapContainer.style.height = `${minimapHeight}px`;
        } else {
            // Fallback to default dimensions if image is not loaded yet
            this.minimapCanvas.width = this.options.width;
            this.minimapCanvas.height = this.options.height;
        }
        
        this.minimapCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            border: ${this.options.borderWidth}px solid ${this.options.borderColor};
            border-radius: 4px;
            cursor: pointer;
            box-sizing: border-box;
        `;
        
        // Get context
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Add canvas to the container
        minimapContainer.appendChild(this.minimapCanvas);
        console.log('Minimap successfully appended to #surf-map-minimap container');
    }

    /**
     * Adds event listeners.
     */
    addEventListeners() {
        if (this.options.enableClick) {
            this.minimapCanvas.addEventListener('click', this.eventHandlers.click);
            this.minimapCanvas.addEventListener('mousedown', this.eventHandlers.mousedown);
        }
        
        if (this.options.enableHover) {
            this.minimapCanvas.addEventListener('mousemove', this.eventHandlers.mousemove);
            this.minimapCanvas.addEventListener('mouseleave', this.eventHandlers.mouseleave);
        }
        
        if (this.options.enableClick) {
            document.addEventListener('mouseup', this.eventHandlers.mouseup);
        }
    }

    /**
     * Removes event listeners.
     */
    removeEventListeners() {
        if (this.options.enableClick) {
            this.minimapCanvas.removeEventListener('click', this.eventHandlers.click);
            this.minimapCanvas.removeEventListener('mousedown', this.eventHandlers.mousedown);
        }
        
        if (this.options.enableHover) {
            this.minimapCanvas.removeEventListener('mousemove', this.eventHandlers.mousemove);
            this.minimapCanvas.removeEventListener('mouseleave', this.eventHandlers.mouseleave);
        }
        
        if (this.options.enableClick) {
            document.removeEventListener('mouseup', this.eventHandlers.mouseup);
        }
    }

    /**
     * Renders the minimap.
     */
    render() {
        if (!this.visible || !this.minimapCtx || !this.state.imageLoaded) return;
        
        // Clear canvas
        this.minimapCtx.fillStyle = this.options.backgroundColor;
        this.minimapCtx.fillRect(0, 0, this.options.width, this.options.height);
        
        // Calculate scaling
        const scaleX = this.options.width / this.state.image.width;
        const scaleY = this.options.height / this.state.image.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate offsets to center the image
        const offsetX = (this.options.width - this.state.image.width * scale) / 2;
        const offsetY = (this.options.height - this.state.image.height * scale) / 2;
        
        // Draw minimap image
        this.minimapCtx.save();
        this.minimapCtx.translate(offsetX, offsetY);
        this.minimapCtx.scale(scale, scale);
        
        // Draw a simplified version of the main image
        this.minimapCtx.globalAlpha = 0.5;
        this.minimapCtx.drawImage(
            this.state.image,
            0, 0,
            this.state.image.width,
            this.state.image.height
        );
        this.minimapCtx.globalAlpha = 1;
        
        // Draw spot indicators
        this.drawSpotIndicators(scale);
        
        this.minimapCtx.restore();
        
        // Draw viewport indicator
        this.drawViewportIndicator(scale, offsetX, offsetY);
    }

    /**
     * Draws spot indicators on the minimap.
     * @param {number} scale - The scale factor.
     */
    drawSpotIndicators(scale) {
        if (!this.spotsManager || !this.spotsManager.loaded) return;
        
        const spots = this.spotsManager.getAllSpots();
        
        spots.forEach(spot => {
            if (spot.pixelCoordinates) {
                const { x, y } = spot.pixelCoordinates;
                
                // Check if this spot should be visible
                if (this.visibleSpotIds && !this.visibleSpotIds.has(spot.id)) {
                    // Skip spots that aren't in the visible list
                    return;
                }
                
                const difficulty = spot.waveDetails && spot.waveDetails.abilityLevel ?
                    spot.waveDetails.abilityLevel.primary : 'intermediate';
                const color = this.spotsManager.getDifficultyColor ?
                    this.spotsManager.getDifficultyColor(difficulty) : '#4CAF50';
                
                // Draw spot indicator with reduced opacity for filtered spots
                this.minimapCtx.globalAlpha = this.visibleSpotIds ? 1.0 : 0.3;
                this.minimapCtx.fillStyle = color;
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(x, y, this.options.spotIndicatorSize, 0, Math.PI * 2);
                this.minimapCtx.fill();
                this.minimapCtx.globalAlpha = 1.0;
                
                // Highlight hovered spot
                if (this.hoveredSpot === spot.id) {
                    this.minimapCtx.strokeStyle = '#ffffff';
                    this.minimapCtx.lineWidth = 1;
                    this.minimapCtx.beginPath();
                    this.minimapCtx.arc(x, y, this.options.spotIndicatorSize + 2, 0, Math.PI * 2);
                    this.minimapCtx.stroke();
                }
            }
        });
    }

    /**
     * Draws the viewport indicator.
     * @param {number} scale - The scale factor.
     * @param {number} offsetX - The X offset.
     * @param {number} offsetY - The Y offset.
     */
    drawViewportIndicator(scale, offsetX, offsetY) {
        if (!this.canvas) return;
        
        // Get canvas dimensions in CSS pixels
        const canvasWidth = this.canvas.width / (this.canvas.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (this.canvas.devicePixelRatio || 1);
        
        // Calculate viewport bounds in image coordinates
        const viewportLeft = (-canvasWidth / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportTop = (-canvasHeight / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        const viewportRight = (canvasWidth / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportBottom = (canvasHeight / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        
        // Convert to minimap coordinates
        const minimapLeft = viewportLeft * scale + offsetX;
        const minimapTop = viewportTop * scale + offsetY;
        const minimapRight = viewportRight * scale + offsetX;
        const minimapBottom = viewportBottom * scale + offsetY;
        
        // Draw viewport rectangle
        this.minimapCtx.fillStyle = this.options.viewportColor;
        this.minimapCtx.strokeStyle = this.options.viewportBorderColor;
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.fillRect(
            minimapLeft,
            minimapTop,
            minimapRight - minimapLeft,
            minimapBottom - minimapTop
        );
        this.minimapCtx.strokeRect(
            minimapLeft,
            minimapTop,
            minimapRight - minimapLeft,
            minimapBottom - minimapTop
        );
    }

    /**
     * Handles click events on the minimap.
     * @param {MouseEvent} e - The mouse event.
     */
    handleClick(e) {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if a spot was clicked
        const clickedSpot = this.getSpotAtPosition(x, y);
        if (clickedSpot) {
            if (this.onSpotClick) {
                this.onSpotClick(clickedSpot);
            }
            return;
        }
        
        // Check if click is within viewport indicator
        if (this.isWithinViewportIndicator(x, y)) {
            // Click is within viewport, don't navigate
            return;
        }
        
        // Otherwise, navigate to the clicked position
        this.navigateToPosition(x, y);
    }

    /**
     * Handles mouse down events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseDown(e) {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if a spot was clicked
        const clickedSpot = this.getSpotAtPosition(x, y);
        if (!clickedSpot && !this.isWithinViewportIndicator(x, y)) {
            this.isDragging = true;
            this.dragStart = { x, y };
            this.minimapCanvas.style.cursor = 'grabbing';
            e.preventDefault();
        }
    }

    /**
     * Handles mouse move events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseMove(e) {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging) {
            // Navigate to the dragged position
            this.navigateToPosition(x, y);
        } else {
            // Check for spot hover
            const hoveredSpot = this.getSpotAtPosition(x, y);
            
            if (hoveredSpot !== this.hoveredSpot) {
                this.hoveredSpot = hoveredSpot;
                this.minimapCanvas.style.cursor = hoveredSpot ? 'pointer' : 'grab';
                this.render();
            }
        }
    }

    /**
     * Handles mouse up events.
     */
    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.minimapCanvas.style.cursor = 'grab';
        }
    }

    /**
     * Handles mouse leave events.
     */
    handleMouseLeave() {
        this.hoveredSpot = null;
        this.isDragging = false;
        this.minimapCanvas.style.cursor = 'grab';
        this.render();
    }

    /**
     * Gets the spot at the specified position.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @returns {Object|null} The spot data or null if no spot found.
     */
    getSpotAtPosition(x, y) {
        if (!this.spotsManager.loaded) return null;
        
        // Calculate scaling
        const scaleX = this.options.width / this.state.image.width;
        const scaleY = this.options.height / this.state.image.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate offsets to center the image
        const offsetX = (this.options.width - this.state.image.width * scale) / 2;
        const offsetY = (this.options.height - this.state.image.height * scale) / 2;
        
        // Convert to image coordinates
        const imageX = (x - offsetX) / scale;
        const imageY = (y - offsetY) / scale;
        
        // Check for spots
        const spots = this.spotsManager.getAllSpots();
        for (const spot of spots) {
            if (spot.pixelCoordinates) {
                const distance = Math.sqrt(
                    Math.pow(imageX - spot.pixelCoordinates.x, 2) +
                    Math.pow(imageY - spot.pixelCoordinates.y, 2)
                );
                
                if (distance <= this.options.spotIndicatorSize + 3) {
                    return spot;
                }
            }
        }
        
        return null;
    }

    /**
     * Navigates to the specified position on the minimap.
     * @param {number} x - The X coordinate on the minimap.
     * @param {number} y - The Y coordinate on the minimap.
     */
    navigateToPosition(x, y) {
        // Calculate scaling
        const scaleX = this.options.width / this.state.image.width;
        const scaleY = this.options.height / this.state.image.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate offsets to center the image
        const offsetX = (this.options.width - this.state.image.width * scale) / 2;
        const offsetY = (this.options.height - this.state.image.height * scale) / 2;
        
        // Convert to image coordinates
        const imageX = (x - offsetX) / scale;
        const imageY = (y - offsetY) / scale;
        
        // Calculate new pan position to center the image coordinates
        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;
        
        // Calculate the new pan position with proper coordinate transformation
        // The image coordinates need to be adjusted for the current zoom level
        // Also need to account for the image center offset in the coordinate transformation
        const newPanX = canvasCenterX - (imageX - this.state.image.width / 2) * this.state.zoom;
        const newPanY = canvasCenterY - (imageY - this.state.image.height / 2) * this.state.zoom;
        
        // Emit viewport change event instead of directly updating state
        // This allows the main map to handle the update with proper constraints
        if (this.onViewportChange) {
            this.onViewportChange({ panX: newPanX, panY: newPanY, zoom: this.state.zoom });
        }
    }
    
    /**
     * Checks if the specified position is within the viewport indicator.
     * @param {number} x - The X coordinate on the minimap.
     * @param {number} y - The Y coordinate on the minimap.
     * @returns {boolean} Whether the position is within the viewport indicator.
     */
    isWithinViewportIndicator(x, y) {
        // Calculate scaling
        const scaleX = this.options.width / this.state.image.width;
        const scaleY = this.options.height / this.state.image.height;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate offsets to center the image
        const offsetX = (this.options.width - this.state.image.width * scale) / 2;
        const offsetY = (this.options.height - this.state.image.height * scale) / 2;
        
        // Calculate viewport bounds in image coordinates
        const viewportLeft = (-this.canvas.width / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportTop = (-this.canvas.height / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        const viewportRight = (this.canvas.width / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportBottom = (this.canvas.height / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        
        // Convert to minimap coordinates
        const minimapLeft = viewportLeft * scale + offsetX;
        const minimapTop = viewportTop * scale + offsetY;
        const minimapRight = viewportRight * scale + offsetX;
        const minimapBottom = viewportBottom * scale + offsetY;
        
        // Check if position is within viewport rectangle
        return x >= minimapLeft && x <= minimapRight && y >= minimapTop && y <= minimapBottom;
    }

    /**
     * Shows the minimap.
     */
    show() {
        if (!this.visible) {
            this.visible = true;
            this.minimapCanvas.style.display = 'block';
            this.render();
        }
    }

    /**
     * Hides the minimap.
     */
    hide() {
        if (this.visible) {
            this.visible = false;
            this.minimapCanvas.style.display = 'none';
        }
    }

    /**
     * Updates the minimap size.
     * @param {number} width - The new width.
     * @param {number} height - The new height.
     */
    updateSize(width, height) {
        this.options.width = width;
        this.options.height = height;
        
        this.minimapCanvas.width = width;
        this.minimapCanvas.height = height;
        
        this.render();
    }

    /**
     * Sets the spot click callback.
     * @param {Function} callback - The callback function.
     */
    setSpotClickCallback(callback) {
        this.onSpotClick = callback;
    }

    /**
     * Sets the viewport change callback.
     * @param {Function} callback - The callback function.
     */
    setViewportChangeCallback(callback) {
        this.onViewportChange = callback;
    }

    /**
     * Updates the visible spots on the minimap.
     * @param {Array<Object>} visibleSpots - Array of visible surf spots.
     */
    updateVisibleSpots(visibleSpots) {
        // Create a set of visible spot IDs for quick lookup
        this.visibleSpotIds = new Set(visibleSpots.map(spot => spot.id));
        
        // Re-render the minimap to show updated spot visibility
        this.render();
    }

    // This method is a duplicate and has been merged with the drawSpotIndicators method above

    /**
     * Destroys the minimap and cleans up resources.
     */
    destroy() {
        // Remove event listeners
        this.removeEventListeners();
        
        // Remove DOM element
        if (this.minimapCanvas && this.minimapCanvas.parentNode) {
            this.minimapCanvas.parentNode.removeChild(this.minimapCanvas);
        }
        
        // Clear references
        this.minimapCanvas = null;
        this.minimapCtx = null;
        this.hoveredSpot = null;
        this.onSpotClick = null;
        this.onViewportChange = null;
    }
}