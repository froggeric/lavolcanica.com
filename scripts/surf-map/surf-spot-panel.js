/**
 * @fileoverview Enhanced SurfSpotPanel - Comprehensive interactive surf spot details panel.
 * @version 1.8.5
 * @description This module provides an enhanced class to dynamically generate the HTML content
 * for a surf spot detail panel with comprehensive interactive features. Based on the standardized
 * surf spot data structure, it incorporates semantic HTML5 elements, responsive design, 
 * accessibility features, animations, and rich user interactions.
 */

/**
 * Generates comprehensive HTML content for the surf spot detail side panel with full interactivity.
 * This class provides both content generation and state management for panel interactions.
 */
export class SurfSpotPanel {
    /**
     * Creates an instance of SurfSpotPanel.
     * @param {Object} options - Configuration options for the panel
     * @param {HTMLElement} options.container - Container element for the panel
     * @param {boolean} options.enableAnimations - Enable animations and transitions
     * @param {boolean} options.enableTooltips - Enable tooltip functionality
     * @param {boolean} options.enableKeyboardNav - Enable keyboard navigation
     * @param {Function} options.onTabChange - Callback for tab changes
     * @param {Function} options.onSectionToggle - Callback for section toggles
     * @param {Function} options.onClose - Callback for panel close
     */
    constructor(options = {}) {
        // Configuration options
        this.options = {
            container: null,
            enableAnimations: true,
            enableTooltips: true,
            enableKeyboardNav: true,
            onTabChange: null,
            onSectionToggle: null,
            onClose: null,
            ...options
        };
        
        // State management
        this.contentFragment = null;
        this.expandedSections = new Set();
        this.loadingStates = new Map();
        this.activeTab = 'overview';
        this.panelState = {
            isOpen: false,
            isAnimating: false,
            currentSpot: null
        };
        
        // Event listener references for cleanup
        this.eventListeners = new Map();
        this.boundHandlers = new Map();
        
        // Animation frame IDs for cleanup
        this.animationFrames = new Set();
        
        // Tooltip system
        this.activeTooltip = null;
        this.tooltipTimeout = null;
        
        // Touch support detection
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Performance optimization
        this.debouncedHandlers = new Map();
        
        // Initialize the panel if container is provided
        if (this.options.container) {
            this.initialize();
        }
    }
    
    /**
     * Initializes the panel with event listeners and setup
     */
    initialize() {
        if (!this.options.container) {
            console.warn('SurfSpotPanel: No container provided for initialization');
            return;
        }
        
        // Add global event listeners
        this._setupGlobalEventListeners();
        
        // Add keyboard navigation if enabled
        if (this.options.enableKeyboardNav) {
            this._setupKeyboardNavigation();
        }
        
        // Initialize tooltip system if enabled
        if (this.options.enableTooltips) {
            this._initializeTooltipSystem();
        }
    }
    
