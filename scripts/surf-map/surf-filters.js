/**
 * @fileoverview Filter functionality for surf spots.
 * @version 1.0.0
 * @description This module provides filter functionality for surf spots,
 * including ability level, wave type, and area filters with visual indicators.
 */

/**
 * Filter manager for surf spots.
 */
export class SurfFilters {
    /**
     * @param {SurfSpotsManager} spotsManager - The surf spots data manager.
     * @param {HTMLElement} filterToggle - The filter toggle button.
     * @param {HTMLElement} filterPanel - The filter panel container.
     * @param {Object} options - Configuration options.
     */
    constructor(spotsManager, filterToggle, filterPanel, options = {}) {
        this.spotsManager = spotsManager;
        this.filterToggle = filterToggle;
        this.filterPanel = filterPanel;
        this.options = {
            animationDuration: 300,
            ...options
        };

        // Filter state
        this.activeFilters = {
            abilityLevel: new Set(),
            waveType: new Set(),
            area: new Set()
        };

        // Available filter options
        this.filterOptions = {
            abilityLevel: [],
            waveType: [],
            area: []
        };

        // State
        this.isPanelOpen = false;
        this.filteredSpots = [];

        // Event callbacks
        this.onFilterChange = null;

        // Initialize
        this.init();
    }

    /**
     * Initializes the filter functionality.
     */
    init() {
        // Load filter options
        this.loadFilterOptions();

        // Setup event listeners
        this.setupEventListeners();

        // Create filter UI if not provided
        if (!this.filterPanel) {
            this.createFilterPanel();
        } else {
            // If panel exists, populate it
            this.buildFilterUI();
        }

        // Create filter toggle if not provided
        if (!this.filterToggle) {
            this.createFilterToggle();
        }

        // Update filter count indicator
        this.updateFilterCount();
    }

    /**
     * Loads available filter options from the spots manager.
     */
    loadFilterOptions() {
        // Get ability levels
        this.filterOptions.abilityLevel = this.spotsManager.getDifficultyLevels();
        
        // Get unique wave types
        const allSpots = this.spotsManager.getAllSpots();
        const waveTypes = new Set();
        allSpots.forEach(spot => {
            if (spot.waveDetails.type && spot.waveDetails.type.length > 0) {
                spot.waveDetails.type.forEach(type => {
                    waveTypes.add(type);
                });
            }
        });
        this.filterOptions.waveType = Array.from(waveTypes).sort();
        
        // Get areas
        this.filterOptions.area = this.spotsManager.getAreas().sort();
    }

