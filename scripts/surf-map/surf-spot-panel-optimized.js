/**
 * @class SurfSpotPanelOptimized
 *
 * @description
 * Manages the final, refined surf spot details panel.
 * This class renders the UI with all agreed-upon design improvements.
 *
 * @param {string} containerId - The ID of the DOM element to render the panel into.
 * @param {Array} surfSpots - The array of surf spot data objects.
 */

// SVG Icon constants for reuse
const ICONS = {
    GLOBE: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="icon-globe"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.5 5.033a6.5 6.5 0 1 1 7 5.934 6.5 6.5 0 0 1-7-5.934z"/><path d="M13 5.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5zm-3 4a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5zM5.5 11a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5z"/></svg>`,
    USER: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>`,
    WARNING: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
    SEABED: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-water" viewBox="0 0 16 16"><path d="M.066 6.513a2.25 2.25 0 0 1 2.22-1.934c.796.062 1.49.422 2.034.958.545.536 1.06 1.19 1.598 1.934 1.095 1.523 2.25 3.13 3.286 3.13.955 0 2.02-.983 2.81-2.12.79-.963 1.33-2.013 1.33-2.876 0-.99-.52-1.88-1.32-2.64a3.9 3.9 0 0 0-1.388-.935c-.54-.23-1.14-.345-1.73-.345-1.1 0-2.06.53-2.88 1.48a4.9 4.9 0 0 0-1.18 1.63.5.5 0 1 0 .965.26c.2-.605.54-1.13 1-1.56.46-.43 1.03-.72 1.7-.72.55 0 1.07.18 1.5.45.69.44 1.05 1.22 1.05 2.14 0 .7-.4 1.5-1.1 2.35-.7.85-1.6 1.65-2.5 1.65-.8 0-1.6-.7-2.5-1.85-.9-1.15-1.8-2.2-2.6-2.2-.7 0-1.3.4-1.8 1-.5.6-1.1 1.3-1.8 1.3-.8 0-1.4-1-1.4-2.3z"/></svg>`
};

export class SurfSpotPanelOptimized {
    constructor(containerId, surfSpots) {
        this.panelContainer = document.getElementById(containerId);
        this.staticSpotsData = surfSpots;
        this.realTimeSpotsData = [];
        this.currentSpot = null;
        this.isPanelOpen = false;

        if (!this.panelContainer) {
            console.error(`[SurfSpotPanelOptimized] Container with id #${containerId} not found.`);
            return;
        }
        this._loadRealTimeData();
    }

    async _loadRealTimeData() {
        try {
            const response = await fetch('data/surf-spot-real-time.json');
            const data = await response.json();
            this.realTimeSpotsData = data.spots;
        } catch (error) {
            console.error('[SurfSpotPanelOptimized] Failed to load real-time surf spot data:', error);
        }
    }

    show(spotId) {
        const staticData = this.staticSpotsData.find(spot => spot.id === spotId);
        const realTimeData = this.realTimeSpotsData.find(spot => spot.id === spotId);

        if (!staticData) {
            console.error(`[SurfSpotPanelOptimized] Surf spot with id "${spotId}" not found.`);
            return;
        }

        this.currentSpot = { ...staticData, realTime: realTimeData?.realTime };
        this.isPanelOpen = true;
        this.panelContainer.innerHTML = this._generatePanelHTML();
        this._addEventListeners();
        
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('side-panel-overlay');
        sidePanel.classList.add('active');
        panelOverlay.classList.add('active');
    }

    hide() {
        this.isPanelOpen = false;
        this.panelContainer.innerHTML = '';
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('side-panel-overlay');
        sidePanel.classList.remove('active');
        panelOverlay.classList.remove('active');
    }

    _generatePanelHTML() {
        const spot = this.currentSpot;
        const panelTitle = document.getElementById('side-panel-title');
        if (panelTitle) {
            panelTitle.textContent = spot.primaryName;
        }

        const alternativeNamesHTML = spot.alternativeNames && spot.alternativeNames.length > 0
            ? `<div class="alternative-names">${spot.alternativeNames.join(' / ')}</div>`
            : '';

        return `
            ${alternativeNamesHTML}
            <article class="surf-spot-panel-optimized" id="surf-spot-panel-${spot.id}">
                ${this._createHero(spot)}
                <div class="surf-spot-panel__content">
                    ${this._createTabNavigation(spot)}
                    ${this._createTabPanels(spot)}
                </div>
            </article>
        `;
    }