    /**
     * Cleans up all event listeners and resources
     */
    destroy() {
        // Clear all event listeners
        this.eventListeners.forEach((handlers, element) => {
            handlers.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        
        // Clear animation frames
        this.animationFrames.forEach(frameId => {
            cancelAnimationFrame(frameId);
        });
        
        // Clear timeouts
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }
        
        // Clear references
        this.eventListeners.clear();
        this.boundHandlers.clear();
        this.animationFrames.clear();
        this.debouncedHandlers.clear();
        this.contentFragment = null;
        this.activeTooltip = null;
    }
    
    /**
     * Generates the complete HTML content for a given surf spot.
     * @param {Object} spot - The surf spot data object.
     * @returns {DocumentFragment} A document fragment containing the panel's HTML content.
     */
    generateContent(spot) {
        if (!spot) {
            console.error('SurfSpotPanel: No spot data provided.');
            return document.createDocumentFragment();
        }

        // Update panel state
        this.panelState.currentSpot = spot;
        this.panelState.isOpen = true;
        
        // Use document fragment for efficient DOM manipulation
        this.contentFragment = document.createDocumentFragment();
        
        // Transform data to ensure compatibility
        const spotData = this._transformSpotData(spot);

        // Create main semantic structure
        const article = document.createElement('article');
        article.className = 'surf-spot-panel';
        article.setAttribute('aria-label', `Surf spot details for ${spotData.primaryName}`);
        
        // 1. Enhanced Header with close button
        article.appendChild(this._createEnhancedHeader(spotData));

        // 2. Hero Section with optimized image
        article.appendChild(this._createHeroSection(spotData));

        // 3. Quick Stats Bar with visual indicators
        article.appendChild(this._createQuickStatsBar(spotData));

        // 4. Main content area with tabs
        const main = document.createElement('main');
        main.className = 'surf-spot-main-content';
        main.setAttribute('id', 'surf-spot-main-content');
        main.setAttribute('role', 'main');
        main.setAttribute('aria-label', 'Surf spot detailed information');
        
        // Create navigation tabs
        const nav = document.createElement('nav');
        nav.className = 'surf-spot-nav';
        nav.setAttribute('role', 'tablist');
        nav.setAttribute('aria-label', 'Surf spot information categories');
        nav.setAttribute('aria-orientation', 'horizontal');
        
        const tabs = this._createNavigationTabs();
        tabs.forEach(tab => nav.appendChild(tab));
        main.appendChild(nav);

        // Create tab panels
        const tabPanels = this._createTabPanels(spotData);
        tabPanels.forEach(panel => main.appendChild(panel));
        
        article.appendChild(main);

        // 5. Footer with additional information
        article.appendChild(this._createFooter(spotData));

        this.contentFragment.appendChild(article);
        
        // Initialize interactive elements after DOM creation
        if (this.options.container) {
            setTimeout(() => {
                this._initializeInteractiveElements();
            }, 0);
        }
        
        return this.contentFragment;
    }
    
    /**
     * Sets up global event listeners for the panel
     * @private
     */
    _setupGlobalEventListeners() {
        // Handle window resize for responsive adjustments
        const resizeHandler = this._debounce(() => {
            this._handleResize();
        }, 250);
        
        this._addEventListener(window, 'resize', resizeHandler);
        
        // Handle escape key for closing panel
        const keyHandler = (e) => {
            if (e.key === 'Escape' && this.panelState.isOpen) {
                this._handleClose();
            }
        };
        
        this._addEventListener(document, 'keydown', keyHandler);
        
        // Handle click outside panel for closing
        const clickHandler = (e) => {
            if (this.panelState.isOpen && this.options.container) {
                const panel = this.options.container.querySelector('.surf-spot-panel');
                if (panel && !panel.contains(e.target)) {
                    this._handleClose();
                }
            }
        };
        
        this._addEventListener(document, 'click', clickHandler);
    }
    
    /**
     * Sets up comprehensive keyboard navigation for the panel
     * @private
     */
    _setupKeyboardNavigation() {
        const keyHandler = (e) => {
            if (!this.panelState.isOpen) return;
            
            const focusedElement = document.activeElement;
            const isTab = focusedElement?.classList.contains('nav-tab');
            const isExpandable = focusedElement?.classList.contains('section-header');
            const isCompassPoint = focusedElement?.classList.contains('compass-point');
            const isMonthCell = focusedElement?.classList.contains('month-cell');
            const isTideIndicator = focusedElement?.classList.contains('tide-indicator');
            const isActionButton = focusedElement?.classList.contains('action-button');
            const isCoordsButton = focusedElement?.classList.contains('coords-button');
            
            // Handle focus trapping within the panel
            if (e.key === 'Tab') {
                this._handleFocusTrapping(e);
                return;
            }
            
            // Handle element-specific keyboard interactions
            switch (e.key) {
                case 'Enter':
                case ' ':
                    // Handle activation of focused elements
                    if (isTab) {
                        e.preventDefault();
                        this._handleTabClick(focusedElement.dataset.tabId);
                        this._announceToScreenReader(`Switched to ${focusedElement.dataset.tabId} tab`);
                    } else if (isExpandable) {
                        e.preventDefault();
                        this._handleSectionToggle(focusedElement);
                        const isExpanded = focusedElement.getAttribute('aria-expanded') === 'true';
                        this._announceToScreenReader(`Section ${isExpanded ? 'expanded' : 'collapsed'}`);
                    } else if (isCompassPoint) {
                        e.preventDefault();
                        this._handleCompassPointClick(
                            focusedElement.closest('.direction-compass').getAttribute('data-compass-type'),
                            focusedElement.getAttribute('data-direction'),
                            focusedElement.classList.contains('active')
                        );
                    } else if (isMonthCell) {
                        e.preventDefault();
                        this._handleMonthClick(
                            parseInt(focusedElement.getAttribute('data-month')),
                            focusedElement.getAttribute('data-month-name'),
                            focusedElement.classList.contains('best-season')
                        );
                    } else if (isTideIndicator) {
                        e.preventDefault();
                        const tideState = focusedElement.getAttribute('data-tide-state');
                        const isGoodTide = focusedElement.classList.contains('active');
                        this._announceToScreenReader(`${tideState} tide is ${isGoodTide ? 'optimal' : 'not ideal'} for this spot`);
                    } else if (isActionButton) {
                        e.preventDefault();
                        focusedElement.click();
                    } else if (isCoordsButton) {
                        e.preventDefault();
                        focusedElement.click();
                    }
                    break;
                    
                case 'Escape':
                    // Close panel or return focus to first interactive element
                    e.preventDefault();
                    if (this.panelState.isOpen) {
                        this._handleClose();
                    }
                    break;
                    
                case 'ArrowLeft':
                case 'ArrowRight':
                    // Handle horizontal navigation in tabs
                    if (isTab) {
                        e.preventDefault();
                        this._handleTabArrowNavigation(e.key === 'ArrowRight' ? 1 : -1);
                    } else if (isCompassPoint) {
                        e.preventDefault();
                        this._handleCompassNavigation(e.key === 'ArrowRight' ? 1 : -1);
                    }
                    break;
                    
                case 'ArrowUp':
                case 'ArrowDown':
                    // Handle vertical navigation in grids and lists
                    if (isMonthCell) {
                        e.preventDefault();
                        this._handleCalendarNavigation(e.key === 'ArrowDown' ? 1 : -1);
                    } else if (isTideIndicator) {
                        e.preventDefault();
                        this._handleTideNavigation(e.key === 'ArrowRight' ? 1 : -1);
                    } else if (isCompassPoint) {
                        e.preventDefault();
                        this._handleCompassNavigation(e.key === 'ArrowDown' ? 2 : -2);
                    }
                    break;
                    
                case 'Home':
                    // Navigate to first element in current context
                    if (isTab || isCompassPoint || isMonthCell) {
                        e.preventDefault();
                        this._navigateToFirstElement();
                    }
                    break;
                    
                case 'End':
                    // Navigate to last element in current context
                    if (isTab || isCompassPoint || isMonthCell) {
                        e.preventDefault();
                        this._navigateToLastElement();
                    }
                    break;
                    
                case 'PageUp':
                case 'PageDown':
                    // Navigate between tabs
                    if (this.panelState.isOpen) {
                        e.preventDefault();
                        this._handleTabArrowNavigation(e.key === 'PageDown' ? 1 : -1);
                    }
                    break;
            }
        };
        
        this._addEventListener(document, 'keydown', keyHandler);
    }
    
    /**
     * Initializes the tooltip system
     * @private
     */
    _initializeTooltipSystem() {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'surf-spot-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.setAttribute('aria-hidden', 'true');
        document.body.appendChild(tooltip);
        
        this.activeTooltip = tooltip;
    }
    
    /**
     * Initializes interactive elements after DOM creation
     * @private
     */
    _initializeInteractiveElements() {
        if (!this.options.container) return;
        
        const panel = this.options.container.querySelector('.surf-spot-panel');
        if (!panel) return;
        
        // Initialize tab navigation
        this._initializeTabNavigation(panel);
        
        // Initialize expandable sections
        this._initializeExpandableSections(panel);
        
        // Initialize interactive compass
        this._initializeInteractiveCompass(panel);
        
        // Initialize seasonal calendar
        this._initializeSeasonalCalendar(panel);
        
        // Initialize tooltips
        if (this.options.enableTooltips) {
            this._initializeTooltips(panel);
        }
        
        // Initialize touch gestures if on touch device
        if (this.isTouchDevice) {
            this._initializeTouchGestures(panel);
        }
        
        // Initialize share functionality
        this._initializeShareFunctionality(panel);
        
        // Initialize print functionality
        this._initializePrintFunctionality(panel);
    }
    
    /**
     * Transforms spot data to ensure compatibility with the enhanced structure
     * @private
     * @param {Object} spot - Original spot data
     * @returns {Object} Transformed spot data
     */
    _transformSpotData(spot) {
        return {
            // Core identity
            id: spot.id || '',
            primaryName: spot.primaryName || spot.name || 'Unknown Spot',
            alternativeNames: spot.alternativeNames || [],
            description: spot.description || '',
            location: {
                area: spot.location?.area || 'Unknown',
                nearestTowns: spot.location?.nearestTowns || [],
                coordinates: spot.location?.coordinates || { lat: 0, lng: 0 }
            },
            
            // Wave details
            waveDetails: {
                type: spot.waveDetails?.type || [],
                direction: spot.waveDetails?.direction || [],
                directionNotes: spot.waveDetails?.directionNotes || '',
                bestSwellDirection: spot.waveDetails?.bestSwellDirection || [],
                bestWindDirection: spot.waveDetails?.bestWindDirection || [],
                bestTide: spot.waveDetails?.bestTide || [],
                tideNotes: spot.waveDetails?.tideNotes || '',
                bestSeason: spot.waveDetails?.bestSeason || [],
                idealConditions: spot.waveDetails?.idealConditions || '',
                abilityLevel: spot.waveDetails?.abilityLevel || { primary: 'Unknown', alsoSuitableFor: [] }
            },
            
            // Characteristics
            characteristics: {
                crowdFactor: spot.characteristics?.crowdFactor || 'Unknown',
                crowdNotes: spot.characteristics?.crowdNotes || '',
                localVibe: spot.characteristics?.localVibe || '',
                hazards: spot.characteristics?.hazards || [],
                bottom: spot.characteristics?.bottom || [],
                waterQuality: spot.characteristics?.waterQuality || 'Unknown'
            },
            
            // Practicalities
            practicalities: {
                access: spot.practicalities?.access || '',
                parking: spot.practicalities?.parking || '',
                facilities: spot.practicalities?.facilities || '',
                paddleOut: spot.practicalities?.paddleOut || '',
                recommendedBoards: spot.practicalities?.recommendedBoards || [],
                additionalTips: spot.practicalities?.additionalTips || ''
            }
        };
    }

    /**
     * Creates the enhanced header section with comprehensive ARIA support
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The header element
     */
    _createEnhancedHeader(spot) {
        const header = document.createElement('header');
        header.className = 'surf-spot-header';
        header.setAttribute('role', 'banner');
        header.setAttribute('aria-label', `Surf spot details for ${spot.primaryName}`);
        
        // Add skip link for keyboard navigation
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.setAttribute('href', '#surf-spot-main-content');
        skipLink.textContent = 'Skip to main content';
        skipLink.setAttribute('aria-label', 'Skip to main content');
        header.appendChild(skipLink);
        
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';
        
        // Title section
        const titleSection = document.createElement('div');
        titleSection.className = 'title-section';
        titleSection.setAttribute('role', 'group');
        titleSection.setAttribute('aria-labelledby', 'surf-spot-name');
        
        const primaryName = document.createElement('h1');
        primaryName.className = 'surf-spot-primary-name';
        primaryName.textContent = spot.primaryName;
        primaryName.setAttribute('id', 'surf-spot-name');
        primaryName.setAttribute('tabindex', '0');
        
        titleSection.appendChild(primaryName);
        
        // Alternative names
        if (spot.alternativeNames.length > 0) {
            const altNames = document.createElement('div');
            altNames.className = 'alternative-names';
            altNames.setAttribute('aria-label', 'Alternative names for this surf spot');
            altNames.setAttribute('role', 'complementary');
            altNames.textContent = `Also known as: ${spot.alternativeNames.join(', ')}`;
            titleSection.appendChild(altNames);
        }
        
        // Location and difficulty indicator
        const metaInfo = document.createElement('div');
        metaInfo.className = 'meta-info';
        metaInfo.setAttribute('role', 'group');
        metaInfo.setAttribute('aria-label', 'Spot metadata');
        
        const location = document.createElement('span');
        location.className = 'location-info';
        location.innerHTML = `<span class="icon" aria-hidden="true">📍</span> ${spot.location.area}`;
        location.setAttribute('aria-label', `Location: ${spot.location.area}`);
        
        const difficulty = document.createElement('span');
        difficulty.className = `difficulty-indicator ${spot.waveDetails.abilityLevel.primary.toLowerCase()}`;
        difficulty.textContent = spot.waveDetails.abilityLevel.primary;
        difficulty.setAttribute('role', 'status');
        difficulty.setAttribute('aria-label', `Difficulty level: ${spot.waveDetails.abilityLevel.primary}`);
        difficulty.setAttribute('title', `Difficulty level: ${spot.waveDetails.abilityLevel.primary}`);
        
        metaInfo.appendChild(location);
        metaInfo.appendChild(difficulty);
        
        titleSection.appendChild(metaInfo);
        headerContent.appendChild(titleSection);
        
        // Action buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        actionButtons.setAttribute('role', 'toolbar');
        actionButtons.setAttribute('aria-label', 'Panel actions');
        actionButtons.setAttribute('aria-orientation', 'horizontal');
        
        // Share button
        const shareButton = document.createElement('button');
        shareButton.className = 'action-button share-button';
        shareButton.setAttribute('type', 'button');
        shareButton.setAttribute('aria-label', 'Share this surf spot');
        shareButton.setAttribute('title', 'Share this surf spot (Ctrl+S)');
        shareButton.setAttribute('data-action', 'share');
        shareButton.setAttribute('aria-describedby', 'share-help');
        shareButton.innerHTML = '<span class="icon" aria-hidden="true">🔗</span>';
        shareButton.addEventListener('click', () => this._handleShare(spot));
        
        // Print button
        const printButton = document.createElement('button');
        printButton.className = 'action-button print-button';
        printButton.setAttribute('type', 'button');
        printButton.setAttribute('aria-label', 'Print surf spot details');
        printButton.setAttribute('title', 'Print surf spot details (Ctrl+P)');
        printButton.setAttribute('data-action', 'print');
        printButton.setAttribute('aria-describedby', 'print-help');
        printButton.innerHTML = '<span class="icon" aria-hidden="true">🖨️</span>';
        printButton.addEventListener('click', () => this._handlePrint());
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'action-button close-button';
        closeButton.setAttribute('type', 'button');
        closeButton.setAttribute('aria-label', 'Close surf spot details panel');
        closeButton.setAttribute('title', 'Close panel (Escape key)');
        closeButton.setAttribute('data-action', 'close');
        closeButton.setAttribute('aria-describedby', 'close-help');
        closeButton.innerHTML = '<span class="icon" aria-hidden="true">✕</span>';
        closeButton.addEventListener('click', () => this._handleClose());
        
        actionButtons.appendChild(shareButton);
        actionButtons.appendChild(printButton);
        actionButtons.appendChild(closeButton);
        
        headerContent.appendChild(actionButtons);
        header.appendChild(headerContent);
        
        return header;
    }

    /**
     * Creates the hero section with optimized image and enhanced accessibility
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The hero section element
     */
    _createHeroSection(spot) {
        const section = document.createElement('section');
        section.className = 'surf-spot-hero';
        section.setAttribute('aria-labelledby', 'surf-spot-name');
        section.setAttribute('role', 'img');
        section.setAttribute('aria-label', `Hero image of ${spot.primaryName} surf spot`);
        
        const heroContainer = document.createElement('div');
        heroContainer.className = 'hero-container';
        
        // Optimized image with lazy loading
        const heroImg = document.createElement('img');
        heroImg.className = 'hero-image';
        heroImg.setAttribute('loading', 'lazy');
        heroImg.setAttribute('decoding', 'async');
        heroImg.setAttribute('alt', `View of ${spot.primaryName} surf spot in ${spot.location.area}`);
        heroImg.setAttribute('width', '800');
        heroImg.setAttribute('height', '533');
        
        // Try to use the spot-specific image
        const spotImageName = spot.id ? `${spot.id}.webp` : null;
        const spotImagePath = spotImageName ? `images/surf-spots/${spotImageName}` : null;
        
        heroImg.src = spotImagePath || 'images/surf-spots/surf-spot-placeholder.webp';
        
        // Error handling with fallback
        if (spotImagePath) {
            heroImg.onerror = function() {
                this.src = 'images/surf-spots/surf-spot-placeholder.webp';
                this.setAttribute('alt', `Default placeholder image for ${spot.primaryName} surf spot`);
            };
        }
        
        heroContainer.appendChild(heroImg);
        
        // Location overlay with GPS coordinates
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.setAttribute('role', 'group');
        overlay.setAttribute('aria-label', 'Location information');
        
        const locationInfo = document.createElement('div');
        locationInfo.className = 'location-details';
        
        const area = document.createElement('div');
        area.className = 'area-name';
        area.setAttribute('role', 'heading');
        area.setAttribute('aria-level', '2');
        area.textContent = spot.location.area;
        
        const coordinates = document.createElement('div');
        coordinates.className = 'coordinates';
        coordinates.setAttribute('role', 'group');
        coordinates.setAttribute('aria-label', 'GPS coordinates');
        coordinates.innerHTML = `
            <span class="icon" aria-hidden="true">🌍</span>
            <span class="coords-text" aria-label="GPS coordinates: ${spot.location.coordinates.lat.toFixed(4)}°N, ${Math.abs(spot.location.coordinates.lng).toFixed(4)}°W">${spot.location.coordinates.lat.toFixed(4)}°N, ${Math.abs(spot.location.coordinates.lng).toFixed(4)}°W</span>
            <button class="coords-button" aria-label="View this location on map" data-coords="${spot.location.coordinates.lat},${spot.location.coordinates.lng}" type="button">
                <span class="icon" aria-hidden="true">🗺️</span>
                <span class="sr-only">View on map</span>
            </button>
        `;
        
        locationInfo.appendChild(area);
        locationInfo.appendChild(coordinates);
        overlay.appendChild(locationInfo);
        heroContainer.appendChild(overlay);
        
        section.appendChild(heroContainer);
        return section;
    }

    /**
     * Creates the quick stats bar with visual indicators and enhanced accessibility
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The quick stats bar element
     */
    _createQuickStatsBar(spot) {
        const section = document.createElement('section');
        section.className = 'quick-stats-bar';
        section.setAttribute('aria-label', 'Quick surf spot statistics');
        section.setAttribute('role', 'region');
        
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        statsContainer.setAttribute('role', 'list');
        statsContainer.setAttribute('aria-label', 'Key surf spot characteristics');
        
        // Crowd level indicator
        const crowdStat = this._createStatIndicator(
            'crowd',
            this._getCrowdLevelIcon(spot.characteristics.crowdFactor),
            spot.characteristics.crowdFactor,
            `Crowd level: ${spot.characteristics.crowdFactor}`,
            'crowd-level'
        );
        crowdStat.setAttribute('role', 'listitem');
        statsContainer.appendChild(crowdStat);
        
        // Bottom type indicator
        const bottomStat = this._createStatIndicator(
            'bottom',
            this._getBottomTypeIcon(spot.characteristics.bottom),
            this._formatBottomType(spot.characteristics.bottom),
            `Bottom type: ${this._formatBottomType(spot.characteristics.bottom)}`,
            'bottom-type'
        );
        bottomStat.setAttribute('role', 'listitem');
        statsContainer.appendChild(bottomStat);
        
        // Water quality indicator
        const waterStat = this._createStatIndicator(
            'water',
            this._getWaterQualityIcon(spot.characteristics.waterQuality),
            spot.characteristics.waterQuality,
            `Water quality: ${spot.characteristics.waterQuality}`,
            'water-quality'
        );
        waterStat.setAttribute('role', 'listitem');
        statsContainer.appendChild(waterStat);
        
        // Wave type indicator
        const waveStat = this._createStatIndicator(
            'wave',
            this._getWaveTypeIcon(spot.waveDetails.type),
            this._formatWaveType(spot.waveDetails.type),
            `Wave type: ${this._formatWaveType(spot.waveDetails.type)}`,
            'wave-type'
        );
        waveStat.setAttribute('role', 'listitem');
        statsContainer.appendChild(waveStat);
        
        section.appendChild(statsContainer);
        return section;
    }

    /**
     * Creates a single stat indicator
     * @private
     * @param {string} type - The type of stat
     * @param {string} icon - The icon to display
     * @param {string} value - The value to display
     * @param {string} ariaLabel - The accessibility label
     * @param {string} tooltipId - ID for tooltip content
     * @returns {HTMLElement} The stat indicator element
     */
    _createStatIndicator(type, icon, value, ariaLabel, tooltipId) {
        const indicator = document.createElement('div');
        indicator.className = `stat-indicator stat-${type}`;
        indicator.setAttribute('aria-label', ariaLabel);
        indicator.setAttribute('data-tooltip', tooltipId);
        
        const iconEl = document.createElement('span');
        iconEl.className = 'stat-icon';
        iconEl.setAttribute('aria-hidden', 'true');
        iconEl.textContent = icon;
        
        const valueEl = document.createElement('span');
        valueEl.className = 'stat-value';
        valueEl.textContent = value;
        
        indicator.appendChild(iconEl);
        indicator.appendChild(valueEl);
        
        return indicator;
    }

    /**
     * Creates the navigation tabs with enhanced accessibility
     * @private
     * @returns {HTMLElement[]} Array of tab elements
     */
    _createNavigationTabs() {
        const tabs = [
            { id: 'overview', label: 'Overview', active: true, description: 'General information about the surf spot' },
            { id: 'waves', label: 'Wave Details', active: false, description: 'Detailed wave conditions and characteristics' },
            { id: 'practicalities', label: 'Practical Info', active: false, description: 'Access, facilities, and practical information' },
            { id: 'seasons', label: 'Best Times', active: false, description: 'Seasonal information and best surfing times' }
        ];
        
        return tabs.map((tab, index) => {
            const button = document.createElement('button');
            button.className = `nav-tab ${tab.active ? 'active' : ''}`;
            button.setAttribute('role', 'tab');
            button.setAttribute('id', `tab-${tab.id}`);
            button.setAttribute('aria-selected', tab.active);
            button.setAttribute('aria-controls', `panel-${tab.id}`);
            button.setAttribute('data-tab-id', tab.id);
            button.setAttribute('title', tab.description);
            button.setAttribute('aria-describedby', `tab-${tab.id}-desc`);
            button.setAttribute('tabindex', tab.active ? '0' : '-1');
            button.textContent = tab.label;
            
            // Add screen reader only description
            const desc = document.createElement('span');
            desc.className = 'sr-only';
            desc.id = `tab-${tab.id}-desc`;
            desc.textContent = tab.description;
            button.appendChild(desc);
            
            return button;
        });
    }

    /**
     * Creates the tab panels with enhanced accessibility
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement[]} Array of panel elements
     */
    _createTabPanels(spot) {
        const panels = [
            {
                id: 'overview',
                active: true,
                creator: () => this._createOverviewPanel(spot),
                label: 'Overview panel with general information about the surf spot'
            },
            {
                id: 'waves',
                active: false,
                creator: () => this._createWaveDetailsPanel(spot),
                label: 'Wave details panel with information about wave conditions and characteristics'
            },
            {
                id: 'practicalities',
                active: false,
                creator: () => this._createPracticalitiesPanel(spot),
                label: 'Practical information panel with access, facilities, and practical details'
            },
            {
                id: 'seasons',
                active: false,
                creator: () => this._createSeasonalPanel(spot),
                label: 'Seasonal information panel with best times to surf'
            }
        ];
        
        return panels.map(panel => {
            const section = document.createElement('section');
            section.className = `tab-panel ${panel.active ? 'active' : ''}`;
            section.setAttribute('role', 'tabpanel');
            section.setAttribute('id', `panel-${panel.id}`);
            section.setAttribute('aria-labelledby', `tab-${panel.id}`);
            section.setAttribute('aria-label', panel.label);
            section.setAttribute('tabindex', panel.active ? '0' : '-1');
            section.setAttribute('hidden', !panel.active);
            
            // Add live region for screen readers
            const liveRegion = document.createElement('div');
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.id = `panel-${panel.id}-status`;
            liveRegion.textContent = panel.active ? 'Currently viewing' : 'Hidden';
            section.appendChild(liveRegion);
            
            const content = panel.creator();
            section.appendChild(content);
            
            return section;
        });
    }

    /**
     * Creates the overview panel
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The overview panel content
     */
    _createOverviewPanel(spot) {
        const container = document.createElement('div');
        container.className = 'panel-content overview-content';
        
        // Description section
        if (spot.description) {
            const descSection = document.createElement('section');
            descSection.className = 'description-section';
            
            const descTitle = document.createElement('h2');
            descTitle.textContent = 'About this spot';
            descSection.appendChild(descTitle);
            
            const descText = document.createElement('p');
            descText.className = 'description-text';
            descText.textContent = spot.description;
            descSection.appendChild(descText);
            
            container.appendChild(descSection);
        }
        
        // Key characteristics grid
        const characteristicsGrid = document.createElement('div');
        characteristicsGrid.className = 'characteristics-grid';
        
        // Wave characteristics
        const waveChar = this._createCharacteristicCard(
            'Wave Characteristics',
            [
                { label: 'Type', value: this._formatWaveType(spot.waveDetails.type) },
                { label: 'Direction', value: this._formatDirection(spot.waveDetails.direction) },
                { label: 'Ability Level', value: spot.waveDetails.abilityLevel.primary },
                { label: 'Bottom', value: this._formatBottomType(spot.characteristics.bottom) }
            ]
        );
        characteristicsGrid.appendChild(waveChar);
        
        // Spot characteristics
        const spotChar = this._createCharacteristicCard(
            'Spot Characteristics',
            [
                { label: 'Crowd Level', value: spot.characteristics.crowdFactor },
                { label: 'Local Vibe', value: spot.characteristics.localVibe },
                { label: 'Water Quality', value: spot.characteristics.waterQuality },
                { label: 'Hazards', value: this._formatHazards(spot.characteristics.hazards) }
            ]
        );
        characteristicsGrid.appendChild(spotChar);
        
        container.appendChild(characteristicsGrid);
        
        return container;
    }

    /**
     * Creates the wave details panel
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The wave details panel content
     */
    _createWaveDetailsPanel(spot) {
        const container = document.createElement('div');
        container.className = 'panel-content wave-details-content';
        
        // Wave conditions section
        const conditionsSection = document.createElement('section');
        conditionsSection.className = 'wave-conditions-section';
        
        const conditionsTitle = document.createElement('h2');
        conditionsTitle.textContent = 'Wave Conditions';
        conditionsSection.appendChild(conditionsTitle);
        
        // Direction indicators
        const directionContainer = document.createElement('div');
        directionContainer.className = 'direction-indicators';
        
        // Swell direction compass
        const swellCompass = this._createDirectionCompass(
            'Best Swell Direction',
            spot.waveDetails.bestSwellDirection,
            'swell'
        );
        directionContainer.appendChild(swellCompass);
        
        // Wind direction compass
        const windCompass = this._createDirectionCompass(
            'Best Wind Direction',
            spot.waveDetails.bestWindDirection,
            'wind'
        );
        directionContainer.appendChild(windCompass);
        
        conditionsSection.appendChild(directionContainer);
        
        // Tide information
        const tideSection = this._createTideSection(spot.waveDetails.bestTide, spot.waveDetails.tideNotes);
        conditionsSection.appendChild(tideSection);
        
        // Ideal conditions
        if (spot.waveDetails.idealConditions) {
            const idealSection = document.createElement('div');
            idealSection.className = 'ideal-conditions';
            
            const idealTitle = document.createElement('h3');
            idealTitle.textContent = 'Ideal Conditions';
            idealSection.appendChild(idealTitle);
            
            const idealText = document.createElement('p');
            idealText.textContent = spot.waveDetails.idealConditions;
            idealSection.appendChild(idealText);
            
            conditionsSection.appendChild(idealSection);
        }
        
        container.appendChild(conditionsSection);
        
        return container;
    }

    /**
     * Creates the practicalities panel
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The practicalities panel content
     */
    _createPracticalitiesPanel(spot) {
        const container = document.createElement('div');
        container.className = 'panel-content practicalities-content';
        
        // Access information
        const accessSection = this._createExpandableSection(
            'access',
            'Access & Parking',
            true
        );
        
        const accessContent = document.createElement('div');
        accessContent.className = 'section-content';
        
        if (spot.practicalities.access) {
            const accessText = document.createElement('p');
            accessText.textContent = spot.practicalities.access;
            accessContent.appendChild(accessText);
        }
        
        if (spot.practicalities.parking) {
            const parkingInfo = document.createElement('div');
            parkingInfo.className = 'parking-info';
            parkingInfo.innerHTML = `
                <h4>Parking</h4>
                <p>${spot.practicalities.parking}</p>
            `;
            accessContent.appendChild(parkingInfo);
        }
        
        accessSection.appendChild(accessContent);
        container.appendChild(accessSection);
        
        // Facilities section
        const facilitiesSection = this._createExpandableSection(
            'facilities',
            'Facilities',
            false
        );
        
        const facilitiesContent = document.createElement('div');
        facilitiesContent.className = 'section-content';
        
        if (spot.practicalities.facilities) {
            const facilitiesText = document.createElement('p');
            facilitiesText.textContent = spot.practicalities.facilities;
            facilitiesContent.appendChild(facilitiesText);
        } else {
            const noFacilities = document.createElement('p');
            noFacilities.className = 'no-facilities';
            noFacilities.textContent = 'No facilities available at this spot';
            facilitiesContent.appendChild(noFacilities);
        }
        
        facilitiesSection.appendChild(facilitiesContent);
        container.appendChild(facilitiesSection);
        
        // Paddle out section
        if (spot.practicalities.paddleOut) {
            const paddleSection = this._createExpandableSection(
                'paddle',
                'Paddle Out',
                false
            );
            
            const paddleContent = document.createElement('div');
            paddleContent.className = 'section-content';
            
            const paddleText = document.createElement('p');
            paddleText.textContent = spot.practicalities.paddleOut;
            paddleContent.appendChild(paddleText);
            
            paddleSection.appendChild(paddleContent);
            container.appendChild(paddleSection);
        }
        
        // Recommended boards
        if (spot.practicalities.recommendedBoards.length > 0) {
            const boardsSection = this._createExpandableSection(
                'boards',
                'Recommended Boards',
                false
            );
            
            const boardsContent = document.createElement('div');
            boardsContent.className = 'section-content';
            
            const boardsList = document.createElement('ul');
            boardsList.className = 'recommended-boards';
            
            spot.practicalities.recommendedBoards.forEach(board => {
                const li = document.createElement('li');
                li.textContent = board;
                boardsList.appendChild(li);
            });
            
            boardsContent.appendChild(boardsList);
            boardsSection.appendChild(boardsContent);
            container.appendChild(boardsSection);
        }
        
        // Additional tips
        if (spot.practicalities.additionalTips) {
            const tipsSection = this._createExpandableSection(
                'tips',
                'Additional Tips',
                false
            );
            
            const tipsContent = document.createElement('div');
            tipsContent.className = 'section-content';
            
            const tipsText = document.createElement('p');
            tipsText.textContent = spot.practicalities.additionalTips;
            tipsContent.appendChild(tipsText);
            
            tipsSection.appendChild(tipsContent);
            container.appendChild(tipsSection);
        }
        
        return container;
    }

    /**
     * Creates the seasonal panel with enhanced accessibility
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The seasonal panel content
     */
    _createSeasonalPanel(spot) {
        const container = document.createElement('div');
        container.className = 'panel-content seasonal-content';
        
        // Best seasons
        const seasonsSection = document.createElement('section');
        seasonsSection.className = 'seasons-section';
        seasonsSection.setAttribute('role', 'region');
        seasonsSection.setAttribute('aria-labelledby', 'seasons-title');
        
        const seasonsTitle = document.createElement('h2');
        seasonsTitle.textContent = 'Best Seasons';
        seasonsTitle.id = 'seasons-title';
        seasonsSection.appendChild(seasonsTitle);
        
        // Add descriptive context for screen readers
        const context = document.createElement('p');
        context.className = 'sr-only';
        context.textContent = 'Interactive calendar showing the best months for surfing at this spot. Each month can be selected for more information.';
        seasonsSection.appendChild(context);
        
        // Visual calendar with grid structure
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'seasonal-calendar';
        calendarContainer.setAttribute('role', 'grid');
        calendarContainer.setAttribute('aria-label', 'Surfing season calendar');
        calendarContainer.setAttribute('aria-readonly', 'true');
        
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        const bestSeasons = spot.waveDetails.bestSeason || [];
        
        months.forEach((month, index) => {
            const monthCell = document.createElement('div');
            monthCell.className = 'month-cell';
            monthCell.setAttribute('data-month', index);
            monthCell.setAttribute('data-month-name', month);
            monthCell.setAttribute('role', 'gridcell');
            monthCell.setAttribute('tabindex', '0');
            
            // Determine if this month is in the best season
            const seasonMap = {
                'Spring': [2, 3, 4],
                'Summer': [5, 6, 7],
                'Autumn': [8, 9, 10],
                'Winter': [11, 0, 1]
            };
            
            let isBestSeason = false;
            for (const season of bestSeasons) {
                if (seasonMap[season] && seasonMap[season].includes(index)) {
                    isBestSeason = true;
                    break;
                }
            }
            
            if (isBestSeason) {
                monthCell.classList.add('best-season');
                monthCell.setAttribute('aria-label', `${month}: Best season for surfing`);
                monthCell.setAttribute('aria-selected', 'true');
            } else {
                monthCell.setAttribute('aria-label', `${month}: Not ideal season for surfing`);
                monthCell.setAttribute('aria-selected', 'false');
            }
            
            monthCell.textContent = month;
            calendarContainer.appendChild(monthCell);
        });
        
        seasonsSection.appendChild(calendarContainer);
        
        // Season legend with proper labeling
        const legend = document.createElement('div');
        legend.className = 'season-legend';
        legend.setAttribute('role', 'group');
        legend.setAttribute('aria-label', 'Season quality legend');
        
        const bestIndicator = document.createElement('div');
        bestIndicator.className = 'legend-item';
        bestIndicator.setAttribute('role', 'img');
        bestIndicator.setAttribute('aria-label', 'Best season indicator - months with optimal surfing conditions');
        bestIndicator.innerHTML = '<span class="legend-color best-season"></span> Best Season';
        
        const normalIndicator = document.createElement('div');
        normalIndicator.className = 'legend-item';
        normalIndicator.setAttribute('role', 'img');
        normalIndicator.setAttribute('aria-label', 'Not ideal season indicator - months with suboptimal surfing conditions');
        normalIndicator.innerHTML = '<span class="legend-color normal-season"></span> Not Ideal';
        
        legend.appendChild(bestIndicator);
        legend.appendChild(normalIndicator);
        seasonsSection.appendChild(legend);
        
        container.appendChild(seasonsSection);
        
        return container;
    }

    /**
     * Creates the footer section with enhanced accessibility
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The footer element
     */
    _createFooter(spot) {
        const footer = document.createElement('footer');
        footer.className = 'surf-spot-footer';
        footer.setAttribute('role', 'contentinfo');
        footer.setAttribute('aria-label', 'Additional information about the surf spot location');
        
        const nearestTowns = document.createElement('div');
        nearestTowns.className = 'nearest-towns';
        nearestTowns.setAttribute('role', 'group');
        nearestTowns.setAttribute('aria-label', 'Nearest towns and locations');
        
        if (spot.location.nearestTowns.length > 0) {
            const townsLabel = document.createElement('span');
            townsLabel.textContent = 'Nearest towns: ';
            townsLabel.setAttribute('role', 'text');
            nearestTowns.appendChild(townsLabel);
            
            const townsList = document.createElement('ul');
            townsList.className = 'towns-list';
            townsList.setAttribute('role', 'list');
            townsList.setAttribute('aria-label', 'List of nearby towns');
            
            spot.location.nearestTowns.forEach(town => {
                const townItem = document.createElement('li');
                townItem.textContent = town;
                townItem.setAttribute('role', 'listitem');
                townsList.appendChild(townItem);
            });
            
            nearestTowns.appendChild(townsList);
        } else {
            const noTowns = document.createElement('p');
            noTowns.textContent = 'No nearby towns information available';
            noTowns.setAttribute('role', 'note');
            nearestTowns.appendChild(noTowns);
        }
        
        footer.appendChild(nearestTowns);
        
        return footer;
    }

    /**
     * Creates a characteristic card with enhanced accessibility
     * @private
     * @param {string} title - The card title
     * @param {Array} items - Array of characteristic items
     * @returns {HTMLElement} The characteristic card element
     */
    _createCharacteristicCard(title, items) {
        const card = document.createElement('div');
        card.className = 'characteristic-card';
        card.setAttribute('role', 'region');
        card.setAttribute('aria-labelledby', `card-title-${title.toLowerCase().replace(/\s+/g, '-')}`);
        
        const cardTitle = document.createElement('h3');
        cardTitle.textContent = title;
        cardTitle.id = `card-title-${title.toLowerCase().replace(/\s+/g, '-')}`;
        card.appendChild(cardTitle);
        
        const list = document.createElement('dl');
        list.className = 'characteristic-list';
        list.setAttribute('role', 'list');
        list.setAttribute('aria-label', `${title} characteristics`);
        
        items.forEach((item, index) => {
            const termId = `term-${title.toLowerCase().replace(/\s+/g, '-')}-${index}`;
            
            const term = document.createElement('dt');
            term.textContent = item.label;
            term.id = termId;
            term.setAttribute('role', 'term');
            
            const desc = document.createElement('dd');
            desc.textContent = item.value;
            desc.setAttribute('role', 'definition');
            desc.setAttribute('aria-labelledby', termId);
            
            list.appendChild(term);
            list.appendChild(desc);
        });
        
        card.appendChild(list);
        return card;
    }

    /**
     * Creates a direction compass with enhanced accessibility
     * @private
     * @param {string} title - The compass title
     * @param {Array} directions - Array of directions
     * @param {string} type - The type of compass (swell or wind)
     * @returns {HTMLElement} The compass element
     */
    _createDirectionCompass(title, directions, type) {
        const compass = document.createElement('div');
        compass.className = `direction-compass compass-${type}`;
        compass.setAttribute('data-compass-type', type);
        compass.setAttribute('role', 'application');
        compass.setAttribute('aria-label', `${title} - Interactive compass showing optimal ${type} directions`);
        
        const compassTitle = document.createElement('h3');
        compassTitle.textContent = title;
        compassTitle.id = `compass-title-${type}`;
        compass.appendChild(compassTitle);
        
        // Add descriptive context for screen readers
        const context = document.createElement('p');
        context.className = 'sr-only';
        context.textContent = `Interactive compass showing the best ${type} directions for surfing. Each direction can be selected for detailed information.`;
        compass.appendChild(context);
        
        const compassRose = document.createElement('div');
        compassRose.className = 'compass-rose';
        compassRose.setAttribute('role', 'img');
        compassRose.setAttribute('aria-label', `Compass rose showing ${type} directions`);
        
        // Create compass directions
        const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        
        compassPoints.forEach(point => {
            const pointEl = document.createElement('div');
            pointEl.className = 'compass-point';
            pointEl.setAttribute('data-direction', point);
            pointEl.setAttribute('role', 'button');
            pointEl.setAttribute('tabindex', '0');
            
            if (directions.includes(point)) {
                pointEl.classList.add('active');
                pointEl.setAttribute('aria-label', `${point} direction: Optimal ${type} direction for this spot`);
                pointEl.setAttribute('aria-pressed', 'true');
            } else {
                pointEl.setAttribute('aria-label', `${point} direction: Not ideal ${type} direction for this spot`);
                pointEl.setAttribute('aria-pressed', 'false');
            }
            
            pointEl.textContent = point;
            
            compassRose.appendChild(pointEl);
        });
        
        compass.appendChild(compassRose);
        
        // Direction labels with live region for announcements
        const directionLabels = document.createElement('div');
        directionLabels.className = 'direction-labels';
        directionLabels.setAttribute('aria-live', 'polite');
        directionLabels.setAttribute('aria-atomic', 'true');
        directionLabels.textContent = `Best ${type} directions: ${directions.join(', ')}`;
        compass.appendChild(directionLabels);
        
        return compass;
    }

    /**
     * Creates the tide section with enhanced accessibility
     * @private
     * @param {Array} tides - Array of tide conditions
     * @param {string} notes - Tide notes
     * @returns {HTMLElement} The tide section element
     */
    _createTideSection(tides, notes) {
        const tideSection = document.createElement('div');
        tideSection.className = 'tide-section';
        tideSection.setAttribute('role', 'region');
        tideSection.setAttribute('aria-labelledby', 'tide-title');
        
        const tideTitle = document.createElement('h3');
        tideTitle.textContent = 'Best Tide';
        tideTitle.id = 'tide-title';
        tideSection.appendChild(tideTitle);
        
        // Add descriptive context for screen readers
        const context = document.createElement('p');
        context.className = 'sr-only';
        context.textContent = 'Visual indicators showing tide conditions that work best at this surf spot. Select any tide state for more information.';
        tideSection.appendChild(context);
        
        const tideIndicators = document.createElement('div');
        tideIndicators.className = 'tide-indicators';
        tideIndicators.setAttribute('role', 'list');
        tideIndicators.setAttribute('aria-label', 'Tide condition indicators');
        
        const tideStates = ['Low', 'Mid', 'High'];
        
        tideStates.forEach(state => {
            const indicator = document.createElement('div');
            indicator.className = 'tide-indicator';
            indicator.setAttribute('data-tide-state', state);
            indicator.setAttribute('role', 'listitem');
            indicator.setAttribute('tabindex', '0');
            
            const isGoodTide = tides.includes(state);
            
            if (isGoodTide) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-label', `${state} tide: Optimal for surfing at this spot`);
                indicator.setAttribute('aria-selected', 'true');
            } else {
                indicator.setAttribute('aria-label', `${state} tide: Not ideal for surfing at this spot`);
                indicator.setAttribute('aria-selected', 'false');
            }
            
            indicator.textContent = state;
            
            tideIndicators.appendChild(indicator);
        });
        
        tideSection.appendChild(tideIndicators);
        
        if (notes) {
            const tideNotes = document.createElement('p');
            tideNotes.className = 'tide-notes';
            tideNotes.setAttribute('role', 'note');
            tideNotes.textContent = notes;
            tideSection.appendChild(tideNotes);
        }
        
        return tideSection;
    }

