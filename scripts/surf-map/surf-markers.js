/**
 * @fileoverview Surf spot markers rendering module.
 * @description This module handles rendering surf spot markers on the map,
 * including marker creation, styling, and interaction handling.
 */

/**
 * Surf spot markers manager class.
 */
export class SurfMarkersManager {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to render on.
     * @param {Object} state - The map state object.
     * @param {SurfSpotsManager} spotsManager - The surf spots data manager.
     * @param {SurfMap} surfMap - The main surf map instance.
     * @param {Object} options - Configuration options.
     */
    constructor(canvas, state, spotsManager, surfMap, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        this.spotsManager = spotsManager;
        this.surfMap = surfMap;
        
        // Configuration options
        this.options = {
            markerSize: 30, // Fixed size for all zoom levels
            markerBorderWidth: 3, // Increased from 2 for better visibility
            markerShadowBlur: 6, // Increased from 4 for better visibility
            markerShadowColor: 'rgba(0, 0, 0, 0.3)',
            tooltipOffset: { x: 10, y: -30 },
            tooltipPadding: 8,
            tooltipBorderRadius: 4,
            tooltipBackground: 'rgba(0, 0, 0, 0.8)',
            tooltipTextColor: '#ffffff',
            tooltipFontSize: 12,
            hoverRadius: 25, // Increased from 15 to make clicking easier
            animationDuration: 200,
            enableHover: true,
            enableTooltips: true,
            enableClick: true,
            // Performance optimization options
            viewportBuffer: 50, // Extra space around viewport to pre-render markers
            maxVisibleMarkers: 100, // Maximum number of markers to render at once
            enableLOD: false, // Disabled - markers maintain consistent style at all zoom levels
            lodZoomThreshold: 0.5, // Zoom level below which to use simplified markers (unused)
            enableClustering: false, // Enable marker clustering at low zoom
            clusteringDistance: 30, // Distance in pixels for clustering
            // Mobile-specific options
            mobileMarkerSize: 35, // Increased from 24 for better touch targets
            mobileHoverRadius: 30, // Increased from 20 for better touch targets
            enableMobileOptimizations: true,
            ...options
        };
        
        // Marker state
        this.markers = new Map(); // Map of spot ID to marker data
        this.hoveredMarker = null;
        this.selectedMarker = null;
        this.visibleMarkers = [];
        this.tooltip = null;
        
        // Animation state
        this.animations = new Map(); // Map of spot ID to animation data
        
        // Performance optimization state
        this.lastViewport = null;
        this.viewportUpdateThrottle = 100; // ms
        this.lastViewportUpdate = 0;
        this.clusters = new Map(); // Marker clusters for low zoom levels
        this.isMobile = this.detectMobile();
        
        // Initialization state to prevent excessive re-initialization
        this.isInitialized = false;
        this.initializationPromise = null;
        this.lastImageWidth = null;
        this.lastImageHeight = null;
        
        // Performance optimization: Coordinate transformation caching
        this.transformationCache = new Map();
        this.lastTransformState = null;
        this.cacheEnabled = true;
        
        // Performance optimization: Shared transformation matrix
        this.transformationMatrix = null;
        this.matrixDirty = true;
        
        // Adjust options for mobile if needed
        if (this.isMobile && this.options.enableMobileOptimizations) {
            this.options.markerSize = this.options.mobileMarkerSize;
            this.options.hoverRadius = this.options.mobileHoverRadius;
        }
        
        // Event handlers
        this.eventHandlers = {
            handleTap: this.handleTap.bind(this)
        };
        
        // Initialize
        this.init();
    }

    /**
     * Initializes the markers manager.
     */
    init() {
        // Create tooltip element
        this.createTooltip();
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize markers for all spots
        this.initializeMarkers();
    }

    /**
     * Creates the tooltip element.
     */
    createTooltip() {
        // Canvas-based tooltip doesn't need DOM element
        this.tooltip = {
            visible: false,
            spotId: null,
            x: 0,
            y: 0,
            content: {
                name: '',
                difficulty: '',
                difficultyColor: ''
            }
        };
    }

    /**
     * Adds event listeners.
     */
    addEventListeners() {
        this.canvas.addEventListener('tap', this.eventHandlers.handleTap);
    }

