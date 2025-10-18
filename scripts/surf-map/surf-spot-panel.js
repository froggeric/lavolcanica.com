/**
 * @fileoverview SurfSpotPanel - Content generator for the surf spot detail side panel.
 * @version 1.0.1
 * @description This module provides a class to dynamically generate the HTML content
 * for a surf spot detail panel, based on the standardized surf spot data structure.
 * It is designed to be used within the main application's side panel system.
 */

/**
 * Generates HTML content for the surf spot detail side panel.
 * This class is a content generator only and does not manage panel state.
 */
export class SurfSpotPanel {
    /**
     * Creates an instance of SurfSpotPanel.
     */
    constructor() {
        this.contentFragment = null;
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

        this.contentFragment = document.createDocumentFragment();
        const spotData = spot;

        // 1. Hero Section with background image
        this.contentFragment.appendChild(this._createHeroSection(spotData));

        // 2. Primary Details Section
        const primaryDetails = this._createPrimaryDetails(spotData);
        this.contentFragment.appendChild(primaryDetails);

        // 3. Tabbed Section for Conditions and Practicalities
        const tabbedSection = this._createTabbedSection(spotData);
        this.contentFragment.appendChild(tabbedSection);

        return this.contentFragment;
    }

    /**
     * Creates the hero section with a background image and spot name.
     * @private
     * @param {Object} spot - The surf spot data object.
     * @returns {HTMLElement} The hero section container element.
     */
    _createHeroSection(spot) {
        const heroContainer = document.createElement('div');
        heroContainer.className = 'side-panel-hero-container';
        heroContainer.style.position = 'relative';
        heroContainer.style.overflow = 'hidden';
        heroContainer.style.borderRadius = '8px';
        heroContainer.style.marginBottom = '0';

        const heroImg = document.createElement('img');
        // Try to use the spot-specific image from the surf-spots directory
        const spotImageName = spot.id ? `${spot.id}.webp` : null;
        const spotImagePath = spotImageName ? `images/surf-spots/${spotImageName}` : null;
        
        // Set the initial image source
        heroImg.src = spotImagePath || 'images/surf-spots/surf-spot-placeholder.webp';
        heroImg.alt = `View of ${spot.name}`;
        
        // Add error handling to fall back to placeholder if spot image doesn't exist
        if (spotImagePath) {
            heroImg.onerror = function() {
                this.src = 'images/surf-spots/surf-spot-placeholder.webp';
            };
        }
        heroImg.className = 'side-panel-hero-image';
        heroImg.style.width = '100%';
        heroImg.style.aspectRatio = '3/2'; // 3:2 aspect ratio
        heroImg.style.objectFit = 'cover';
        heroImg.style.display = 'block';

        // Overlay for the title
        const titleOverlay = document.createElement('div');
        titleOverlay.style.position = 'absolute';
        titleOverlay.style.bottom = '0';
        titleOverlay.style.left = '0';
        titleOverlay.style.right = '0';
        titleOverlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)';
        titleOverlay.style.padding = '1.5rem';
        titleOverlay.style.paddingTop = '3rem';

        const title = document.createElement('h2');
        title.className = 'side-panel-hero-title';
        title.textContent = spot.name;
        title.style.color = 'var(--text-salt-crystal)';
        title.style.margin = '0';
        title.style.fontFamily = 'var(--font-heading)';
        title.style.fontSize = '1.75rem';
        title.style.fontWeight = '700';
        title.style.textShadow = '2px 2px 8px rgba(0,0,0,0.7)';

        titleOverlay.appendChild(title);
        heroContainer.appendChild(heroImg);
        heroContainer.appendChild(titleOverlay);