    _createHero(spot) {
        const heroImage = `images/surf-spots/${spot.id}.webp`;
        const placeholderImage = 'images/surf-spots/a-surf-spot-placeholder.webp';
        const { lat, lng } = spot.location.coordinates;

        return `
            <figure class="surf-spot-panel__hero">
                <img src="${heroImage}" alt="Surfing at ${spot.primaryName}" class="surf-spot-panel__hero-img" loading="lazy" onerror="this.src='${placeholderImage}'; this.onerror=null;">
                <div class="surf-spot-panel__hero-overlay top-left">
                    <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" class="gps-link">
                        ${ICONS.GLOBE}
                        <span>${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                    </a>
                </div>
                <figcaption class="surf-spot-panel__hero-overlay bottom-right">
                    <span class="surf-spot-panel__hero-tag">${spot.waveDetails.type.join(' / ')}</span>
                    <span class="surf-spot-panel__hero-tag surf-spot-panel__hero-tag--difficulty-${spot.waveDetails.abilityLevel.primary.toLowerCase()}">${spot.waveDetails.abilityLevel.primary}</span>
                </figcaption>
            </figure>
        `;
    }

    _createTabNavigation(spot) {
        return `
            <div class="surf-spot-panel__tab-nav" role="tablist" aria-label="Surf Spot Details">
                <button id="tab-vibe-${spot.id}" role="tab" aria-selected="true" aria-controls="tabpanel-vibe-${spot.id}" class="surf-spot-panel__tab-btn is-active">The Vibe</button>
                <button id="tab-wave-${spot.id}" role="tab" aria-selected="false" aria-controls="tabpanel-wave-${spot.id}" class="surf-spot-panel__tab-btn">The Wave</button>
                <button id="tab-trip-${spot.id}" role="tab" aria-selected="false" aria-controls="tabpanel-trip-${spot.id}" class="surf-spot-panel__tab-btn">The Trip</button>
            </div>
        `;
    }

    _createTabPanels(spot) {
        return `
            <div class="surf-spot-panel__tab-content">
                <div id="tabpanel-vibe-${spot.id}" role="tabpanel" aria-labelledby="tab-vibe-${spot.id}" class="surf-spot-panel__tab-panel is-active">
                    ${this._createVibePanel(spot)}
                </div>
                <div id="tabpanel-wave-${spot.id}" role="tabpanel" aria-labelledby="tab-wave-${spot.id}" class="surf-spot-panel__tab-panel" hidden>
                    ${this._createWavePanel(spot)}
                </div>
                <div id="tabpanel-trip-${spot.id}" role="tabpanel" aria-labelledby="tab-trip-${spot.id}" class="surf-spot-panel__tab-panel" hidden>
                    ${this._createTripPanel(spot)}
                </div>
            </div>
        `;
    }

    _createVibePanel(spot) {
        const seasonMap = { "Spring": [2, 3, 4], "Summer": [5, 6, 7], "Autumn": [8, 9, 10], "Winter": [11, 0, 1] };
        const activeMonths = spot.waveDetails.bestSeason.flatMap(season => seasonMap[season] || []);
        
        return `
            <p class="panel-section__description">${spot.description}</p>
            <div class="panel-section">
                ${this._createSeasonChart(activeMonths)}
            </div>
            <div class="info-grid">
                <div class="info-grid-item">
                    <span class="info-grid-item__label">Crowds</span>
                    <div class="crowd-icons">${this._createCrowdIcons(spot.characteristics.crowdFactor)}</div>
                </div>
                <div class="info-grid-item">
                    <span class="info-grid-item__label">Seabed</span>
                    <div class="seabed-info">${ICONS.SEABED}<span>${spot.characteristics.bottom.join(', ')}</span></div>
                </div>
            </div>
            <div class="panel-section">
                <ul class="icon-list">
                    ${spot.characteristics.hazards.map(hazard => `<li class="hazard-item">${ICONS.WARNING}<span>${hazard}</span></li>`).join('')}
                </ul>
            </div>
            <div class="panel-section">
                <h3 class="panel-section__title">Local Vibe</h3>
                <p class="panel-section__description">${spot.characteristics.localVibe}</p>
            </div>
        `;
    }

