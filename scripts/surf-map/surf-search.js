/**
 * @fileoverview Search functionality for surf spots.
 * @description This module provides instant search functionality for surf spots,
 * including text highlighting and result display with difficulty indicators.
 */

/**
 * Search manager for surf spots.
 */
export class SurfSearch {
    /**
     * @param {SurfSpotsManager} spotsManager - The surf spots data manager.
     * @param {HTMLElement} searchInput - The search input element.
     * @param {HTMLElement} resultsContainer - The container for search results.
     * @param {Object} options - Configuration options.
     * @param {number} [options.debounceTime=300] - Debounce time for search input.
     * @param {number} [options.maxResults=10] - Maximum number of results to display.
     */
    constructor(spotsManager, searchInput, resultsContainer, options = {}) {
        this.spotsManager = spotsManager;
        this.searchInput = searchInput;
        this.resultsContainer = resultsContainer;
        this.options = {
            debounceTime: options.debounceTime || 300,
            maxResults: options.maxResults || 10,
            // Mobile-specific options
            mobileDebounceTime: options.mobileDebounceTime || 200, // Faster response on mobile
            mobileMaxResults: options.mobileMaxResults || 8, // Fewer results on mobile
            enableVoiceSearch: options.enableVoiceSearch !== false, // Enable voice search on mobile
            enableLocationSearch: options.enableLocationSearch !== false, // Enable location-based search
            touchFeedback: options.touchFeedback !== false, // Visual feedback for touch
            ...options
        };

        // State
        this.searchResults = [];
        this.searchIndex = new Map();
        this.isSearchVisible = false;
        this.debounceTimer = null;
        this.selectedResultIndex = -1;

        // Event callbacks
        this.onResultClick = null;
        this.onSearchChange = null;
        this.onResultsUpdate = null;
        
        // Mobile detection
        this.isMobile = this.detectMobile();
        
        // Adjust options for mobile
        if (this.isMobile) {
            this.options.debounceTime = this.options.mobileDebounceTime;
            this.options.maxResults = this.options.mobileMaxResults;
        }

        // Initialize
        this.init();
    }

    /**
     * Initializes the search functionality.
     */
    init() {
        // Build search index
        this.buildSearchIndex();

        // Setup event listeners
        this.setupEventListeners();

        // Create results container if not provided
        if (!this.resultsContainer) {
            this.createResultsContainer();
        }
        
        // Setup clear button functionality
        this.setupClearButton();
    }