    /**
     * Removes event listeners.
     */
    removeEventListeners() {
        this.canvas.removeEventListener('tap', this.eventHandlers.handleTap);
    }

    /**
     * Initializes markers for all surf spots.
     */
    async initializeMarkers(retryCount = 0) {
        // Prevent multiple simultaneous initializations
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        // Check if already initialized with same image dimensions
        const currentImageWidth = this.spotsManager.imageWidth;
        const currentImageHeight = this.spotsManager.imageHeight;
        
        if (this.isInitialized &&
            this.lastImageWidth === currentImageWidth &&
            this.lastImageHeight === currentImageHeight &&
            this.markers.size > 0) {
            return; // Already initialized with same dimensions
        }
        
        this.initializationPromise = this._initializeMarkersInternal(retryCount);
        
        try {
            await this.initializationPromise;
        } finally {
            this.initializationPromise = null;
        }
    }
    
    /**
     * Internal method to initialize markers.
     * @private
     * @param {number} retryCount - Current retry count.
     * @returns {Promise<void>}
     */
    async _initializeMarkersInternal(retryCount = 0) {
        if (!this.spotsManager.loaded) {
            return;
        }
        
        // Check if image dimensions are available
        if (!this.spotsManager.imageWidth || !this.spotsManager.imageHeight) {
            const maxRetries = 10;
            
            if (retryCount < maxRetries) {
                // Try again after a short delay
                await new Promise(resolve => setTimeout(resolve, 100));
                return this._initializeMarkersInternal(retryCount + 1);
            } else {
                // Maximum retries reached, log a warning
                console.warn(`Maximum retry attempts (${maxRetries}) reached for marker initialization. Image dimensions still not available.`);
                return;
            }
        }
        
        const spots = this.spotsManager.getAllSpots();
        
        // Only clear markers if image dimensions changed or this is first initialization
        if (!this.isInitialized ||
            this.lastImageWidth !== this.spotsManager.imageWidth ||
            this.lastImageHeight !== this.spotsManager.imageHeight) {
            
            // Clear existing markers
            this.markers.clear();
            this.visibleMarkers = [];
            
            let markersCreated = 0;
            spots.forEach(spot => {
                // Only recalculate pixel coordinates if needed
                let pixelCoords = spot.pixelCoordinates;
                if (!pixelCoords) {
                    pixelCoords = this.spotsManager.getPixelCoordinates(spot.id, spot);
                }
                
                if (pixelCoords) {
                    this.markers.set(spot.id, {
                        spot: spot,
                        x: pixelCoords.x,
                        y: pixelCoords.y,
                        visible: true,
                        scale: 1,
                        opacity: 1
                    });
                    markersCreated++;
                }
            });
            
            // Update initialization state
            this.isInitialized = true;
            this.lastImageWidth = this.spotsManager.imageWidth;
            this.lastImageHeight = this.spotsManager.imageHeight;
            
            console.log(`Initialized ${markersCreated} markers`);
        }
    }

    /**
     * Updates visibility of markers based on viewport.
     * @param {Object} viewport - The viewport bounds.
     */
    updateVisibility(viewport) {
        // Throttle viewport updates for performance
        const now = performance.now();
        if (now - this.lastViewportUpdate < this.viewportUpdateThrottle &&
            this.lastViewport && this.viewportsEqual(viewport, this.lastViewport)) {
            return;
        }
        
        this.lastViewportUpdate = now;
        this.lastViewport = { ...viewport };
        
        // Add buffer to viewport for pre-rendering
        const bufferedViewport = {
            left: viewport.left - this.options.viewportBuffer,
            right: viewport.right + this.options.viewportBuffer,
            top: viewport.top - this.options.viewportBuffer,
            bottom: viewport.bottom + this.options.viewportBuffer
        };
        
        this.visibleMarkers = [];
        
        // Check if we should use clustering
        const useClustering = this.options.enableClustering && this.state.zoom < 0.3;
        
        if (useClustering) {
            this.updateClusteredVisibility(bufferedViewport);
        } else {
            this.updateIndividualVisibility(bufferedViewport);
        }
    }
    