    _createWavePanel(spot) {
        const tideMap = { "Low": ["low"], "Mid": ["rising", "ebbing"], "High": ["high"] };
        const activeTides = spot.waveDetails.bestTide.flatMap(tide => tideMap[tide] || []);

        return `
            <p class="panel-section__description">${spot.waveDetails.idealConditions}</p>
            <div class="panel-section">
                <h3 class="panel-section__title">Paddle Out</h3>
                <p class="panel-section__description">${spot.practicalities.paddleOut}</p>
            </div>
            <div class="panel-grid-double">
                <div class="panel-grid-item compass-container--swell">
                    <h4 class="panel-grid-item__title">Best Swell</h4>
                    ${this._createCompass('swell', spot.waveDetails.bestSwellDirection, spot.realTime?.waveDirection)}
                </div>
                <div class="panel-grid-item compass-container--wind">
                    <h4 class="panel-grid-item__title">Best Wind</h4>
                    ${this._createCompass('wind', spot.waveDetails.bestWindDirection, spot.realTime?.windDirection)}
                </div>
            </div>
            <div class="panel-section">
                <h3 class="panel-section__title">Best Tide</h3>
                ${this._createTideChart(activeTides, spot.realTime?.tide)}
            </div>
            <div class="panel-section">
                <h3 class="panel-section__title">Recommended Boards</h3>
                <p class="panel-section__description">${spot.practicalities.recommendedBoards.join(', ')}</p>
            </div>
        `;
    }

    _createTripPanel(spot) {
        const location = spot.location.area === 'Offshore' ? spot.location.area : `${spot.location.area} Coast`;
        return `
            <div class="panel-section">
                <h3 class="panel-section__title">Location</h3>
                <p class="panel-section__description">${location} - Near ${spot.location.nearestTowns.join(', ')}</p>
            </div>
            <div class="panel-section">
                <h3 class="panel-section__title">Access & Parking</h3>
                <p class="panel-section__description">${spot.practicalities.access}</p>
            </div>
            <div class="panel-section">
                <h3 class="panel-section__title">Facilities</h3>
                <p class="panel-section__description">${spot.practicalities.facilities}</p>
            </div>
            ${spot.practicalities.additionalTips ? `
            <div class="panel-section">
                <h3 class="panel-section__title">Insider Tips</h3>
                <p class="panel-section__description">${spot.practicalities.additionalTips}</p>
            </div>` : ''}
        `;
    }

    _createSeasonChart(activeMonths) {
        const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        const currentMonth = new Date().getMonth();
        let chartHTML = '<div class="season-chart">';
        months.forEach((month, i) => {
            const isActive = activeMonths.includes(i) ? 'is-active' : '';
            const isCurrent = i === currentMonth ? 'is-current-month' : '';
            chartHTML += `<div class="season-month ${isActive} ${isCurrent}" title="${months[i]}"><span>${month}</span></div>`;
        });
        chartHTML += '</div>';
        return chartHTML;
    }
    
    _createCrowdIcons(crowdFactor) {
        const level = crowdFactor.toLowerCase();
        if (level === 'high' || level === 'crowded') return ICONS.USER.repeat(3);
        if (level === 'medium') return ICONS.USER.repeat(2);
        return ICONS.USER;
    }

    _createCompass(type, bestDirections, realTimeDirection) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const radius = 45;
        const center = 60;

        let segments = '';
        directions.forEach((dir, i) => {
            const isActive = bestDirections.includes(dir) ? 'is-active' : '';
            segments += `<path class="compass-segment ${isActive}" d="${this._getCompassSegmentPath(i, center, radius)}" data-direction="${dir}"></path>`;
        });

        let labels = '';
        directions.forEach((dir, i) => {
            const angle = i * 45 - 90;
            const labelRadius = radius + 10;
            const x = center + labelRadius * Math.cos(Math.PI * angle / 180);
            const y = center + labelRadius * Math.sin(Math.PI * angle / 180);
            labels += `<text x="${x}" y="${y}" class="compass-label">${dir}</text>`;
        });

        let realTimeMarker = '';
        if (realTimeDirection) {
            const angle = directions.indexOf(realTimeDirection) * 45;
            realTimeMarker = `<g transform="rotate(${angle} ${center} ${center})"><path class="real-time-arrow" d="M ${center} 22 L ${center-4} 32 L ${center+4} 32 Z"></path></g>`;
        }

