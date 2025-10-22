/**
 * @fileoverview Core SurfMap class for the fullscreen surf map interface.
 * @description This module contains the core SurfMap class that manages the map state,
 * coordinates between the renderer and interaction handlers, and provides the main API
 * for the surf map functionality.
 */

/**
 * Core SurfMap class that manages the map state and coordinates between components.
 */
export class SurfMap {
    /**
     * @param {HTMLElement} container - The container element for the map.
     * @param {Object} options - Configuration options for the map.
     * @param {string} options.imagePath - Path to the surf map image.
     * @param {number} [options.minZoom=0.5] - Minimum zoom level.
     * @param {number} [options.maxZoom=3.0] - Maximum zoom level.
     * @param {number} [options.initialZoom=1.0] - Initial zoom level.
     */
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            imagePath: options.imagePath || 'images/surf-map.webp',
            minZoom: options.minZoom || 0.5,
            maxZoom: options.maxZoom || 2.0, // Default to 2x to prevent over-zooming
            initialZoom: options.initialZoom || 1.0,
            // Performance optimization options
            renderThrottle: options.renderThrottle || (1000 / 60), // 60 FPS
            mobileRenderThrottle: options.mobileRenderThrottle || (1000 / 30), // 30 FPS on mobile
            enableTouchOptimizations: options.enableTouchOptimizations !== false,
            enableMemoryOptimization: options.enableMemoryOptimization !== false,
            visibilityCheckInterval: options.visibilityCheckInterval || 1000,
            mobileVisibilityCheckInterval: options.mobileVisibilityCheckInterval || 2000,
            ...options
        };
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        this.isTouchDevice = 'ontouchstart' in window;
        
        // Adjust performance options for mobile
        if (this.isMobile) {
            this.options.renderThrottle = this.options.mobileRenderThrottle;
            this.options.visibilityCheckInterval = this.options.mobileVisibilityCheckInterval;
        }

        // Map state
        this.state = {
            zoom: this.options.initialZoom,
            panX: 0,
            panY: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            lastPanX: 0,
            lastPanY: 0,
            imageLoaded: false,
            image: null
        };

        // Component references
        this.renderer = null;
        this.interactions = null;
        this.spotsManager = null;
        this.markersManager = null;
        this.spotModal = null;
        this.minimap = null;
        this.searchManager = null;
        this.spotsCounter = null;

        // Event listeners
        this.eventListeners = new Map();
        
        // Performance optimization state
        this.lastRenderTime = 0;
        this.renderFrameId = null;
        this.visibilityCheckIntervalId = null;
        this.isTouchActive = false;
        this.touchStartTime = 0;
        this.performanceMode = 'normal'; // 'normal', 'touch', 'memory'
        
        // State tracking for optimized rendering
        this.lastRenderState = {
            zoom: null,
            panX: null,
            panY: null,
            canvasWidth: null,
            canvasHeight: null,
            imageLoaded: null
        };
        this.needsRender = true;
        
        // Initialize the map
        this.init();
    }

    /**
     * Initializes the surf map by setting up the canvas and loading the image.
     */
    async init() {
        try {
            // Create the canvas element
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'surf-map-canvas';
            this.container.appendChild(this.canvas);
            
            // Set up canvas for high-DPI displays
            this.setupHighDPICanvas();

            // Initialize the surf spots manager early so it can be used by loadImage
            const { SurfSpotsManager } = await import('./surf-spots.js');
            this.spotsManager = new SurfSpotsManager();

            // Load the map image first and wait for it to complete
            await this.loadImage();
            
            // Set the image dimensions in the spots manager now that the image has loaded
            if (this.state.imageLoaded && this.state.image) {
                this.spotsManager.setImageDimensions(this.state.image.width, this.state.image.height);
                
                // Load surf spots after image dimensions are set
                await this.spotsManager.loadSurfSpots();

                // Validate coordinate conversion after setting image dimensions
                const validationResults = this.spotsManager.validateCoordinateConversion();
                if (!validationResults.valid) {
                    console.warn('Coordinate conversion validation failed:', validationResults.issues);
                }
            }

            // Initialize the renderer
            const { SurfMapRenderer } = await import('./surf-map-renderer.js');
            this.renderer = new SurfMapRenderer(this.canvas, this.state);

            // Initialize the interaction handler with mobile optimizations
            const { SurfMapInteractions } = await import('./surf-map-interactions.js');
            this.interactions = new SurfMapInteractions(this.canvas, this.state, this);
            
            // Set up touch performance optimizations
            if (this.options.enableTouchOptimizations) {
                this.setupTouchOptimizations();
            }

            // Initialize the markers manager with mobile optimizations
            const { SurfMarkersManager } = await import('./surf-markers.js');
            this.markersManager = new SurfMarkersManager(
                this.canvas,
                this.state,
                this.spotsManager,
                this,
                {
                    enableMobileOptimizations: this.isMobile,
                    maxVisibleMarkers: this.isMobile ? 50 : 100,
                    viewportBuffer: this.isMobile ? 30 : 50
                }
            );
            this.markersManager.setMarkerClickCallback(this.handleMarkerClick.bind(this));
            
            // Initialize markers now that the image has loaded and dimensions are set
            if (this.state.imageLoaded) {
                await this.markersManager.initializeMarkers();
            }

            // The spot detail panel is now handled by the main application
            // No need to initialize a separate modal

            // Initialize the minimap
            const { SurfMinimap } = await import('./surf-minimap.js');
            this.minimap = new SurfMinimap(this.canvas, this.state, this.spotsManager);
            this.minimap.setSpotClickCallback(this.handleMinimapSpotClick.bind(this));
            this.minimap.setViewportChangeCallback(this.handleMinimapViewportChange.bind(this));

            // Initialize search functionality
            const { SurfSearch } = await import('./surf-search.js');
            const searchInput = document.querySelector('.surf-map-search-input');
            this.searchManager = new SurfSearch(
                this.spotsManager,
                searchInput,
                null,
                {
                    debounceTime: this.isMobile ? 200 : 300,
                    maxResults: this.isMobile ? 8 : 10,
                    enableVoiceSearch: this.isMobile,
                    enableLocationSearch: this.isMobile,
                    touchFeedback: this.isMobile
                }
            );
            this.searchManager.setResultClickCallback(this.handleSearchResultClick.bind(this));
            this.searchManager.setSearchChangeCallback(this.handleSearchChange.bind(this));
            this.searchManager.setResultsUpdateCallback(this.handleResultsUpdate.bind(this));

            // Initialize the surf spots counter
            const { SurfSpotsCounter } = await import('./surf-counter.js');
            const counterElement = document.getElementById('surf-spots-counter');
            if (counterElement) {
                this.spotsCounter = new SurfSpotsCounter(counterElement, {
                    singularLabel: 'surf spot',
                    pluralLabel: 'surf spots',
                    animationDuration: 300
                });
            }

            // Set up clear button event listener
            const clearBtn = document.querySelector('.surf-map-clear-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clearSearch();
                });
            }

            // Set initial view
            this.resetView();

            // Start the render loop with performance optimizations
            this.startRenderLoop();
            
            // Start visibility checks
            this.startVisibilityChecks();

            // Initialize the counter with the total number of spots
            if (this.spotsCounter && this.spotsManager) {
                const totalSpots = this.spotsManager.getAllSpots().length;
                this.updateSpotsCounter(totalSpots);
            }

            // Hide loading indicator
            const loadingIndicator = this.container.querySelector('.map-loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Remove loading class from container
            this.container.classList.remove('loading');
            
            // Emit ready event
            this.emit('ready');
        } catch (error) {
            console.error('Failed to initialize SurfMap:', error);
            this.emit('error', error);
        }
    }

    /**
     * Loads the map image.
     * @returns {Promise<HTMLImageElement>} The loaded image.
     */
    loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.state.image = img;
                this.state.imageLoaded = true;
                
                // Dynamically adjust max zoom to be 2x the actual image size
                // This prevents excessive zooming that would make the image blurry
                const maxZoomBasedOnImage = 2.0; // 2x the actual size
                this.options.maxZoom = Math.min(this.options.maxZoom, maxZoomBasedOnImage);
                
                // Ensure current zoom is within bounds
                this.state.zoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, this.state.zoom));
                
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${this.options.imagePath}`));
            };
            img.src = this.options.imagePath;
        });
    }

    /**
     * Detects if the device is a mobile device.
     * @returns {boolean} True if the device is mobile, false otherwise.
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    }

    /**
     * Sets up touch optimizations for mobile devices.
     */
    setupTouchOptimizations() {
        if (!this.isTouchDevice) return;
        
        // Set up touch event listeners for performance optimization
        this.canvas.addEventListener('touchstart', () => {
            this.isTouchActive = true;
            this.touchStartTime = Date.now();
            this.performanceMode = 'touch';
        }, { passive: true });
        
        this.canvas.addEventListener('touchend', () => {
            // Reset performance mode after a short delay
            setTimeout(() => {
                this.isTouchActive = false;
                this.performanceMode = 'normal';
            }, 100);
        }, { passive: true });
    }

    /**
     * Starts the render loop with performance optimizations.
     */
    startRenderLoop() {
        const render = (timestamp) => {
            // Throttle rendering based on performance mode
            const elapsed = timestamp - this.lastRenderTime;
            const throttleTime = this.performanceMode === 'touch' ?
                this.options.renderThrottle * 2 : this.options.renderThrottle;
            
            if (elapsed >= throttleTime) {
                this.render();
                this.lastRenderTime = timestamp;
            }
            
            this.renderFrameId = requestAnimationFrame(render);
        };
        
        this.renderFrameId = requestAnimationFrame(render);
    }

    /**
     * Starts visibility checks for performance optimization.
     */
    startVisibilityChecks() {
        const checkVisibility = () => {
            if (!this.canvas) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 &&
                             rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !this.renderFrameId) {
                this.startRenderLoop();
            } else if (!isVisible && this.renderFrameId) {
                cancelAnimationFrame(this.renderFrameId);
                this.renderFrameId = null;
            }
        };
        
        this.visibilityCheckIntervalId = setInterval(
            checkVisibility,
            this.options.visibilityCheckInterval
        );
        
        // Initial check
        checkVisibility();
    }

    /**
     * Resets the map view to the initial state.
     */
    resetView() {
        this.state.zoom = this.options.initialZoom;
        this.state.panX = 0;
        this.state.panY = 0;
        this.constrainPan();
        this.forceRender();
        this.emit('viewReset');
    }

    /**
     * Sets the zoom level and centers the view on the specified point.
     * @param {number} zoom - The new zoom level.
     * @param {number} [centerX=0] - The X coordinate to center on (in image coordinates).
     * @param {number} [centerY=0] - The Y coordinate to center on (in image coordinates).
     */
    setZoom(zoom, centerX = 0, centerY = 0) {
        // Constrain zoom level
        const newZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, zoom));
        
        if (newZoom !== this.state.zoom) {
            // Calculate the point in canvas coordinates before zoom
            const canvasRect = this.canvas.getBoundingClientRect();
            const canvasCenterX = canvasRect.width / 2;
            const canvasCenterY = canvasRect.height / 2;
            
            // Calculate the image coordinates at the center of the canvas
            const imageX = (canvasCenterX - this.state.panX) / this.state.zoom;
            const imageY = (canvasCenterY - this.state.panY) / this.state.zoom;
            
            // Update zoom
            this.state.zoom = newZoom;
            
            // Adjust pan to keep the same point centered
            this.state.panX = canvasCenterX - imageX * this.state.zoom;
            this.state.panY = canvasCenterY - imageY * this.state.zoom;
            
            this.constrainPan();
            this.forceRender();
            this.emit('zoomChanged', { zoom: this.state.zoom });
        }
    }

    /**
     * Zooms in by the specified amount.
     * @param {number} [amount=0.1] - The amount to zoom in.
     */
    zoomIn(amount = 0.1) {
        this.setZoom(this.state.zoom + amount);
    }

    /**
     * Zooms out by the specified amount.
     * @param {number} [amount=0.1] - The amount to zoom out.
     */
    zoomOut(amount = 0.1) {
        this.setZoom(this.state.zoom - amount);
    }

    /**
     * Pans the map by the specified amount.
     * @param {number} deltaX - The amount to pan horizontally.
     * @param {number} deltaY - The amount to pan vertically.
     */
    pan(deltaX, deltaY) {
        this.state.panX += deltaX;
        this.state.panY += deltaY;
        this.constrainPan();
        this.forceRender();
        this.emit('panChanged', { panX: this.state.panX, panY: this.state.panY });
    }

    /**
     * Sets the pan position to the specified coordinates.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     */
    setPan(x, y) {
        this.state.panX = x;
        this.state.panY = y;
        this.constrainPan();
        this.forceRender();
        this.emit('panChanged', { panX: this.state.panX, panY: this.state.panY });
    }

    /**
     * Constrains the pan position to keep the image within the canvas bounds.
     */
    constrainPan() {
        if (!this.state.imageLoaded) return;

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const imageWidth = this.state.image.width * this.state.zoom;
        const imageHeight = this.state.image.height * this.state.zoom;

        // Calculate the maximum pan values
        const maxPanX = Math.max(0, (imageWidth - canvasWidth) / 2);
        const maxPanY = Math.max(0, (imageHeight - canvasHeight) / 2);

        // Constrain pan values
        this.state.panX = Math.max(-maxPanX, Math.min(maxPanX, this.state.panX));
        this.state.panY = Math.max(-maxPanY, Math.min(maxPanY, this.state.panY));
    }

    /**
     * Renders the map.
     */
    render() {
        if (!this.renderer) {
            return;
        }
        
        // Check if render state has changed
        const currentState = {
            zoom: this.state.zoom,
            panX: this.state.panX,
            panY: this.state.panY,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            imageLoaded: this.state.imageLoaded
        };
        
        // Only render if state has changed or render is explicitly needed
        const stateChanged = !this.stateEquals(currentState, this.lastRenderState);
        
        if (!this.needsRender && !stateChanged) {
            return;
        }
        
        // Update last render state
        this.lastRenderState = { ...currentState };
        this.needsRender = false;
        
        // Render base map
        this.renderer.render();
        
        // Update marker visibility based on current viewport
        this.updateMarkerVisibility();
        
        // Apply search visibility
        this.updateSearchVisibility();
        
        // Render markers
        if (this.markersManager) {
            this.markersManager.render();
        }
        
        // Render minimap
        if (this.minimap) {
            this.minimap.render();
        }
    }
    
    /**
     * Compares two render states for equality.
     * @param {Object} state1 - First state.
     * @param {Object} state2 - Second state.
     * @returns {boolean} Whether the states are equal.
     */
    stateEquals(state1, state2) {
        if (!state1 || !state2) return false;
        
        return state1.zoom === state2.zoom &&
               state1.panX === state2.panX &&
               state1.panY === state2.panY &&
               state1.canvasWidth === state2.canvasWidth &&
               state1.canvasHeight === state2.canvasHeight &&
               state1.imageLoaded === state2.imageLoaded;
    }
    
    /**
     * Forces a render on the next frame.
     */
    forceRender() {
        this.needsRender = true;
    }

    /**
     * Sets up the canvas for high-DPI displays.
     */
    setupHighDPICanvas() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set the actual size in memory
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale the canvas down using CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Store the device pixel ratio for use in rendering
        this.devicePixelRatio = dpr;
    }

    /**
     * Handles canvas resize.
     */
    resize() {
        if (this.canvas) {
            this.setupHighDPICanvas();
            this.constrainPan();
            this.forceRender();
        }
        this.emit('resize');
    }

    /**
     * Adds an event listener.
     * @param {string} event - The event name.
     * @param {Function} callback - The event callback.
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Removes an event listener.
     * @param {string} event - The event name.
     * @param {Function} callback - The event callback to remove.
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emits an event.
     * @param {string} event - The event name.
     * @param {*} data - The event data.
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for '${event}':`, error);
                }
            });
        }
    }

    /**
     * Updates marker visibility based on current viewport.
     */
    updateMarkerVisibility() {
        if (!this.markersManager || !this.state.imageLoaded) return;
        
        // Calculate viewport bounds in image coordinates
        const viewportLeft = (-this.canvas.width / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportTop = (-this.canvas.height / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        const viewportRight = (this.canvas.width / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportBottom = (this.canvas.height / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        
        const viewport = {
            left: viewportLeft,
            top: viewportTop,
            right: viewportRight,
            bottom: viewportBottom
        };
        
        // Update marker visibility
        this.markersManager.updateVisibility(viewport);
    }

    /**
     * Handles marker click events.
     * @param {Object} spot - The clicked surf spot data.
     */
    handleMarkerClick(spot) {
        // Call the global showSurfSpotPanel function from the main application
        if (window.showSurfSpotPanel) {
            window.showSurfSpotPanel(spot.id);
        }
        
        // Emit marker click event
        this.emit('markerClick', { spot });
    }

    /**
     * Handles panel close events.
     * This is now handled by the main application.
     */
    handlePanelClose() {
        // Deselect marker
        if (this.markersManager) {
            this.markersManager.deselectMarker();
        }
        
        // Emit panel close event
        this.emit('panelClose');
    }

    /**
     * Handles minimap spot click events.
     * @param {Object} spot - The clicked surf spot data.
     */
    handleMinimapSpotClick(spot) {
        // Center the view on the spot
        if (spot.pixelCoordinates) {
            this.centerOnSpot(spot);
        }
        
        // Call the global showSurfSpotPanel function from the main application
        if (window.showSurfSpotPanel) {
            window.showSurfSpotPanel(spot.id);
        }
        
        // Emit minimap spot click event
        this.emit('minimapSpotClick', { spot });
    }

    /**
     * Handles minimap viewport change events.
     * @param {Object} viewport - The new viewport state.
     */
    handleMinimapViewportChange(viewport) {
        // Update pan position
        this.state.panX = viewport.panX;
        this.state.panY = viewport.panY;
        
        // Constrain pan
        this.constrainPan();
        
        // Re-render
        this.forceRender();
        
        // Emit viewport change event
        this.emit('viewportChanged', viewport);
    }

    /**
     * Centers the view on a specific surf spot.
     * @param {Object} spot - The surf spot to center on.
     */
    centerOnSpot(spot) {
        if (!spot.pixelCoordinates) return;
        
        const { x, y } = spot.pixelCoordinates;
        
        // Calculate new pan position to center the spot
        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;
        
        const newPanX = canvasCenterX - x * this.state.zoom;
        const newPanY = canvasCenterY - y * this.state.zoom;
        
        // Update state with animation
        if (this.renderer) {
            this.renderer.startTransition({
                panX: newPanX,
                panY: newPanY,
                zoom: this.state.zoom
            });
        } else {
            this.state.panX = newPanX;
            this.state.panY = newPanY;
            this.constrainPan();
            this.forceRender();
        }
        
        // Emit spot centered event
        this.emit('spotCentered', { spot });
    }

    /**
     * Updates marker visibility based on search criteria.
     */
    updateSearchVisibility() {
        if (!this.markersManager) {
            return;
        }

        // Get all spots
        const allSpots = this.spotsManager.getAllSpots();
        
        // Determine search state and results
        let searchResults = [];
        if (this.searchManager && typeof this.searchManager.getSearchResults === 'function') {
            try {
                searchResults = this.searchManager.getSearchResults().map(r => r.spot);
            } catch (e) {
                searchResults = [];
            }
        }
        const searchActive = Array.isArray(searchResults) && searchResults.length > 0;
        
        // Compute final visible set based on search state
        let visibleSpots;
        if (searchActive) {
            visibleSpots = searchResults;
        } else {
            visibleSpots = allSpots;
        }
        
        // Update marker visibility
        this.markersManager.updateSpotVisibility(visibleSpots);
        
        // Update minimap to show only visible spots
        if (this.minimap && typeof this.minimap.updateVisibleSpots === 'function') {
            this.minimap.updateVisibleSpots(visibleSpots);
        }
        
        // Update the surf spots counter
        this.updateSpotsCounter(visibleSpots.length);
    }

    /**
     * Handles search result click events.
     * @param {Object} spot - The clicked surf spot.
     */
    handleSearchResultClick(spot) {
        // Center on the spot
        this.centerOnSpot(spot);
        
        // Call the global showSurfSpotPanel function from the main application
        if (window.showSurfSpotPanel) {
            window.showSurfSpotPanel(spot.id);
        }
        
        // Highlight the marker
        if (this.markersManager) {
            this.markersManager.highlightMarker(spot.id);
            // Force a render to show the highlight
            this.forceRender();
        }
        
        // Emit search result click event
        this.emit('searchResultClick', { spot });
    }

    /**
     * Handles search change events.
     * @param {Array<Object>} results - The search results.
     */
    handleSearchChange(results) {
        // Update marker visibility
        this.updateSearchVisibility();
        
        // Re-render
        this.forceRender();
        
        // Emit search change event
        this.emit('searchChange', { results });
    }

    /**
     * Updates the surf spots counter with the current count.
     * @param {number} count - The number of visible spots.
     */
    updateSpotsCounter(count) {
        if (this.spotsCounter) {
            this.spotsCounter.updateCount(count);
        }
    }

    /**
     * Handles results update events.
     * @param {Array<Object>} results - The updated search results.
     */
    handleResultsUpdate(results) {
        // Update the counter with the new results count
        this.updateSpotsCounter(results.length);
    }

    /**
     * Clears search input.
     */
    clearSearch() {
        // Clear search
        if (this.searchManager) {
            this.searchManager.clearSearch();
        }
        
        // Reset the counter to show all spots
        if (this.spotsCounter && this.spotsManager) {
            const totalSpots = this.spotsManager.getAllSpots().length;
            this.updateSpotsCounter(totalSpots);
        }
    }

    /**
     * Shows the minimap.
     */
    showMinimap() {
        if (this.minimap) {
            this.minimap.show();
        }
    }

    /**
     * Hides the minimap.
     */
    hideMinimap() {
        if (this.minimap) {
            this.minimap.hide();
        }
    }

    /**
     * Gets the surf spots manager.
     * @returns {SurfSpotsManager|null} The surf spots manager.
     */
    getSpotsManager() {
        return this.spotsManager;
    }

    /**
     * Gets the markers manager.
     * @returns {SurfMarkersManager|null} The markers manager.
     */
    getMarkersManager() {
        return this.markersManager;
    }

    /**
     * Gets the spot modal.
     * @returns {SurfSpotModal|null} The spot modal.
     */
    getSpotModal() {
        return this.spotModal;
    }

    /**
     * Gets the minimap.
     * @returns {SurfMinimap|null} The minimap.
     */
    getMinimap() {
        return this.minimap;
    }

    /**
     * Gets the search manager.
     * @returns {SurfSearch|null} The search manager.
     */
    getSearchManager() {
        return this.searchManager;
    }

    /**
     * Gets the currently visible surf spots based on the viewport.
     * @returns {Array<Object>} An array of visible surf spot objects.
     */
    getVisibleSpots() {
        if (!this.markersManager || !this.state.imageLoaded) {
            return [];
        }
        
        // The markersManager is responsible for tracking visibility
        // We can get the visible spots from it
        if (typeof this.markersManager.getVisibleSpots === 'function') {
            return this.markersManager.getVisibleSpots();
        }
        
        // Fallback: calculate visibility manually
        const allSpots = this.spotsManager.getAllSpots();
        const visibleSpots = [];
        
        // Calculate viewport bounds in image coordinates
        const viewportLeft = (-this.canvas.width / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportTop = (-this.canvas.height / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        const viewportRight = (this.canvas.width / 2 - this.state.panX) / this.state.zoom + this.state.image.width / 2;
        const viewportBottom = (this.canvas.height / 2 - this.state.panY) / this.state.zoom + this.state.image.height / 2;
        
        for (const spot of allSpots) {
            if (spot.pixelCoordinates) {
                const { x, y } = spot.pixelCoordinates;
                if (x >= viewportLeft && x <= viewportRight && y >= viewportTop && y <= viewportBottom) {
                    visibleSpots.push(spot);
                }
            }
        }
        
        return visibleSpots;
    }

    /**
     * Focuses on a specific surf spot by ID.
     * @param {string} spotId - The ID of the spot to focus on.
     */
    focusOnSpot(spotId) {
        if (!this.spotsManager) return;
        
        const spot = this.spotsManager.getSpot(spotId);
        if (spot) {
            this.centerOnSpot(spot);
        }
    }

    /**
     * Destroys the surf map and cleans up resources.
     */
    destroy() {
        // Stop render loop
        if (this.renderFrameId) {
            cancelAnimationFrame(this.renderFrameId);
            this.renderFrameId = null;
        }
        
        // Stop visibility checks
        if (this.visibilityCheckIntervalId) {
            clearInterval(this.visibilityCheckIntervalId);
            this.visibilityCheckIntervalId = null;
        }
        
        // Remove event listeners
        this.eventListeners.clear();

        // Destroy components
        if (this.interactions) {
            this.interactions.destroy();
        }
        if (this.renderer) {
            this.renderer.destroy();
        }
        if (this.spotsManager) {
            this.spotsManager.destroy();
        }
        if (this.markersManager) {
            this.markersManager.destroy();
        }
        // The spot detail panel is now handled by the main application
        // No need to destroy a separate modal
        if (this.minimap) {
            this.minimap.destroy();
        }
        if (this.searchManager) {
            this.searchManager.destroy();
        }
        if (this.spotsCounter) {
            this.spotsCounter.destroy();
        }

        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        // Clear references
        this.canvas = null;
        this.renderer = null;
        this.interactions = null;
        this.spotsManager = null;
        this.markersManager = null;
        // The spot detail panel is now handled by the main application
        // No need to clear a separate modal reference
        this.minimap = null;
        this.searchManager = null;
        this.spotsCounter = null;
        this.state.image = null;
    }
}
