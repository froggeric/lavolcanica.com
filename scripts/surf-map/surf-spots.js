/**
 * @fileoverview Surf spots data management module.
 * @version 1.0.1
 * @description This module handles loading, processing, and managing surf spot data
 * for the surf map, including coordinate conversion and spot categorization.
 */

/**
 * Surf spots data manager class.
 */
export class SurfSpotsManager {
    /**
     * @param {Object} options - Configuration options.
     * @param {string} [options.dataPath='data/surfspots/'] - Path to surf spot data files.
     * @param {Object} [options.pixelCoordinates] - Predefined pixel coordinates for spots.
     * @param {HTMLImageElement} [options.mapImage] - The map image element.
     */
    constructor(options = {}) {
        this.options = {
            dataPath: options.dataPath || 'data/',
            consolidatedDataFile: options.consolidatedDataFile || 'fuerteventura-surf-spots.json',
            pixelCoordinates: options.pixelCoordinates || {},
            // Concurrency and rate-limit controls for JSON loading
            concurrentLimit: options.concurrentLimit || 5,
            rateLimitPauseMs: options.rateLimitPauseMs || 150,
            ...options
        };
        
        // Set image dimensions if provided
        if (options.mapImage) {
            this.imageWidth = options.mapImage.width;
            this.imageHeight = options.mapImage.height;
        }
        
        // Data storage
        this.spots = new Map(); // Map of spot ID to spot data
        this.spotsByArea = new Map(); // Map of area name to array of spot IDs
        this.spotsByDifficulty = new Map(); // Map of difficulty to array of spot IDs
        this.fetchCache = new Map(); // Cache filename -> spot to avoid re-fetch on subsequent loads
        
        // State
        this.loaded = false;
        this.loadingPromise = null;
    }

    /**
     * Loads all surf spot data from JSON files.
     * @returns {Promise<void>} Promise that resolves when all data is loaded.
     */
    async loadSurfSpots() {
        if (this.loaded) return;
        if (this.loadingPromise) return this.loadingPromise;
        
        this.loadingPromise = this._loadSurfSpotsInternal();
        return this.loadingPromise;
    }