        return heroContainer;
    }

    /**
     * Creates the primary details section with tags and description.
     * @private
     * @param {Object} spot - The surf spot data object.
     * @returns {HTMLElement} The primary details section element.
     */
    _createPrimaryDetails(spot) {
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'side-panel-text-content'; // Re-use existing class for padding

        // Tags container
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'spot-details-tags';
        tagsContainer.style.display = 'flex';
        tagsContainer.style.flexWrap = 'wrap';
        tagsContainer.style.gap = '0.5rem';
        tagsContainer.style.marginBottom = '1.5rem';

        if (spot.difficulty) {
            const difficultyTag = this._createTag(spot.difficulty, `difficulty ${spot.difficulty.toLowerCase()}`);
            tagsContainer.appendChild(difficultyTag);
        }
        if (spot.waveType) {
            const waveTypeTag = this._createTag(spot.waveType, 'wave-type');
            tagsContainer.appendChild(waveTypeTag);
        }
        if (spot.primarySwellDirection) {
            const swellTag = this._createTag(`Swell: ${spot.primarySwellDirection}`, 'swell-direction');
            tagsContainer.appendChild(swellTag);
        }
        
        detailsContainer.appendChild(tagsContainer);

        // Description
        if (spot.description) {
            const description = document.createElement('p');
            description.className = 'collab-details-bio'; // Re-use existing class
            description.textContent = spot.description;
            description.style.marginBottom = '0';
            detailsContainer.appendChild(description);
        }

        return detailsContainer;
    }

    /**
     * Creates a styled tag element.
     * @private
     * @param {string} text - The text content of the tag.
     * @param {string} className - The CSS class for styling.
     * @returns {HTMLElement} The tag element.
     */
    _createTag(text, className) {
        const tag = document.createElement('span');
        tag.className = `spot-tag ${className}`;
        tag.textContent = text;
        tag.style.padding = '0.25rem 0.75rem';
        tag.style.borderRadius = '20px';
        tag.style.fontSize = '0.8rem';
        tag.style.fontWeight = '600';
        tag.style.textTransform = 'uppercase';
        tag.style.color = 'white';
        tag.style.display = 'inline-block';

        // Style based on class name
        switch (className) {
            case 'difficulty beginner':
                tag.style.backgroundColor = '#4CAF50'; // Green
                break;
            case 'difficulty intermediate':
                tag.style.backgroundColor = '#FF9800'; // Orange
                break;
            case 'difficulty advanced':
                tag.style.backgroundColor = '#F44336'; // Red
                break;
            case 'difficulty pro':
                tag.style.backgroundColor = '#9C27B0'; // Purple
                break;
            default:
                tag.style.backgroundColor = 'var(--accent-canary-teal)';
        }
        return tag;
    }

    /**
     * Creates the tabbed section for conditions and practicalities.
     * @private
     * @param {Object} spot - The surf spot data object.
     * @returns {HTMLElement} The tabbed section element.
     */
    _createTabbedSection(spot) {
        const tabbedContainer = document.createElement('div');
        tabbedContainer.className = 'side-panel-text-content';

        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'song-info-tabs'; // Re-use existing tab styles
        tabsContainer.style.marginBottom = '1.5rem';
        tabsContainer.style.marginTop = '1.5rem';

        const conditionsTab = this._createTab('Conditions', true);
        const practicalitiesTab = this._createTab('Practicalities', false);

        tabsContainer.appendChild(conditionsTab);
        tabsContainer.appendChild(practicalitiesTab);
        tabbedContainer.appendChild(tabsContainer);

        // Tab Panes
        const conditionsPane = this._createConditionsPane(spot);
        const practicalitiesPane = this._createPracticalitiesPane(spot);

        conditionsPane.classList.add('active'); // Conditions is active by default
        tabbedContainer.appendChild(conditionsPane);
        tabbedContainer.appendChild(practicalitiesPane);

        // Tab switching logic
        const tabs = [conditionsTab, practicalitiesTab];
        const panes = [conditionsPane, practicalitiesPane];

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                panes[index].classList.add('active');
            });
        });

        return tabbedContainer;
    }

    /**
     * Creates a single tab button.
     * @private
     * @param {string} text - The tab's text.
     * @param {boolean} isActive - Whether the tab is initially active.
     * @returns {HTMLElement} The tab button element.
     */
    _createTab(text, isActive) {
        const tab = document.createElement('button');
        tab.className = 'song-info-tab';
        if (isActive) tab.classList.add('active');
        tab.textContent = text;
        tab.type = 'button';
        return tab;
    }

    /**
     * Creates the conditions pane with a grid of details.
     * @private
     * @param {Object} spot - The surf spot data object.
     * @returns {HTMLElement} The conditions pane element.
     */
    _createConditionsPane(spot) {
        const pane = document.createElement('div');
        pane.className = 'song-info-content';

        const grid = document.createElement('div');
        grid.className = 'spot-details-grid';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
        grid.style.gap = '1rem';

        if (spot.bestSwell) {
            grid.appendChild(this._createConditionItem('Best Swell', spot.bestSwell, 'ocean'));
        }
        if (spot.bestWind) {
            grid.appendChild(this._createConditionItem('Best Wind', spot.bestWind, 'wind'));
        }
        if (spot.bestTide) {
            grid.appendChild(this._createConditionItem('Best Tide', spot.bestTide, 'water'));
        }
        if (spot.bestSeason) {
            grid.appendChild(this._createConditionItem('Best Season', spot.bestSeason, 'calendar'));
        }

        pane.appendChild(grid);
        return pane;
    }
    
    /**
     * Creates the practicalities pane with access and hazard information.
     * @private
     * @param {Object} spot - The surf spot data object.
     * @returns {HTMLElement} The practicalities pane element.
     */
    _createPracticalitiesPane(spot) {
        const pane = document.createElement('div');
        pane.className = 'song-info-content';

        // Access Section
        if (spot.access || spot.parking) {
            const accessTitle = document.createElement('h3');
            accessTitle.textContent = 'Access & Parking';
            accessTitle.style.marginBottom = '0.75rem';
            accessTitle.style.fontFamily = 'var(--font-heading)';
            accessTitle.style.fontSize = '1.1rem';
            accessTitle.style.color = 'var(--text-salt-crystal)';
            pane.appendChild(accessTitle);
        }

        if (spot.access) {
            const accessP = document.createElement('p');
            accessP.className = 'collab-details-bio';
            accessP.textContent = spot.access;
            accessP.style.marginBottom = '1.5rem';
            pane.appendChild(accessP);
        }
        
        if (spot.parking) {
            const parkingP = document.createElement('p');
            parkingP.className = 'collab-details-bio';
            parkingP.innerHTML = `<strong>Parking:</strong> ${spot.parking}`;
            parkingP.style.marginBottom = '1.5rem';
            pane.appendChild(parkingP);
        }

        // Facilities Section
        if (spot.facilities && spot.facilities.length > 0) {
            const facilitiesTitle = document.createElement('h3');
            facilitiesTitle.textContent = 'Facilities';
            facilitiesTitle.style.marginBottom = '0.75rem';
            facilitiesTitle.style.marginTop = '1.5rem';
            facilitiesTitle.style.fontFamily = 'var(--font-heading)';
            facilitiesTitle.style.fontSize = '1.1rem';
            facilitiesTitle.style.color = 'var(--text-salt-crystal)';
            pane.appendChild(facilitiesTitle);

            const facilitiesList = document.createElement('ul');
            facilitiesList.style.listStyle = 'disc';
            facilitiesList.style.paddingLeft = '1.5rem';
            spot.facilities.forEach(facility => {
                const li = document.createElement('li');
                li.textContent = facility;
                li.style.marginBottom = '0.5rem';
                facilitiesList.appendChild(li);
            });
            pane.appendChild(facilitiesList);
        }

        // Hazards Section
        if (spot.hazards && spot.hazards.length > 0) {
            const hazardsTitle = document.createElement('h3');
            hazardsTitle.textContent = 'Hazards';
            hazardsTitle.style.marginBottom = '0.75rem';
            hazardsTitle.style.marginTop = '1.5rem';
            hazardsTitle.style.fontFamily = 'var(--font-heading)';
            hazardsTitle.style.fontSize = '1.1rem';
            hazardsTitle.style.color = 'var(--text-salt-crystal)';
            pane.appendChild(hazardsTitle);

            const hazardsContainer = document.createElement('div');
            hazardsContainer.style.display = 'flex';
            hazardsContainer.style.flexWrap = 'wrap';
            hazardsContainer.style.gap = '0.5rem';

            spot.hazards.forEach(hazard => {
                const hazardTag = document.createElement('span');
                hazardTag.className = 'hazard-tag';
                hazardTag.textContent = hazard;
                hazardTag.style.padding = '0.25rem 0.75rem';
                hazardTag.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'; // Light red background
                hazardTag.style.border = '1px solid rgba(244, 67, 54, 0.5)';
                hazardTag.style.color = '#F44336';
                hazardTag.style.borderRadius = '4px';
                hazardTag.style.fontSize = '0.8rem';
                hazardTag.style.fontWeight = '500';
                hazardsContainer.appendChild(hazardTag);
            });
            pane.appendChild(hazardsContainer);
        }
        
        return pane;
    }

    /**
     * Creates a single item for the conditions grid.
     * @private
     * @param {string} label - The item's label.
     * @param {string} value - The item's value.
     * @param {string} icon - A keyword for an icon (e.g., 'ocean').
     * @returns {HTMLElement} The condition item element.
     */
    _createConditionItem(label, value, icon) {
        const item = document.createElement('div');
        item.className = 'condition-item';
        item.style.textAlign = 'center';
        item.style.padding = '1rem';
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        item.style.borderRadius = '8px';

        const iconEl = document.createElement('div');
        iconEl.className = `condition-icon icon-${icon}`;
        iconEl.style.fontSize = '1.5rem';
        iconEl.style.marginBottom = '0.5rem';
        iconEl.textContent = this._getIconSymbol(icon);

        const valueEl = document.createElement('div');
        valueEl.className = 'condition-value';
        valueEl.style.fontWeight = '600';
        valueEl.style.fontSize = '0.9rem';
        valueEl.style.color = 'var(--accent-canary-teal)';
        valueEl.textContent = value;

        const labelEl = document.createElement('div');
        labelEl.className = 'condition-label';
        labelEl.style.fontSize = '0.8rem';
        labelEl.style.color = 'rgba(240, 240, 240, 0.7)';
        labelEl.style.marginTop = '0.25rem';
        labelEl.textContent = label;

        item.appendChild(iconEl);
        item.appendChild(valueEl);
        item.appendChild(labelEl);

        return item;
    }
    
    /**
     * Returns a simple symbol for an icon keyword.
     * @private
     * @param {string} icon - The icon keyword.
     * @returns {string} A symbol or emoji.
     */
    _getIconSymbol(icon) {
        const icons = {
            'ocean': '🌊',
            'wind': '💨',
            'water': '🌊',
            'calendar': '📅'
        };
        return icons[icon] || '•';
    }
}