    /**
     * Updates visibility for individual markers.
     * @param {Object} viewport - The viewport bounds.
     */
    updateIndividualVisibility(viewport) {
        const markersArray = Array.from(this.markers.values());
        
        // Sort markers by distance from viewport center for priority rendering
        const viewportCenterX = (viewport.left + viewport.right) / 2;
        const viewportCenterY = (viewport.top + viewport.bottom) / 2;
        
        markersArray.sort((a, b) => {
            const distA = Math.sqrt(
                Math.pow(a.x - viewportCenterX, 2) +
                Math.pow(a.y - viewportCenterY, 2)
            );
            const distB = Math.sqrt(
                Math.pow(b.x - viewportCenterX, 2) +
                Math.pow(b.y - viewportCenterY, 2)
            );
            return distA - distB;
        });
        
        // Limit the number of visible markers for performance
        const maxMarkers = Math.min(markersArray.length, this.options.maxVisibleMarkers);
        
        for (let i = 0; i < maxMarkers; i++) {
            const marker = markersArray[i];
            const wasVisible = marker.visible;
            
            // Check if marker is in viewport bounds
            const inViewport = (
                marker.x >= viewport.left &&
                marker.x <= viewport.right &&
                marker.y >= viewport.top &&
                marker.y <= viewport.bottom
            );
            
            // Set marker visibility based on viewport bounds
            marker.visible = inViewport;
            
            if (marker.visible) {
                this.visibleMarkers.push(marker);
                
                // Animate marker appearance
                if (!wasVisible && marker.visible) {
                    this.animateMarkerAppearance(marker.spot.id);
                }
            }
        }
    }
    
    /**
     * Updates visibility for clustered markers.
     * @param {Object} viewport - The viewport bounds.
     */
    updateClusteredVisibility(viewport) {
        // Clear existing clusters
        this.clusters.clear();
        
        // Create clusters
        const markersArray = Array.from(this.markers.values());
        const visited = new Set();
        
        markersArray.forEach(marker => {
            if (visited.has(marker.spot.id)) return;
            
            // Check if marker is in viewport
            if (marker.x < viewport.left || marker.x > viewport.right ||
                marker.y < viewport.top || marker.y > viewport.bottom) {
                return;
            }
            
            // Create a new cluster
            const cluster = {
                markers: [marker],
                x: marker.x,
                y: marker.y,
                count: 1
            };
            
            visited.add(marker.spot.id);
            
            // Find nearby markers to add to cluster
            markersArray.forEach(otherMarker => {
                if (visited.has(otherMarker.spot.id)) return;
                
                const distance = Math.sqrt(
                    Math.pow(marker.x - otherMarker.x, 2) +
                    Math.pow(marker.y - otherMarker.y, 2)
                );
                
                if (distance < this.options.clusteringDistance) {
                    cluster.markers.push(otherMarker);
                    cluster.x += otherMarker.x;
                    cluster.y += otherMarker.y;
                    cluster.count++;
                    visited.add(otherMarker.spot.id);
                }
            });
            
            // Calculate cluster center
            cluster.x /= cluster.count;
            cluster.y /= cluster.count;
            
            // Add cluster to visible markers
            this.visibleMarkers.push({
                ...cluster,
                isCluster: true,
                visible: true,
                scale: 1,
                opacity: 1
            });
            
            this.clusters.set(`${cluster.x}_${cluster.y}`, cluster);
        });
    }
    
    /**
     * Checks if two viewports are equal.
     * @param {Object} viewport1 - First viewport.
     * @param {Object} viewport2 - Second viewport.
     * @returns {boolean} Whether the viewports are equal.
     */
    viewportsEqual(viewport1, viewport2) {
        return viewport1.left === viewport2.left &&
               viewport1.right === viewport2.right &&
               viewport1.top === viewport2.top &&
               viewport1.bottom === viewport2.bottom;
    }
    
    /**
     * Detects if the device is mobile (legacy method for compatibility).
     * @returns {boolean} Whether the device is mobile.
     */
    detectMobile() {
        const userAgent = navigator.userAgent;
        const hasTouch = 'ontouchstart' in window;
        const screenWidth = window.innerWidth;
        
        // Tablet detection - prioritize tablet over mobile
        if (/iPad/i.test(userAgent) || 
            (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) ||
            (screenWidth >= 768 && screenWidth <= 1024 && hasTouch)) {
            return true;
        }
        
        // Mobile detection
        if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
            (screenWidth < 768 && hasTouch)) {
            return true;
        }
        
