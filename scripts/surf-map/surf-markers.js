/**
 * @fileoverview Surf spot markers rendering module.
 * @version 1.0.1
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
     * @param {Object} options - Configuration options.
     */
    constructor(canvas, state, spotsManager, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        this.spotsManager = spotsManager;
        
        // Configuration options
        this.options = {
            markerSize: 30, // Increased from 20 to make markers more visible
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
            enableLOD: true, // Level of detail - simplify markers at low zoom
            lodZoomThreshold: 0.5, // Zoom level below which to use simplified markers
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
        
        // Adjust options for mobile if needed
        if (this.isMobile && this.options.enableMobileOptimizations) {
            this.options.markerSize = this.options.mobileMarkerSize;
            this.options.hoverRadius = this.options.mobileHoverRadius;
        }
        
        // Event handlers
        this.eventHandlers = {
            mousemove: this.handleMouseMove.bind(this),
            click: this.handleClick.bind(this),
            touchstart: this.handleTouchStart.bind(this)
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
        this.canvas.addEventListener('mousemove', this.eventHandlers.mousemove);
        this.canvas.addEventListener('click', this.eventHandlers.click);
        this.canvas.addEventListener('touchstart', this.eventHandlers.touchstart, { passive: false });
    }

    /**
     * Removes event listeners.
     */
    removeEventListeners() {
        this.canvas.removeEventListener('mousemove', this.eventHandlers.mousemove);
        this.canvas.removeEventListener('click', this.eventHandlers.click);
        this.canvas.removeEventListener('touchstart', this.eventHandlers.touchstart);
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
     * Detects if the device is mobile.
     * @returns {boolean} Whether the device is mobile.
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
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
        
        // Update animations
        this.updateAnimations();
        
        // Sort markers by y position for proper layering
        const sortedMarkers = [...this.visibleMarkers].sort((a, b) => a.y - b.y);
        
        // Render each marker
        sortedMarkers.forEach(marker => {
            this.renderMarker(marker);
        });
        
        // Render tooltip if visible
        if (this.tooltip && this.tooltip.visible) {
            this.renderTooltip();
        }
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
        
        // Get image dimensions from spotsManager
        const imageWidth = this.spotsManager.imageWidth;
        const imageHeight = this.spotsManager.imageHeight;
        
        // Calculate screen position - this is the key transformation
        // First transform from image coordinates to world coordinates
        const worldX = (x - imageWidth / 2) * this.state.zoom;
        const worldY = (y - imageHeight / 2) * this.state.zoom;
        
        // Then transform from world coordinates to screen coordinates
        const screenX = worldX + this.canvas.width / 2 + this.state.panX;
        const screenY = worldY + this.canvas.height / 2 + this.state.panY;
        
        // Debug logging removed to prevent console spam
        
        // Check if marker is within canvas bounds
        const isInBounds = screenX >= -50 && screenX <= this.canvas.width + 50 &&
                           screenY >= -50 && screenY <= this.canvas.height + 50;
        
        // Skip if marker is completely outside canvas bounds
        if (!isInBounds) {
            return;
        }
        
        // Apply transformations
        this.ctx.translate(screenX, screenY);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = opacity;
        
        // Determine marker size based on zoom level (LOD)
        let markerSize = this.options.markerSize;
        if (this.options.enableLOD && this.state.zoom < this.options.lodZoomThreshold) {
            // Simplified marker at low zoom
            markerSize = this.options.markerSize * 0.7;
        }
        
        // Draw shadow
        this.ctx.shadowColor = this.options.markerShadowColor;
        this.ctx.shadowBlur = this.options.markerShadowBlur;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 2;
        
        // Draw marker background
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = this.options.markerBorderWidth;
        
        if (this.options.enableLOD && this.state.zoom < this.options.lodZoomThreshold) {
            // Simplified marker shape at low zoom
            this.ctx.beginPath();
            this.ctx.arc(0, 0, markerSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // Full marker shape at normal zoom
            // Draw marker shape (circle with point)
            this.ctx.beginPath();
            this.ctx.arc(0, -markerSize / 2, markerSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw point
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(-markerSize / 3, 0);
            this.ctx.lineTo(0, -markerSize / 2);
            this.ctx.lineTo(markerSize / 3, 0);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Draw hover effect
        if (this.hoveredMarker === marker.spot.id) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, -markerSize / 2, markerSize / 2 + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw selection effect
        if (this.selectedMarker === marker.spot.id) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, -markerSize / 2, markerSize / 2 + 6, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    /**
     * Renders a cluster marker.
     * @param {Object} cluster - The cluster data.
     */
    renderCluster(cluster) {
        const { x, y, scale, opacity, count } = cluster;
        
        // Get image dimensions from spotsManager
        const imageWidth = this.spotsManager.imageWidth;
        const imageHeight = this.spotsManager.imageHeight;
        
        // Calculate screen position - same transformation as individual markers
        const worldX = (x - imageWidth / 2) * this.state.zoom;
        const worldY = (y - imageHeight / 2) * this.state.zoom;
        
        const screenX = worldX + this.canvas.width / 2 + this.state.panX;
        const screenY = worldY + this.canvas.height / 2 + this.state.panY;
        
        // Apply transformations
        this.ctx.translate(screenX, screenY);
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = opacity;
        
        // Calculate cluster size based on count
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
     * Handles mouse move events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseMove(e) {
        if (!this.options.enableHover) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check for marker hover
        const hoveredMarker = this.getMarkerAtPosition(x, y);
        
        if (hoveredMarker !== this.hoveredMarker) {
            this.hoveredMarker = hoveredMarker;
            
            if (hoveredMarker && this.options.enableTooltips) {
                this.showTooltip(hoveredMarker, e.clientX, e.clientY);
                this.canvas.style.cursor = 'pointer';
            } else {
                this.hideTooltip();
                this.canvas.style.cursor = 'grab';
            }
        } else if (hoveredMarker && this.options.enableTooltips) {
            this.updateTooltipPosition(e.clientX, e.clientY);
        }
    }

    /**
     * Handles click events.
     * @param {MouseEvent} e - The mouse event.
     */
    handleClick(e) {
        if (!this.options.enableClick) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const clickedMarker = this.getMarkerAtPosition(x, y);
        
        if (clickedMarker) {
            this.selectMarker(clickedMarker);
            
            // Emit marker click event
            if (this.onMarkerClick) {
                const marker = this.markers.get(clickedMarker);
                if (marker) {
                    this.onMarkerClick(marker.spot);
                }
            }
        }
    }

    /**
     * Handles touch start events.
     * @param {TouchEvent} e - The touch event.
     */
    handleTouchStart(e) {
        if (!this.options.enableClick) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const touchedMarker = this.getMarkerAtPosition(x, y);
        
        if (touchedMarker) {
            e.preventDefault();
            
            // Show tooltip for touched marker on mobile
            if (this.options.enableTooltips) {
                this.showTooltip(touchedMarker, touch.clientX, touch.clientY);
                
                // Hide tooltip after delay
                setTimeout(() => {
                    this.hideTooltip();
                }, 2000);
            }
            
            this.selectMarker(touchedMarker);
            
            // Emit marker click event
            if (this.onMarkerClick) {
                const marker = this.markers.get(touchedMarker);
                if (marker) {
                    this.onMarkerClick(marker.spot);
                }
            }
        }
    }

    /**
     * Gets the marker at the specified position.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @returns {string|null} The spot ID or null if no marker found.
     */
    getMarkerAtPosition(x, y) {
        // Get image dimensions from spotsManager
        const imageWidth = this.spotsManager.imageWidth;
        const imageHeight = this.spotsManager.imageHeight;
        
        for (const marker of this.visibleMarkers) {
            // Calculate screen position - same transformation as rendering
            const worldX = (marker.x - imageWidth / 2) * this.state.zoom;
            const worldY = (marker.y - imageHeight / 2) * this.state.zoom;
            
            const screenX = worldX + this.canvas.width / 2 + this.state.panX;
            const screenY = worldY + this.canvas.height / 2 + this.state.panY;
            
            // Check if position is within marker bounds
            const distance = Math.sqrt(Math.pow(x - screenX, 2) + Math.pow(y - screenY, 2));
            
            if (marker.isCluster) {
                // Check cluster hover
                const clusterSize = Math.min(
                    this.options.markerSize * 1.5,
                    this.options.markerSize + Math.log(marker.count) * 5
                );
                if (distance <= clusterSize / 2 + this.options.hoverRadius) {
                    return marker;
                }
            } else {
                // Check individual marker hover
                if (distance <= this.options.hoverRadius) {
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
    }

    /**
     * Deselects the current marker.
     */
    deselectMarker() {
        this.selectedMarker = null;
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
        
        // Reset initialization state
        this.isInitialized = false;
        this.initializationPromise = null;
        this.lastImageWidth = null;
        this.lastImageHeight = null;
    }
}