    /**
     * Creates an expandable section with enhanced accessibility
     * @private
     * @param {string} id - The section ID
     * @param {string} title - The section title
     * @param {boolean} expanded - Whether the section is initially expanded
     * @returns {HTMLElement} The expandable section element
     */
    _createExpandableSection(id, title, expanded) {
        const section = document.createElement('div');
        section.className = 'expandable-section';
        section.setAttribute('data-section-id', id);
        section.setAttribute('role', 'region');
        section.setAttribute('aria-labelledby', `section-header-${id}`);
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.setAttribute('role', 'button');
        header.setAttribute('id', `section-header-${id}`);
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', expanded);
        header.setAttribute('aria-controls', `section-content-${id}`);
        header.setAttribute('title', `${expanded ? 'Collapse' : 'Expand'} ${title} section`);
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        titleEl.setAttribute('id', `section-title-${id}`);
        header.appendChild(titleEl);
        
        // Add screen reader only status
        const status = document.createElement('span');
        status.className = 'sr-only';
        status.id = `section-status-${id}`;
        status.textContent = expanded ? 'Expanded' : 'Collapsed';
        header.appendChild(status);
        
        // Update aria-labelledby to include both title and status
        header.setAttribute('aria-labelledby', `section-title-${id} section-status-${id}`);
        
        const icon = document.createElement('span');
        icon.className = 'expand-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = expanded ? '−' : '+';
        header.appendChild(icon);
        
        section.appendChild(header);
        
        if (expanded) {
            this.expandedSections.add(id);
        }
        
        return section;
    }
    
