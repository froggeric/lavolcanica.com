/**
 * @fileoverview Surf spot detail modal module.
 * @version 1.0.0
 * @description This module handles displaying detailed surf spot information
 * in a modal with tabbed content for Overview, Conditions, and Practicalities.
 */

/**
 * Surf spot detail modal class.
 */
export class SurfSpotModal {
    /**
     * @param {Object} options - Configuration options.
     * @param {string} [options.containerId='surf-spot-modal'] - ID for the modal container.
     * @param {string} [options.closeButtonClass='modal-close'] - Class for the close button.
     * @param {string} [options.tabButtonClass='modal-tab-button'] - Class for tab buttons.
     * @param {string} [options.tabContentClass='modal-tab-content'] - Class for tab content.
     * @param {boolean} [options.enableAnimation=true] - Whether to enable animations.
     * @param {number} [options.animationDuration=300] - Animation duration in ms.
     */
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'surf-spot-modal',
            closeButtonClass: options.closeButtonClass || 'modal-close',
            tabButtonClass: options.tabButtonClass || 'modal-tab-button',
            tabContentClass: options.tabContentClass || 'modal-tab-content',
            enableAnimation: options.enableAnimation !== false,
            animationDuration: options.animationDuration || 300,
            ...options
        };
        
        // State
        this.isOpen = false;
        this.currentSpot = null;
        this.activeTab = 'overview';
        
        // DOM elements
        this.modal = null;
        this.modalOverlay = null;
        this.modalContent = null;
        this.modalHeader = null;
        this.modalBody = null;
        this.closeButton = null;
        this.tabButtons = null;
        this.tabContents = null;
        
        // Event handlers
        this.eventHandlers = {
            close: this.handleClose.bind(this),
            overlayClick: this.handleOverlayClick.bind(this),
            keydown: this.handleKeydown.bind(this),
            tabClick: this.handleTabClick.bind(this)
        };
        
        // Callbacks
        this.onClose = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initializes the modal.
     */
    init() {
        this.createModal();
        this.addEventListeners();
    }

    /**
     * Creates the modal DOM structure.
     */
    createModal() {
        // Create modal overlay
        this.modalOverlay = document.createElement('div');
        this.modalOverlay.id = `${this.options.containerId}-overlay`;
        this.modalOverlay.className = 'surf-modal-overlay';
        this.modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            display: none;
            opacity: 0;
            transition: opacity ${this.options.animationDuration}ms ease;
        `;
        
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.id = this.options.containerId;
        this.modal.className = 'surf-modal';
        this.modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            background-color: #1a1a1a;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 2001;
            display: none;
            opacity: 0;
            transition: opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease;
            overflow: hidden;
        `;
        
        // Create modal header
        this.modalHeader = document.createElement('div');
        this.modalHeader.className = 'surf-modal-header';
        this.modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #333;
        `;
        
        // Create modal title
        this.modalTitle = document.createElement('h2');
        this.modalTitle.style.cssText = `
            margin: 0;
            color: #fff;
            font-size: 24px;
            font-weight: 600;
        `;
        
        // Create close button
        this.closeButton = document.createElement('button');
        this.closeButton.className = this.options.closeButtonClass;
        this.closeButton.innerHTML = '×';
        this.closeButton.style.cssText = `
            background: none;
            border: none;
            color: #fff;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        `;
        this.closeButton.addEventListener('mouseenter', () => {
            this.closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        this.closeButton.addEventListener('mouseleave', () => {
            this.closeButton.style.backgroundColor = 'transparent';
        });
        
        // Create modal body
        this.modalBody = document.createElement('div');
        this.modalBody.className = 'surf-modal-body';
        this.modalBody.style.cssText = `
            padding: 0;
            max-height: calc(80vh - 80px);
            overflow-y: auto;
        `;
        
        // Create tabs container
        this.tabsContainer = document.createElement('div');
        this.tabsContainer.className = 'surf-modal-tabs';
        this.tabsContainer.style.cssText = `
            display: flex;
            background-color: #222;
            border-bottom: 1px solid #333;
        `;
        
        // Create tab buttons container
        this.tabButtonsContainer = document.createElement('div');
        this.tabButtonsContainer.style.cssText = `
            display: flex;
            width: 100%;
        `;
        
        // Create tab content container
        this.tabContentContainer = document.createElement('div');
        this.tabContentContainer.className = 'surf-modal-tab-content-container';
        this.tabContentContainer.style.cssText = `
            padding: 20px;
        `;
        
        // Assemble modal
        this.modalHeader.appendChild(this.modalTitle);
        this.modalHeader.appendChild(this.closeButton);
        this.tabsContainer.appendChild(this.tabButtonsContainer);
        this.modalBody.appendChild(this.tabsContainer);
        this.modalBody.appendChild(this.tabContentContainer);
        this.modal.appendChild(this.modalHeader);
        this.modal.appendChild(this.modalBody);
        
        // Add to DOM
        document.body.appendChild(this.modalOverlay);
        document.body.appendChild(this.modal);
    }

    /**
     * Adds event listeners.
     */
    addEventListeners() {
        // Close button
        this.closeButton.addEventListener('click', this.eventHandlers.close);
        
        // Overlay click
        this.modalOverlay.addEventListener('click', this.eventHandlers.overlayClick);
        
        // Keyboard events
        document.addEventListener('keydown', this.eventHandlers.keydown);
    }

    /**
     * Removes event listeners.
     */
    removeEventListeners() {
        this.closeButton.removeEventListener('click', this.eventHandlers.close);
        this.modalOverlay.removeEventListener('click', this.eventHandlers.overlayClick);
        document.removeEventListener('keydown', this.eventHandlers.keydown);
    }

    /**
     * Opens the modal with surf spot data.
     * @param {Object} spot - The surf spot data.
     */
    open(spot) {
        if (!spot) return;
        
        this.currentSpot = spot;
        this.activeTab = 'overview';
        
        // Update modal content
        this.updateModalContent();
        
        // Show modal
        this.showModal();
    }

    /**
     * Closes the modal.
     */
    close() {
        this.hideModal();
        
        if (this.onClose) {
            this.onClose();
        }
    }

    /**
     * Shows the modal with animation.
     */
    showModal() {
        this.isOpen = true;
        
        // Show elements
        this.modalOverlay.style.display = 'block';
        this.modal.style.display = 'block';
        
        // Trigger reflow for animation
        this.modalOverlay.offsetHeight;
        this.modal.offsetHeight;
        
        // Animate in
        if (this.options.enableAnimation) {
            setTimeout(() => {
                this.modalOverlay.style.opacity = '1';
                this.modal.style.opacity = '1';
                this.modal.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
        } else {
            this.modalOverlay.style.opacity = '1';
            this.modal.style.opacity = '1';
            this.modal.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hides the modal with animation.
     */
    hideModal() {
        this.isOpen = false;
        
        // Animate out
        if (this.options.enableAnimation) {
            this.modalOverlay.style.opacity = '0';
            this.modal.style.opacity = '0';
            this.modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            setTimeout(() => {
                if (!this.isOpen) {
                    this.modalOverlay.style.display = 'none';
                    this.modal.style.display = 'none';
                }
            }, this.options.animationDuration);
        } else {
            this.modalOverlay.style.display = 'none';
            this.modal.style.display = 'none';
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Updates the modal content with surf spot data.
     */
    updateModalContent() {
        if (!this.currentSpot) return;
        
        const spot = this.currentSpot;
        
        // Update title
        this.modalTitle.textContent = spot.primaryName;
        
        // Create tabs
        this.createTabs();
        
        // Set active tab
        this.setActiveTab('overview');
    }

    /**
     * Creates the tabs.
     */
    createTabs() {
        // Clear existing tabs
        this.tabButtonsContainer.innerHTML = '';
        this.tabContentContainer.innerHTML = '';
        
        // Define tabs
        const tabs = [
            { id: 'overview', label: 'Overview' },
            { id: 'conditions', label: 'Conditions' },
            { id: 'practicalities', label: 'Practicalities' }
        ];
        
        // Create tab buttons
        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.className = this.options.tabButtonClass;
            button.dataset.tab = tab.id;
            button.textContent = tab.label;
            button.style.cssText = `
                flex: 1;
                padding: 15px 20px;
                background: none;
                border: none;
                color: #aaa;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 2px solid transparent;
            `;
            
            button.addEventListener('click', () => this.handleTabClick(tab.id));
            
            this.tabButtonsContainer.appendChild(button);
        });
        
        // Create tab content
        this.createTabContent();
    }

    /**
     * Creates the tab content.
     */
    createTabContent() {
        if (!this.currentSpot) return;
        
        const spot = this.currentSpot;
        
        // Create overview content
        const overviewContent = this.createOverviewContent(spot);
        
        // Create conditions content
        const conditionsContent = this.createConditionsContent(spot);
        
        // Create practicalities content
        const practicalitiesContent = this.createPracticalitiesContent(spot);
        
        // Store tab content
        this.tabContents = {
            overview: overviewContent,
            conditions: conditionsContent,
            practicalities: practicalitiesContent
        };
    }

    /**
     * Creates overview content.
     * @param {Object} spot - The surf spot data.
     * @returns {HTMLElement} The overview content element.
     */
    createOverviewContent(spot) {
        const content = document.createElement('div');
        content.className = 'tab-content';
        content.style.cssText = `
            color: #fff;
        `;
        
        // Description
        const description = document.createElement('p');
        description.textContent = spot.description;
        description.style.cssText = `
            margin-bottom: 20px;
            line-height: 1.6;
        `;
        content.appendChild(description);
        
        // Location info
        const locationTitle = document.createElement('h3');
        locationTitle.textContent = 'Location';
        locationTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(locationTitle);
        
        const locationInfo = document.createElement('div');
        locationInfo.innerHTML = `
            <p><strong>Area:</strong> ${spot.location.area}</p>
            <p><strong>Nearest Towns:</strong> ${spot.location.nearestTowns.join(', ')}</p>
            <p><strong>Coordinates:</strong> ${spot.location.coordinates.lat}, ${spot.location.coordinates.lng}</p>
            <p><strong>Coordinates Accuracy:</strong> ${spot.location.coordinates.accuracy}</p>
        `;
        locationInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(locationInfo);
        
        // Wave details
        const waveTitle = document.createElement('h3');
        waveTitle.textContent = 'Wave Details';
        waveTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(waveTitle);
        
        const waveInfo = document.createElement('div');
        waveInfo.innerHTML = `
            <p><strong>Type:</strong> ${Array.isArray(spot.waveDetails.type) ? spot.waveDetails.type.join(', ') : 'Unknown'}</p>
            <p><strong>Direction:</strong> ${Array.isArray(spot.waveDetails.direction) ? spot.waveDetails.direction.join(', ') : 'Unknown'}</p>
            ${spot.waveDetails.directionNotes ? `<p><strong>Direction Notes:</strong> ${spot.waveDetails.directionNotes}</p>` : ''}
            <p><strong>Difficulty:</strong> ${spot.waveDetails.abilityLevel.primary}</p>
            ${spot.waveDetails.abilityLevel.alsoSuitableFor && spot.waveDetails.abilityLevel.alsoSuitableFor.length > 0 ?
                `<p><strong>Also Suitable For:</strong> ${spot.waveDetails.abilityLevel.alsoSuitableFor.join(', ')}</p>` : ''}
        `;
        waveInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(waveInfo);
        
        return content;
    }

    /**
     * Creates conditions content.
     * @param {Object} spot - The surf spot data.
     * @returns {HTMLElement} The conditions content element.
     */
    createConditionsContent(spot) {
        const content = document.createElement('div');
        content.className = 'tab-content';
        content.style.cssText = `
            color: #fff;
        `;
        
        const wave = spot.waveDetails;
        
        // Swell
        const swellTitle = document.createElement('h3');
        swellTitle.textContent = 'Swell';
        swellTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(swellTitle);
        
        const swellInfo = document.createElement('div');
        swellInfo.innerHTML = `
            <p><strong>Best Direction:</strong> ${Array.isArray(wave.bestSwellDirection) ? wave.bestSwellDirection.join(', ') : 'Unknown'}</p>
        `;
        swellInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(swellInfo);
        
        // Wind
        const windTitle = document.createElement('h3');
        windTitle.textContent = 'Wind';
        windTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(windTitle);
        
        const windInfo = document.createElement('div');
        windInfo.innerHTML = `
            <p><strong>Best Direction:</strong> ${Array.isArray(wave.bestWindDirection) ? wave.bestWindDirection.join(', ') : 'Unknown'}</p>
        `;
        windInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(windInfo);
        
        // Tide
        const tideTitle = document.createElement('h3');
        tideTitle.textContent = 'Tide';
        tideTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(tideTitle);
        
        const tideInfo = document.createElement('div');
        tideInfo.innerHTML = `
            <p><strong>Best Tide:</strong> ${Array.isArray(wave.bestTide) ? wave.bestTide.join(', ') : 'Unknown'}</p>
            ${wave.tideNotes ? `<p><strong>Tide Notes:</strong> ${wave.tideNotes}</p>` : ''}
        `;
        tideInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(tideInfo);
        
        // Season
        const seasonTitle = document.createElement('h3');
        seasonTitle.textContent = 'Season';
        seasonTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(seasonTitle);
        
        const seasonInfo = document.createElement('div');
        seasonInfo.innerHTML = `
            <p><strong>Best Season:</strong> ${Array.isArray(wave.bestSeason) ? wave.bestSeason.join(', ') : 'Unknown'}</p>
        `;
        seasonInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(seasonInfo);
        
        // Ideal conditions
        const idealTitle = document.createElement('h3');
        idealTitle.textContent = 'Ideal Conditions';
        idealTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(idealTitle);
        
        const idealInfo = document.createElement('div');
        idealInfo.innerHTML = `
            <p>${wave.idealConditions}</p>
        `;
        idealInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(idealInfo);
        
        return content;
    }

    /**
     * Creates practicalities content.
     * @param {Object} spot - The surf spot data.
     * @returns {HTMLElement} The practicalities content element.
     */
    createPracticalitiesContent(spot) {
        const content = document.createElement('div');
        content.className = 'tab-content';
        content.style.cssText = `
            color: #fff;
        `;
        
        const practicalities = spot.practicalities;
        
        // Access
        const accessTitle = document.createElement('h3');
        accessTitle.textContent = 'Access';
        accessTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(accessTitle);
        
        const accessInfo = document.createElement('div');
        accessInfo.innerHTML = `
            <p>${practicalities.access || 'Information not available'}</p>
        `;
        accessInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(accessInfo);
        
        // Parking
        const parkingTitle = document.createElement('h3');
        parkingTitle.textContent = 'Parking';
        parkingTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(parkingTitle);
        
        const parkingInfo = document.createElement('div');
        parkingInfo.innerHTML = `
            <p>${practicalities.parking || 'Information not available'}</p>
        `;
        parkingInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(parkingInfo);
        
        // Facilities
        const facilitiesTitle = document.createElement('h3');
        facilitiesTitle.textContent = 'Facilities';
        facilitiesTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(facilitiesTitle);
        
        const facilitiesInfo = document.createElement('div');
        facilitiesInfo.innerHTML = `
            <p>${practicalities.facilities || 'Information not available'}</p>
        `;
        facilitiesInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(facilitiesInfo);
        
        // Paddle out
        const paddleTitle = document.createElement('h3');
        paddleTitle.textContent = 'Paddle Out';
        paddleTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(paddleTitle);
        
        const paddleInfo = document.createElement('div');
        paddleInfo.innerHTML = `
            <p>${practicalities.paddleOut || 'Information not available'}</p>
        `;
        paddleInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(paddleInfo);
        
        // Recommended boards
        const boardsTitle = document.createElement('h3');
        boardsTitle.textContent = 'Recommended Boards';
        boardsTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(boardsTitle);
        
        const boardsInfo = document.createElement('div');
        boardsInfo.innerHTML = `
            <p><strong>Recommended Boards:</strong> ${Array.isArray(practicalities.recommendedBoards) ? practicalities.recommendedBoards.join(', ') : 'Unknown'}</p>
            ${practicalities.additionalTips ? `<p><strong>Additional Tips:</strong> ${practicalities.additionalTips}</p>` : ''}
        `;
        boardsInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(boardsInfo);
        
        // Characteristics
        const characteristicsTitle = document.createElement('h3');
        characteristicsTitle.textContent = 'Characteristics';
        characteristicsTitle.style.cssText = `
            color: #FF4D4D;
            margin-bottom: 10px;
            font-size: 18px;
        `;
        content.appendChild(characteristicsTitle);
        
        const characteristicsInfo = document.createElement('div');
        characteristicsInfo.innerHTML = `
            <p><strong>Crowd Factor:</strong> ${spot.characteristics.crowdFactor}</p>
            ${spot.characteristics.crowdNotes ? `<p><strong>Crowd Notes:</strong> ${spot.characteristics.crowdNotes}</p>` : ''}
            <p><strong>Local Vibe:</strong> ${spot.characteristics.localVibe || 'Unknown'}</p>
            <p><strong>Hazards:</strong> ${Array.isArray(spot.characteristics.hazards) ? spot.characteristics.hazards.join(', ') : 'Unknown'}</p>
            <p><strong>Bottom:</strong> ${Array.isArray(spot.characteristics.bottom) ? spot.characteristics.bottom.join(', ') : 'Unknown'}</p>
            <p><strong>Water Quality:</strong> ${spot.characteristics.waterQuality || 'Unknown'}</p>
        `;
        characteristicsInfo.style.cssText = `
            margin-bottom: 20px;
        `;
        content.appendChild(characteristicsInfo);
        
        return content;
    }

    /**
     * Handles tab click events.
     * @param {string} tabId - The tab ID.
     */
    handleTabClick(tabId) {
        this.setActiveTab(tabId);
    }

    /**
     * Sets the active tab.
     * @param {string} tabId - The tab ID.
     */
    setActiveTab(tabId) {
        if (!this.tabContents || !this.tabContents[tabId]) return;
        
        this.activeTab = tabId;
        
        // Update tab buttons
        const tabButtons = this.tabButtonsContainer.querySelectorAll(`.${this.options.tabButtonClass}`);
        tabButtons.forEach(button => {
            const isActive = button.dataset.tab === tabId;
            button.style.color = isActive ? '#fff' : '#aaa';
            button.style.borderBottomColor = isActive ? '#FF4D4D' : 'transparent';
        });
        
        // Update tab content
        this.tabContentContainer.innerHTML = '';
        this.tabContentContainer.appendChild(this.tabContents[tabId]);
    }

    /**
     * Handles close button click.
     */
    handleClose() {
        this.close();
    }

    /**
     * Handles overlay click.
     * @param {MouseEvent} e - The mouse event.
     */
    handleOverlayClick(e) {
        if (e.target === this.modalOverlay) {
            this.close();
        }
    }

    /**
     * Handles keyboard events.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleKeydown(e) {
        if (!this.isOpen) return;
        
        if (e.key === 'Escape') {
            this.close();
        }
    }

    /**
     * Sets the close callback.
     * @param {Function} callback - The callback function.
     */
    setCloseCallback(callback) {
        this.onClose = callback;
    }

    /**
     * Destroys the modal and cleans up resources.
     */
    destroy() {
        // Remove event listeners
        this.removeEventListeners();
        
        // Remove DOM elements
        if (this.modalOverlay && this.modalOverlay.parentNode) {
            this.modalOverlay.parentNode.removeChild(this.modalOverlay);
        }
        
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
        
        // Clear references
        this.modal = null;
        this.modalOverlay = null;
        this.modalContent = null;
        this.modalHeader = null;
        this.modalBody = null;
        this.closeButton = null;
        this.tabButtons = null;
        this.tabContents = null;
        this.currentSpot = null;
        this.onClose = null;
    }
}