        return `
            <div class="compass-container">
                <svg class="compass" viewBox="0 0 120 120">
                    <circle cx="${center}" cy="${center}" r="${radius}" class="compass-bg" />
                    ${segments}
                    <circle cx="${center}" cy="${center}" r="20" class="compass-inner-circle" />
                    ${labels}
                    ${realTimeMarker}
                </svg>
            </div>
        `;
    }
    
    _getCompassSegmentPath(index, center, radius) {
        const angle = 45;
        const startAngle = index * angle - angle / 2 - 90;
        const endAngle = startAngle + angle;
        const x1 = center + radius * Math.cos(Math.PI * startAngle / 180);
        const y1 = center + radius * Math.sin(Math.PI * startAngle / 180);
        const x2 = center + radius * Math.cos(Math.PI * endAngle / 180);
        const y2 = center + radius * Math.sin(Math.PI * endAngle / 180);
        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    }

    _createTideChart(activeTides, realTimeTide) {
        const phases = [ { name: 'low', label: 'Low' }, { name: 'rising', label: 'Rising' }, { name: 'high', label: 'High' }, { name: 'ebbing', label: 'Ebbing' }];
        const path = "M 0 10 Q 25 0, 50 10 T 100 10";
        
        let backgroundPath = '';
        if (activeTides.length > 0) {
            const tideToX = { low: 0, rising: 25, high: 50, ebbing: 75 };
            backgroundPath = activeTides.map(tide => {
                const startX = tideToX[tide];
                const endX = startX + 25;
                // Create a path that goes from the bottom, up to the wave, along the wave, and back down
                return `M ${startX},20 L ${startX},10 Q ${startX + 12.5},${tide === 'rising' ? 0 : (tide === 'ebbing' ? 20 : 10)} ${startX + 25},10 L ${endX},20 Z`;
            }).join(' ');
        }

        let realTimeMarker = '';
        if (realTimeTide && realTimeTide.level !== null) {
            const x = realTimeTide.level * 100;
            const yOnWave = 10 - 10 * Math.cos(Math.PI * realTimeTide.level);
            realTimeMarker = `
                <line x1="${x}" y1="20" x2="${x}" y2="${yOnWave}" class="real-time-tide-line" />
                <circle cx="${x}" cy="${yOnWave}" r="3" class="real-time-tide-marker" />
            `;
        }

        return `
            <div class="tide-chart-container">
                <div class="tide-phases">
                    ${phases.map(p => `<div class="tide-phase ${activeTides.includes(p.name) ? 'is-active' : ''}">${p.label}</div>`).join('')}
                </div>
                <svg class="tide-wave" viewBox="0 0 100 20">
                    <path d="${backgroundPath}" class="tide-wave-bg" />
                    <path d="${path}" class="tide-wave-fg" />
                    ${realTimeMarker}
                </svg>
            </div>
        `;
    }

    _addEventListeners() {
        const panel = this.panelContainer.querySelector('.surf-spot-panel-optimized');
        if (!panel) return;

        const closeButton = document.querySelector('.close-panel-btn');
        if (closeButton) {
            closeButton.onclick = () => this.hide();
        }
        
        const panelOverlay = document.getElementById('side-panel-overlay');
        if (panelOverlay) {
            panelOverlay.onclick = () => this.hide();
        }

        const tablist = panel.querySelector('[role="tablist"]');
        if (!tablist) return;

        tablist.addEventListener('click', (e) => {
            const targetTab = e.target.closest('[role="tab"]');
            if (!targetTab) return;
            this._switchTab(targetTab);
        });

        tablist.addEventListener('keydown', (e) => {
            const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
            const activeTabIndex = tabs.findIndex(tab => tab.classList.contains('is-active'));

            let newIndex = activeTabIndex;
            if (e.key === 'ArrowRight') {
                newIndex = (activeTabIndex + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                newIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
            } else {
                return;
            }

            tabs[newIndex].focus();
            this._switchTab(tabs[newIndex]);
        });
    }

    _switchTab(targetTab) {
        const tablist = targetTab.parentElement;
        const tabs = tablist.querySelectorAll('[role="tab"]');
        const panel = this.panelContainer.querySelector('.surf-spot-panel-optimized');
        const tabPanels = panel.querySelectorAll('[role="tabpanel"]');

        tabs.forEach(tab => {
            tab.classList.remove('is-active');
            tab.setAttribute('aria-selected', 'false');
        });

        targetTab.classList.add('is-active');
        targetTab.setAttribute('aria-selected', 'true');

        const controls = targetTab.getAttribute('aria-controls');
        tabPanels.forEach(panel => {
            if (panel.id === controls) {
                panel.hidden = false;
                panel.classList.add('is-active');
            } else {
                panel.hidden = true;
                panel.classList.remove('is-active');
            }
        });
    }
}