    /**
     * Initializes tab navigation
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeTabNavigation(panel) {
        const tabs = panel.querySelectorAll('.nav-tab');
        
        tabs.forEach(tab => {
            const tabId = tab.getAttribute('data-tab-id');
            
            const clickHandler = (e) => {
                e.preventDefault();
                this._handleTabClick(tabId);
            };
            
            this._addEventListener(tab, 'click', clickHandler);
        });
    }
    
    /**
     * Handles tab click events with enhanced screen reader announcements
     * @private
     * @param {string} tabId - The ID of the clicked tab
     */
    _handleTabClick(tabId) {
        if (this.activeTab === tabId) return;
        
        const previousTab = this.activeTab;
        this.activeTab = tabId;
        
        // Update tab buttons
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab-id') === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        
        // Update tab panels
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            const isActive = panel.id === `panel-${tabId}`;
            panel.classList.toggle('active', isActive);
            panel.setAttribute('hidden', !isActive);
            panel.setAttribute('tabindex', isActive ? '0' : '-1');
            
            // Update panel status for screen readers
            const statusElement = panel.querySelector(`[id$="-status"]`);
            if (statusElement) {
                statusElement.textContent = isActive ? 'Currently viewing' : 'Hidden';
            }
        });
        
        // Announce change for screen readers with detailed context
        const tabNames = {
            'overview': 'Overview',
            'waves': 'Wave Details',
            'practicalities': 'Practical Information',
            'seasons': 'Best Times to Surf'
        };
        
        const tabName = tabNames[tabId] || tabId;
        this._announceToScreenReader(`Switched to ${tabName} tab. Content has been updated.`);
        
        // Focus the first element in the new panel for keyboard users
        setTimeout(() => {
            const activePanel = document.getElementById(`panel-${tabId}`);
            if (activePanel) {
                const firstFocusable = activePanel.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }
        }, 100);
        
        // Call callback if provided
        if (this.options.onTabChange) {
            this.options.onTabChange(tabId, previousTab);
        }
    }
    
    /**
     * Initializes expandable sections
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeExpandableSections(panel) {
        const sections = panel.querySelectorAll('.expandable-section');
        
        sections.forEach(section => {
            const header = section.querySelector('.section-header');
            const sectionId = section.getAttribute('data-section-id');
            const icon = header.querySelector('.expand-icon');
            const isExpanded = this.expandedSections.has(sectionId);
            
            // Create content div if it doesn't exist
            let content = section.querySelector('.section-content');
            if (!content) {
                content = document.createElement('div');
                content.className = 'section-content';
                content.id = `section-content-${sectionId}`;
                content.setAttribute('hidden', !isExpanded);
                section.appendChild(content);
            } else {
                content.setAttribute('hidden', !isExpanded);
            }
            
            const clickHandler = () => {
                this._handleSectionToggle(header);
            };
            
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._handleSectionToggle(header);
                }
            };
            
            this._addEventListener(header, 'click', clickHandler);
            this._addEventListener(header, 'keydown', keyHandler);
        });
    }
    
    /**
     * Handles section toggle events with enhanced screen reader announcements
     * @private
     * @param {HTMLElement} header - The section header element
     */
    _handleSectionToggle(header) {
        const section = header.closest('.expandable-section');
        const sectionId = section.getAttribute('data-section-id');
        const icon = header.querySelector('.expand-icon');
        const content = section.querySelector('.section-content');
        const statusElement = header.querySelector('.sr-only');
        
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        const newExpanded = !isExpanded;
        
        header.setAttribute('aria-expanded', newExpanded);
        icon.textContent = newExpanded ? '−' : '+';
        
        // Update status for screen readers
        if (statusElement) {
            statusElement.textContent = newExpanded ? 'Expanded' : 'Collapsed';
        }
        
        if (content) {
            content.setAttribute('hidden', !newExpanded);
            
            // Animate height change if animations are enabled
            if (this.options.enableAnimations) {
                this._animateSectionToggle(content, newExpanded);
            }
        }
        
        // Track expanded state
        if (newExpanded) {
            this.expandedSections.add(sectionId);
        } else {
            this.expandedSections.delete(sectionId);
        }
        
        // Announce change for screen readers
        const sectionTitle = header.querySelector('h3').textContent;
        this._announceToScreenReader(`${sectionTitle} section ${newExpanded ? 'expanded' : 'collapsed'}`);
        
        // Call callback if provided
        if (this.options.onSectionToggle) {
            this.options.onSectionToggle(sectionId, newExpanded);
        }
    }
    
    /**
     * Animates section toggle with height transition
     * @private
     * @param {HTMLElement} content - The content element
     * @param {boolean} expanding - Whether the section is expanding
     */
    _animateSectionToggle(content, expanding) {
        if (expanding) {
            // Store original height
            const originalHeight = content.style.height;
            content.style.height = '0';
            content.style.overflow = 'hidden';
            content.style.display = 'block';
            
            // Measure natural height
            const naturalHeight = content.scrollHeight;
            
            // Animate to natural height
            requestAnimationFrame(() => {
                content.style.height = `${naturalHeight}px`;
                
                const transitionEnd = () => {
                    content.style.height = originalHeight;
                    content.style.overflow = '';
                    content.removeEventListener('transitionend', transitionEnd);
                };
                
                content.addEventListener('transitionend', transitionEnd);
            });
        } else {
            // Animate to 0 height
            const naturalHeight = content.scrollHeight;
            content.style.height = `${naturalHeight}px`;
            content.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                content.style.height = '0';
                
                const transitionEnd = () => {
                    content.style.display = '';
                    content.style.overflow = '';
                    content.removeEventListener('transitionend', transitionEnd);
                };
                
                content.addEventListener('transitionend', transitionEnd);
            });
        }
    }
    
    /**
     * Initializes interactive compass
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeInteractiveCompass(panel) {
        const compasses = panel.querySelectorAll('.direction-compass');
        
        compasses.forEach(compass => {
            const compassType = compass.getAttribute('data-compass-type');
            const points = compass.querySelectorAll('.compass-point');
            
            points.forEach(point => {
                const direction = point.getAttribute('data-direction');
                const isActive = point.classList.contains('active');
                
                const clickHandler = () => {
                    this._handleCompassPointClick(compassType, direction, isActive);
                };
                
                const hoverHandler = () => {
                    this._handleCompassPointHover(compassType, direction);
                };
                
                this._addEventListener(point, 'click', clickHandler);
                this._addEventListener(point, 'mouseenter', hoverHandler);
            });
        });
    }
    
    /**
     * Handles compass point click with enhanced screen reader support
     * @private
     * @param {string} compassType - The type of compass
     * @param {string} direction - The direction clicked
     * @param {boolean} isActive - Whether the point is active
     */
    _handleCompassPointClick(compassType, direction, isActive) {
        // Show detailed information about this direction
        const messages = {
            swell: {
                'N': 'North swells typically bring powerful, consistent waves to north-facing spots.',
                'NE': 'Northeast swells work well with offshore trade winds.',
                'E': 'East swells are less common but can produce clean conditions.',
                'SE': 'Southeast swells may wrap around to create protected spots.',
                'S': 'South swells are common in summer, often bringing warmer water.',
                'SW': 'Southwest swells can create excellent conditions on south-facing beaches.',
                'W': 'West swells are powerful and can produce large waves.',
                'NW': 'Northwest swells are the most powerful and consistent in winter.'
            },
            wind: {
                'N': 'North winds are typically offshore for south-facing spots.',
                'NE': 'Northeast trade winds provide offshore conditions for west-facing spots.',
                'E': 'East winds are offshore for north-facing beaches.',
                'SE': 'Southeast winds are offshore for northwest-facing spots.',
                'S': 'South winds are offshore for north-facing spots.',
                'SW': 'Southwest winds are offshore for northeast-facing spots.',
                'W': 'West winds are typically onshore for most spots.',
                'NW': 'Northwest winds are typically onshore for north-facing spots.'
            }
        };
        
        const message = messages[compassType]?.[direction] || `Information about ${direction} ${compassType}`;
        
        // Announce to screen readers
        this._announceToScreenReader(`${direction} ${compassType}: ${message}`);
        
        // Show tooltip or alert with information
        if (this.options.enableTooltips) {
            this._showTooltip(message, event.target);
        } else {
            // Fallback to a simple notification
            console.log(message);
        }
    }
    
    /**
     * Handles compass point hover
     * @private
     * @param {string} compassType - The type of compass
     * @param {string} direction - The direction being hovered
     */
    _handleCompassPointHover(compassType, direction) {
        // Visual feedback for compass interaction
        if (!this.options.enableAnimations) return;
        
        const compass = document.querySelector(`.compass-${compassType}`);
        const rose = compass?.querySelector('.compass-rose');
        
        if (rose) {
            // Add subtle rotation effect
            rose.style.transform = `rotate(${this._getDirectionAngle(direction)}deg)`;
            rose.style.transition = 'transform 0.3s ease';
        }
    }
    
    /**
     * Gets the angle for a compass direction
     * @private
     * @param {string} direction - The compass direction
     * @returns {number} The angle in degrees
     */
    _getDirectionAngle(direction) {
        const angles = {
            'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
            'S': 180, 'SW': 225, 'W': 270, 'NW': 315
        };
        return angles[direction] || 0;
    }
    
    /**
     * Initializes seasonal calendar
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeSeasonalCalendar(panel) {
        const calendar = panel.querySelector('.seasonal-calendar');
        if (!calendar) return;
        
        const monthCells = calendar.querySelectorAll('.month-cell');
        
        monthCells.forEach(cell => {
            const monthIndex = parseInt(cell.getAttribute('data-month'));
            const monthName = cell.getAttribute('data-month-name');
            const isBestSeason = cell.classList.contains('best-season');
            
            const clickHandler = () => {
                this._handleMonthClick(monthIndex, monthName, isBestSeason);
            };
            
            const hoverHandler = () => {
                this._handleMonthHover(monthIndex, monthName, isBestSeason);
            };
            
            this._addEventListener(cell, 'click', clickHandler);
            this._addEventListener(cell, 'mouseenter', hoverHandler);
        });
    }
    
    /**
     * Handles month click in seasonal calendar with enhanced screen reader support
     * @private
     * @param {number} monthIndex - The month index (0-11)
     * @param {string} monthName - The month name
     * @param {boolean} isBestSeason - Whether it's a best season month
     */
    _handleMonthClick(monthIndex, monthName, isBestSeason) {
        const seasonInfo = this._getSeasonInfo(monthIndex);
        
        // Show detailed information about this month
        let message = `${monthName}: `;
        
        if (isBestSeason) {
            message += `Best season! ${seasonInfo.description}`;
        } else {
            message += `Not ideal. ${seasonInfo.alternative}`;
        }
        
        // Announce to screen readers
        this._announceToScreenReader(message);
        
        // Show tooltip or notification
        if (this.options.enableTooltips) {
            this._showTooltip(message, event.target);
        } else {
            console.log(message);
        }
    }
    
    /**
     * Handles month hover in seasonal calendar
     * @private
     * @param {number} monthIndex - The month index (0-11)
     * @param {string} monthName - The month name
     * @param {boolean} isBestSeason - Whether it's a best season month
     */
    _handleMonthHover(monthIndex, monthName, isBestSeason) {
        // Visual feedback for month interaction
        if (!this.options.enableAnimations) return;
        
        const cell = event.target;
        cell.style.transform = 'scale(1.1)';
        cell.style.transition = 'transform 0.2s ease';
        
        // Reset on mouse leave
        const leaveHandler = () => {
            cell.style.transform = '';
            cell.removeEventListener('mouseleave', leaveHandler);
        };
        
        this._addEventListener(cell, 'mouseleave', leaveHandler);
    }
    
    /**
     * Gets season information for a month
     * @private
     * @param {number} monthIndex - The month index (0-11)
     * @returns {Object} Season information
     */
    _getSeasonInfo(monthIndex) {
        const seasons = {
            0: { name: 'Winter', description: 'Consistent north swells, cooler water.', alternative: 'Try south-facing spots for protection.' },
            1: { name: 'Winter', description: 'Peak season for north swells.', alternative: 'Smaller days good for beginners.' },
            2: { name: 'Spring', description: 'Transitional season with varied conditions.', alternative: 'Can be good with the right swell direction.' },
            3: { name: 'Spring', description: 'Increasing consistency, warmer weather.', alternative: 'Check forecasts carefully.' },
            4: { name: 'Spring', description: 'Good mix of swells possible.', alternative: 'Early morning often best.' },
            5: { name: 'Summer', description: 'Trade wind season, northeast swells.', alternative: 'Focus on east coast spots.' },
            6: { name: 'Summer', description: 'Consistent trade winds.', alternative: 'Early mornings before wind picks up.' },
            7: { name: 'Summer', description: 'Peak trade wind season.', alternative: 'Wind-protected spots work best.' },
            8: { name: 'Autumn', description: 'Transition period, variable conditions.', alternative: 'Can surprise with good swells.' },
            9: { name: 'Autumn', description: 'North swells starting to return.', alternative: 'Water still warm from summer.' },
            10: { name: 'Autumn', description: 'Prime season approaching.', alternative: 'Less crowded than winter.' },
            11: { name: 'Winter', description: 'Winter season beginning.', alternative: 'Storm swells possible.' }
        };
        
        return seasons[monthIndex] || { name: 'Unknown', description: 'No specific information.', alternative: 'Check local conditions.' };
    }
    
    /**
     * Initializes tooltips for elements with data-tooltip attributes
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeTooltips(panel) {
        const tooltipElements = panel.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltipId = element.getAttribute('data-tooltip');
            const tooltipContent = this._getTooltipContent(tooltipId);
            
            if (!tooltipContent) return;
            
            const showHandler = (e) => {
                this._showTooltip(tooltipContent, e.target);
            };
            
            const hideHandler = () => {
                this._hideTooltip();
            };
            
            this._addEventListener(element, 'mouseenter', showHandler);
            this._addEventListener(element, 'mouseleave', hideHandler);
            
            // Touch support
            if (this.isTouchDevice) {
                this._addEventListener(element, 'touchstart', showHandler);
                this._addEventListener(element, 'touchend', hideHandler);
            }
        });
    }
    
    /**
     * Gets tooltip content by ID
     * @private
     * @param {string} tooltipId - The tooltip ID
     * @returns {string} The tooltip content
     */
    _getTooltipContent(tooltipId) {
        const tooltipContent = {
            'crowd-level': 'Indicates how crowded the spot typically gets. Empty spots offer solitude, while crowded spots may have competition for waves.',
            'bottom-type': 'The seafloor composition. Sand is safest for beginners, while reef and rock require more experience.',
            'water-quality': 'General water cleanliness. Clean water is ideal, while poor quality may indicate pollution risks.',
            'wave-type': 'The type of wave formation. Beach breaks are sandy bottoms, reef breaks are over coral/rock, and point breaks follow a coastline.'
        };
        
        return tooltipContent[tooltipId] || '';
    }
    
    /**
     * Shows a tooltip
     * @private
     * @param {string} content - The tooltip content
     * @param {HTMLElement} target - The target element
     */
    _showTooltip(content, target) {
        if (!this.activeTooltip) return;
        
        // Clear any existing timeout
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }
        
        // Set content
        this.activeTooltip.textContent = content;
        this.activeTooltip.setAttribute('aria-hidden', 'false');
        
        // Position tooltip
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.activeTooltip.getBoundingClientRect();
        
        // Default position above the element
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width - tooltipRect.width) / 2;
        
        // Adjust if tooltip would go off screen
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        this.activeTooltip.style.top = `${top}px`;
        this.activeTooltip.style.left = `${left}px`;
        
        // Show with animation
        this.activeTooltip.style.opacity = '0';
        this.activeTooltip.style.transform = 'translateY(5px)';
        this.activeTooltip.style.display = 'block';
        
        requestAnimationFrame(() => {
            this.activeTooltip.style.opacity = '1';
            this.activeTooltip.style.transform = 'translateY(0)';
            this.activeTooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        });
    }
    
    /**
     * Hides the tooltip
     * @private
     */
    _hideTooltip() {
        if (!this.activeTooltip) return;
        
        // Hide with animation
        this.activeTooltip.style.opacity = '0';
        this.activeTooltip.style.transform = 'translateY(5px)';
        
        // Hide after animation
        this.tooltipTimeout = setTimeout(() => {
            this.activeTooltip.style.display = 'none';
            this.activeTooltip.setAttribute('aria-hidden', 'true');
        }, 200);
    }
    
    /**
     * Initializes touch gestures for mobile devices
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeTouchGestures(panel) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const touchStartHandler = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        };
        
        const touchEndHandler = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this._handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        };
        
        this._addEventListener(panel, 'touchstart', touchStartHandler);
        this._addEventListener(panel, 'touchend', touchEndHandler);
    }
    
    /**
     * Handles swipe gestures for navigation
     * @private
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} endX - Ending X position
     * @param {number} endY - Ending Y position
     */
    _handleSwipeGesture(startX, startY, endX, endY) {
        const threshold = 50; // Minimum distance for swipe
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Check if horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
            // Left swipe (next tab)
            if (deltaX < 0) {
                this._handleTabArrowNavigation(1);
            }
            // Right swipe (previous tab)
            else if (deltaX > 0) {
                this._handleTabArrowNavigation(-1);
            }
        }
        // Check if vertical swipe
        else if (Math.abs(deltaY) > threshold) {
            // Down swipe (close panel)
            if (deltaY > 0) {
                this._handleClose();
            }
        }
    }
    
    /**
     * Adds search integration functionality
     * @param {Function} searchFunction - Function to call with search query
     */
    enableSearchIntegration(searchFunction) {
        this.searchFunction = searchFunction;
    }
    
    /**
     * Adds map integration functionality
     * @param {Function} mapFunction - Function to call with coordinates
     */
    enableMapIntegration(mapFunction) {
        this.mapFunction = mapFunction;
    }
    
    /**
     * Shows loading state for the panel
     * @param {string} message - Optional loading message
     */
    showLoadingState(message = 'Loading surf spot details...') {
        if (!this.options.container) return;
        
        // Clear existing content
        this.options.container.innerHTML = '';
        
        // Create loading skeleton
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'surf-spot-loading';
        
        // Loading spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        
        // Loading message
        const messageEl = document.createElement('p');
        messageEl.className = 'loading-message';
        messageEl.textContent = message;
        
        // Skeleton elements
        const skeleton = this._createLoadingSkeleton();
        
        loadingContainer.appendChild(spinner);
        loadingContainer.appendChild(messageEl);
        loadingContainer.appendChild(skeleton);
        
        this.options.container.appendChild(loadingContainer);
        
        // Update state
        this.panelState.isLoading = true;
    }
    
    /**
     * Hides loading state
     */
    hideLoadingState() {
        if (!this.options.container) return;
        
        const loadingContainer = this.options.container.querySelector('.surf-spot-loading');
        if (loadingContainer) {
            // Fade out loading state
            loadingContainer.style.opacity = '0';
            loadingContainer.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                if (loadingContainer.parentNode) {
                    loadingContainer.parentNode.removeChild(loadingContainer);
                }
            }, 300);
        }
        
        // Update state
        this.panelState.isLoading = false;
    }
    
    /**
     * Creates a loading skeleton for visual feedback
     * @private
     * @returns {HTMLElement} The skeleton element
     */
    _createLoadingSkeleton() {
        const skeleton = document.createElement('div');
        skeleton.className = 'loading-skeleton';
        
        // Header skeleton
        const headerSkeleton = document.createElement('div');
        headerSkeleton.className = 'skeleton-header';
        
        const titleSkeleton = document.createElement('div');
        titleSkeleton.className = 'skeleton-title';
        
        const metaSkeleton = document.createElement('div');
        metaSkeleton.className = 'skeleton-meta';
        
        headerSkeleton.appendChild(titleSkeleton);
        headerSkeleton.appendChild(metaSkeleton);
        skeleton.appendChild(headerSkeleton);
        
        // Hero skeleton
        const heroSkeleton = document.createElement('div');
        heroSkeleton.className = 'skeleton-hero';
        skeleton.appendChild(heroSkeleton);
        
        // Content skeleton
        const contentSkeleton = document.createElement('div');
        contentSkeleton.className = 'skeleton-content';
        
        // Create multiple skeleton lines
        for (let i = 0; i < 5; i++) {
            const lineSkeleton = document.createElement('div');
            lineSkeleton.className = 'skeleton-line';
            lineSkeleton.style.width = `${Math.random() * 30 + 70}%`;
            contentSkeleton.appendChild(lineSkeleton);
        }
        
        skeleton.appendChild(contentSkeleton);
        
        return skeleton;
    }
    
    /**
     * Handles coordinate click for map integration
     * @private
     * @param {string} coords - The coordinates string "lat,lng"
     */
    _handleCoordinateClick(coords) {
        if (!this.mapFunction) return;
        
        const [lat, lng] = coords.split(',').map(Number);
        
        // Call map function with coordinates
        this.mapFunction({ lat, lng });
        
        // Show feedback
        this._showNotification('Opening location in map...');
    }
    
    /**
     * Handles search functionality
     * @private
     * @param {string} query - Search query
     */
    _handleSearch(query) {
        if (!this.searchFunction) return;
        
        // Call search function
        this.searchFunction(query);
        
        // Show feedback
        this._showNotification(`Searching for "${query}"...`);
    }
    
    /**
     * Enhances the hero section with map integration
     * @private
     * @param {HTMLElement} heroSection - The hero section element
     * @param {Object} spot - The surf spot data
     */
    _enhanceHeroSectionWithMap(heroSection, spot) {
        const coordsButton = heroSection.querySelector('.coords-button');
        if (!coordsButton) return;
        
        // Add click handler for coordinates button
        const clickHandler = () => {
            const coords = coordsButton.getAttribute('data-coords');
            this._handleCoordinateClick(coords);
        };
        
        this._addEventListener(coordsButton, 'click', clickHandler);
    }
    
    /**
     * Enhances the header with search functionality
     * @private
     * @param {HTMLElement} header - The header element
     * @param {Object} spot - The surf spot data
     */
    _enhanceHeaderWithSearch(header, spot) {
        // Add search button to action buttons
        const actionButtons = header.querySelector('.action-buttons');
        if (!actionButtons) return;
        
        const searchButton = document.createElement('button');
        searchButton.className = 'action-button search-button';
        searchButton.setAttribute('type', 'button');
        searchButton.setAttribute('aria-label', 'Search similar spots');
        searchButton.innerHTML = '<span class="icon" aria-hidden="true">🔍</span>';
        
        const clickHandler = () => {
            // Search for spots in the same area
            this._handleSearch(spot.location.area);
        };
        
        this._addEventListener(searchButton, 'click', clickHandler);
        
        // Insert before close button
        const closeButton = actionButtons.querySelector('.close-button');
        actionButtons.insertBefore(searchButton, closeButton);
    }
    
    /**
     * Updates the _createEnhancedHeader method to include search functionality
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The enhanced header element
     */
    _createEnhancedHeaderWithSearch(spot) {
        const header = this._createEnhancedHeader(spot);
        
        // Add search functionality if enabled
        if (this.searchFunction) {
            this._enhanceHeaderWithSearch(header, spot);
        }
        
        return header;
    }
    
    /**
     * Updates the _createHeroSection method to include map functionality
     * @private
     * @param {Object} spot - The surf spot data object
     * @returns {HTMLElement} The enhanced hero section element
     */
    _createHeroSectionWithMap(spot) {
        const heroSection = this._createHeroSection(spot);
        
        // Add map functionality if enabled
        if (this.mapFunction) {
            this._enhanceHeroSectionWithMap(heroSection, spot);
        }
        
        return heroSection;
    }
    
    /**
     * Updates the generateContent method to use enhanced components
     * @param {Object} spot - The surf spot data object
     * @returns {DocumentFragment} A document fragment containing the panel's HTML content
     */
    generateContentWithEnhancements(spot) {
        if (!spot) {
            console.error('SurfSpotPanel: No spot data provided.');
            return document.createDocumentFragment();
        }
    
        // Show loading state if enabled
        if (this.options.enableAnimations) {
            this.showLoadingState();
        }
    
        // Update panel state
        this.panelState.currentSpot = spot;
        this.panelState.isOpen = true;
        
        // Use document fragment for efficient DOM manipulation
        this.contentFragment = document.createDocumentFragment();
        
        // Transform data to ensure compatibility
        const spotData = this._transformSpotData(spot);
    
        // Create main semantic structure
        const article = document.createElement('article');
        article.className = 'surf-spot-panel';
        article.setAttribute('aria-label', `Surf spot details for ${spotData.primaryName}`);
        
        // 1. Enhanced Header with search and close buttons
        article.appendChild(this._createEnhancedHeaderWithSearch(spotData));
    
        // 2. Hero Section with map integration
        article.appendChild(this._createHeroSectionWithMap(spotData));
    
        // 3. Quick Stats Bar with visual indicators
        article.appendChild(this._createQuickStatsBar(spotData));
    
        // 4. Main content area with tabs
        const main = document.createElement('main');
        main.className = 'surf-spot-main-content';
        
        // Create navigation tabs
        const nav = document.createElement('nav');
        nav.className = 'surf-spot-nav';
        nav.setAttribute('role', 'tablist');
        nav.setAttribute('aria-label', 'Surf spot information categories');
        
        const tabs = this._createNavigationTabs();
        tabs.forEach(tab => nav.appendChild(tab));
        main.appendChild(nav);
    
        // Create tab panels
        const tabPanels = this._createTabPanels(spotData);
        tabPanels.forEach(panel => main.appendChild(panel));
        
        article.appendChild(main);
    
        // 5. Footer with additional information
        article.appendChild(this._createFooter(spotData));
    
        this.contentFragment.appendChild(article);
        
        // Hide loading state and show content
        setTimeout(() => {
            this.hideLoadingState();
            
            // Initialize interactive elements after DOM creation
            if (this.options.container) {
                setTimeout(() => {
                    this._initializeInteractiveElements();
                }, 0);
            }
        }, 500);
        
        return this.contentFragment;
    }
    
    /**
     * Initializes share functionality
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializeShareFunctionality(panel) {
        const shareButton = panel.querySelector('.share-button');
        if (!shareButton) return;
        
        // Already has click handler in _createEnhancedHeader
    }
    
    /**
     * Handles sharing surf spot information
     * @private
     * @param {Object} spot - The surf spot data
     */
    _handleShare(spot) {
        const shareData = {
            title: `${spot.primaryName} - Surf Spot Details`,
            text: `Check out ${spot.primaryName} in ${spot.location.area}! ${spot.description.substring(0, 100)}...`,
            url: window.location.href
        };
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share(shareData)
                .catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback to copying to clipboard
            this._copyToClipboard(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
            this._showNotification('Link copied to clipboard!');
        }
    }
    
    /**
     * Initializes print functionality
     * @private
     * @param {HTMLElement} panel - The panel element
     */
    _initializePrintFunctionality(panel) {
        const printButton = panel.querySelector('.print-button');
        if (!printButton) return;
        
        // Already has click handler in _createEnhancedHeader
    }
    
    /**
     * Handles printing surf spot details
     * @private
     */
    _handlePrint() {
        // Create a print-specific stylesheet
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                body * { visibility: hidden; }
                .surf-spot-panel, .surf-spot-panel * { visibility: visible; }
                .surf-spot-panel { position: absolute; left: 0; top: 0; width: 100%; }
                .action-button { display: none; }
            }
        `;
        document.head.appendChild(printStyles);
        
        // Trigger print dialog
        window.print();
        
        // Remove print styles after printing
        setTimeout(() => {
            document.head.removeChild(printStyles);
        }, 1000);
    }
    
    /**
     * Handles panel close
     * @private
     */
    _handleClose() {
        this.panelState.isOpen = false;
        
        // Call callback if provided
        if (this.options.onClose) {
            this.options.onClose();
        }
        
        // Dispatch custom event
        const event = new CustomEvent('closePanel', { bubbles: true });
        if (this.options.container) {
            this.options.container.dispatchEvent(event);
        }
    }
    
    /**
     * Handles window resize
     * @private
     */
    _handleResize() {
        // Adjust panel layout for different screen sizes
        if (!this.options.container) return;
        
        const panel = this.options.container.querySelector('.surf-spot-panel');
        if (!panel) return;
        
        // Check if mobile view
        const isMobile = window.innerWidth < 768;
        panel.classList.toggle('mobile-view', isMobile);
        
        // Adjust calendar layout for mobile
        const calendar = panel.querySelector('.seasonal-calendar');
        if (calendar) {
            calendar.classList.toggle('mobile-calendar', isMobile);
        }
    }
    
    /**
     * Handles tab navigation with arrow keys
     * @private
     * @param {number} direction - Direction of navigation (1 for next, -1 for previous)
     */
    _handleTabArrowNavigation(direction) {
        const tabs = Array.from(document.querySelectorAll('.nav-tab'));
        const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));
        
        let nextIndex = currentIndex + direction;
        
        // Wrap around if at ends
        if (nextIndex < 0) {
            nextIndex = tabs.length - 1;
        } else if (nextIndex >= tabs.length) {
            nextIndex = 0;
        }
        
        const nextTab = tabs[nextIndex];
        const tabId = nextTab.getAttribute('data-tab-id');
        
        this._handleTabClick(tabId);
        nextTab.focus();
    }
    
    /**
     * Handles focus trapping within the panel
     * @private
     * @param {KeyboardEvent} e - The keyboard event
     */
    _handleFocusTrapping(e) {
        if (!this.options.container) return;
        
        const panel = this.options.container.querySelector('.surf-spot-panel');
        if (!panel) return;
        
        // Get all focusable elements within the panel
        const focusableElements = panel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Handle Tab and Shift+Tab
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift+Tab: going backwards
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: going forwards
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }
    
    /**
     * Handles compass navigation with arrow keys
     * @private
     * @param {number} direction - Direction of navigation (1 for clockwise, -1 for counter-clockwise)
     */
    _handleCompassNavigation(direction) {
        const compassPoints = Array.from(document.querySelectorAll('.compass-point:focus'));
        if (compassPoints.length === 0) return;
        
        const currentPoint = compassPoints[0];
        const allPoints = Array.from(currentPoint.parentElement.querySelectorAll('.compass-point'));
        const currentIndex = allPoints.indexOf(currentPoint);
        
        let nextIndex = currentIndex + direction;
        
        // Wrap around if at ends
        if (nextIndex < 0) {
            nextIndex = allPoints.length - 1;
        } else if (nextIndex >= allPoints.length) {
            nextIndex = 0;
        }
        
        const nextPoint = allPoints[nextIndex];
        nextPoint.focus();
    }
    
    /**
     * Handles calendar navigation with arrow keys
     * @private
     * @param {number} direction - Direction of navigation (1 for next, -1 for previous)
     */
    _handleCalendarNavigation(direction) {
        const monthCell = document.activeElement;
        if (!monthCell?.classList.contains('month-cell')) return;
        
        const allMonths = Array.from(monthCell.parentElement.querySelectorAll('.month-cell'));
        const currentIndex = allMonths.indexOf(monthCell);
        
        let nextIndex = currentIndex + direction;
        
        // Wrap around if at ends
        if (nextIndex < 0) {
            nextIndex = allMonths.length - 1;
        } else if (nextIndex >= allMonths.length) {
            nextIndex = 0;
        }
        
        const nextMonth = allMonths[nextIndex];
        nextMonth.focus();
    }
    
    /**
     * Handles tide navigation with arrow keys
     * @private
     * @param {number} direction - Direction of navigation (1 for next, -1 for previous)
     */
    _handleTideNavigation(direction) {
        const tideIndicator = document.activeElement;
        if (!tideIndicator?.classList.contains('tide-indicator')) return;
        
        const allTides = Array.from(tideIndicator.parentElement.querySelectorAll('.tide-indicator'));
        const currentIndex = allTides.indexOf(tideIndicator);
        
        let nextIndex = currentIndex + direction;
        
        // Wrap around if at ends
        if (nextIndex < 0) {
            nextIndex = allTides.length - 1;
        } else if (nextIndex >= allTides.length) {
            nextIndex = 0;
        }
        
        const nextTide = allTides[nextIndex];
        nextTide.focus();
    }
    
    /**
     * Navigates to the first element in the current context
     * @private
     */
    _navigateToFirstElement() {
        const focusedElement = document.activeElement;
        
        if (focusedElement?.classList.contains('nav-tab')) {
            const tabs = document.querySelectorAll('.nav-tab');
            if (tabs.length > 0) {
                tabs[0].focus();
            }
        } else if (focusedElement?.classList.contains('compass-point')) {
            const compassPoints = document.querySelectorAll('.compass-point');
            if (compassPoints.length > 0) {
                compassPoints[0].focus();
            }
        } else if (focusedElement?.classList.contains('month-cell')) {
            const monthCells = document.querySelectorAll('.month-cell');
            if (monthCells.length > 0) {
                monthCells[0].focus();
            }
        }
    }
    
    /**
     * Navigates to the last element in the current context
     * @private
     */
    _navigateToLastElement() {
        const focusedElement = document.activeElement;
        
        if (focusedElement?.classList.contains('nav-tab')) {
            const tabs = document.querySelectorAll('.nav-tab');
            if (tabs.length > 0) {
                tabs[tabs.length - 1].focus();
            }
        } else if (focusedElement?.classList.contains('compass-point')) {
            const compassPoints = document.querySelectorAll('.compass-point');
            if (compassPoints.length > 0) {
                compassPoints[compassPoints.length - 1].focus();
            }
        } else if (focusedElement?.classList.contains('month-cell')) {
            const monthCells = document.querySelectorAll('.month-cell');
            if (monthCells.length > 0) {
                monthCells[monthCells.length - 1].focus();
            }
        }
    }
    
    /**
     * Announces messages to screen readers
     * @private
     * @param {string} message - The message to announce
     */
    _announceToScreenReader(message) {
        // Create or get the live region
        let liveRegion = document.getElementById('sr-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'sr-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        
        // Update the message
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
    
    /**
     * Handles tab navigation within the panel
     * @private
     * @param {KeyboardEvent} e - The keyboard event
     */
    _handleTabNavigation(e) {
        // This is now handled by _handleFocusTrapping
        // Keeping this method for backward compatibility
        this._handleFocusTrapping(e);
    }
    
    /**
     * Announces tab changes for screen readers
     * @private
     * @param {string} tabId - The ID of the activated tab
     */
    _announceTabChange(tabId) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Switched to ${tabId} tab`;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    /**
     * Copies text to clipboard
     * @private
     * @param {string} text - Text to copy
     */
    _copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textarea);
    }
    
    /**
     * Shows a notification message
     * @private
     * @param {string} message - The message to show
     */
    _showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'surf-spot-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#333';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Show notification
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
        });
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * Adds an event listener with cleanup tracking
     * @private
     * @param {HTMLElement} element - The element to add listener to
     * @param {string} event - The event type
     * @param {Function} handler - The event handler
     */
    _addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        // Track for cleanup
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        
        this.eventListeners.get(element).push({ event, handler });
    }
    
    /**
     * Creates a debounced version of a function
     * @private
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce wait time in ms
     * @returns {Function} The debounced function
     */
    _debounce(func, wait) {
        const key = func.toString();
        
        if (this.debouncedHandlers.has(key)) {
            return this.debouncedHandlers.get(key);
        }
        
        let timeout;
        const debouncedFunc = function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
        
        this.debouncedHandlers.set(key, debouncedFunc);
        return debouncedFunc;
    }

    /**
     * Gets the crowd level icon
     * @private
     * @param {string} crowdFactor - The crowd factor
     * @returns {string} The icon character
     */
    _getCrowdLevelIcon(crowdFactor) {
        const icons = {
            'Empty': '🏝️',
            'Low': '👤',
            'Medium': '👥',
            'High': '👥👥',
            'Crowded': '👥👥👥'
        };
        return icons[crowdFactor] || '👤';
    }

    /**
     * Gets the bottom type icon
     * @private
     * @param {Array} bottomTypes - Array of bottom types
     * @returns {string} The icon character
     */
    _getBottomTypeIcon(bottomTypes) {
        if (bottomTypes.includes('Sand')) return '🏖️';
        if (bottomTypes.includes('Reef')) return '🪨';
        if (bottomTypes.includes('Lava')) return '🌋';
        if (bottomTypes.includes('Rock')) return '⛰️';
        return '🏖️';
    }

    /**
     * Gets the water quality icon
     * @private
     * @param {string} waterQuality - The water quality
     * @returns {string} The icon character
     */
    _getWaterQualityIcon(waterQuality) {
        const icons = {
            'Clean': '💧',
            'Good': '💧',
            'Fair': '💧',
            'Poor': '🚫'
        };
        return icons[waterQuality] || '💧';
    }

    /**
     * Gets the wave type icon
     * @private
     * @param {Array} waveTypes - Array of wave types
     * @returns {string} The icon character
     */
    _getWaveTypeIcon(waveTypes) {
        if (waveTypes.includes('Beach Break')) return '🏖️';
        if (waveTypes.includes('Reef Break')) return '🪨';
        if (waveTypes.includes('Point Break')) return '📍';
        if (waveTypes.includes('Breakwater / Jetty')) return '🧱';
        return '🌊';
    }

    /**
     * Formats the bottom type for display
     * @private
     * @param {Array} bottomTypes - Array of bottom types
     * @returns {string} Formatted bottom type
     */
    _formatBottomType(bottomTypes) {
        if (!bottomTypes || bottomTypes.length === 0) return 'Unknown';
        return bottomTypes.join(', ');
    }

    /**
     * Formats the wave type for display
     * @private
     * @param {Array} waveTypes - Array of wave types
     * @returns {string} Formatted wave type
     */
    _formatWaveType(waveTypes) {
        if (!waveTypes || waveTypes.length === 0) return 'Unknown';
        return waveTypes.join(', ');
    }

    /**
     * Formats the direction for display
     * @private
     * @param {Array} directions - Array of directions
     * @returns {string} Formatted direction
     */
    _formatDirection(directions) {
        if (!directions || directions.length === 0) return 'Unknown';
        return directions.join(', ');
    }

    /**
     * Formats the hazards for display
     * @private
     * @param {Array} hazards - Array of hazards
     * @returns {string} Formatted hazards
     */
    _formatHazards(hazards) {
        if (!hazards || hazards.length === 0) return 'None known';
        return hazards.join(', ');
    }
}