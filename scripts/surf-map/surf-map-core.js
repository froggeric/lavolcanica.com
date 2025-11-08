/**
 * @fileoverview Core SurfMap class for the fullscreen surf map interface.
 * @description This module contains the core SurfMap class that manages the map state,
 * coordinates between the renderer and interaction handlers, and provides the main API
 * for the surf map functionality. Enhanced with smooth gesture handling and momentum.
 */

import { appConfig } from '../../data/config/app-config.js';
import { Viewport } from './viewport.js';
import { InteractionManager } from './interaction-manager.js';

/**
 * Core SurfMap class that manages the map state and coordinates between components.
 */
export class SurfMap {
    /**
     * @param {HTMLElement} container - The container element for the map.
     * @param {Object} options - Configuration options for the map.
     */
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            imagePath: options.imagePath || 'images/surf-map.webp',
            minZoom: options.minZoom || 0.5,
            maxZoom: appConfig.surfMap.maxZoom || 2.0,
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
        this.interactionManager = null;
        this.spotsManager = null;
        this.markersManager = null;
        this.spotModal = null;
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
        this.isPanelOpening = false;
        
        // Initialize the map
        this.init();
    }

    /**
     * Initializes the surf map by setting up the canvas and loading the image.
     */
    async init() {
        try {
            this.viewport = new Viewport(this.container, [
                document.getElementById('left-side-search')
            ]);
            
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

            // Initialize the NEW interaction manager
            this.interactionManager = new InteractionManager(
                this.canvas,
                null, // No minimap
                this.state,
                {
                    minZoom: this.options.minZoom,
                    maxZoom: this.options.maxZoom,
                    momentumEnabled: true
                }
            );
            
            // Set up interaction event listeners
            this.setupInteractionListeners();

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
     * Sets up event listeners for the interaction manager.
     */
    setupInteractionListeners() {
        // Handle tap events
        this.canvas.addEventListener('tap', (e) => {
            const { x, y, target } = e.detail;
            if (target === 'map') {
                this.handleTap(x, y);
            }
        });

        // Handle double tap events (zoom in)
        this.canvas.addEventListener('doubletap', (e) => {
            const { x, y, target } = e.detail;
            if (target === 'map') {
                this.handleDoubleTap(x, y);
            }
        });

        // Handle drag events
        this.canvas.addEventListener('drag', (e) => {
            const { deltaX, deltaY } = e.detail;
            this.handleDrag(deltaX, deltaY);
        });

        // Handle momentum events
        this.canvas.addEventListener('momentum', (e) => {
            const { deltaX, deltaY } = e.detail;
            this.handleDrag(deltaX, deltaY);
        });

        // Handle drag end
        this.canvas.addEventListener('dragend', (e) => {
            this.state.isDragging = false;
        });

        // Handle pinch zoom
        this.canvas.addEventListener('pinch', (e) => {
            const { zoom, centerX, centerY } = e.detail;
            this.handlePinchZoom(zoom, centerX, centerY);
        });

        // Handle wheel zoom
        this.canvas.addEventListener('zoom', (e) => {
            const { delta, x, y } = e.detail;
            this.handleWheelZoom(delta, x, y);
        });
    }

    /**
     * Handles tap events on the map.
     */
    handleTap(x, y) {
        // Check if a marker was tapped
        if (this.markersManager) {
            const clickedSpot = this.markersManager.getSpotAtPosition(x, y);
            if (clickedSpot) {
                this.handleMarkerClick(clickedSpot);
            }
        }
    }

    /**
     * Handles double tap events (zoom in to that point).
     */
    handleDoubleTap(x, y) {
        const newZoom = Math.min(this.state.zoom * 1.5, this.options.maxZoom);
        this.zoomToPoint(newZoom, x, y);
    }

    /**
     * Handles drag events for panning.
     */
    handleDrag(deltaX, deltaY) {
        this.state.isDragging = true;
        this.state.panX += deltaX;
        this.state.panY += deltaY;
        this.constrainPan();
        this.forceRender();
    }

    /**
     * Handles pinch zoom gestures.
     */
    handlePinchZoom(newZoom, centerX, centerY) {
        // Clamp zoom to valid range
        newZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, newZoom));
        
        // Calculate the image coordinates of the pinch center
        const imageX = (centerX - this.canvas.width / 2 - this.state.panX) / this.state.zoom;
        const imageY = (centerY - this.canvas.height / 2 - this.state.panY) / this.state.zoom;
        
        // Update zoom
        this.state.zoom = newZoom;
        
        // Adjust pan to keep the pinch center point fixed
        this.state.panX = centerX - this.canvas.width / 2 - imageX * newZoom;
        this.state.panY = centerY - this.canvas.height / 2 - imageY * newZoom;
        
        // Constrain pan to valid bounds
        this.constrainPan();
        this.forceRender();
    }

    /**
     * Handles wheel zoom events.
     */
    handleWheelZoom(delta, x, y) {
        const zoomFactor = 1 + delta;
        const newZoom = Math.max(
            this.options.minZoom,
            Math.min(this.options.maxZoom, this.state.zoom * zoomFactor)
        );
        
        this.zoomToPoint(newZoom, x, y);
    }

    /**
     * Zooms to a specific point with smooth animation.
     */
    zoomToPoint(newZoom, canvasX, canvasY) {
        const startZoom = this.state.zoom;
        const startPanX = this.state.panX;
        const startPanY = this.state.panY;
        const duration = 200;
        let startTime = null;

        // Calculate the image coordinates of the zoom center
        const imageX = (canvasX - this.canvas.width / 2 - startPanX) / startZoom;
        const imageY = (canvasY - this.canvas.height / 2 - startPanY) / startZoom;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // easeOutCubic for smooth deceleration
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const currentZoom = startZoom + (newZoom - startZoom) * easedProgress;

            // Calculate new pan to keep the zoom point fixed
            const newPanX = canvasX - this.canvas.width / 2 - imageX * currentZoom;
            const newPanY = canvasY - this.canvas.height / 2 - imageY * currentZoom;

            this.state.zoom = currentZoom;
            this.state.panX = newPanX;
            this.state.panY = newPanY;

            this.constrainPan();
            this.forceRender();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.emit('zoomChanged', { zoom: this.state.zoom });
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Loads the map image.
     */
    loadImage() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.state.image = img;
                this.state.imageLoaded = true;
                
                // Dynamically adjust max zoom to be 2x the actual image size
                const maxZoomBasedOnImage = 2.0;
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
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
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
        const visibleRect = this.viewport.getVisibleRect();
        const scaleX = visibleRect.width / this.state.image.width;
        const scaleY = visibleRect.height / this.state.image.height;
        const initialZoom = Math.min(scaleX, scaleY);
        this.state.zoom = Number(initialZoom.toFixed(6));
        this.options.minZoom = Number(initialZoom.toFixed(6));
        this.state.panX = 0;
        this.state.panY = 0;
        this.constrainPan();
        this.forceRender();
        this.emit('viewReset');
    }

    /**
     * Sets the zoom level and centers the view on the specified point.
     */
    setZoom(zoom, centerX = 0, centerY = 0) {
        const newZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, zoom));
        this.zoomTo(newZoom, centerX, centerY);
    }

    /**
     * Zooms to a specific level with animation.
     */
    zoomTo(newZoom, x, y) {
        const startZoom = this.state.zoom;
        const startPanX = this.state.panX;
        const startPanY = this.state.panY;
        const duration = 200;
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            const currentZoom = startZoom + (newZoom - startZoom) * easedProgress;

            const imageX = (x - startPanX) / startZoom;
            const imageY = (y - startPanY) / startZoom;

            const newPanX = x - imageX * currentZoom;
            const newPanY = y - imageY * currentZoom;

            this.state.zoom = currentZoom;
            this.state.panX = newPanX;
            this.state.panY = newPanY;

            this.constrainPan();
            this.forceRender();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.emit('zoomChanged', { zoom: this.state.zoom });
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Zooms in by the specified amount.
     */
    zoomIn(amount = 0.1) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const newZoom = this.state.zoom + amount;
        this.zoomToPoint(newZoom, centerX, centerY);
    }

    /**
     * Zooms out by the specified amount.
     */
    zoomOut(amount = 0.1) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const newZoom = this.state.zoom - amount;
        this.zoomToPoint(newZoom, centerX, centerY);
    }

    /**
     * Pans the map by the specified amount.
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

        const visibleRect = this.viewport.getVisibleRect();
        const canvasWidth = visibleRect.width;
        const canvasHeight = visibleRect.height;
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
        
        // Render base map first
        this.renderer.render();
        
        // Update marker visibility based on current viewport
        this.updateMarkerVisibility();
        
        // Apply search visibility
        this.updateSearchVisibility();
        
        // Render markers with proper canvas clearing
        if (this.markersManager) {
            this.markersManager.render();
        }
    }
    
    /**
     * Compares two render states for equality.
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
     * Forces a render and returns a promise that resolves after the next frame is painted.
     */
    async forceRenderAndWait() {
        this.needsRender = true;
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
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
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Removes an event listener.
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
     */
    async handleMarkerClick(spot) {
        if (this.isPanelOpening) return;
        this.isPanelOpening = true;

        try {
            // Select the marker first to make the orange ring appear
            if (this.markersManager) {
                this.markersManager.selectMarker(spot.id);
            }

            // Force a render and wait for it to complete
            await this.forceRenderAndWait();

            // Call the global showSurfSpotPanel function from the main application
            if (window.showSurfSpotPanel) {
                window.showSurfSpotPanel(spot.id);
            }

            // Emit marker click event
            this.emit('markerClick', { spot });
        } finally {
            // Reset the lock after a short delay to prevent rapid re-clicks
            setTimeout(() => {
                this.isPanelOpening = false;
            }, 300);
        }
    }

    /**
     * Handles panel close events.
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
     * Centers the view on a specific surf spot.
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
        
        // Update the surf spots counter
        this.updateSpotsCounter(visibleSpots.length);
    }

    /**
     * Handles search result click events.
     */
    async handleSearchResultClick(spot) {
        if (this.isPanelOpening) return;
        this.isPanelOpening = true;

        try {
            // Select the marker first to make the orange ring appear
            if (this.markersManager) {
                this.markersManager.selectMarker(spot.id);
            }

            // Center on the spot
            this.centerOnSpot(spot);

            // Force a render and wait for it to complete
            await this.forceRenderAndWait();

            // Call the global showSurfSpotPanel function from the main application
            if (window.showSurfSpotPanel) {
                window.showSurfSpotPanel(spot.id);
            }

            // Emit search result click event
            this.emit('searchResultClick', { spot });
        } finally {
            // Reset the lock after a short delay
            setTimeout(() => {
                this.isPanelOpening = false;
            }, 300);
        }
    }

    /**
     * Handles search change events.
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
     */
    updateSpotsCounter(count) {
        if (this.spotsCounter) {
            this.spotsCounter.updateCount(count);
        }
    }

    /**
     * Handles results update events.
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
     * Gets the surf spots manager.
     */
    getSpotsManager() {
        return this.spotsManager;
    }

    /**
     * Gets the markers manager.
     */
    getMarkersManager() {
        return this.markersManager;
    }

    /**
     * Gets the spot modal.
     */
    getSpotModal() {
        return this.spotModal;
    }

    /**
     * Gets the search manager.
     */
    getSearchManager() {
        return this.searchManager;
    }

    /**
     * Gets the currently visible surf spots based on the viewport.
     */
    getVisibleSpots() {
        if (!this.markersManager || !this.state.imageLoaded) {
            return [];
        }
        
        // The markersManager is responsible for tracking visibility
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
        if (this.interactionManager) {
            this.interactionManager.destroy();
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
        this.interactionManager = null;
        this.spotsManager = null;
        this.markersManager = null;
        this.searchManager = null;
        this.spotsCounter = null;
        this.state.image = null;
    }
}