    /**
     * Sets up event listeners for filter controls.
     */
    setupEventListeners() {
        // Filter toggle button
        if (this.filterToggle) {
            console.log('Setting up filter toggle event listener');
            this.filterToggle.addEventListener('click', (e) => {
                console.log('Filter toggle clicked');
                e.preventDefault();
                e.stopPropagation();
                this.togglePanel();
            });
        } else {
            console.error('Filter toggle element not found');
        }

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isPanelOpen &&
                !this.filterPanel.contains(e.target) &&
                !this.filterToggle.contains(e.target)) {
                this.closePanel();
            }
        });

        // Escape key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen) {
                this.closePanel();
            }
        });
    }

    /**
     * Creates the filter panel if it doesn't exist.
     */
    createFilterPanel() {
        this.filterPanel = document.createElement('div');
        this.filterPanel.className = 'surf-map-filter-panel';
        document.body.appendChild(this.filterPanel);
        this.buildFilterUI();
    }

    /**
     * Creates the filter toggle button if it doesn't exist.
     */
    createFilterToggle() {
        this.filterToggle = document.createElement('button');
        this.filterToggle.className = 'surf-map-filter-toggle';
        this.filterToggle.setAttribute('aria-label', 'Toggle filters');
        this.filterToggle.innerHTML = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
            </svg>
            <span class="filter-count">0</span>
        `;
        
        // Insert after search input
        const searchContainer = document.querySelector('.surf-map-search');
        if (searchContainer) {
            searchContainer.parentNode.insertBefore(this.filterToggle, searchContainer.nextSibling);
        }
    }

    /**
     * Builds the filter UI.
     */
    buildFilterUI() {
        if (!this.filterPanel) return;

        this.filterPanel.innerHTML = `
            <div class="filter-panel-header">
                <h3>Filter Surf Spots</h3>
                <button class="filter-panel-close" aria-label="Close filters">&times;</button>
            </div>
            <div class="filter-panel-content">
                <div class="filter-section">
                    <h4>Ability Level</h4>
                    <div class="filter-options" data-filter-type="abilityLevel"></div>
                </div>
                <div class="filter-section">
                    <h4>Wave Type</h4>
                    <div class="filter-options" data-filter-type="waveType"></div>
                </div>
                <div class="filter-section">
                    <h4>Area</h4>
                    <div class="filter-options" data-filter-type="area"></div>
                </div>
            </div>
            <div class="filter-panel-footer">
                <button class="filter-reset-btn">Reset Filters</button>
                <button class="filter-apply-btn">Apply Filters</button>
            </div>
        `;

        // Populate filter options
        this.populateFilterOptions();

        // Setup filter event listeners
        this.setupFilterEventListeners();
    }

    /**
     * Populates filter options in the UI.
     */
    populateFilterOptions() {
        // Populate ability level filters
        const abilityLevelContainer = this.filterPanel.querySelector('[data-filter-type="abilityLevel"]');
        this.filterOptions.abilityLevel.forEach(level => {
            const option = this.createFilterOption('abilityLevel', level, level);
            abilityLevelContainer.appendChild(option);
        });

        // Populate wave type filters
        const waveTypeContainer = this.filterPanel.querySelector('[data-filter-type="waveType"]');
        this.filterOptions.waveType.forEach(type => {
            const option = this.createFilterOption('waveType', type, this.formatWaveType(type));
            waveTypeContainer.appendChild(option);
        });

        // Populate area filters
        const areaContainer = this.filterPanel.querySelector('[data-filter-type="area"]');
        this.filterOptions.area.forEach(area => {
            const option = this.createFilterOption('area', area, area);
            areaContainer.appendChild(option);
        });
    }

    /**
     * Creates a filter option element.
     * @param {string} type - The filter type.
     * @param {string} value - The filter value.
     * @param {string} label - The display label.
     * @returns {HTMLElement} The filter option element.
     */
    createFilterOption(type, value, label) {
        const option = document.createElement('label');
        option.className = 'filter-option';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'filter-checkbox';
        input.setAttribute('data-filter-type', type);
        input.setAttribute('data-filter-value', value);
        
        const indicator = document.createElement('span');
        indicator.className = 'filter-indicator';
        
        // Add color indicator for ability level
        if (type === 'abilityLevel') {
            const color = this.spotsManager.getDifficultyColor(value);
            indicator.style.backgroundColor = color;
        }
        
        const text = document.createElement('span');
        text.className = 'filter-label';
        text.textContent = label;
        
        option.appendChild(input);
        option.appendChild(indicator);
        option.appendChild(text);
        
        return option;
    }

    /**
     * Sets up event listeners for filter controls.
     */
    setupFilterEventListeners() {
        // Close button
        const closeBtn = this.filterPanel.querySelector('.filter-panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePanel();
            });
        }

        // Filter checkboxes
        const checkboxes = this.filterPanel.querySelectorAll('.filter-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleFilterChange();
            });
        });

        // Reset button
        const resetBtn = this.filterPanel.querySelector('.filter-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Apply button
        const applyBtn = this.filterPanel.querySelector('.filter-apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFilters();
                this.closePanel();
            });
        }
    }

    /**
     * Handles filter checkbox changes.
     */
    handleFilterChange() {
        // Update active filters
        const checkboxes = this.filterPanel.querySelectorAll('.filter-checkbox:checked');
        
        // Clear current filters
        this.activeFilters.abilityLevel.clear();
        this.activeFilters.waveType.clear();
        this.activeFilters.area.clear();
        
        // Add active filters
        checkboxes.forEach(checkbox => {
            const type = checkbox.getAttribute('data-filter-type');
            const value = checkbox.getAttribute('data-filter-value');
            
            if (this.activeFilters[type]) {
                this.activeFilters[type].add(value);
            }
        });

        // Update filter count
        this.updateFilterCount();
    }

    /**
     * Updates the filter count indicator.
     */
    updateFilterCount() {
        if (!this.filterToggle) return;

        const countElement = this.filterToggle.querySelector('.filter-count');
        if (countElement) {
            const totalActiveFilters = 
                this.activeFilters.abilityLevel.size + 
                this.activeFilters.waveType.size + 
                this.activeFilters.area.size;
            
            countElement.textContent = totalActiveFilters;
            countElement.style.display = totalActiveFilters > 0 ? 'block' : 'none';
        }
    }

    /**
     * Toggles the filter panel open/closed.
     */
    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    /**
     * Opens the filter panel.
     */
    openPanel() {
        console.log('=== FILTER PANEL OPEN START ===');
        
        if (!this.filterPanel) {
            console.error('Cannot open filter panel: panel element not found');
            return;
        }
        
        if (this.isPanelOpen) {
            console.log('Filter panel is already open');
            return;
        }

        console.log('Opening filter panel');
        console.log('Filter panel element:', this.filterPanel);
        console.log('Filter toggle element:', this.filterToggle);
        
        this.filterPanel.classList.add('open');
        this.isPanelOpen = true;
        
        // Update toggle button state
        if (this.filterToggle) {
            this.filterToggle.classList.add('active');
            this.filterToggle.setAttribute('aria-expanded', 'true');
            console.log('Updated toggle button state to active');
        } else {
            console.warn('No filter toggle element found');
        }
        
        // Force display the panel
        this.filterPanel.style.display = 'block';
        this.filterPanel.style.visibility = 'visible';
        console.log('Filter panel opened');
        console.log('=== FILTER PANEL OPEN END ===');
    }

    /**
     * Closes the filter panel.
     */
    closePanel() {
        if (!this.filterPanel || !this.isPanelOpen) return;

        console.log('Closing filter panel');
        this.filterPanel.classList.remove('open');
        this.isPanelOpen = false;
        
        // Update toggle button state
        if (this.filterToggle) {
            this.filterToggle.classList.remove('active');
            this.filterToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Hide the panel
        this.filterPanel.style.display = 'none';
        this.filterPanel.style.visibility = 'hidden';
        console.log('Filter panel closed');
    }

    /**
     * Applies the current filters.
     */
    applyFilters() {
        console.log('=== APPLYING FILTERS START ===');
        
        // Get all spots
        const allSpots = this.spotsManager.getAllSpots();
        console.log(`Total spots before filtering: ${allSpots.length}`);
        
        console.log('Active filters:', {
            abilityLevel: Array.from(this.activeFilters.abilityLevel),
            waveType: Array.from(this.activeFilters.waveType),
            area: Array.from(this.activeFilters.area)
        });
        
        // Filter spots based on active filters
        this.filteredSpots = allSpots.filter(spot => {
            let passesAllFilters = true;
            
            // Check ability level filter
            if (this.activeFilters.abilityLevel.size > 0) {
                const spotAbility = spot.waveDetails.abilityLevel.primary;
                const passesAbilityFilter = spotAbility && this.activeFilters.abilityLevel.has(spotAbility);
                if (!passesAbilityFilter) {
                    console.log(`Spot "${spot.primaryName}" filtered out by ability level: ${spotAbility}`);
                    passesAllFilters = false;
                }
            }
            
            // Check wave type filter
            if (passesAllFilters && this.activeFilters.waveType.size > 0) {
                const spotWaveTypes = spot.waveDetails.type || [];
                const hasMatchingWaveType = spotWaveTypes.some(type =>
                    this.activeFilters.waveType.has(type)
                );
                if (!hasMatchingWaveType) {
                    console.log(`Spot "${spot.primaryName}" filtered out by wave type: [${spotWaveTypes.join(', ')}]`);
                    passesAllFilters = false;
                }
            }
            
            // Check area filter
            if (passesAllFilters && this.activeFilters.area.size > 0) {
                const spotArea = spot.location.area;
                const passesAreaFilter = spotArea && this.activeFilters.area.has(spotArea);
                if (!passesAreaFilter) {
                    console.log(`Spot "${spot.primaryName}" filtered out by area: ${spotArea}`);
                    passesAllFilters = false;
                }
            }
            
            return passesAllFilters;
        });

        console.log(`Spots after filtering: ${this.filteredSpots.length}`);
        console.log('Filtered spots:', this.filteredSpots.map(s => s.primaryName));

        // Notify of filter change
        if (this.onFilterChange) {
            console.log('Calling filter change callback');
            this.onFilterChange(this.filteredSpots);
        } else {
            console.warn('No filter change callback set');
        }
        
        console.log('=== APPLYING FILTERS END ===');
    }

    /**
     * Resets all filters.
     */
    resetFilters() {
        // Clear active filters
        this.activeFilters.abilityLevel.clear();
        this.activeFilters.waveType.clear();
        this.activeFilters.area.clear();
        
        // Uncheck all checkboxes
        const checkboxes = this.filterPanel.querySelectorAll('.filter-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update filter count
        this.updateFilterCount();
        
        // Apply empty filters
        this.applyFilters();
    }

    /**
     * Formats wave type for display.
     * @param {string} waveType - The wave type.
     * @returns {string} The formatted wave type.
     */
    formatWaveType(waveType) {
        // Convert camelCase or snake_case to Title Case
        return waveType
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    /**
     * Gets the currently filtered spots.
     * @returns {Array<Object>} The filtered spots.
     */
    getFilteredSpots() {
        return this.filteredSpots;
    }

    /**
     * Gets the active filters.
     * @returns {Object} The active filters.
     */
    getActiveFilters() {
        return {
            abilityLevel: Array.from(this.activeFilters.abilityLevel),
            waveType: Array.from(this.activeFilters.waveType),
            area: Array.from(this.activeFilters.area)
        };
    }

    /**
     * Sets filters programmatically.
     * @param {Object} filters - The filters to set.
     */
    setFilters(filters) {
        // Clear current filters
        this.resetFilters();
        
        // Set new filters
        if (filters.abilityLevel) {
            filters.abilityLevel.forEach(level => {
                this.activeFilters.abilityLevel.add(level);
                const checkbox = this.filterPanel.querySelector(
                    `[data-filter-type="abilityLevel"][data-filter-value="${level}"]`
                );
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (filters.waveType) {
            filters.waveType.forEach(type => {
                this.activeFilters.waveType.add(type);
                const checkbox = this.filterPanel.querySelector(
                    `[data-filter-type="waveType"][data-filter-value="${type}"]`
                );
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (filters.area) {
            filters.area.forEach(area => {
                this.activeFilters.area.add(area);
                const checkbox = this.filterPanel.querySelector(
                    `[data-filter-type="area"][data-filter-value="${area}"]`
                );
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Update filter count and apply
        this.updateFilterCount();
        this.applyFilters();
    }

    /**
     * Sets the callback for filter changes.
     * @param {Function} callback - The callback function.
     */
    setFilterChangeCallback(callback) {
        this.onFilterChange = callback;
    }

    /**
     * Rebuilds the filter options (useful when spot data changes).
     */
    rebuildFilterOptions() {
        this.loadFilterOptions();
        if (this.filterPanel) {
            this.buildFilterUI();
        }
    }

    /**
     * Destroys the filter manager and cleans up resources.
     */
    destroy() {
        // Remove event listeners
        if (this.filterToggle) {
            this.filterToggle.removeEventListener('click', this.togglePanel);
        }
        
        document.removeEventListener('click', this.handleDocumentClick);
        document.removeEventListener('keydown', this.handleKeyDown);

        // Remove filter panel if we created it
        if (this.filterPanel && this.filterPanel.parentNode) {
            this.filterPanel.parentNode.removeChild(this.filterPanel);
        }

        // Remove filter toggle if we created it
        if (this.filterToggle && this.filterToggle.parentNode) {
            this.filterToggle.parentNode.removeChild(this.filterToggle);
        }

        // Clear references
        this.filterToggle = null;
        this.filterPanel = null;
        this.onFilterChange = null;
    }
}