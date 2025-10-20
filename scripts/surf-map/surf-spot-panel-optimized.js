/**
 * @class SurfSpotPanelOptimized
 * @version 1.0.1
 *
 * @description
 * Manages the enhanced, component-based surf spot details panel.
 * This class is responsible for rendering the panel's UI, handling state,
 * and managing user interactions based on the architecture defined in
 * `doc/surf-spot-panel-plan.md`.
 *
 * @param {string} containerId - The ID of the DOM element to render the panel into.
 * @param {Array} surfSpots - The array of surf spot data objects.
 */
export class SurfSpotPanelOptimized {
  constructor(containerId, surfSpots) {
    this.panelContainer = document.getElementById(containerId);
    this.surfSpots = surfSpots;
    this.currentSpot = null;
    this.isPanelOpen = false;

    if (!this.panelContainer) {
      console.error(`[SurfSpotPanelOptimized] Container with id #${containerId} not found.`);
      return;
    }
  }

  // Methods for rendering, showing, hiding, and interacting with the panel will be added here.
  show(spotId) {
    this.currentSpot = this.surfSpots.find(spot => spot.id === spotId);
    if (!this.currentSpot) {
      console.error(`[SurfSpotPanelOptimized] Surf spot with id "${spotId}" not found.`);
      return;
    }

    this.isPanelOpen = true;
    this.panelContainer.innerHTML = this._generatePanelHTML();
    this._addEventListeners();
  }

  hide() {
    this.isPanelOpen = false;
    this.panelContainer.innerHTML = '';
  }

  _generatePanelHTML() {
    const spot = this.currentSpot;
    return `
      <article class="surf-spot-panel" id="surf-spot-panel-${spot.id}" aria-labelledby="surf-spot-panel-title-${spot.id}">
        ${this._createHeader(spot)}
        ${this._createHero(spot)}
        <div class="surf-spot-panel__content">
          ${this._createTabNavigation(spot)}
          ${this._createTabPanels(spot)}
        </div>
        ${this._createFooter(spot)}
      </article>
    `;
  }

  _createHeader(spot) {
    const alternativeNames = spot.alternativeNames.length ? spot.alternativeNames.join(' / ') : '';
    return `
      <header class="surf-spot-panel__header">
        <div class="surf-spot-panel__title-container">
          <h1 id="surf-spot-panel-title-${spot.id}" class="surf-spot-panel__spot-name">${spot.primaryName}</h1>
          ${alternativeNames ? `<p class="surf-spot-panel__alternative-names">${alternativeNames}</p>` : ''}
        </div>
        <button class="surf-spot-panel__close-btn" aria-label="Close surf spot details">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </header>
    `;
  }

  _createHero(spot) {
    const heroImage = `images/surf-spots/${spot.id}.webp`;
    const placeholderImage = 'images/surf-spots/a-surf-spot-placeholder.webp';
    return `
      <figure class="surf-spot-panel__hero">
        <img src="${heroImage}"
             alt="Surfing at ${spot.primaryName}"
             class="surf-spot-panel__hero-img"
             loading="lazy"
             onerror="this.src='${placeholderImage}'; this.onerror=null;">
        <figcaption class="surf-spot-panel__hero-caption">
          <span class="surf-spot-panel__hero-tag">${spot.location.area}</span>
          <span class="surf-spot-panel__hero-tag surf-spot-panel__hero-tag--difficulty-${spot.waveDetails.abilityLevel.primary.toLowerCase()}">${spot.waveDetails.abilityLevel.primary}</span>
          <span class="surf-spot-panel__hero-tag">${spot.waveDetails.type.join(' / ')}</span>
        </figcaption>
      </figure>
    `;
  }

  _createTabNavigation(spot) {
    return `
      <div class="surf-spot-panel__tab-nav" role="tablist" aria-label="Surf Spot Details">
        <button id="tab-overview-${spot.id}" role="tab" aria-selected="true" aria-controls="tabpanel-overview-${spot.id}" class="surf-spot-panel__tab-btn is-active">Overview</button>
        <button id="tab-conditions-${spot.id}" role="tab" aria-selected="false" aria-controls="tabpanel-conditions-${spot.id}" class="surf-spot-panel__tab-btn">Conditions</button>
        <button id="tab-practicalities-${spot.id}" role="tab" aria-selected="false" aria-controls="tabpanel-practicalities-${spot.id}" class="surf-spot-panel__tab-btn">Practicalities</button>
      </div>
    `;
  }

  _createTabPanels(spot) {
    return `
      <div class="surf-spot-panel__tab-content">
        <div id="tabpanel-overview-${spot.id}" role="tabpanel" aria-labelledby="tab-overview-${spot.id}" class="surf-spot-panel__tab-panel is-active">
          ${this._createOverviewPanel(spot)}
        </div>
        <div id="tabpanel-conditions-${spot.id}" role="tabpanel" aria-labelledby="tab-conditions-${spot.id}" class="surf-spot-panel__tab-panel" hidden>
          <p>Conditions content goes here.</p>
        </div>
        <div id="tabpanel-practicalities-${spot.id}" role="tabpanel" aria-labelledby="tab-practicalities-${spot.id}" class="surf-spot-panel__tab-panel" hidden>
          <p>Practicalities content goes here.</p>
        </div>
      </div>
    `;
  }

  _createOverviewPanel(spot) {
    return `
      <div class="panel-section">
        <h2 class="panel-section__title">Description</h2>
        <p>${spot.description}</p>
      </div>
      <div class="panel-section">
        <h2 class="panel-section__title">Ideal Conditions</h2>
        <p>${spot.waveDetails.idealConditions}</p>
      </div>
      <div class="panel-section">
        <h2 class="panel-section__title">Hazards</h2>
        <ul class="icon-list">
          ${spot.characteristics.hazards.map(hazard => `<li>${hazard}</li>`).join('')}
        </ul>
      </div>
       <div class="panel-section">
        <h2 class="panel-section__title">Local Vibe</h2>
        <p>${spot.characteristics.localVibe}</p>
      </div>
    `;
  }

  _createFooter(spot) {
    return `
      <footer class="surf-spot-panel__footer">
        <div class="surf-spot-panel__footer-item">
          <span class="surf-spot-panel__footer-label">GPS</span>
          <button class="surf-spot-panel__footer-action" data-lat="${spot.location.coordinates.lat}" data-lng="${spot.location.coordinates.lng}">
            ${spot.location.coordinates.lat}, ${spot.location.coordinates.lng} (Copy)
          </button>
        </div>
        <div class="surf-spot-panel__footer-item">
           <button class="surf-spot-panel__footer-action surf-spot-panel__share-btn">Share</button>
        </div>
      </footer>
    `;
  }

  _addEventListeners() {
    const panel = this.panelContainer.querySelector('.surf-spot-panel');
    if (!panel) return;

    const closeButton = panel.querySelector('.surf-spot-panel__close-btn');
    closeButton.addEventListener('click', () => this.hide());

    const tablist = panel.querySelector('[role="tablist"]');
    const tabs = tablist.querySelectorAll('[role="tab"]');
    const tabPanels = panel.querySelectorAll('[role="tabpanel"]');

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
      const panel = tablist.closest('.surf-spot-panel');
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
        } else {
          panel.hidden = true;
        }
      });
  }
}