    /**
     * Builds a search index for fast text filtering.
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        
        const allSpots = this.spotsManager.getAllSpots();
        allSpots.forEach(spot => {
            // Create searchable text from all relevant spot properties
            const searchableText = [
                // Basic identification
                spot.primaryName || spot.id,
                ...(spot.alternativeNames || []),
                
                // Location information
                spot.location.area || '',
                ...(spot.location.nearestTowns || []),
                spot.location.coordinates.lat.toString(),
                spot.location.coordinates.lng.toString(),
                spot.location.coordinates.accuracy || '',
                
                // Wave details
                spot.waveDetails.abilityLevel.primary || '',
                ...(spot.waveDetails.abilityLevel.alsoSuitableFor || []),
                ...(spot.waveDetails.type || []),
                ...(spot.waveDetails.direction || []),
                spot.waveDetails.directionNotes || '',
                ...(spot.waveDetails.bestSwellDirection || []),
                ...(spot.waveDetails.bestWindDirection || []),
                ...(spot.waveDetails.bestTide || []),
                spot.waveDetails.tideNotes || '',
                ...(spot.waveDetails.bestSeason || []),
                spot.waveDetails.idealConditions || '',
                
                // Characteristics
                spot.characteristics.crowdFactor || '',
                spot.characteristics.crowdNotes || '',
                spot.characteristics.localVibe || '',
                ...(spot.characteristics.hazards || []),
                ...(spot.characteristics.bottom || []),
                spot.characteristics.waterQuality || '',
                
                // Practicalities
                spot.practicalities.access || '',
                spot.practicalities.parking || '',
                spot.practicalities.facilities || '',
                spot.practicalities.paddleOut || '',
                ...(spot.practicalities.recommendedBoards || []),
                spot.practicalities.additionalTips || '',
                
                // Description
                spot.description || ''
            ].join(' ').toLowerCase();

            // Store in index with additional metadata for better search scoring
            this.searchIndex.set(spot.id, {
                spot,
                searchableText,
                // Store individual components for better matching and highlighting
                components: {
                    names: [spot.primaryName || spot.id, ...(spot.alternativeNames || [])],
                    location: [
                        spot.location.area || '',
                        ...(spot.location.nearestTowns || []),
                        spot.location.coordinates.lat.toString(),
                        spot.location.coordinates.lng.toString(),
                        spot.location.coordinates.accuracy || ''
                    ],
                    waveDetails: [
                        spot.waveDetails.abilityLevel.primary || '',
                        ...(spot.waveDetails.abilityLevel.alsoSuitableFor || []),
                        ...(spot.waveDetails.type || []),
                        ...(spot.waveDetails.direction || []),
                        spot.waveDetails.directionNotes || '',
                        ...(spot.waveDetails.bestSwellDirection || []),
                        ...(spot.waveDetails.bestWindDirection || []),
                        ...(spot.waveDetails.bestTide || []),
                        spot.waveDetails.tideNotes || '',
                        ...(spot.waveDetails.bestSeason || []),
                        spot.waveDetails.idealConditions || ''
                    ],
                    characteristics: [
                        spot.characteristics.crowdFactor || '',
                        spot.characteristics.crowdNotes || '',
                        spot.characteristics.localVibe || '',
                        ...(spot.characteristics.hazards || []),
                        ...(spot.characteristics.bottom || []),
                        spot.characteristics.waterQuality || ''
                    ],
                    practicalities: [
                        spot.practicalities.access || '',
                        spot.practicalities.parking || '',
                        spot.practicalities.facilities || '',
                        spot.practicalities.paddleOut || '',
                        ...(spot.practicalities.recommendedBoards || []),
                        spot.practicalities.additionalTips || ''
                    ],
                    description: spot.description || ''
                }
            });
        });
    }

    /**
     * Sets up event listeners for the search input.
     */
    setupEventListeners() {
        if (!this.searchInput) return;

        // Input event with debouncing
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // Focus event
        this.searchInput.addEventListener('focus', () => {
            if (this.searchResults.length > 0) {
                this.showResults();
            }
        });

        // Blur event with delay to allow result clicks
        this.searchInput.addEventListener('blur', (e) => {
            console.log('Search input blur event triggered');
            // Check if the blur is caused by clicking on a search result
            const relatedTarget = e.relatedTarget;
            const isClickingResult = relatedTarget && relatedTarget.classList && relatedTarget.classList.contains('search-result');
            
            if (!isClickingResult) {
                setTimeout(() => {
                    console.log('Hiding search results after blur');
                    this.hideResults();
                }, 200);
            } else {
                console.log('Blur caused by clicking on search result, not hiding immediately');
            }
        });

        // Key navigation
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
        
        // Mobile-specific event listeners
        if (this.isMobile) {
            this.setupMobileEventListeners();
        }
        
        // Setup search button functionality
        this.setupSearchButton();
    }
    