        // Desktop fallback
        return false;
    }

    /**
     * Animates marker appearance.
     * @param {string} spotId - The spot ID.
     */
    animateMarkerAppearance(spotId) {
        const marker = this.markers.get(spotId);
        if (!marker) return;
        
        const animation = {
            startTime: performance.now(),
            startScale: 0,
            endScale: 1,
            startOpacity: 0,
            endOpacity: 1,
            duration: this.options.animationDuration
        };
        
        this.animations.set(spotId, animation);
    }

    /**
     * Updates animations.
     */
    updateAnimations() {
        const now = performance.now();
        const completedAnimations = [];
        
        this.animations.forEach((animation, spotId) => {
            const elapsed = now - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            // Apply easing
            const easedProgress = this.easeOutCubic(progress);
            
            const marker = this.markers.get(spotId);
            if (marker) {
                marker.scale = this.lerp(animation.startScale, animation.endScale, easedProgress);
                marker.opacity = this.lerp(animation.startOpacity, animation.endOpacity, easedProgress);
            }
            
            if (progress >= 1) {
                completedAnimations.push(spotId);
            }
        });
        
        // Remove completed animations
        completedAnimations.forEach(spotId => {
            this.animations.delete(spotId);
        });
    }

    /**
     * Renders all visible markers.
     */
    render() {
        if (!this.ctx) return;
        
        // Clear any existing marker drawings by saving and restoring context state
        // This ensures markers don't accumulate on top of each other
        this.ctx.save();
        
        // Update animations first
        this.updateAnimations();
        
        // Sort markers by y position for proper layering (markers further back render first)
        const sortedMarkers = [...this.visibleMarkers].sort((a, b) => a.y - b.y);
        
        // Render each marker with proper isolation
        sortedMarkers.forEach(marker => {
            this.renderMarker(marker);
        });
        
        // Render tooltip if visible (rendered last to appear on top)
        if (this.tooltip && this.tooltip.visible) {
            this.renderTooltip();
        }
        
        // Restore the context state to prevent accumulation
        this.ctx.restore();
    }

    /**
     * Renders a single marker.
     * @param {Object} marker - The marker data.
     */
    renderMarker(marker) {
        if (!this.ctx) return;
        
        // Save context state
        this.ctx.save();
        
        if (marker.isCluster) {
            this.renderCluster(marker);
        } else {
            this.renderIndividualMarker(marker);
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Renders an individual marker.
     * @param {Object} marker - The marker data.
     */
    renderIndividualMarker(marker) {
        const { spot, x, y, scale, opacity } = marker;
        const difficulty = spot.waveDetails.abilityLevel.primary;
        const color = this.spotsManager.getDifficultyColor(difficulty);
        
        // Apply shared canvas transformations
        this.applyCanvasTransformations();
        
        // Move to marker position in image coordinates (actual spot location)
        this.ctx.translate(x, y);
        
        // Apply marker-specific transformations
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = opacity;
        
        // Apply inverse zoom scaling to maintain fixed marker size
        // This counteracts the zoom scaling from the canvas transformations
        const inverseZoomScale = 1 / this.state.zoom;
        this.ctx.scale(inverseZoomScale, inverseZoomScale);
        
        // Use fixed marker size (no LOD-dependent sizing)
        const markerSize = this.options.markerSize;
        const radius = markerSize / 2;
        
        // Draw shadow
        this.ctx.shadowColor = this.options.markerShadowColor;
        this.ctx.shadowBlur = this.options.markerShadowBlur;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 2;
        
        // Draw marker background (circle centered on actual spot location)
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = this.options.markerBorderWidth;
        
        // Draw circle centered at (0, 0) - the actual spot location
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Reset shadow before drawing hover/selection rings to prevent them from having shadows
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Draw selection effect if marker is selected
        if (this.selectedMarker === marker.spot.id) {
            this.ctx.strokeStyle = '#FFD700'; // Gold color
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        } 
        // Draw hover effect if marker is hovered but not selected
        else if (this.hoveredMarker === marker.spot.id) {
            this.ctx.strokeStyle = '#00C2A8'; // Teal color
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // The shadow is now reset before the hover/selection rings are drawn,
        // and the context is restored in the calling renderMarker() function,
        // so this is no longer needed.
    }
    
    /**
     * Renders a cluster marker.
     * @param {Object} cluster - The cluster data.
     */
    renderCluster(cluster) {
        const { x, y, scale, opacity, count } = cluster;
        
        // Apply shared canvas transformations
        this.applyCanvasTransformations();
        
        // Move to cluster position in image coordinates
        this.ctx.translate(x, y);
        
        // Apply cluster-specific transformations
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = opacity;
        
        // Apply inverse zoom scaling to maintain fixed cluster size
        // This counteracts the zoom scaling from the canvas transformations
        const inverseZoomScale = 1 / this.state.zoom;
        this.ctx.scale(inverseZoomScale, inverseZoomScale);
        
        // Calculate cluster size based on count (fixed size)
        const clusterSize = Math.min(
            this.options.markerSize * 1.5,
            this.options.markerSize + Math.log(count) * 5
        );
        
        // Draw shadow
        this.ctx.shadowColor = this.options.markerShadowColor;
        this.ctx.shadowBlur = this.options.markerShadowBlur;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 2;
        
        // Draw cluster background
        this.ctx.fillStyle = '#FF4D4D';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = this.options.markerBorderWidth;
        
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, clusterSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw count text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${Math.max(10, clusterSize / 2)}px Roboto, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(count.toString(), 0, 0);
        
        // Draw hover effect
        if (this.hoveredMarker === cluster) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, clusterSize / 2 + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    /**
     * Handles tap events on the markers.
     * @param {CustomEvent} e - The tap event.
     */
    handleTap(e) {
        if (!e.detail) return;
        const { x, y } = e.detail;
        const rect = this.canvas.getBoundingClientRect();
        const tapX = x - rect.left;
        const tapY = y - rect.top;

        const clickedMarkerId = this.getMarkerAtPosition(tapX, tapY);
        
        if (clickedMarkerId) {
            this.selectMarker(clickedMarkerId);
            
            // Emit marker click event
            if (this.onMarkerClick) {
                const marker = this.markers.get(clickedMarkerId);
                if (marker) {
                    this.onMarkerClick(marker.spot);
                }
            }
        } else {
            // If tap is on the background, deselect
            this.deselectAllMarkers();
        }
    }

    handleHover(event) {
        if (!this.options.enableHover) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const hoveredMarkerId = this.getMarkerAtPosition(mouseX, mouseY);

        if (this.hoveredMarker !== hoveredMarkerId) {
            this.hoveredMarker = hoveredMarkerId;

            // Update cursor using CSS classes
            if (hoveredMarkerId) {
                this.canvas.classList.add('has-hover-marker');
            } else {
                this.canvas.classList.remove('has-hover-marker');
            }

            this.surfMap.forceRender();
        }
    }

    /**
     * Gets the marker at the specified position.
     * @param {number} x - The X coordinate (in CSS pixels).
     * @param {number} y - The Y coordinate (in CSS pixels).
     * @returns {string|null} The spot ID or null if no marker found.
     */
    getMarkerAtPosition(x, y) {
        const imageWidth = this.spotsManager.imageWidth;
        const imageHeight = this.spotsManager.imageHeight;
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = this.canvas.width / dpr;
        const cssHeight = this.canvas.height / dpr;
        const panX = this.state.panX;
        const panY = this.state.panY;
        const zoom = this.state.zoom;

        // Transform screen coordinates (CSS pixels) to image coordinates
        const imageX = ((x - cssWidth / 2 - panX) / zoom) + (imageWidth / 2);
        const imageY = ((y - cssHeight / 2 - panY) / zoom) + (imageHeight / 2);

        for (const marker of this.visibleMarkers) {
            if (marker.isCluster) {
                const distance = Math.sqrt(
                    Math.pow(imageX - marker.x, 2) + 
                    Math.pow(imageY - marker.y, 2)
                );
                const clusterSize = Math.min(
                    this.options.markerSize * 1.5,
                    this.options.markerSize + Math.log(marker.count) * 5
                );
                if (distance <= clusterSize / 2) {
                    return marker;
                }
            } else {
                const markerSize = this.options.markerSize;
                const radius = markerSize / 2;
                const touchTolerance = this.isMobile ? 5 : 0; // 5px tolerance for touch
                
                const distance = Math.sqrt(
                    Math.pow(imageX - marker.x, 2) + 
                    Math.pow(imageY - marker.y, 2)
                );
                
                if (distance <= radius + touchTolerance) {
                    return marker.spot.id;
                }
            }
        }
        
        return null;
    }

    /**
     * Shows the tooltip for a marker.
     * @param {string|Object} spotIdOrCluster - The spot ID or cluster object.
     * @param {number} clientX - The client X coordinate.
     * @param {number} clientY - The client Y coordinate.
     */
    showTooltip(spotIdOrCluster, clientX, clientY) {
        if (!this.tooltip) this.createTooltip();

        if (typeof spotIdOrCluster === 'object' && spotIdOrCluster.isCluster) {
            const cluster = spotIdOrCluster;
            const spotNames = cluster.markers.slice(0, 3).map(m => m.spot.primaryName).join(', ');
            const moreText = cluster.markers.length > 3 ? ` and ${cluster.markers.length - 3} more` : '';
            
            this.tooltip.content.name = `${cluster.markers.length} Surf Spots`;
            this.tooltip.content.difficulty = `${spotNames}${moreText}`;
            this.tooltip.content.difficultyColor = '#666666';
        } else {
            const marker = this.markers.get(spotIdOrCluster);
            if (!marker) return;
            
            const spot = marker.spot;
            const difficulty = spot.waveDetails.abilityLevel.primary;
            const difficultyColor = this.spotsManager.getDifficultyColor(difficulty);

            this.tooltip.content.name = spot.primaryName;
            this.tooltip.content.difficulty = difficulty;
            this.tooltip.content.difficultyColor = difficultyColor;
        }

        // Convert client coordinates to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.tooltip.x = clientX - rect.left;
        this.tooltip.y = clientY - rect.top;
        this.tooltip.spotId = spotIdOrCluster;
        this.tooltip.visible = true;
    }

    /**
     * Updates the tooltip position.
     * @param {number} clientX - The client X coordinate.
     * @param {number} clientY - The client Y coordinate.
     */
    updateTooltipPosition(clientX, clientY) {
        if (!this.tooltip || !this.tooltip.visible) return;

        // Convert client coordinates to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.tooltip.x = clientX - rect.left;
        this.tooltip.y = clientY - rect.top;
    }

    /**
     * Hides the tooltip.
     */
    hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.visible = false;
        this.tooltip.spotId = null;
    }

    /**
     * Selects a marker.
     * @param {string} spotId - The spot ID.
     */
    selectMarker(spotId) {
        this.selectedMarker = spotId;
        this.surfMap.render();
    }

    /**
     * Deselects the current marker.
     */
    deselectMarker() {
        this.selectedMarker = null;
        this.surfMap.forceRender();
    }

    deselectAllMarkers() {
        if (this.selectedMarker) {
            this.selectedMarker = null;
            this.surfMap.forceRender();
        }
    }

    /**
     * Highlights a specific marker.
     * @param {string} spotId - The spot ID to highlight.
     */
    highlightMarker(spotId) {
        this.selectedMarker = spotId;
        
        // Trigger a render to show the highlight
        if (this.canvas && this.ctx) {
            // Request a render if the map is available
            if (this.canvas.parentNode) {
                const renderEvent = new CustomEvent('renderMap');
                this.canvas.dispatchEvent(renderEvent);
            }
        }
    }

    /**
     * Updates marker visibility based on a list of visible spots.
     * @param {Array<Object>} visibleSpots - Array of visible surf spots.
     */
    updateSpotVisibility(visibleSpots) {
        // Create a set of visible spot IDs for quick lookup
        const visibleSpotIds = new Set(visibleSpots.map(spot => spot.id));
        
        // Update marker visibility
        this.markers.forEach((marker, spotId) => {
            marker.visible = visibleSpotIds.has(spotId);
            
            if (marker.visible) {
                // Add to visible markers if not already there
                if (!this.visibleMarkers.includes(marker)) {
                    this.visibleMarkers.push(marker);
                }
            } else {
                // Remove from visible markers
                const index = this.visibleMarkers.indexOf(marker);
                if (index > -1) {
                    this.visibleMarkers.splice(index, 1);
                }
            }
        });
    }

    /**
     * Sets the marker click callback.
     * @param {Function} callback - The callback function.
     */
    setMarkerClickCallback(callback) {
        this.onMarkerClick = callback;
    }

    /**
     * Ease-out cubic easing function.
     * @param {number} t - The progress value (0-1).
     * @returns {number} The eased value.
     */
    easeOutCubic(t) {
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
     * Renders the tooltip on the canvas.
     */
    renderTooltip() {
        if (!this.ctx || !this.tooltip || !this.tooltip.visible) return;
        
        const { x, y, content } = this.tooltip;
        
        // Set font properties
        this.ctx.font = '14px Roboto, sans-serif';
        
        // Measure text dimensions
        const nameMetrics = this.ctx.measureText(content.name);
        const difficultyMetrics = this.ctx.measureText(content.difficulty);
        
        // Calculate tooltip dimensions
        const padding = 10;
        const margin = 5;
        const tooltipWidth = Math.max(nameMetrics.width, difficultyMetrics.width) + padding * 2;
        const tooltipHeight = 40; // Height for two lines of text
        const arrowSize = 8;
        
        // Calculate position to avoid going off-screen
        let tooltipX = x + 15; // Offset from cursor
        let tooltipY = y - tooltipHeight - 15; // Position above cursor
        
        // Adjust if tooltip goes beyond canvas bounds
        if (tooltipX + tooltipWidth > this.canvas.width) {
            tooltipX = x - tooltipWidth - 15;
        }
        if (tooltipY < 0) {
            tooltipY = y + 15;
        }
        
        // Save context state
        this.ctx.save();
        
        // Draw tooltip background with rounded corners
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Draw rounded rectangle
        this.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw arrow pointing to the marker
        this.ctx.beginPath();
        if (tooltipY < y) {
            // Arrow pointing down
            this.ctx.moveTo(x - arrowSize/2, tooltipY + tooltipHeight);
            this.ctx.lineTo(x + arrowSize/2, tooltipY + tooltipHeight);
            this.ctx.lineTo(x, tooltipY + tooltipHeight + arrowSize);
        } else {
            // Arrow pointing up
            this.ctx.moveTo(x - arrowSize/2, tooltipY);
            this.ctx.lineTo(x + arrowSize/2, tooltipY);
            this.ctx.lineTo(x, tooltipY - arrowSize);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // Draw spot name
        this.ctx.font = 'bold 14px Roboto, sans-serif';
        this.ctx.fillText(content.name, tooltipX + padding, tooltipY + padding);
        
        // Draw difficulty with colored background
        this.ctx.font = '12px Roboto, sans-serif';
        this.ctx.fillStyle = content.difficultyColor;
        this.ctx.fillRect(
            tooltipX + padding,
            tooltipY + padding + 18,
            difficultyMetrics.width + 6,
            16
        );
        
        // Draw difficulty text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(
            content.difficulty,
            tooltipX + padding + 3,
            tooltipY + padding + 20
        );
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Applies the shared canvas transformation sequence.
     * This method centralizes the coordinate transformation logic to eliminate code duplication
     * and ensure consistent rendering across all marker types.
     */
    applyCanvasTransformations() {
        // Check if transformation matrix needs updating
        if (this.matrixDirty) {
            this.updateTransformationMatrix();
            this.matrixDirty = false;
        }
        
        // Get image dimensions from spotsManager
        const imageWidth = this.spotsManager.imageWidth;
        const imageHeight = this.spotsManager.imageHeight;
        
        // Apply the SAME transformation sequence as the raster map renderer
        // This ensures perfect alignment between markers and the underlying map
        
        // 1. Scale for high-DPI displays (same as renderer)
        const dpr = window.devicePixelRatio || 1;
        this.ctx.scale(dpr, dpr);
        
        // 2. Move to center of canvas (in CSS pixels) - same as renderer
        const cssWidth = this.canvas.width / dpr;
        const cssHeight = this.canvas.height / dpr;
        this.ctx.translate(cssWidth / 2, cssHeight / 2);
        
        // 3. Apply pan - same as renderer
        this.ctx.translate(this.state.panX, this.state.panY);
        
        // 4. Apply zoom - same as renderer
        this.ctx.scale(this.state.zoom, this.state.zoom);
        
        // 5. Move to center of image - same as renderer
        this.ctx.translate(-imageWidth / 2, -imageHeight / 2);
    }
    
    /**
     * Updates the transformation matrix for coordinate caching.
     * This matrix is used to cache coordinate transformations and improve performance.
     */
    updateTransformationMatrix() {
        const imageWidth = this.spotsManager.imageWidth;
        const imageHeight = this.spotsManager.imageHeight;
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = this.canvas.width / dpr;
        const cssHeight = this.canvas.height / dpr;
        
        // Create transformation matrix (2D affine transformation)
        // Matrix represents: translate(cssWidth/2, cssHeight/2) * translate(panX, panY) * 
        // scale(zoom, zoom) * translate(-imageWidth/2, -imageHeight/2)
        this.transformationMatrix = {
            a: this.state.zoom,
            b: 0,
            c: 0,
            d: this.state.zoom,
            e: (this.state.panX * this.state.zoom) + (cssWidth / 2 * this.state.zoom) - (imageWidth / 2 * this.state.zoom),
            f: (this.state.panY * this.state.zoom) + (cssHeight / 2 * this.state.zoom) - (imageHeight / 2 * this.state.zoom)
        };
        
        // Update the last transform state for caching
        this.lastTransformState = {
            zoom: this.state.zoom,
            panX: this.state.panX,
            panY: this.state.panY,
            imageWidth,
            imageHeight,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            dpr
        };
    }
    
    /**
     * Transforms image coordinates to screen coordinates using the cached transformation matrix.
     * This method provides better performance for repeated coordinate transformations.
     * 
     * @param {number} imageX - The X coordinate in image space.
     * @param {number} imageY - The Y coordinate in image space.
     * @returns {Object} The transformed screen coordinates {x, y}.
     */
    transformImageToScreen(imageX, imageY) {
        if (!this.transformationMatrix || this.matrixDirty) {
            this.updateTransformationMatrix();
            this.matrixDirty = false;
        }
        
        const { a, b, c, d, e, f } = this.transformationMatrix;
        
        return {
            x: a * imageX + b * imageY + e,
            y: c * imageX + d * imageY + f
        };
    }
    
    /**
     * Gets the current transformation state key for caching purposes.
     * @returns {string} A string representing the current transformation state.
     */
    getTransformStateKey() {
        return `${this.state.zoom}_${this.state.panX}_${this.state.panY}_${this.canvas.width}_${this.canvas.height}`;
    }
    
    /**
     * Clears the coordinate transformation cache.
     * This should be called when the transformation state changes significantly.
     */
    clearTransformationCache() {
        this.transformationCache.clear();
        this.matrixDirty = true;
    }
    
    /**
     * Draws a rounded rectangle.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @param {number} width - The width.
     * @param {number} height - The height.
     * @param {number} radius - The corner radius.
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * Destroys the markers manager and cleans up resources.
     */
    destroy() {
        // Remove event listeners
        this.removeEventListeners();
        
        // Clear tooltip
        this.tooltip = null;
        
        // Clear data
        this.markers.clear();
        this.animations.clear();
        this.visibleMarkers = [];
        this.hoveredMarker = null;
        this.selectedMarker = null;
        this.onMarkerClick = null;

        // Clean up hover state
        if (this.canvas) {
            this.canvas.classList.remove('has-hover-marker');
        }
        
        // Clear performance optimization caches
        this.transformationCache.clear();
        this.transformationMatrix = null;
        
        // Reset initialization state
        this.isInitialized = false;
        this.initializationPromise = null;
        this.lastImageWidth = null;
        this.lastImageHeight = null;
    }
}