    /**
     * Internal method to load surf spot data.
     * @private
     * @returns {Promise<void>}
     */
    async _loadSurfSpotsInternal() {
        try {
            // Detect file:// protocol which breaks fetch of local JSON due to CORS/opaque origin
            if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
                console.error('Detected file:// protocol. Browsers restrict fetch of local files causing CORS-like failures.');
                console.error('Start the local server to serve JSON via HTTP: node server/dev-server.js');
            }

            // Load the consolidated surf spots file
            const data = await this._loadConsolidatedSpotsFile();
            
            if (!data || !data.spots || !Array.isArray(data.spots)) {
                throw new Error('Invalid data format in consolidated surf spots file');
            }

            // Process each spot from the consolidated data
            let loadedCount = 0;
            data.spots.forEach(spot => {
                try {
                    // Add pixel coordinates if available
                    const coords = this.getPixelCoordinates(spot.id, spot);
                    if (coords) {
                        spot.pixelCoordinates = coords;
                    }
                    
                    // Store the spot
                    this.spots.set(spot.id, spot);
                    loadedCount++;
                } catch (err) {
                    console.warn(`Failed to process surf spot ${spot.id}:`, err);
                }
            });
            
            // Organize spots by categories
            this._organizeSpots();
            
            this.loaded = true;
            console.log(`Loaded ${loadedCount} surf spots from consolidated file`);
        } catch (error) {
            console.error('Failed to load surf spots:', error);
            throw error;
        }
    }

    /**
     * Loads the consolidated surf spots file.
     * @private
     * @returns {Promise<Object|null>} Promise that resolves to the spots data or null if failed.
     */
    async _loadConsolidatedSpotsFile() {
        try {
            // Return cached result to avoid repeated fetches
            const cacheKey = this.options.consolidatedDataFile;
            if (this.fetchCache && this.fetchCache.has(cacheKey)) {
                return this.fetchCache.get(cacheKey);
            }

            const url = `${this.options.dataPath}${this.options.consolidatedDataFile}`;
            
            // Add cache-busting parameter to prevent browser caching
            const cacheBuster = `?t=${Date.now()}`;
            const urlWithCacheBuster = url + cacheBuster;

            // Retry-aware fetch to handle transient 429/5xx responses
            const fetchJsonWithRetry = async (url, retries = 2, backoffMs = 300) => {
                let attempt = 0;
                while (attempt <= retries) {
                    try {
                        const response = await fetch(url, { cache: 'no-cache' });
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        }
                        const json = await response.json();
                        return json;
                    } catch (err) {
                        if (attempt >= retries) {
                            throw err;
                        }
                        // Exponential backoff
                        await new Promise(r => setTimeout(r, backoffMs * (attempt + 1)));
                        attempt++;
                    }
                }
            };

            const data = await fetchJsonWithRetry(urlWithCacheBuster);

            // Cache result to avoid re-fetching
            if (this.fetchCache) {
                this.fetchCache.set(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error(`Failed to load consolidated spots file ${this.options.consolidatedDataFile}:`, error);
            return null;
        }
    }

    /**
     * Organizes spots by area and difficulty.
     * @private
     */
    _organizeSpots() {
        this.spotsByArea.clear();
        this.spotsByDifficulty.clear();
        
        this.spots.forEach(spot => {
            // Organize by area
            const area = spot.location.area || 'Unknown';
            if (!this.spotsByArea.has(area)) {
                this.spotsByArea.set(area, []);
            }
            this.spotsByArea.get(area).push(spot.id);
            
            // Organize by difficulty
            const difficulty = spot.waveDetails.abilityLevel.primary || 'Unknown';
            if (!this.spotsByDifficulty.has(difficulty)) {
                this.spotsByDifficulty.set(difficulty, []);
            }
            this.spotsByDifficulty.get(difficulty).push(spot.id);
        });
    }

    /**
     * Gets a surf spot by ID.
     * @param {string} spotId - The spot ID.
     * @returns {Object|null} The spot data or null if not found.
     */
    getSpot(spotId) {
        return this.spots.get(spotId) || null;
    }

    /**
     * Gets all surf spots.
     * @returns {Array<Object>} Array of all spot data.
     */
    getAllSpots() {
        return Array.from(this.spots.values());
    }

    /**
     * Gets spots by area.
     * @param {string} area - The area name.
     * @returns {Array<Object>} Array of spots in the specified area.
     */
    getSpotsByArea(area) {
        const spotIds = this.spotsByArea.get(area) || [];
        return spotIds.map(id => this.spots.get(id)).filter(Boolean);
    }

    /**
     * Gets spots by difficulty level.
     * @param {string} difficulty - The difficulty level.
     * @returns {Array<Object>} Array of spots with the specified difficulty.
     */
    getSpotsByDifficulty(difficulty) {
        const spotIds = this.spotsByDifficulty.get(difficulty) || [];
        return spotIds.map(id => this.spots.get(id)).filter(Boolean);
    }

    /**
     * Gets all available areas.
     * @returns {Array<string>} Array of area names.
     */
    getAreas() {
        return Array.from(this.spotsByArea.keys());
    }

    /**
     * Gets all available difficulty levels.
     * @returns {Array<string>} Array of difficulty levels.
     */
    getDifficultyLevels() {
        return Array.from(this.spotsByDifficulty.keys());
    }

    /**
     * Gets spots visible in the current viewport.
     * @param {Object} viewport - The viewport bounds.
     * @param {number} viewport.left - Left bound in pixels.
     * @param {number} viewport.top - Top bound in pixels.
     * @param {number} viewport.right - Right bound in pixels.
     * @param {number} viewport.bottom - Bottom bound in pixels.
     * @returns {Array<Object>} Array of visible spots.
     */
    getVisibleSpots(viewport) {
        const visibleSpots = [];
        
        this.spots.forEach(spot => {
            if (spot.pixelCoordinates) {
                const { x, y } = spot.pixelCoordinates;
                if (
                    x >= viewport.left &&
                    x <= viewport.right &&
                    y >= viewport.top &&
                    y <= viewport.bottom
                ) {
                    visibleSpots.push(spot);
                }
            }
        });
        
        return visibleSpots;
    }

    /**
     * Gets the default pixel coordinates for surf spots.
     * These coordinates are approximate positions on the map image for testing.
     * @private
     * @returns {Object} Map of spot ID to pixel coordinates.
     */
    /**
     * Converts GPS coordinates to pixel coordinates.
     * @param {number} lat - Latitude.
     * @param {number} lng - Longitude.
     * @returns {Object} The pixel coordinates {x, y}.
     */
    gpsToPixel(lat, lng) {
        // Map boundaries for Fuerteventura (accurate bounds)
        const mapBounds = {
            north: 28.815195,    // Northernmost point of Fuerteventura
            south: 27.984300,    // Southernmost point of Fuerteventura
            east: -13.706680,    // Easternmost point of Fuerteventura
            west: -14.641998     // Westernmost point of Fuerteventura
        };
        
        // Ensure image dimensions are set
        if (!this.imageWidth || !this.imageHeight) {
            console.warn('Image dimensions not set in gpsToPixel, returning null');
            return null;
        }
        
        const imageWidth = this.imageWidth;
        const imageHeight = this.imageHeight;
        
        // Calculate the relative position within the map bounds
        // Note: In map coordinates, (0,0) is at the top-left corner
        // Latitude increases going north, but pixel Y increases going down
        const latRatio = (mapBounds.north - lat) / (mapBounds.north - mapBounds.south);
        const lngRatio = (lng - mapBounds.west) / (mapBounds.east - mapBounds.west);
        
        // Convert to pixel coordinates
        const pixelX = lngRatio * imageWidth;
        const pixelY = latRatio * imageHeight;
        
        // Validate the calculated coordinates are within the image bounds
        if (pixelX < 0 || pixelX > imageWidth || pixelY < 0 || pixelY > imageHeight) {
            console.warn(`Calculated pixel coordinates (${pixelX}, ${pixelY}) are outside image bounds for GPS (${lat}, ${lng})`);
        }
        
        return { x: pixelX, y: pixelY };
    }
    
    /**
     * Gets pixel coordinates for a spot, converting from GPS coordinates.
     * @param {string} spotId - The spot ID.
     * @param {Object} spot - The spot data.
     * @returns {Object|null} The pixel coordinates {x, y} or null if not found.
     */
    getPixelCoordinates(spotId, spot) {
        // Check if pixel coordinates are already cached
        if (spot.pixelCoordinates) {
            return spot.pixelCoordinates;
        }
        
        // Calculate pixel coordinates if not cached
        if (spot.location && spot.location.coordinates) {
            const { lat, lng } = spot.location.coordinates;
            const pixelCoords = this.gpsToPixel(lat, lng);
            if (pixelCoords) {
                // Cache the coordinates
                spot.pixelCoordinates = pixelCoords;
                return pixelCoords;
            } else {
                console.warn(`Failed to calculate pixel coordinates for spot: ${spot.primaryName}`);
                return null;
            }
        }
        
        console.warn(`No coordinates available for spot: ${spot.primaryName}`);
        return null;
    }
    
    
    /**
     * Sets the actual image dimensions.
     * @param {number} width - The image width.
     * @param {number} height - The image height.
     */
    setImageDimensions(width, height) {
        const oldWidth = this.imageWidth;
        const oldHeight = this.imageHeight;
        
        this.imageWidth = width;
        this.imageHeight = height;
        
        // If dimensions changed, recalculate all pixel coordinates
        if (oldWidth !== width || oldHeight !== height) {
            this.recalculateAllPixelCoordinates();
        }
    }
    
    /**
     * Recalculates pixel coordinates for all spots after image dimensions change.
     * @private
     */
    recalculateAllPixelCoordinates() {
        if (!this.loaded) {
            return;
        }
        
        let processedCount = 0;
        
        this.spots.forEach(spot => {
            // Clear existing pixel coordinates to force recalculation
            delete spot.pixelCoordinates;
            
            if (spot.location && spot.location.coordinates) {
                const { lat, lng } = spot.location.coordinates;
                spot.pixelCoordinates = this.gpsToPixel(lat, lng);
                processedCount++;
            }
        });
    }

    /**
     * Gets the color for a difficulty level.
     * @param {string} difficulty - The difficulty level.
     * @returns {string} The color code for the difficulty.
     */
    getDifficultyColor(difficulty) {
        const colors = {
            'Beginner': '#4CAF50',      // Green
            'Intermediate': '#2196F3', // Blue
            'Advanced': '#FF9800',     // Orange
            'Expert': '#F44336'        // Red
        };
        
        return colors[difficulty] || '#9E9E9E'; // Gray for unknown
    }

    /**
     * Converts geographic coordinates to pixel coordinates.
     * Note: This is a simplified conversion for testing purposes.
     * In a real application, you would use proper GIS transformations.
     * @param {number} lat - Latitude.
     * @param {number} lng - Longitude.
     * @returns {Object} Pixel coordinates {x, y}.
     */
    geoToPixel(lat, lng) {
        // This function is deprecated and should not be used
        // Use gpsToPixel() instead
        console.warn('geoToPixel() is deprecated. Use gpsToPixel() instead.');
        return this.gpsToPixel(lat, lng);
    }

    
    /**
     * Validates GPS coordinates and pixel coordinate conversion.
     * @returns {Object} Validation results with any issues found.
     */
    validateCoordinateConversion() {
        const results = {
            valid: true,
            issues: [],
            spotCount: 0,
            validSpotCount: 0,
            invalidSpots: []
        };
        
        // Check if image dimensions are set
        if (!this.imageWidth || !this.imageHeight) {
            results.valid = false;
            results.issues.push('Image dimensions not set');
            return results;
        }
        
        // Validate each spot
        this.spots.forEach(spot => {
            results.spotCount++;
            
            if (!spot.location || !spot.location.coordinates) {
                results.valid = false;
                results.issues.push(`Spot ${spot.primaryName} has no GPS coordinates`);
                results.invalidSpots.push(spot.primaryName);
                return;
            }
            
            const { lat, lng } = spot.location.coordinates;
            
            // Check if GPS coordinates are within expected bounds
            if (lat < 27.5 || lat > 29.0 || lng < -15.0 || lng > -13.5) {
                results.valid = false;
                results.issues.push(`Spot ${spot.primaryName} has GPS coordinates outside expected bounds: (${lat}, ${lng})`);
                results.invalidSpots.push(spot.primaryName);
                return;
            }
            
            // Check if pixel coordinates are calculated correctly
            if (!spot.pixelCoordinates) {
                // Calculate pixel coordinates
                spot.pixelCoordinates = this.gpsToPixel(lat, lng);
            }
            
            // Check if pixel coordinates are within image bounds
            const { x, y } = spot.pixelCoordinates;
            if (x < 0 || x > this.imageWidth || y < 0 || y > this.imageHeight) {
                results.valid = false;
                results.issues.push(`Spot ${spot.primaryName} has pixel coordinates outside image bounds: (${x}, ${y})`);
                results.invalidSpots.push(spot.primaryName);
                return;
            }
            
            results.validSpotCount++;
        });
        
        // Only log if there are issues
        if (!results.valid && results.issues.length > 0) {
            console.warn('Coordinate conversion validation failed:', results.issues);
        }
        
        return results;
    }

    /**
     * Destroys the surf spots manager and cleans up resources.
     */
    destroy() {
        this.spots.clear();
        this.spotsByArea.clear();
        this.spotsByDifficulty.clear();
        this.loaded = false;
        this.loadingPromise = null;
    }
}