    /**
     * Sets up the search button functionality.
     */
    setupSearchButton() {
        // Find the search button in the same container as the search input
        const searchContainer = this.searchInput.closest('.surf-map-search');
        if (searchContainer) {
            const searchBtn = searchContainer.querySelector('.surf-map-search-btn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    // Trigger search with current input value
                    this.performSearch(this.searchInput.value);
                });
            }
        }
    }
    
    /**
     * Sets up the clear search button functionality.
     */
    setupClearButton() {
        // Find the clear button in the same container as the search input
        const searchContainer = this.searchInput.closest('.surf-map-search');
        if (searchContainer) {
            const clearBtn = searchContainer.querySelector('.surf-map-clear-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clearSearch();
                });
            }
        }
    }
    
    /**
     * Sets up mobile-specific event listeners.
     */
    setupMobileEventListeners() {
        // Touch events for better mobile interaction
        this.searchInput.addEventListener('touchstart', (e) => {
            if (this.options.touchFeedback) {
                this.showTouchFeedback(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        
        // Voice search support
        if (this.options.enableVoiceSearch && 'webkitSpeechRecognition' in window) {
            this.setupVoiceSearch();
        }
        
        // Location-based search
        if (this.options.enableLocationSearch && 'geolocation' in navigator) {
            this.setupLocationSearch();
        }
    }
    
    /**
     * Sets up voice search functionality.
     */
    setupVoiceSearch() {
        // Create voice search button
        const voiceButton = document.createElement('button');
        voiceButton.className = 'surf-map-voice-search-btn';
        voiceButton.innerHTML = '🎤';
        voiceButton.setAttribute('aria-label', 'Voice search');
        voiceButton.style.cssText = `
            background: none;
            border: none;
            color: var(--text-salt-crystal);
            cursor: pointer;
            padding: 0.5rem;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        `;
        
        // Add click event
        voiceButton.addEventListener('click', () => {
            this.startVoiceSearch();
        });
        
        // Insert after search input
        this.searchInput.parentNode.insertBefore(voiceButton, this.searchInput.nextSibling);
        this.voiceButton = voiceButton;
    }
    
    /**
     * Starts voice search.
     */
    startVoiceSearch() {
        if (!('webkitSpeechRecognition' in window)) return;
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            if (this.voiceButton) {
                this.voiceButton.innerHTML = '🔴';
                this.voiceButton.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
            }
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.searchInput.value = transcript;
            this.handleSearchInput(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
            this.resetVoiceButton();
        };
        
        recognition.onend = () => {
            this.resetVoiceButton();
        };
        
        recognition.start();
    }
    
    /**
     * Resets the voice search button.
     */
    resetVoiceButton() {
        if (this.voiceButton) {
            this.voiceButton.innerHTML = '🎤';
            this.voiceButton.style.backgroundColor = 'transparent';
        }
    }
    
    /**
     * Sets up location-based search.
     */
    setupLocationSearch() {
        // Create location search button
        const locationButton = document.createElement('button');
        locationButton.className = 'surf-map-location-search-btn';
        locationButton.innerHTML = '📍';
        locationButton.setAttribute('aria-label', 'Search near my location');
        locationButton.style.cssText = `
            background: none;
            border: none;
            color: var(--text-salt-crystal);
            cursor: pointer;
            padding: 0.5rem;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        `;
        
        // Add click event
        locationButton.addEventListener('click', () => {
            this.searchNearLocation();
        });
        
        // Insert after search input or voice button
        const insertAfter = this.voiceButton || this.searchInput;
        insertAfter.parentNode.insertBefore(locationButton, insertAfter.nextSibling);
        this.locationButton = locationButton;
    }
    
    /**
     * Searches for surf spots near the user's location.
     */
    searchNearLocation() {
        if (!('geolocation' in navigator)) return;
        
        // Show loading state
        if (this.locationButton) {
            this.locationButton.innerHTML = '⏳';
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Find spots near this location
                const nearbySpots = this.findNearbySpots(latitude, longitude);
                
                // Update search results
                this.searchResults = nearbySpots.slice(0, this.options.maxResults);
                this.displayResults();
                
                // Reset button
                if (this.locationButton) {
                    this.locationButton.innerHTML = '📍';
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                
                // Reset button
                if (this.locationButton) {
                    this.locationButton.innerHTML = '📍';
                }
                
                // Show error message
                this.showLocationError();
            }
        );
    }
    
    /**
     * Finds surf spots near a given location.
     * @param {number} latitude - The latitude.
     * @param {number} longitude - The longitude.
     * @returns {Array<Object>} Array of nearby spots with distance.
     */
    findNearbySpots(latitude, longitude) {
        const allSpots = this.spotsManager.getAllSpots();
        const nearbySpots = [];
        
        allSpots.forEach(spot => {
            if (spot.location && spot.location.coordinates) {
                const distance = this.calculateDistance(
                    latitude, longitude,
                    spot.location.coordinates.lat, spot.location.coordinates.lng
                );
                
                nearbySpots.push({
                    spot,
                    score: Math.max(0, 10 - distance), // Higher score for closer spots
                    distance
                });
            }
        });
        
        // Sort by distance
        nearbySpots.sort((a, b) => a.distance - b.distance);
        
        return nearbySpots;
    }
    
    /**
     * Calculates the distance between two coordinates in km.
     * @param {number} lat1 - First latitude.
     * @param {number} lon1 - First longitude.
     * @param {number} lat2 - Second latitude.
     * @param {number} lon2 - Second longitude.
     * @returns {number} Distance in km.
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    /**
     * Converts degrees to radians.
     * @param {number} degrees - The degrees to convert.
     * @returns {number} The radians.
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * Shows location error message.
     */
    showLocationError() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = `
                <div class="search-location-error">
                    <div>Unable to get your location</div>
                    <div style="font-size: 0.8rem; opacity: 0.7;">Please check your location settings</div>
                </div>
            `;
            this.showResults();
        }
    }
    
    /**
     * Shows touch feedback at the specified position.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     */
    showTouchFeedback(x, y) {
        // Create or update touch feedback element
        let feedback = document.getElementById('surf-search-touch-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'surf-search-touch-feedback';
            feedback.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(255, 77, 77, 0.3);
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
        
        // Auto-hide after delay
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translate(-50%, -50%) scale(0.5)';
        }, 300);
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
     * Creates the search results container if it doesn't exist.
     */
    createResultsContainer() {
        // Check if we're in the left-side search container
        const leftSideContainer = this.searchInput.closest('.left-side-search-container');
        
        if (leftSideContainer) {
            // For left-side search, use the existing results container
            this.resultsContainer = leftSideContainer.querySelector('.surf-map-search-results');
        } else {
            // For other contexts, create a new results container
            this.resultsContainer = document.createElement('div');
            this.resultsContainer.className = 'surf-map-search-results';
            this.searchInput.parentNode.appendChild(this.resultsContainer);
        }
    }

    /**
     * Handles search input with debouncing.
     * @param {string} query - The search query.
     */
    handleSearchInput(query) {
        // Clear existing debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new debounce timer
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, this.options.debounceTime);
    }

    /**
     * Performs the actual search.
     * @param {string} query - The search query.
     */
    performSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();
        
        if (trimmedQuery === '') {
            this.clearResults();
            this.notifySearchChange([]);
            return;
        }

        // Search the index
        const results = [];
        const queryWords = trimmedQuery.split(/\s+/);

        this.searchIndex.forEach(({ spot, searchableText, components }) => {
            let score = 0;
            let matchedText = [];
            let matchedCategories = new Set();

            // Calculate relevance score based on category importance
            queryWords.forEach(word => {
                if (searchableText.includes(word)) {
                    // Base match score
                    score += 1;
                    
                    // Name matches (highest priority)
                    components.names.forEach(name => {
                        if (name.toLowerCase().includes(word)) {
                            score += 5; // High score for name matches
                            matchedText.push(name);
                            matchedCategories.add('name');
                        }
                    });
                    
                    // Location matches (high priority)
                    components.location.forEach(location => {
                        if (location.toLowerCase().includes(word)) {
                            score += 3; // High score for location matches
                            matchedText.push(location);
                            matchedCategories.add('location');
                        }
                    });
                    
                    // Wave detail matches (medium-high priority)
                    components.waveDetails.forEach(detail => {
                        if (detail.toLowerCase().includes(word)) {
                            score += 2.5; // Medium-high score for wave details
                            matchedText.push(detail);
                            matchedCategories.add('waveDetails');
                        }
                    });
                    
                    // Characteristics matches (medium priority)
                    components.characteristics.forEach(characteristic => {
                        if (characteristic.toLowerCase().includes(word)) {
                            score += 2; // Medium score for characteristics
                            matchedText.push(characteristic);
                            matchedCategories.add('characteristics');
                        }
                    });
                    
                    // Practicalities matches (low-medium priority)
                    components.practicalities.forEach(practicality => {
                        if (practicality.toLowerCase().includes(word)) {
                            score += 1.5; // Low-medium score for practicalities
                            matchedText.push(practicality);
                            matchedCategories.add('practicalities');
                        }
                    });
                    
                    // Description matches (lowest priority)
                    if (components.description.toLowerCase().includes(word)) {
                        score += 1; // Lowest score for description matches
                        matchedCategories.add('description');
                    }
                    
                    // Bonus for exact word matches
                    if (searchableText.split(' ').includes(word)) {
                        score += 0.5;
                    }
                }
            });

            // Bonus for matching multiple categories (diversity bonus)
            if (matchedCategories.size > 1) {
                score += matchedCategories.size * 0.5;
            }

            // Bonus for matching multiple query words
            const matchedWords = queryWords.filter(word => searchableText.includes(word));
            if (matchedWords.length > 1) {
                score += matchedWords.length * 0.3;
            }

            if (score > 0) {
                results.push({
                    spot,
                    score,
                    matchedText: [...new Set(matchedText)], // Remove duplicates
                    matchedCategories: Array.from(matchedCategories)
                });
            }
        });

        // Sort by relevance score
        results.sort((a, b) => b.score - a.score);

        // Limit results
        this.searchResults = results.slice(0, this.options.maxResults);

        // Display results
        this.displayResults();

        // Notify of search change
        this.notifySearchChange(this.searchResults.map(result => result.spot));
        
        // Notify of results update
        this.notifyResultsUpdate(this.searchResults.map(result => result.spot));
    }

    /**
     * Displays the search results.
     */
    displayResults() {
        if (!this.resultsContainer) return;

        // Clear previous results
        this.resultsContainer.innerHTML = '';

        if (this.searchResults.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'No surf spots found';
            this.resultsContainer.appendChild(noResults);
        } else {
            this.searchResults.forEach((result, index) => {
                const resultElement = this.createResultElement(result, index);
                this.resultsContainer.appendChild(resultElement);
            });
        }

        this.showResults();
    }

    /**
     * Creates a result element for a single search result.
     * @param {Object} result - The search result.
     * @param {number} index - The result index.
     * @returns {HTMLElement} The result element.
     */
    createResultElement(result, index) {
        const { spot, matchedText, distance, matchedCategories } = result;
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.setAttribute('data-index', index);
        resultElement.setAttribute('data-spot-id', spot.id);
        
        // Add mobile-specific attributes
        if (this.isMobile) {
            resultElement.setAttribute('role', 'button');
            resultElement.setAttribute('tabindex', '0');
        }

        // Create difficulty indicator
        const difficulty = spot.waveDetails.abilityLevel.primary || 'Unknown';
        const difficultyColor = this.spotsManager.getDifficultyColor(difficulty);
        
        const difficultyIndicator = document.createElement('span');
        difficultyIndicator.className = 'search-result-difficulty';
        difficultyIndicator.style.backgroundColor = difficultyColor;
        difficultyIndicator.textContent = difficulty;
        
        // Create name with highlighting
        const nameElement = document.createElement('div');
        nameElement.className = 'search-result-name';
        nameElement.innerHTML = this.highlightText(spot.primaryName || spot.id, matchedText);
        
        // Create location info with highlighting
        const locationElement = document.createElement('div');
        locationElement.className = 'search-result-location';
        const locationText = [
            spot.location.area,
            ...(spot.location.nearestTowns || [])
        ].filter(Boolean).join(', ');
        locationElement.innerHTML = this.highlightText(locationText || 'Unknown location', matchedText);
        
        // Create wave type info with highlighting
        const waveTypeElement = document.createElement('div');
        waveTypeElement.className = 'search-result-wave-type';
        const waveType = (spot.waveDetails.type && spot.waveDetails.type[0]) || 'Unknown';
        waveTypeElement.innerHTML = this.highlightText(`Wave: ${waveType}`, matchedText);
        
        // Create match categories info if available
        let matchCategoriesElement = null;
        if (matchedCategories && matchedCategories.length > 0) {
            matchCategoriesElement = document.createElement('div');
            matchCategoriesElement.className = 'search-result-match-categories';
            matchCategoriesElement.style.fontSize = '0.8rem';
            matchCategoriesElement.style.opacity = '0.7';
            matchCategoriesElement.style.marginTop = '4px';
            
            // Create category labels
            const categoryLabels = {
                'name': 'Name',
                'location': 'Location',
                'waveDetails': 'Wave Details',
                'characteristics': 'Characteristics',
                'practicalities': 'Practicalities',
                'description': 'Description'
            };
            
            const categoryText = matchedCategories
                .map(cat => categoryLabels[cat] || cat)
                .join(' • ');
            
            matchCategoriesElement.textContent = `Matched in: ${categoryText}`;
        }
        
        // Create distance info if available
        let distanceElement = null;
        if (distance !== undefined) {
            distanceElement = document.createElement('div');
            distanceElement.className = 'search-result-distance';
            distanceElement.textContent = `${distance.toFixed(1)} km away`;
        }
        
        // Assemble the result element
        resultElement.appendChild(difficultyIndicator);
        resultElement.appendChild(nameElement);
        resultElement.appendChild(locationElement);
        resultElement.appendChild(waveTypeElement);
        
        if (matchCategoriesElement) {
            resultElement.appendChild(matchCategoriesElement);
        }
        
        if (distanceElement) {
            resultElement.appendChild(distanceElement);
        }
        
        // Add click event
        resultElement.addEventListener('click', (e) => {
            console.log('Search result click event triggered for:', result.spot.id, result.spot.primaryName);
            console.log('Event target:', e.target);
            console.log('Current target:', e.currentTarget);
            this.handleResultClick(result.spot);
        });
        
        // Add touch events for mobile
        if (this.isMobile) {
            resultElement.addEventListener('touchstart', (e) => {
                if (this.options.touchFeedback) {
                    this.showTouchFeedback(e.touches[0].clientX, e.touches[0].clientY);
                }
                resultElement.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
            });
            
            resultElement.addEventListener('touchend', () => {
                setTimeout(() => {
                    resultElement.style.backgroundColor = '';
                }, 150);
            });
        }

        return resultElement;
    }

    /**
     * Highlights matched text in a string.
     * @param {string} text - The text to highlight.
     * @param {Array<string>} matches - The matched terms.
     * @returns {string} The highlighted HTML.
     */
    highlightText(text, matches) {
        if (!matches || matches.length === 0) {
            return text;
        }

        let highlightedText = text;
        
        // Create a regex pattern to match any of the matched terms
        const pattern = new RegExp(`(${matches.join('|')})`, 'gi');
        
        // Replace matches with highlighted versions
        highlightedText = highlightedText.replace(pattern, '<mark>$1</mark>');
        
        return highlightedText;
    }

    /**
     * Shows the search results container.
     */
    showResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.add('visible');
            this.isSearchVisible = true;
        }
    }

    /**
     * Hides the search results container.
     */
    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.remove('visible');
            this.isSearchVisible = false;
        }
    }

    /**
     * Clears the search results.
     */
    clearResults() {
        this.searchResults = [];
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
        this.hideResults();
    }

    /**
     * Handles keyboard navigation in search results.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleKeyNavigation(e) {
        if (!this.isSearchVisible || this.searchResults.length === 0) return;

        const currentIndex = this.getSelectedIndex();
        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                newIndex = Math.min(currentIndex + 1, this.searchResults.length - 1);
                this.selectResult(newIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                newIndex = Math.max(currentIndex - 1, -1);
                this.selectResult(newIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    this.handleResultClick(this.searchResults[currentIndex].spot);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.hideResults();
                this.searchInput.blur();
                break;
        }
    }

    /**
     * Gets the index of the currently selected result.
     * @returns {number} The selected index or -1 if none selected.
     */
    getSelectedIndex() {
        const selected = this.resultsContainer.querySelector('.search-result.selected');
        return selected ? parseInt(selected.getAttribute('data-index')) : -1;
    }

    /**
     * Selects a result by index.
     * @param {number} index - The index to select.
     */
    selectResult(index) {
        // Store selected index
        this.selectedResultIndex = index;
        
        // Remove previous selection
        const previousSelected = this.resultsContainer.querySelector('.search-result.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Add new selection
        if (index >= 0 && index < this.searchResults.length) {
            const resultElement = this.resultsContainer.querySelector(`[data-index="${index}"]`);
            if (resultElement) {
                resultElement.classList.add('selected');
                
                // Mobile-specific scrolling
                if (this.isMobile) {
                    resultElement.scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth'
                    });
                } else {
                    resultElement.scrollIntoView({ block: 'nearest' });
                }
            }
        }
    }

    /**
     * Handles a result click.
     * @param {Object} spot - The clicked surf spot.
     */
    handleResultClick(spot) {
        console.log('handleResultClick called for:', spot.id, spot.primaryName);
        this.clearSearch();
        this.hideResults();
        
        if (this.onResultClick) {
            console.log('Calling onResultClick callback for:', spot.id);
            this.onResultClick(spot);
        } else {
            console.error('No onResultClick callback available');
        }
    }

    /**
     * Clears the search input and results.
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.clearResults();
        this.notifySearchChange([]);
    }

    /**
     * Notifies listeners of search changes.
     * @param {Array<Object>} results - The current search results.
     */
    notifySearchChange(results) {
        if (this.onSearchChange) {
            this.onSearchChange(results);
        }
    }

    /**
     * Sets the callback for result clicks.
     * @param {Function} callback - The callback function.
     */
    setResultClickCallback(callback) {
        this.onResultClick = callback;
    }

    /**
     * Sets the callback for search changes.
     * @param {Function} callback - The callback function.
     */
    setSearchChangeCallback(callback) {
        this.onSearchChange = callback;
    }

    /**
     * Sets the callback for results updates.
     * @param {Function} callback - The callback function.
     */
    setResultsUpdateCallback(callback) {
        this.onResultsUpdate = callback;
    }

    /**
     * Notifies listeners of results updates.
     * @param {Array<Object>} results - The current search results.
     */
    notifyResultsUpdate(results) {
        if (this.onResultsUpdate) {
            this.onResultsUpdate(results);
        }
    }

    /**
     * Rebuilds the search index (useful when spot data changes).
     */
    rebuildIndex() {
        this.buildSearchIndex();
    }

    /**
     * Gets the current search results.
     * @returns {Array<Object>} The current search results.
     */
    getSearchResults() {
        return this.searchResults;
    }

    /**
     * Destroys the search manager and cleans up resources.
     */
    destroy() {
        // Clear debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Remove event listeners
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearchInput);
            this.searchInput.removeEventListener('focus', this.showResults);
            this.searchInput.removeEventListener('blur', this.hideResults);
            this.searchInput.removeEventListener('keydown', this.handleKeyNavigation);
        }

        // Clear results
        this.clearResults();

        // Remove results container if we created it
        if (this.resultsContainer && this.resultsContainer.parentNode) {
            this.resultsContainer.parentNode.removeChild(this.resultsContainer);
        }

        // Clear references
        this.searchInput = null;
        this.resultsContainer = null;
        this.onResultClick = null;
        this.onSearchChange = null;
        this.onResultsUpdate = null;
    }
}
