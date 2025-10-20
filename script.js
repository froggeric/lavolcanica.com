/**
 * @fileoverview Main application script for La Sonora Volcánica website.
 * @version 1.8.5
 * @description This script handles the entire frontend logic for the La Sonora Volcánica website,
 * The application follows a modular architecture where all content is loaded from external
 * data modules located in the `/data` directory.
 *
 * Key Features:
 * - Dynamic content population from JSON-like data modules
 * - Single-page application (SPA) behavior with side panels
 * - Embedded audio player with custom controls
 * - Internationalization (i18n) support
 * - Responsive design with mobile navigation
 * - Accessibility features (keyboard navigation, ARIA attributes)
 * - Performance optimizations (lazy loading, debouncing, intersection observers)
 *
 * @author Frédéric Guigand
 * @since 2025
 */

// IIFE (Immediately Invoked Function Expression) to create a private scope
// and prevent polluting the global namespace.
(function() {
    'use strict'; // Enforces stricter parsing and error handling in JavaScript.

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Sanitizes a string to prevent XSS attacks by escaping HTML entities.
     * @param {string} str - The string to sanitize.
     * @returns {string} The sanitized HTML string.
     */
    const sanitizeHTML = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    /**
     * Creates a debounced version of a function that delays execution until after
     * a specified wait time has elapsed since the last time it was invoked.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    /**
     * Creates an SVG icon element with proper namespace.
     * @param {string} iconId - The ID of the SVG symbol to reference.
     * @returns {SVGElement} The created SVG element.
     */
    const createSVGIcon = (iconId) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('icon');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', `#${iconId}`);
        svg.appendChild(use);
        return svg;
    };

    /**
     * Scroll lock utility to prevent background scrolling when modals or panels are open.
     * This prevents layout shift by maintaining the scrollbar width and scroll position.
     */
    const scrollLock = {
        /** Enables scroll lock by adding the 'scroll-lock' class to the HTML element. */
        enable() {
            const html = document.documentElement;
            const scrollY = window.scrollY;
            
            html.classList.add('scroll-lock');
            // Restore scroll position (safety measure)
            window.scrollTo(0, scrollY);
        },
        
        /** Disables scroll lock by removing the 'scroll-lock' class from the HTML element. */
        disable() {
            const html = document.documentElement;
            const scrollY = window.scrollY;
            
            html.classList.remove('scroll-lock');
            // Restore scroll position (safety measure)
            window.scrollTo(0, scrollY);
        }
    };

    // ==================== NAVIGATION HISTORY MANAGEMENT ====================

    /**
     * Navigation history management using URL parameters
     * Tracks where users came from to enable smart navigation back
     */
    const navigationHistory = {
        /**
         * Sets the navigation context in URL parameters
         * @param {string} context - The context to set (discography, collaborator, main, surfmap)
         */
        setContext(context) {
            const url = new URL(window.location);
            url.searchParams.set('returnTo', context);
            window.history.replaceState({}, '', url);
        },

        /**
         * Gets the current navigation context from URL parameters
         * @returns {string|null} The current context or null if not set
         */
        getContext() {
            const url = new URL(window.location);
            return url.searchParams.get('returnTo');
        },

        /**
         * Clears the navigation context from URL parameters
         */
        clearContext() {
            const url = new URL(window.location);
            url.searchParams.delete('returnTo');
            window.history.replaceState({}, '', url);
        }
    };

    // ==================== INITIALIZATION ====================

    /**
     * Initializes the application when the DOM is fully loaded.
     * Sets up the data loader and starts the application.
     */
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize scrollbar width calculation for scroll lock
        document.documentElement.classList.add('scroll-lock-init');

        // Import the data loader module
        import('./scripts/data-loader.js').then(({ dataLoader }) => {
            initializeApp(dataLoader);
        }).catch(error => {
            console.error('Failed to load modules:', error);
        });
    });

    /**
     * Main application initialization function.
     * Sets up all UI components, event listeners, and populates initial content.
     * @param {Object} dataLoader - The data loader instance with access to all content.
     */
    const initializeApp = async (dataLoader) => {
        // Initialize with default language from configuration
        let currentLang = dataLoader.config.app.defaultLanguage;
        let translations = {};
        
        try {
            // Load default language translations
            translations = await dataLoader.loadTranslations(currentLang);
        } catch (error) {
            console.error('Failed to load translations:', error);
        }

        // Initialize the lyrics cache manager with configuration
        const lyricsCacheManager = new LyricsCacheManager({
            maxMemoryCacheSize: dataLoader.config.app.lyricsCache?.maxMemoryCacheSize || 50,
            maxSessionStorageSize: dataLoader.config.app.lyricsCache?.maxSessionStorageSize || 100,
            sessionStorageKey: dataLoader.config.app.lyricsCache?.sessionStorageKey || 'lyricsCache',
            cleanupThreshold: dataLoader.config.app.lyricsCache?.cleanupThreshold || 0.8
        });

        // Set global reference to cache manager
        window.lyricsCacheManager = lyricsCacheManager;

        // Initialize the lyrics language manager with cache manager
        const lyricsLanguageManager = new LyricsLanguageManager(currentLang, lyricsCacheManager);

        // ==================== DOM ELEMENT CACHING ====================
        // Cache frequently used DOM elements for better performance
        const body = document.body;
        const musicGrid = document.querySelector('.music-grid');
        const collabsGrid = document.querySelector('.collabs-grid');
        const mainNav = document.querySelector('.main-nav');

        // ==================== NAVIGATION HELPERS ====================
        
        /**
         * Helper functions for navigation context management
         * Defined inside initializeApp to have access to dataLoader and DOM elements
         */
        const navigationHelpers = {
            /**
             * Gets the currently displayed collaborator ID
             * @returns {string|null} The collaborator ID or null if not in collaborator panel
             */
            getCurrentCollaboratorId() {
                if (!sidePanel || !sidePanel.classList.contains('active')) return null;
                
                const panelTitle = sidePanel.querySelector('.side-panel-title');
                if (panelTitle && !panelTitle.dataset.key) {
                    // This is a collaborator panel (no translation key)
                    const collab = dataLoader.collaborators.find(c => c.name === panelTitle.textContent);
                    return collab ? collab.id : null;
                }
                return null;
            },

            /**
             * Gets the stored collaborator ID from session storage
             * @returns {string|null} The stored collaborator ID or null
             */
            getStoredCollaboratorId() {
                return sessionStorage.getItem('lastCollaboratorId');
            },

            /**
             * Stores the collaborator ID in session storage
             * @param {string} collabId - The collaborator ID to store
             */
            storeCollaboratorId(collabId) {
                if (collabId) {
                    sessionStorage.setItem('lastCollaboratorId', collabId);
                }
            },

            /**
             * Determines the current navigation context
             * @returns {string} The current context (discography, collaborator, or main)
             */
            getCurrentContext() {
                if (!sidePanel || !sidePanel.classList.contains('active')) {
                    return 'main';
                }
                
                // Check if it's the discography panel
                const panelTitle = sidePanel.querySelector('.side-panel-title');
                if (panelTitle && panelTitle.dataset.key === 'fullDiscographyTitle') {
                    return 'discography';
                }
                
                // Check if it's a collaborator panel (no translation key)
                if (panelTitle && !panelTitle.dataset.key) {
                    return 'collaborator';
                }
                
                // Default to main for other cases
                return 'main';
            }
        };

        // ==================== CONTENT POPULATION FUNCTIONS ====================

        /**
         * Creates a music card element for displaying release information.
         * @param {Object} release - The release data object.
         * @param {boolean} [isFeatured=false] - Whether this is a featured release card.
         * @param {boolean} [disableTitleAction=false] - Whether to disable title click action.
         * @returns {HTMLElement} The created music card element.
         */
        function createMusicCard(release, isFeatured = false, disableTitleAction = false) {
            const card = document.createElement('div');
            card.className = 'music-card';
            
            const img = document.createElement('img');
            img.src = release.coverArt;
            img.alt = `Cover art for ${release.title}`;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.setAttribute('data-action', 'play-track');
            
            // Fallback for missing images
            img.onerror = () => {
                img.src = 'images/placeholder-album.svg';
                img.alt = 'Album artwork unavailable';
            };
            
            card.appendChild(img);
            
            // Use platform configuration from data loader
            const platforms = dataLoader.config.platforms;
            
            if (isFeatured) {
                const overlay = document.createElement('div');
                overlay.className = 'music-card-overlay';
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'music-card-info';
                
                const title = document.createElement('h3');
                title.className = 'music-card-title';
                title.textContent = release.title;
                if (!disableTitleAction) {
                    title.setAttribute('data-action', 'open-release-panel');
                    title.setAttribute('data-release-title', release.title);
                }
                
                const year = document.createElement('p');
                year.className = 'music-card-year';
                year.textContent = release.year;
                
                infoDiv.appendChild(title);
                infoDiv.appendChild(year);
                
                const linksDiv = document.createElement('div');
                linksDiv.className = 'streaming-links';
                
                // Create streaming links for all platforms
                platforms.forEach(platform => {
                    // Only create link if it has a valid URL (not '#' or empty)
                    if (release.links[platform.key] && release.links[platform.key] !== '#') {
                        const link = document.createElement('a');
                        link.href = release.links[platform.key];
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.className = 'tooltip';
                        link.setAttribute('data-tooltip', platform.tooltip);
                        link.setAttribute('aria-label', `Listen to ${release.title} on ${platform.tooltip}`);
                        
                        // Use SVG namespace for creating SVG elements
                        const svg = createSVGIcon(platform.icon);
                        link.appendChild(svg);
                        linksDiv.appendChild(link);
                    }
                });
                
                overlay.appendChild(infoDiv);
                overlay.appendChild(linksDiv);
                card.appendChild(overlay);
            } else {
                // For discography list - new layout with streaming links in bottom right corner
                card.appendChild(img);
                
                // Create a container for the text and links
                // <div class="music-card-content">
                const contentContainer = document.createElement('div');
                contentContainer.className = 'music-card-content';
                
                // Create a container for the title
                // <div class="music-card-title-container">
                const titleContainer = document.createElement('div');
                titleContainer.className = 'music-card-title-container';
                
                const title = document.createElement('h3');
                title.className = 'music-card-title';
                title.textContent = release.title;
                if (!disableTitleAction) {
                    title.setAttribute('data-action', 'open-release-panel');
                    title.setAttribute('data-release-title', release.title);
                }
                
                titleContainer.appendChild(title);
                
                // Create streaming links container for bottom right corner
                const linksDiv = document.createElement('div');
                linksDiv.className = 'streaming-links-bottom';
                
                // Create streaming links for all platforms (same as featured)
                platforms.forEach(platform => {
                    // Only create link if it has a valid URL (not '#' or empty)
                    if (release.links[platform.key] && release.links[platform.key] !== '#') {
                        const link = document.createElement('a');
                        link.href = release.links[platform.key];
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.className = 'tooltip';
                        link.setAttribute('data-tooltip', platform.tooltip);
                        link.setAttribute('aria-label', `Listen to ${release.title} on ${platform.tooltip}`);
                        
                        // Use SVG namespace for creating SVG elements
                        const svg = createSVGIcon(platform.icon);
                        link.appendChild(svg);
                        linksDiv.appendChild(link);
                    }
                });
                
                contentContainer.appendChild(titleContainer);
                contentContainer.appendChild(linksDiv);
                card.appendChild(contentContainer);
            }
            
            return card;
        }

        /**
         * Populates the featured releases grid on the main page.
         * Shows skeleton loaders first for better UX, then loads actual content.
         */
        function populateFeaturedGrid() {
            if (!musicGrid) return;
            
            // Show skeleton loaders immediately to improve perceived performance
            musicGrid.innerHTML = '';
            for (let i = 0; i < dataLoader.config.app.featuredReleaseCount; i++) {
                musicGrid.appendChild(createSkeletonMusicCard());
            }

            // Simulate network delay to show skeletons, then load actual content
            setTimeout(() => {
                const fragment = document.createDocumentFragment();
                const featuredReleases = dataLoader.getFeaturedReleases();
                
                featuredReleases.forEach(release => {
                    const card = createMusicCard(release, true);
                    fragment.appendChild(card);
                });
                
                musicGrid.innerHTML = '';
                musicGrid.appendChild(fragment);
            }, dataLoader.config.app.skeletonLoaderDelay);
        }

        /**
         * Populates the full discography list inside the side panel.
         * @param {HTMLElement} listContainer - The container element for the discography list.
         */
        function populateDiscographyList(listContainer) {
            if (!listContainer) return;
            
            const fragment = document.createDocumentFragment();
            
            dataLoader.releases.forEach(release => {
                const card = createMusicCard(release, false);
                fragment.appendChild(card);
            });
            
            listContainer.innerHTML = '';
            listContainer.appendChild(fragment);
        }

        /**
         * Creates a collaborator card element for displaying collaborator information.
         * @param {Object} collab - The collaborator data object.
         * @returns {HTMLElement} The created collaborator card element.
         */
        function createCollaboratorCard(collab) {
            const card = document.createElement('div');
            card.className = 'collab-card';
            card.setAttribute('data-action', 'open-collab-panel');
            card.setAttribute('data-collab-id', collab.id);
            card.tabIndex = 0; // Make focusable for keyboard navigation
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${collab.name}`);
            
            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
            
            const img = document.createElement('img');
            img.src = collab.photoSrc;
            img.alt = `Photo of ${collab.name}`;
            img.className = 'collab-card-photo';
            img.loading = 'lazy';
            img.decoding = 'async';
            
            // Fallback for missing images
            img.onerror = () => {
                img.src = 'images/placeholder-person.svg';
                img.alt = 'Photo unavailable';
            };
            
            const name = document.createElement('h3');
            name.className = 'collab-card-name';
            name.textContent = collab.name;
            
            card.appendChild(img);
            card.appendChild(name);
            
            return card;
        }
        
        // ==================== SKELETON LOADER FUNCTIONS ====================

        /**
         * Creates a skeleton loader card for music releases.
         * @returns {HTMLElement} The skeleton music card element.
         */
        function createSkeletonMusicCard() {
            const card = document.createElement('div');
            card.className = 'music-card skeleton-card';
            const img = document.createElement('div');
            img.className = 'skeleton skeleton-image';
            card.appendChild(img);
            return card;
        }

        /**
         * Creates a skeleton loader card for collaborators.
         * @returns {HTMLElement} The skeleton collaborator card element.
         */
        function createSkeletonCollabCard() {
            const card = document.createElement('div');
            card.className = 'skeleton-card';
            const avatar = document.createElement('div');
            avatar.className = 'skeleton skeleton-avatar';
            const text = document.createElement('div');
            text.className = 'skeleton skeleton-text short';
            card.appendChild(avatar);
            card.appendChild(text);
            return card;
        }

        /**
         * Populates the collaborators grid on the main page.
         * Shows skeleton loaders first for better UX, then loads actual content.
         */
        function populateCollabsGrid() {
            if (!collabsGrid) return;

            // Show skeleton loaders immediately to improve perceived performance
            collabsGrid.innerHTML = '';
            for (let i = 0; i < dataLoader.collaborators.length; i++) {
                collabsGrid.appendChild(createSkeletonCollabCard());
            }

            // Simulate network delay to show skeletons, then load actual content
            setTimeout(() => {
                const fragment = document.createDocumentFragment();
                
                dataLoader.collaborators.forEach(collab => {
                    const card = createCollaboratorCard(collab);
                    fragment.appendChild(card);
                });
                
                collabsGrid.innerHTML = '';
                collabsGrid.appendChild(fragment);
            }, dataLoader.config.app.skeletonLoaderDelay);
        }

        // ==================== SIDE PANEL LOGIC ====================

        // Cache side panel elements
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('side-panel-overlay');
        const openDiscographyBtn = document.querySelector('.discography-btn');
        
        // Focus trap variables for accessibility
        let focusableElements;
        let firstFocusable;
        let lastFocusable;
        
        // Initialize side panel functionality if elements exist
        if (sidePanel && panelOverlay) {
            const panelTitle = sidePanel.querySelector('.side-panel-title');
            const panelContent = sidePanel.querySelector('.side-panel-content');
            const closePanelBtn = sidePanel.querySelector('.close-panel-btn');

            /**
             * Implements focus trapping within the side panel for accessibility.
             * Ensures keyboard navigation stays within the panel when it's open.
             * @param {KeyboardEvent} e - The keyboard event.
             */
            const trapFocus = (e) => {
                if (e.key !== 'Tab') return;
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            };

            /**
             * Opens the side panel and sets up focus trapping.
             * All panels now open from the right side.
             */
            const openPanel = () => {
                scrollLock.enable();
                
                sidePanel.classList.add('active');
                panelOverlay.classList.add('active');
                
                // Set up focus trap
                focusableElements = sidePanel.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                firstFocusable = focusableElements[0];
                lastFocusable = focusableElements[focusableElements.length - 1];
                
                // Focus first element
                setTimeout(() => firstFocusable?.focus(), 100);
                
                // Add trap listener
                sidePanel.addEventListener('keydown', trapFocus);
                
                // Add touch gesture for swipe to close
                let touchStartX = 0;
                let touchStartY = 0;

                const handleTouchStart = (e) => {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                };

                const handleTouchEnd = (e) => {
                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    
                    const deltaX = touchEndX - touchStartX;
                    const deltaY = Math.abs(touchEndY - touchStartY);
                    
                    // Swipe right to close (only if horizontal swipe)
                    if (deltaX > 100 && deltaY < 50) {
                        closePanel();
                    }
                };

                sidePanel.addEventListener('touchstart', handleTouchStart, { passive: true });
                sidePanel.addEventListener('touchend', handleTouchEnd, { passive: true });

                // Store handlers for cleanup
                sidePanel._touchHandlers = { handleTouchStart, handleTouchEnd };
            };
            
            const closePanel = () => {
                // Check if we're closing the release info panel and need smart navigation
                const isReleaseInfoPanel = panelTitle.textContent &&
                    dataLoader.releases.some(r => r.title === panelTitle.textContent);
                
                if (isReleaseInfoPanel) {
                    const returnContext = navigationHistory.getContext();
                    
                    if (returnContext) {
                        // Clear context before navigation
                        navigationHistory.clearContext();
                        
                        // Execute smart navigation based on context
                        switch (returnContext) {
                            case 'discography':
                                // Return to discography panel
                                showDiscography();
                                return; // Skip default close behavior
                                
                            case 'collaborator':
                                // Return to collaborator panel
                                const collabId = navigationHelpers.getStoredCollaboratorId();
                                if (collabId) {
                                    const collab = dataLoader.collaborators.find(c => c.id === collabId);
                                    if (collab) {
                                        showCollaborator(collab);
                                        return; // Skip default close behavior
                                    }
                                }
                                break; // Fall through to default close if collaborator not found
                                
                                
                            case 'main':
                            default:
                                // Default behavior - just close panel and return to main
                                break;
                        }
                    }
                }
                
                // Default close behavior
                scrollLock.disable();
                sidePanel.classList.remove('active');
                panelOverlay.classList.remove('active');
                
                // Remove focus trap
                sidePanel.removeEventListener('keydown', trapFocus);
                
                // Remove touch handlers
                if (sidePanel._touchHandlers) {
                    sidePanel.removeEventListener('touchstart', sidePanel._touchHandlers.handleTouchStart);
                    sidePanel.removeEventListener('touchend', sidePanel._touchHandlers.handleTouchEnd);
                    delete sidePanel._touchHandlers;
                }
            };

            /**
             * Determines the platform name from a URL for the "Visit" button text.
             * @param {string} url - The URL to analyze.
             * @returns {string} The platform name.
             */
            const getLinkPlatform = (url) => {
                if (url.includes('spotify.com')) return 'Spotify';
                if (url.includes('music.apple.com')) return 'Apple Music';
                if (url.includes('youtube.com')) return 'YouTube';
                if (url.includes('instagram.com')) return 'Instagram';
                if (url.includes('tiktok.com')) return 'TikTok';
                return 'Website';
            };

            /**
             * Shared function to populate and open the side panel.
             * @param {string} title - The panel title.
             * @param {HTMLElement} content - The content to display in the panel.
             * @param {string} [titleKey] - Optional translation key for the title.
             */
            const showPanel = (title, content, titleKey = null) => {
                // Set title
                if (titleKey) {
                    panelTitle.dataset.key = titleKey;
                    panelTitle.textContent = title;
                } else {
                    panelTitle.removeAttribute('data-key');
                    panelTitle.textContent = title;
                }
                
                // Clear and populate panel content
                panelContent.innerHTML = '';
                panelContent.appendChild(content);
                openPanel(); // Open from right
            };

            /**
             * Populates the side panel with the full discography.
             * Sets the panel title and content, then opens the panel.
             */
            const showDiscography = () => {
                // Create content with the same structure as Release Info panel
                const contentFragment = document.createDocumentFragment();
                
                // Create discography list wrapper
                const discographyList = document.createElement('div');
                discographyList.className = 'discography-list';
                populateDiscographyList(discographyList);
                contentFragment.appendChild(discographyList);
                
                showPanel(translations.ui.fullDiscographyTitle, contentFragment, 'fullDiscographyTitle');
            };

            /**
             * Populates the side panel with a specific collaborator's details.
             * @param {Object} collab - The collaborator data object.
             */
            const showCollaborator = (collab) => {
                const platform = getLinkPlatform(collab.link);
                const visitBtnText = translations.ui.collabVisitBtn.replace('%s', `${collab.name} on ${platform}`);

                // Create content with the same structure as Release Info panel
                const contentFragment = document.createDocumentFragment();
                
                // Hero image wrapped in a container for consistent padding
                const heroContainer = document.createElement('div');
                heroContainer.className = 'side-panel-hero-container';
                
                const heroImg = document.createElement('img');
                heroImg.src = collab.photoSrc;
                heroImg.alt = `Photo of ${collab.name}`;
                heroImg.className = 'side-panel-hero-image';
                heroImg.loading = 'lazy';
                
                heroContainer.appendChild(heroImg);
                contentFragment.appendChild(heroContainer);
                
                // Create discography list wrapper
                // CRITICAL: This must be a direct child of contentFragment because the layout
                // logic expects a flat structure for consistent padding and spacing.
                const discographyList = document.createElement('div');
                discographyList.className = 'discography-list';
                
                // Get all releases for this collaborator and create music cards for each
                let hasSongs = false;
                if (collab.releaseIds) {
                    collab.releaseIds.forEach(releaseId => {
                        const release = dataLoader.getRelease(releaseId);
                        if (release) {
                            hasSongs = true;
                            const songCard = createMusicCard(release, false);
                            discographyList.appendChild(songCard);
                        }
                    });
                }
                
                // Only add the discography list if we have songs
                if (hasSongs) {
                    contentFragment.appendChild(discographyList);
                }
                
                // Text content container (same as Release Info)
                const textContent = document.createElement('div');
                textContent.className = 'side-panel-text-content';
                
                // Bio
                const bioText = dataLoader.resolveContent(collab.contentIds.bio, 'bios', currentLang);
                const bioParagraphs = bioText.split('\n\n');
                bioParagraphs.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.className = 'collab-details-bio';
                    p.textContent = paragraph;
                    textContent.appendChild(p);
                });
                
                // Visit button
                const visitBtnContainer = document.createElement('div');
                visitBtnContainer.className = 'collab-details-visit-btn-container';
                
                const visitBtn = document.createElement('a');
                visitBtn.href = collab.link;
                visitBtn.target = '_blank';
                visitBtn.rel = 'noopener noreferrer';
                visitBtn.className = 'cta-button';
                visitBtn.textContent = visitBtnText;
                
                visitBtnContainer.appendChild(visitBtn);
                textContent.appendChild(visitBtnContainer);
                
                contentFragment.appendChild(textContent);
                
                showPanel(collab.name, contentFragment);
            };

            if (openDiscographyBtn) openDiscographyBtn.addEventListener('click', showDiscography);
            closePanelBtn.addEventListener('click', closePanel);
            panelOverlay.addEventListener('click', closePanel);

            // Make functions available to the global event listener.
            window.showCollaborator = showCollaborator;

            /**
             * Populates the side panel with a specific release's details.
             * @param {Object} release - The release data object.
             */
            /**
             * Creates a cover art component for displaying release cover art in the side panel.
             * @param {Object} release - The release data object.
             * @returns {HTMLElement} The created cover art container element.
             */
            function createReleaseCoverArt(release) {
                const heroContainer = document.createElement('div');
                heroContainer.className = 'side-panel-hero-container';
                
                const heroImg = document.createElement('img');
                heroImg.src = release.coverArt;
                heroImg.alt = `Cover art for ${release.title}`;
                heroImg.className = 'side-panel-hero-image clickable-album-art';
                heroImg.loading = 'lazy';
                
                // Add click event listener to start playback
                heroImg.addEventListener('click', () => {
                    if (window.loadTrack) {
                        window.loadTrack(release);
                    }
                });
                
                // Fallback for missing images
                heroImg.onerror = () => {
                    heroImg.src = 'images/placeholder-album.svg';
                    heroImg.alt = 'Album artwork unavailable';
                };
                
                heroContainer.appendChild(heroImg);
                return heroContainer;
            }

            const showReleaseInfo = async (release) => {
                // Create content safely
                const contentFragment = document.createDocumentFragment();
                
                // --- Hero Cover Art: Use the new cover art component ---
                const coverArtComponent = createReleaseCoverArt(release);
                contentFragment.appendChild(coverArtComponent);

                // Text content container
                // <div class="side-panel-text-content">
                const textContent = document.createElement('div');
                textContent.className = 'side-panel-text-content';

                // Determine which sections to show
                const sectionsToShow = release.visibleSections || ['story', 'lyrics', 'gallery'];
                const hasStory = release.contentIds.story && sectionsToShow.includes('story');
                const hasLyrics = release.contentIds.lyrics && sectionsToShow.includes('lyrics');
                const hasGallery = release.contentIds.gallery && sectionsToShow.includes('gallery');

                // Tabbed Content
                const tabsContainer = document.createElement('div');
                tabsContainer.className = 'song-info-tabs';
                const tabs = [];
                const panes = [];
                
                if (hasStory) {
                    const storyTab = document.createElement('button');
                    storyTab.className = 'song-info-tab active';
                    storyTab.textContent = 'Story';
                    tabsContainer.appendChild(storyTab);
                    tabs.push(storyTab);

                    const storyPane = document.createElement('div');
                    storyPane.className = 'song-info-content active';
                    const storyP = document.createElement('p');
                    storyP.className = 'collab-details-bio';
                    storyP.textContent = dataLoader.resolveContent(release.contentIds.story, 'stories', currentLang);
                    storyPane.appendChild(storyP);
                    textContent.appendChild(storyPane);
                    panes.push(storyPane);
                }

                if (hasLyrics) {
                    const lyricsTab = document.createElement('button');
                    lyricsTab.className = 'song-info-tab';
                    if (!hasStory) lyricsTab.classList.add('active'); // Make first tab active
                    lyricsTab.textContent = 'Lyrics';
                    tabsContainer.appendChild(lyricsTab);
                    tabs.push(lyricsTab);

                    const lyricsPane = document.createElement('div');
                    lyricsPane.className = 'song-info-content';
                    if (!hasStory) lyricsPane.classList.add('active'); // Make first pane active
                    
                    // Get available languages for this lyrics content
                    const availableLyricsLanguages = dataLoader.getAvailableLyricsLanguages ?
                        dataLoader.getAvailableLyricsLanguages(release.contentIds.lyrics) : [currentLang];
                    
                    // Initialize the lyrics language manager for this release with preloading
                    const initialLanguage = await lyricsLanguageManager.initializeForRelease(
                        release.id,
                        availableLyricsLanguages,
                        release.contentIds.lyrics,
                        (contentId, language) => dataLoader.resolveLyricsContent(contentId, language)
                    );
                    
                    // Create language selector if multiple languages are available
                    if (availableLyricsLanguages.length > 1) {
                        const languageSelector = createLyricsLanguageSelector(
                            release.id,
                            availableLyricsLanguages,
                            initialLanguage,
                            async (releaseId, newLang, previousLang) => {
                                // Handle language change through the manager
                                const prevLang = await lyricsLanguageManager.changeLanguage(releaseId, newLang);
                                
                                // Update lyrics content when language changes
                                const lyricsContent = lyricsPane.querySelector('.lyrics-content');
                                const lyricsP = lyricsContent ? lyricsContent.querySelector('p') : null;
                                if (lyricsP) {
                                    // Add loading state
                                    lyricsContent.style.opacity = '0.5';
                                    
                                    // Try to get from cache first
                                    let newLyricsText = lyricsLanguageManager.getCachedLyrics(releaseId, newLang);
                                    
                                    if (newLyricsText) {
                                        // Instant update from cache
                                        lyricsP.textContent = newLyricsText;
                                        lyricsP.style.whiteSpace = 'pre-wrap';
                                        lyricsContent.style.opacity = '1';
                                    } else {
                                        // Load from data loader with minimal delay for better UX
                                        setTimeout(async () => {
                                            try {
                                                // Get the lyrics content and preserve line breaks
                                                newLyricsText = dataLoader.resolveLyricsContent ?
                                                    dataLoader.resolveLyricsContent(release.contentIds.lyrics, newLang) :
                                                    dataLoader.resolveContent(release.contentIds.lyrics, 'lyrics', newLang);
                                                
                                                // Cache the lyrics for future use
                                                if (lyricsCacheManager) {
                                                    lyricsCacheManager.setLyrics(releaseId, newLang, newLyricsText);
                                                }
                                                
                                                // Set the text content while preserving whiteSpace style
                                                lyricsP.textContent = newLyricsText;
                                                lyricsP.style.whiteSpace = 'pre-wrap';
                                                
                                                // Fade back in
                                                lyricsContent.style.opacity = '1';
                                            } catch (error) {
                                                console.error(`Failed to load lyrics for ${releaseId} in ${newLang}:`, error);
                                                lyricsP.textContent = '[Lyrics not available]';
                                                lyricsContent.style.opacity = '1';
                                            }
                                        }, 50); // Minimal delay for smooth transition
                                    }
                                }
                            }
                        );
                        
                        const selectorElement = languageSelector.create();
                        lyricsPane.appendChild(selectorElement);
                        
                        // Add the announcement region to the panel content
                        const announcementRegion = languageSelector.getAnnouncementRegion();
                        if (announcementRegion) {
                            textContent.appendChild(announcementRegion);
                        }
                        
                        // Set focus to the active language button when the lyrics tab is activated
                        const lyricsTab = tabsContainer.querySelector('.song-info-tab:nth-child(' + (hasStory ? 2 : 1) + ')');
                        if (lyricsTab) {
                            lyricsTab.addEventListener('click', () => {
                                setTimeout(() => {
                                    languageSelector.focusActiveButton();
                                }, 100); // Small delay to ensure the tab is fully activated
                            });
                        }
                    }
                    
                    // Create lyrics content container
                    const lyricsContent = document.createElement('div');
                    lyricsContent.className = 'lyrics-content';
                    lyricsContent.style.transition = 'opacity 0.15s ease';
                    
                    // Add initial loading state
                    lyricsContent.style.opacity = '0.5';
                    
                    const lyricsP = document.createElement('p');
                    lyricsP.className = 'collab-details-bio';
                    lyricsP.style.whiteSpace = 'pre-wrap';
                    
                    // Load initial lyrics content (try cache first)
                    const cachedLyrics = lyricsLanguageManager.getCachedLyrics(release.id, initialLanguage);
                    if (cachedLyrics) {
                        lyricsP.textContent = cachedLyrics;
                        lyricsP.style.whiteSpace = 'pre-wrap';
                        lyricsContent.style.opacity = '1';
                    } else {
                        setTimeout(() => {
                            const lyricsText = dataLoader.resolveLyricsContent ?
                                dataLoader.resolveLyricsContent(release.contentIds.lyrics, initialLanguage) :
                                dataLoader.resolveContent(release.contentIds.lyrics, 'lyrics', initialLanguage);
                            
                            // Cache the lyrics for future use
                            if (lyricsCacheManager) {
                                lyricsCacheManager.setLyrics(release.id, initialLanguage, lyricsText);
                            }
                            
                            lyricsP.textContent = lyricsText;
                            lyricsP.style.whiteSpace = 'pre-wrap';
                            
                            // Fade in after content is loaded
                            lyricsContent.style.opacity = '1';
                        }, 100);
                    }
                    
                    lyricsContent.appendChild(lyricsP);
                    lyricsPane.appendChild(lyricsContent);
                    textContent.appendChild(lyricsPane);
                    panes.push(lyricsPane);
                }

                if (hasGallery) {
                    const galleryTab = document.createElement('button');
                    galleryTab.className = 'song-info-tab';
                    if (!hasStory && !hasLyrics) galleryTab.classList.add('active'); // Make first pane active
                    galleryTab.textContent = 'Gallery';
                    tabsContainer.appendChild(galleryTab);
                    tabs.push(galleryTab);

                    const galleryPane = document.createElement('div');
                    galleryPane.className = 'song-info-content';
                    if (!hasStory && !hasLyrics) galleryPane.classList.add('active'); // Make first pane active
                    const gallery = document.createElement('div');
                    gallery.className = 'song-info-gallery';
                    
                    // For now, we'll use placeholder images for galleries
                    // In a real implementation, these would come from the data
                    const galleryImages = [
                        'images/gallery/placeholder-1.jpg',
                        'images/gallery/placeholder-2.jpg',
                        'images/gallery/placeholder-3.jpg'
                    ];
                    
                    galleryImages.forEach(src => {
                        const img = document.createElement('img');
                        img.src = src;
                        img.alt = `Gallery image for ${release.title}`;
                        img.loading = 'lazy';
                        gallery.appendChild(img);
                    });
                    galleryPane.appendChild(gallery);
                    textContent.appendChild(galleryPane);
                    panes.push(galleryPane);
                }
                
                if (tabsContainer.children.length > 0) {
                    textContent.insertBefore(tabsContainer, textContent.firstChild);
                }
                
                // Tab switching logic
                tabs.forEach((tab, index) => {
                    tab.addEventListener('click', () => {
                        // Deactivate all tabs and panes
                        tabs.forEach(t => t.classList.remove('active'));
                        panes.forEach(p => p.classList.remove('active'));
                        // Activate the clicked tab and its corresponding pane
                        tab.classList.add('active');
                        panes[index].classList.add('active');
                    });
                });

                contentFragment.appendChild(textContent);
                
                showPanel(release.title, contentFragment);
            };

            window.showReleaseInfo = showReleaseInfo;
            
        }

        // --- 5. Mini-Player Logic ---
        const miniPlayer = document.getElementById('mini-player');
        if (miniPlayer) {
            const playerElements = {
                coverArt: miniPlayer.querySelector('.player-cover-art'),
                title: miniPlayer.querySelector('.player-title'),
                audio: miniPlayer.querySelector('.audio-element'),
                playPauseBtn: miniPlayer.querySelector('.play-pause-btn'),
                iconPlay: miniPlayer.querySelector('.icon-play'),
                iconPause: miniPlayer.querySelector('.icon-pause'),
                seekSlider: miniPlayer.querySelector('.seek-slider'),
                currentTimeEl: miniPlayer.querySelector('.current-time'),
                totalTimeEl: miniPlayer.querySelector('.total-time'),
                closePlayerBtn: miniPlayer.querySelector('.close-player-btn'),
                errorMessage: miniPlayer.querySelector('.player-error-message')
            };
            
            // Flag to track if we're intentionally closing the player.
            // This prevents the 'error' event from firing and showing a
            // misleading error message when the audio source is removed during cleanup.
            let isClosingPlayer = false;
            
            const formatTime = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
            const togglePlay = () => playerElements.audio.src && (playerElements.audio.paused ? playerElements.audio.play() : playerElements.audio.pause());
            const updatePlayButton = () => {
                if(!playerElements.iconPlay || !playerElements.iconPause) return;
                playerElements.iconPlay.classList.toggle('hidden', !playerElements.audio.paused);
                playerElements.iconPause.classList.toggle('hidden', playerElements.audio.paused);
            };
            
            const showError = (message) => {
                // Don't show error if we're intentionally closing the player
                if (isClosingPlayer) return;
                
                playerElements.errorMessage.textContent = message;
                playerElements.errorMessage.classList.remove('hidden');
                setTimeout(() => {
                    playerElements.errorMessage.classList.add('hidden');
                }, dataLoader.config.app.audioPlayer.errorDisplayDuration);
            };
            
            // Track the currently playing release for mini player click functionality
            let currentPlayingRelease = null;
            // Track the currently playing track ID to prevent restarts
            let currentTrackId = null;
            
            const loadTrack = (track) => {
                // Check if the same track is already actively playing
                const isSameTrack = currentTrackId === track.id;
                const isActivelyPlaying = !playerElements.audio.paused && playerElements.audio.src;
                
                // If it's the same track and it's actively playing, do nothing
                if (isSameTrack && isActivelyPlaying) {
                    return;
                }
                
                // If it's the same track but paused, resume playback
                if (isSameTrack && !isActivelyPlaying) {
                    playerElements.audio.play().catch(error => {
                        console.error('Playback failed:', error);
                        showError('Unable to resume playback. Please try again.');
                    });
                    return;
                }
                
                // Clean up previous track
                if (playerElements.audio.src) {
                    playerElements.audio.pause();
                    playerElements.audio.currentTime = 0;
                }
                
                // Store the current release for click functionality
                currentPlayingRelease = track;
                // Store the current track ID
                currentTrackId = track.id;
                
                playerElements.coverArt.src = track.coverArt;
                playerElements.coverArt.alt = `Cover art for ${track.title}`;
                playerElements.title.textContent = track.title;
                playerElements.audio.src = track.audioSrc;
                miniPlayer.classList.add('active');
                body.classList.add('player-active');
                
                // Add loading state
                miniPlayer.classList.add('loading');
                
                playerElements.audio.play().catch(error => {
                    console.error('Playback failed:', error);
                    showError('Unable to play this track. Please try another.');
                    miniPlayer.classList.remove('loading');
                    closePlayer();
                });
            };
            
            const closePlayer = () => {
                // Set flag to prevent error messages during cleanup
                isClosingPlayer = true;
                
                playerElements.audio.pause();
                playerElements.audio.currentTime = 0;
                
                // Instead of setting src to empty string, which causes errors,
                // we'll use the suspend method and then remove the source
                playerElements.audio.removeAttribute('src');
                playerElements.audio.load(); // This stops any ongoing network activity
                
                miniPlayer.classList.remove('active');
                miniPlayer.classList.remove('loading');
                body.classList.remove('player-active');
                
                // Reset the current playing release
                currentPlayingRelease = null;
                // Reset the current track ID
                currentTrackId = null;
                
                // Reset the flag after a short delay
                setTimeout(() => {
                    isClosingPlayer = false;
                }, 100);
            };
            
            // Audio event listeners with error handling
            playerElements.audio.addEventListener('play', updatePlayButton);
            playerElements.audio.addEventListener('pause', updatePlayButton);
            playerElements.audio.addEventListener('loadedmetadata', () => {
                playerElements.totalTimeEl.textContent = formatTime(playerElements.audio.duration);
                playerElements.seekSlider.max = playerElements.audio.duration;
                miniPlayer.classList.remove('loading');
            });
            
            // Debounced time update for performance
            playerElements.audio.addEventListener('timeupdate', debounce(() => {
                playerElements.currentTimeEl.textContent = formatTime(playerElements.audio.currentTime);
                if (!playerElements.seekSlider.matches(':active')) {
                    playerElements.seekSlider.value = playerElements.audio.currentTime;
                }
                // Update progress bar CSS variable
                const progress = (playerElements.audio.currentTime / playerElements.audio.duration) * 100;
                playerElements.seekSlider.style.setProperty('--seek-progress', `${progress}%`);
            }, dataLoader.config.app.performance.debounceDelay));
            
            playerElements.audio.addEventListener('error', (e) => {
                const errorMessages = {
                    1: 'Audio loading was aborted',
                    2: 'Network error occurred',
                    3: 'Audio decoding failed',
                    4: 'Audio format not supported'
                };
                
                console.error('Audio error:', errorMessages[e.target.error.code] || 'Unknown error');
                showError('Unable to play this track');
                miniPlayer.classList.remove('loading');
            });
            
            playerElements.audio.addEventListener('waiting', () => {
                miniPlayer.classList.add('loading');
            });
            
            playerElements.audio.addEventListener('canplay', () => {
                miniPlayer.classList.remove('loading');
            });
            
            playerElements.playPauseBtn.addEventListener('click', togglePlay);
            playerElements.seekSlider.addEventListener('input', () => playerElements.audio.currentTime = playerElements.seekSlider.value);
            playerElements.closePlayerBtn.addEventListener('click', closePlayer);

            // Add click event listeners to mini player album art and title
            const openCurrentReleaseInfo = () => {
                if (currentPlayingRelease && window.showReleaseInfo) {
                    // Determine the current context and set it for smart navigation back
                    const currentContext = navigationHelpers.getCurrentContext();
                    navigationHistory.setContext(currentContext);
                    
                    // Store additional context if we're in collaborator panel
                    if (currentContext === 'collaborator') {
                        const currentCollabId = navigationHelpers.getCurrentCollaboratorId();
                        navigationHelpers.storeCollaboratorId(currentCollabId);
                    }
                    
                    window.showReleaseInfo(currentPlayingRelease);
                }
            };
            
            playerElements.coverArt.addEventListener('click', openCurrentReleaseInfo);
            playerElements.title.addEventListener('click', openCurrentReleaseInfo);

            window.loadTrack = loadTrack;
        }

        // ==================== EVENT DELEGATION ====================
        // A single event listener on the body handles clicks for multiple actions.
        // This is a highly efficient pattern that avoids attaching multiple listeners
        // and works seamlessly with dynamically generated content.
        document.body.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;

            const action = actionTarget.dataset.action;

            if (action === 'play-track') {
                const musicCard = actionTarget.closest('.music-card');
                if (musicCard) {
                    const imgSrc = musicCard.querySelector('img').getAttribute('src');
                    // Check if the clicked song belongs to a release (unified approach)
                    const release = dataLoader.releases.find(r => r.coverArt === imgSrc);
                    
                    if(release && window.loadTrack) {
                        window.loadTrack(release);
                    }
                }
            } else if (action === 'open-collab-panel') {
                const collabId = actionTarget.dataset.collabId;
                const collabData = dataLoader.collaborators.find(c => c.id === collabId);
                if (collabData && window.showCollaborator) window.showCollaborator(collabData);
            } else if (action === 'open-release-panel') {
                const releaseTitle = actionTarget.dataset.releaseTitle;
                const releaseData = dataLoader.releases.find(r => r.title === releaseTitle);
                if (releaseData && window.showReleaseInfo) {
                    // Determine the current context and set it for smart navigation back
                    const currentContext = navigationHelpers.getCurrentContext();
                    navigationHistory.setContext(currentContext);
                    
                    // Store additional context if we're in collaborator panel
                    if (currentContext === 'collaborator') {
                        const currentCollabId = navigationHelpers.getCurrentCollaboratorId();
                        navigationHelpers.storeCollaboratorId(currentCollabId);
                    }
                    
                    window.showReleaseInfo(releaseData);
                }
            } else if (action === 'toggle-play') {
                // Handled by individual element listener
            } else if (action === 'close-player') {
                // Handled by individual element listener
            }
        });

        // ==================== MOBILE NAVIGATION ====================
        
        // Cache hamburger menu element
        const hamburger = document.querySelector('.hamburger-menu');
        
        /**
         * Closes the mobile navigation menu and disables scroll lock.
         */
        const closeMobileNav = () => {
            body.classList.remove('nav-open');
            scrollLock.disable();
            if (hamburger) {
                hamburger.setAttribute('aria-expanded', 'false');
            }
        };

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                const isOpening = !body.classList.contains('nav-open');
                
                if (isOpening) {
                    scrollLock.enable();
                } else {
                    scrollLock.disable();
                }
                
                body.classList.toggle('nav-open');
                hamburger.setAttribute('aria-expanded', body.classList.contains('nav-open'));
            });
        }
        
        // Close mobile nav when navigation links or language buttons are clicked
        if (mainNav) {
            mainNav.addEventListener('click', (e) => {
                // Check if clicked element is a nav link or language button
                if (e.target.matches('.nav-links a') || e.target.matches('.language-switcher .lang-btn')) {
                    closeMobileNav();
                }
            });
        }
        
        // ==================== MULTILINGUAL CONTENT MANAGEMENT ====================
        
        // Cache language buttons and translatable elements
        const langButtons = document.querySelectorAll('.lang-btn');
        const translatableElements = document.querySelectorAll('[data-key]');
        
        /**
         * Updates the page content with translations for the specified language.
         * @param {string} lang - The language code to load translations for.
         */
        const updateContent = async (lang) => {
            currentLang = lang;
            document.documentElement.lang = lang; // Update HTML lang attribute
            
            // Load translations for the selected language
            try {
                translations = await dataLoader.loadTranslations(lang);
            } catch (error) {
                console.error(`Failed to load translations for ${lang}:`, error);
                return;
            }
            
            translatableElements.forEach(element => {
                const key = element.getAttribute('data-key');
                if (translations.ui && translations.ui[key]) {
                    if (key === 'aboutBio') {
                        // Handle bio text with paragraph breaks
                        const paragraphs = translations.ui[key].split('\n\n');
                        // Convert each paragraph to a sanitized HTML paragraph element
                        element.innerHTML = paragraphs.map(p => `<p>${sanitizeHTML(p)}</p>`).join('');
                    } else {
                        element.textContent = translations.ui[key];
                    }
                }
            });
        };
        
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedLang = button.getAttribute('data-lang');
                if (selectedLang) {
                    langButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    updateContent(selectedLang);
                }
            });
        });

        // ==================== KEYBOARD CONTROLS ====================
        document.addEventListener('keydown', (e) => {
            // Only if player is active and not typing in an input
            if (!miniPlayer || !miniPlayer.classList.contains('active')) return;
            if (e.target.matches('input, textarea, select')) return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (miniPlayer.classList.contains('active')) {
                        const playPauseBtn = miniPlayer.querySelector('.play-pause-btn');
                        if (playPauseBtn) playPauseBtn.click();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (sidePanel && sidePanel.classList.contains('active')) {
                        const closeBtn = sidePanel.querySelector('.close-panel-btn');
                        if (closeBtn) closeBtn.click();
                    } else if (miniPlayer.classList.contains('active')) {
                        const closeBtn = miniPlayer.querySelector('.close-player-btn');
                        if (closeBtn) closeBtn.click();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (miniPlayer.classList.contains('active') && playerElements.audio) {
                        playerElements.audio.currentTime = Math.max(0,
                            playerElements.audio.currentTime - 5);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (miniPlayer.classList.contains('active') && playerElements.audio) {
                        playerElements.audio.currentTime = Math.min(
                            playerElements.audio.duration,
                            playerElements.audio.currentTime + 5);
                    }
                    break;
            }
        });

        // ==================== PERFORMANCE OPTIMIZATION ====================
        // Pause hero animation when not visible to improve performance
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && 'IntersectionObserver' in window) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        heroSection.style.setProperty('--animation-state', 'running');
                    } else {
                        heroSection.style.setProperty('--animation-state', 'paused');
                    }
                });
            }, { threshold: 0.1 });
            
            heroObserver.observe(heroSection);
        }

        /**
         * Populates the footer with artist links from the centralized data.
         */
        function populateFooterLinks() {
            const footerLinksContainer = document.getElementById('footer-links');
            if (!footerLinksContainer) return;
            
            const fragment = document.createDocumentFragment();
            
            dataLoader.artist.links.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.target = '_blank';
                linkElement.rel = 'noopener noreferrer';
                linkElement.className = 'tooltip';
                linkElement.setAttribute('data-tooltip', link.tooltip);
                linkElement.setAttribute('aria-label', link.ariaLabel);
                
                // Create SVG icon
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.classList.add('icon');
                const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                use.setAttribute('href', `#${link.icon}`);
                svg.appendChild(use);
                
                linkElement.appendChild(svg);
                fragment.appendChild(linkElement);
            });
            
            footerLinksContainer.innerHTML = '';
            footerLinksContainer.appendChild(fragment);
        }

        
        // ==================== INITIAL SETUP ====================
        // Run all population functions and set the initial language.
        populateFeaturedGrid();
        populateCollabsGrid();
        updateContent(currentLang);
        populateFooterLinks();
        
        // Version display removed from footer - version is now managed in config files
        
        // ==================== PANEL TESTING ====================
        // Test function to verify panels work correctly after refactor
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.testPanels = () => {
                console.log('Testing panel structures after aggressive refactor...');
                
                // Test Discography panel
                if (window.showDiscography) {
                    console.log('✓ Discography panel function exists');
                } else {
                    console.error('✗ Discography panel function missing');
                }
                
                // Test Collaborator panel
                if (window.showCollaborator) {
                    console.log('✓ Collaborator panel function exists');
                } else {
                    console.error('✗ Collaborator panel function missing');
                }
                
                // Test Release Info panel
                if (window.showReleaseInfo) {
                    console.log('✓ Release Info panel function exists');
                } else {
                    console.error('✗ Release Info panel function missing');
                }
                
                console.log('Panel testing complete. Open browser console to see results.');
            };
            
            // Test function for lyrics cache
            window.testLyricsCache = () => {
                console.log('Testing lyrics cache functionality...');
                
                if (!window.lyricsCacheManager) {
                    console.error('✗ Lyrics cache manager not initialized');
                    return;
                }
                
                console.log('✓ Lyrics cache manager initialized');
                
                // Test cache statistics
                const stats = window.lyricsCacheManager.getStats();
                console.log('Cache statistics:', stats);
                
                // Test cache methods
                const testReleaseId = 'test-release';
                const testLanguage = 'en';
                const testLyrics = 'Test lyrics content for caching';
                
                // Test setting and getting lyrics
                window.lyricsCacheManager.setLyrics(testReleaseId, testLanguage, testLyrics);
                const cachedLyrics = window.lyricsCacheManager.getLyrics(testReleaseId, testLanguage);
                
                if (cachedLyrics === testLyrics) {
                    console.log('✓ Cache set/get functionality working');
                } else {
                    console.error('✗ Cache set/get functionality failed');
                }
                
                // Test hasLyrics method
                if (window.lyricsCacheManager.hasLyrics(testReleaseId, testLanguage)) {
                    console.log('✓ Cache hasLyrics method working');
                } else {
                    console.error('✗ Cache hasLyrics method failed');
                }
                
                // Test getCachedLanguages method
                const cachedLanguages = window.lyricsCacheManager.getCachedLanguages(testReleaseId);
                if (cachedLanguages.includes(testLanguage)) {
                    console.log('✓ Cache getCachedLanguages method working');
                } else {
                    console.error('✗ Cache getCachedLanguages method failed');
                }
                
                // Test cache invalidation
                window.lyricsCacheManager.invalidateRelease(testReleaseId);
                if (!window.lyricsCacheManager.hasLyrics(testReleaseId, testLanguage)) {
                    console.log('✓ Cache invalidation working');
                } else {
                    console.error('✗ Cache invalidation failed');
                }
                
                // Clean up test data
                window.lyricsCacheManager.invalidateAll();
                
                console.log('Lyrics cache testing complete. Open browser console to see results.');
            };
            
            
            // Auto-run tests in development mode
            setTimeout(() => {
                if (window.testPanels) window.testPanels();
                if (window.testLyricsCache) window.testLyricsCache();
            }, 2000);
        }
    };

})();

// ==================== MULTI-LANGUAGE LYRICS MANAGER ====================

/**
 * Manages the state and preferences for lyrics language selection.
 * Handles session storage, default language settings, and language switching logic.
 */
class LyricsLanguageManager {
    /**
     * @param {string} defaultLanguage - The default language from global settings
     * @param {LyricsCacheManager} cacheManager - The cache manager instance
     */
    constructor(defaultLanguage, cacheManager = null) {
        this.defaultLanguage = defaultLanguage;
        this.sessionStorageKey = 'lyricsLanguagePreference';
        this.currentReleaseId = null;
        this.currentLanguage = defaultLanguage;
        this.availableLanguages = [];
        this.selectors = new Map(); // Track selectors by release ID
        this.cacheManager = cacheManager;
        this.preloadedContent = new Map(); // Track preloaded content
    }

    /**
     * Gets the stored language preference for a release from session storage
     * @param {string} releaseId - The ID of the release
     * @returns {string|null} The stored language code or null
     */
    getStoredLanguagePreference(releaseId) {
        try {
            const stored = sessionStorage.getItem(this.sessionStorageKey);
            if (stored) {
                const preferences = JSON.parse(stored);
                return preferences[releaseId] || null;
            }
        } catch (error) {
            console.warn('Failed to read language preference from session storage:', error);
        }
        return null;
    }

    /**
     * Stores the language preference for a release in session storage
     * @param {string} releaseId - The ID of the release
     * @param {string} languageCode - The language code to store
     */
    storeLanguagePreference(releaseId, languageCode) {
        try {
            let preferences = {};
            const stored = sessionStorage.getItem(this.sessionStorageKey);
            if (stored) {
                preferences = JSON.parse(stored);
            }
            preferences[releaseId] = languageCode;
            sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to store language preference in session storage:', error);
        }
    }

    /**
     * Determines the initial language to use for a release
     * @param {string} releaseId - The ID of the release
     * @param {Array<string>} availableLanguages - Available languages for this release
     * @returns {string} The language code to use
     */
    getInitialLanguage(releaseId, availableLanguages) {
        // First check if we have a stored preference for this release
        const storedPreference = this.getStoredLanguagePreference(releaseId);
        if (storedPreference && availableLanguages.includes(storedPreference)) {
            return storedPreference;
        }

        // Fall back to the global default language if available
        if (availableLanguages.includes(this.defaultLanguage)) {
            return this.defaultLanguage;
        }

        // Fall back to English if available
        if (availableLanguages.includes('en')) {
            return 'en';
        }

        // Fall back to the first available language
        return availableLanguages.length > 0 ? availableLanguages[0] : this.defaultLanguage;
    }

    /**
     * Initializes the language manager for a specific release
     * @param {string} releaseId - The ID of the release
     * @param {Array<string>} availableLanguages - Available languages for this release
     * @param {string} contentId - The content ID for the lyrics
     * @param {Function} loadLyricsFunction - Function to load lyrics for a given language
     * @returns {Promise<string>} The initial language to use
     */
    async initializeForRelease(releaseId, availableLanguages, contentId = null, loadLyricsFunction = null) {
        this.currentReleaseId = releaseId;
        this.availableLanguages = availableLanguages;
        this.currentLanguage = this.getInitialLanguage(releaseId, availableLanguages);
        
        // Preload all language versions if cache manager is available
        if (this.cacheManager && contentId && loadLyricsFunction) {
            try {
                const allLyrics = await this.cacheManager.preloadAllLanguages(
                    releaseId,
                    contentId,
                    availableLanguages,
                    loadLyricsFunction
                );
                this.preloadedContent.set(releaseId, allLyrics);
            } catch (error) {
                console.warn(`Failed to preload lyrics for ${releaseId}:`, error);
            }
        }
        
        return this.currentLanguage;
    }

    /**
     * Handles language change for a release
     * @param {string} releaseId - The ID of the release
     * @param {string} newLanguage - The new language code
     * @returns {Promise<string>} The previous language code
     */
    async changeLanguage(releaseId, newLanguage) {
        if (!this.availableLanguages.includes(newLanguage)) {
            console.warn(`Language ${newLanguage} is not available for release ${releaseId}`);
            return this.currentLanguage;
        }

        const previousLanguage = this.currentLanguage;
        this.currentLanguage = newLanguage;
        this.storeLanguagePreference(releaseId, newLanguage);
        return previousLanguage;
    }

    /**
     * Gets the current language for the active release
     * @returns {string} The current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Gets the available languages for the active release
     * @returns {Array<string>} The available language codes
     */
    getAvailableLanguages() {
        return [...this.availableLanguages];
    }

    /**
     * Checks if a language is available for the current release
     * @param {string} languageCode - The language code to check
     * @returns {boolean} True if the language is available
     */
    isLanguageAvailable(languageCode) {
        return this.availableLanguages.includes(languageCode);
    }

    /**
     * Resets the manager state (useful when switching releases)
     */
    reset() {
        this.currentReleaseId = null;
        this.currentLanguage = this.defaultLanguage;
        this.availableLanguages = [];
    }
    
    /**
     * Gets cached lyrics for a release and language
     * @param {string} releaseId - The ID of the release
     * @param {string} language - The language code
     * @returns {string|null} The cached lyrics or null if not found
     */
    getCachedLyrics(releaseId, language) {
        if (this.cacheManager) {
            return this.cacheManager.getLyrics(releaseId, language);
        }
        return null;
    }
    
    /**
     * Checks if lyrics are cached for a release and language
     * @param {string} releaseId - The ID of the release
     * @param {string} language - The language code
     * @returns {boolean} True if cached, false otherwise
     */
    hasCachedLyrics(releaseId, language) {
        if (this.cacheManager) {
            return this.cacheManager.hasLyrics(releaseId, language);
        }
        return false;
    }
    
    /**
     * Gets the preloaded content for a release
     * @param {string} releaseId - The ID of the release
     * @returns {Object|null} The preloaded content or null if not available
     */
    getPreloadedContent(releaseId) {
        return this.preloadedContent.get(releaseId) || null;
    }
}

// ==================== MULTI-LANGUAGE LYRICS SELECTOR ====================

/**
 * Creates and manages the horizontal language selector for multi-language lyrics.
 * This component allows users to switch between available lyric translations
 * independently from the global language setting with full accessibility support.
 */
class LyricsLanguageSelector {
    /**
     * @param {string} releaseId - The ID of the current release
     * @param {Array<string>} availableLanguages - Array of available language codes
     * @param {string} currentLanguage - Currently selected language code
     */
    constructor(releaseId, availableLanguages, currentLanguage) {
        this.releaseId = releaseId;
        this.availableLanguages = availableLanguages;
        this.currentLanguage = currentLanguage;
        this.element = null;
        this.onLanguageChange = null; // Callback function for language changes
        this.announcementRegion = null; // For screen reader announcements
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isScrollable = false;
    }

    /**
     * Creates the language selector DOM element
     * @returns {HTMLElement} The language selector container element
     */
    create() {
        const container = document.createElement('div');
        container.className = 'lyrics-language-selector';
        container.setAttribute('role', 'tablist');
        container.setAttribute('aria-label', 'Lyrics language selection');
        container.setAttribute('aria-orientation', 'horizontal');
        
        // Create screen reader announcement region
        this.announcementRegion = document.createElement('div');
        this.announcementRegion.setAttribute('aria-live', 'polite');
        this.announcementRegion.setAttribute('aria-atomic', 'true');
        this.announcementRegion.className = 'sr-only';
        this.announcementRegion.style.position = 'absolute';
        this.announcementRegion.style.left = '-10000px';
        this.announcementRegion.style.width = '1px';
        this.announcementRegion.style.height = '1px';
        this.announcementRegion.style.overflow = 'hidden';
        
        // Only create buttons if we have multiple languages
        if (this.availableLanguages.length > 1) {
            this.availableLanguages.forEach((langCode, index) => {
                const button = this.createLanguageButton(langCode, index);
                container.appendChild(button);
            });
            
            // Check if selector is scrollable for visual indicators
            this.checkScrollable(container);
        }
        
        this.element = container;
        this.bindEvents();
        
        return container;
    }

    /**
     * Creates a language button for the selector
     * @param {string} langCode - The language code (e.g., 'en', 'es', 'fr')
     * @param {number} index - The index of the button in the list
     * @returns {HTMLElement} The created button element
     */
    createLanguageButton(langCode, index) {
        const button = document.createElement('button');
        button.className = 'language-btn';
        button.setAttribute('role', 'tab');
        button.setAttribute('data-lang', langCode);
        button.setAttribute('aria-controls', 'lyrics-content');
        button.setAttribute('aria-selected', langCode === this.currentLanguage ? 'true' : 'false');
        button.setAttribute('aria-describedby', `lang-desc-${langCode}`);
        button.setAttribute('title', this.getLanguageName(langCode));
        button.setAttribute('tabindex', langCode === this.currentLanguage ? '0' : '-1');
        button.id = `lang-tab-${this.releaseId}-${index}`;
        
        const langSpan = document.createElement('span');
        langSpan.className = 'lang-code';
        langSpan.textContent = langCode.toUpperCase();
        langSpan.setAttribute('aria-hidden', 'true');
        
        const indicator = document.createElement('span');
        indicator.className = 'lang-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        
        // Hidden description for screen readers
        const description = document.createElement('span');
        description.id = `lang-desc-${langCode}`;
        description.className = 'sr-only';
        description.textContent = `${this.getLanguageName(langCode)} lyrics language`;
        description.style.position = 'absolute';
        description.style.left = '-10000px';
        description.style.width = '1px';
        description.style.height = '1px';
        description.style.overflow = 'hidden';
        
        button.appendChild(langSpan);
        button.appendChild(indicator);
        
        if (langCode === this.currentLanguage) {
            button.classList.add('active');
        }
        
        return button;
    }

    /**
     * Binds event listeners to the language selector
     */
    bindEvents() {
        if (!this.element) return;
        
        // Click events
        this.element.addEventListener('click', (e) => {
            if (e.target.matches('.language-btn') || e.target.closest('.language-btn')) {
                const button = e.target.matches('.language-btn') ? e.target : e.target.closest('.language-btn');
                const selectedLang = button.getAttribute('data-lang');
                this.selectLanguage(selectedLang);
            }
        });
        
        // Enhanced keyboard navigation support
        this.element.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(e);
                    break;
                case 'Home':
                    this.handleHomeKey(e);
                    break;
                case 'End':
                    this.handleEndKey(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleKeySelection(e);
                    break;
                case 'Escape':
                    this.handleEscapeKey(e);
                    break;
            }
        });
        
        // Touch gesture support
        this.element.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        this.element.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
        
        // Scroll detection for visual indicators
        this.element.addEventListener('scroll', () => {
            this.updateScrollIndicators();
        }, { passive: true });
        
        // Focus management
        this.element.addEventListener('focusin', (e) => {
            if (e.target.matches('.language-btn')) {
                this.ensureButtonVisible(e.target);
            }
        });
    }

    /**
     * Handles language selection with visual feedback and screen reader announcements
     * @param {string} languageCode - The selected language code
     */
    selectLanguage(languageCode) {
        if (languageCode === this.currentLanguage) return;
        
        // Check if the language is available
        if (!this.availableLanguages.includes(languageCode)) {
            console.warn(`Language ${languageCode} is not available for release ${this.releaseId}`);
            return;
        }
        
        // Update visual state
        const buttons = this.element.querySelectorAll('.language-btn');
        buttons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            const isActive = btnLang === languageCode;
            
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        
        // Update current language
        const previousLanguage = this.currentLanguage;
        this.currentLanguage = languageCode;
        
        // Announce change to screen readers
        this.announceLanguageChange(languageCode, previousLanguage);
        
        // Call the callback if provided
        if (this.onLanguageChange) {
            this.onLanguageChange(this.releaseId, languageCode, previousLanguage);
        }
    }

    /**
     * Announces language changes to screen readers
     * @param {string} newLanguage - The new language code
     * @param {string} previousLanguage - The previous language code
     */
    announceLanguageChange(newLanguage, previousLanguage) {
        if (this.announcementRegion) {
            const newName = this.getLanguageName(newLanguage);
            const previousName = this.getLanguageName(previousLanguage);
            this.announcementRegion.textContent = `Language changed from ${previousName} to ${newName}`;
        }
    }

    /**
     * Handles keyboard navigation between language buttons
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleArrowNavigation(e) {
        e.preventDefault();
        const buttons = Array.from(this.element.querySelectorAll('.language-btn'));
        const currentIndex = buttons.findIndex(btn => btn.classList.contains('active'));
        
        let nextIndex;
        if (e.key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        } else {
            nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        }
        
        buttons[nextIndex].focus();
        this.ensureButtonVisible(buttons[nextIndex]);
    }

    /**
     * Handles Home key navigation
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleHomeKey(e) {
        e.preventDefault();
        const buttons = this.element.querySelectorAll('.language-btn');
        if (buttons.length > 0) {
            buttons[0].focus();
            this.ensureButtonVisible(buttons[0]);
        }
    }

    /**
     * Handles End key navigation
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleEndKey(e) {
        e.preventDefault();
        const buttons = this.element.querySelectorAll('.language-btn');
        if (buttons.length > 0) {
            buttons[buttons.length - 1].focus();
            this.ensureButtonVisible(buttons[buttons.length - 1]);
        }
    }

    /**
     * Handles keyboard selection of the focused language button
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeySelection(e) {
        e.preventDefault();
        const focusedBtn = this.element.querySelector('.language-btn:focus');
        if (focusedBtn) {
            const selectedLang = focusedBtn.getAttribute('data-lang');
            this.selectLanguage(selectedLang);
        }
    }

    /**
     * Handles Escape key to return focus to the active tab
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleEscapeKey(e) {
        e.preventDefault();
        const activeBtn = this.element.querySelector('.language-btn.active');
        if (activeBtn) {
            activeBtn.focus();
        }
    }

    /**
     * Ensures a button is visible in the scrollable container
     * @param {HTMLElement} button - The button to ensure is visible
     */
    ensureButtonVisible(button) {
        if (!this.isScrollable) return;
        
        const container = this.element;
        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        if (buttonRect.left < containerRect.left) {
            // Button is to the left of the visible area
            container.scrollLeft -= containerRect.left - buttonRect.left;
        } else if (buttonRect.right > containerRect.right) {
            // Button is to the right of the visible area
            container.scrollLeft += buttonRect.right - containerRect.right;
        }
    }

    /**
     * Handles touch start for swipe gestures
     * @param {TouchEvent} e - The touch event
     */
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    /**
     * Handles touch end for swipe gestures
     * @param {TouchEvent} e - The touch event
     */
    handleTouchEnd(e) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = Math.abs(touchEndY - this.touchStartY);
        
        // Check if it's a horizontal swipe (not vertical scroll)
        if (Math.abs(deltaX) > 50 && deltaY < 50) {
            const buttons = Array.from(this.element.querySelectorAll('.language-btn'));
            const currentIndex = buttons.findIndex(btn => btn.classList.contains('active'));
            
            let nextIndex;
            if (deltaX > 0) {
                // Swipe right - previous language
                nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
            } else {
                // Swipe left - next language
                nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
            }
            
            const nextLang = buttons[nextIndex].getAttribute('data-lang');
            this.selectLanguage(nextLang);
            this.ensureButtonVisible(buttons[nextIndex]);
        }
        
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    /**
     * Checks if the selector is scrollable and updates visual indicators
     * @param {HTMLElement} container - The container element
     */
    checkScrollable(container) {
        // Check if content overflows horizontally
        this.isScrollable = container.scrollWidth > container.clientWidth;
        
        if (this.isScrollable) {
            container.classList.add('scrollable');
            this.updateScrollIndicators();
        } else {
            container.classList.remove('scrollable');
        }
    }

    /**
     * Updates scroll indicators based on current scroll position
     */
    updateScrollIndicators() {
        if (!this.isScrollable) return;
        
        const container = this.element;
        const atStart = container.scrollLeft <= 0;
        const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
        
        // Update visual indicators (could be enhanced with CSS pseudo-elements)
        container.classList.toggle('at-start', atStart);
        container.classList.toggle('at-end', atEnd);
    }

    /**
     * Updates the selector with new language data
     * @param {Array<string>} availableLanguages - New array of available language codes
     * @param {string} currentLanguage - New current language code
     */
    updateLanguages(availableLanguages, currentLanguage) {
        this.availableLanguages = availableLanguages;
        this.currentLanguage = currentLanguage;
        
        if (this.element) {
            // Clear existing content
            this.element.innerHTML = '';
            
            // Only recreate if we have multiple languages
            if (availableLanguages.length > 1) {
                availableLanguages.forEach((langCode, index) => {
                    const button = this.createLanguageButton(langCode, index);
                    this.element.appendChild(button);
                });
                
                // Check if selector is scrollable
                this.checkScrollable(this.element);
            }
            
            // Re-add announcement region
            if (this.announcementRegion && this.element.parentNode) {
                this.element.parentNode.appendChild(this.announcementRegion);
            }
        }
    }

    /**
     * Gets the current active language button
     * @returns {HTMLElement|null} The active button or null
     */
    getActiveButton() {
        if (!this.element) return null;
        return this.element.querySelector('.language-btn.active');
    }

    /**
     * Sets focus to the active language button
     */
    focusActiveButton() {
        const activeBtn = this.getActiveButton();
        if (activeBtn) {
            activeBtn.focus();
            this.ensureButtonVisible(activeBtn);
        }
    }

    /**
     * Gets the announcement region element
     * @returns {HTMLElement} The announcement region element
     */
    getAnnouncementRegion() {
        return this.announcementRegion;
    }

    /**
     * Sets a callback function to be called when language changes
     * @param {Function} callback - Function to call on language change
     */
    setLanguageChangeCallback(callback) {
        this.onLanguageChange = callback;
    }

    /**
     * Gets the display name for a language code
     * @param {string} langCode - The language code
     * @returns {string} The display name for the language
     */
    getLanguageName(langCode) {
        const languageNames = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'nl': 'Nederlands',
            'pl': 'Polski',
            'ru': 'Русский',
            'ja': '日本語',
            'zh': '中文',
            'ko': '한국어',
            'ar': 'العربية'
        };
        
        return languageNames[langCode] || langCode.toUpperCase();
    }

    /**
     * Shows an error state when a language is unavailable
     * @param {string} languageCode - The unavailable language code
     */
    showLanguageUnavailableError(languageCode) {
        const button = this.element.querySelector(`[data-lang="${languageCode}"]`);
        if (button) {
            button.classList.add('unavailable');
            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('title', `${this.getLanguageName(languageCode)} - Not available`);
        }
    }

    /**
     * Handles error states for unavailable languages
     */
    handleUnavailableLanguages() {
        if (!this.element) return;
        
        const buttons = this.element.querySelectorAll('.language-btn');
        buttons.forEach(btn => {
            const langCode = btn.getAttribute('data-lang');
            if (!this.availableLanguages.includes(langCode)) {
                this.showLanguageUnavailableError(langCode);
            }
        });
    }

    /**
     * Destroys the selector and cleans up event listeners
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.onLanguageChange = null;
    }
}

/**
 * Utility function to create a lyrics language selector
 * @param {string} releaseId - The ID of the current release
 * @param {Array<string>} availableLanguages - Array of available language codes
 * @param {string} currentLanguage - Currently selected language code
 * @param {Function} onLanguageChange - Callback function for language changes
 * @returns {LyricsLanguageSelector} The created selector instance
 */
function createLyricsLanguageSelector(releaseId, availableLanguages, currentLanguage, onLanguageChange) {
    const selector = new LyricsLanguageSelector(releaseId, availableLanguages, currentLanguage);
    
    if (onLanguageChange) {
        selector.setLanguageChangeCallback(onLanguageChange);
    }
    
    return selector;
}

// ==================== LYRICS CACHE MANAGER ====================

/**
 * Manages efficient caching of lyric translations to ensure instant switching between languages.
 * Implements a multi-level caching strategy with in-memory cache and session storage.
 */
class LyricsCacheManager {
    /**
     * @param {Object} config - Configuration options for the cache manager
     * @param {number} [config.maxMemoryCacheSize=50] - Maximum number of releases to cache in memory
     * @param {number} [config.maxSessionStorageSize=100] - Maximum number of releases to cache in session storage
     * @param {string} [config.sessionStorageKey='lyricsCache'] - Key for session storage
     * @param {number} [config.cleanupThreshold=0.8] - Threshold for triggering cleanup (0.8 = 80%)
     */
    constructor(config = {}) {
        this.maxMemoryCacheSize = config.maxMemoryCacheSize || 50;
        this.maxSessionStorageSize = config.maxSessionStorageSize || 100;
        this.sessionStorageKey = config.sessionStorageKey || 'lyricsCache';
        this.cleanupThreshold = config.cleanupThreshold || 0.8;
        
        // In-memory cache for instant access
        this.memoryCache = new Map();
        
        // Access tracking for LRU (Least Recently Used) eviction
        this.accessOrder = new Map();
        
        // Initialize session storage cache
        this.initializeSessionStorage();
        
        // Track cache statistics
        this.stats = {
            memoryHits: 0,
            sessionHits: 0,
            misses: 0,
            preloads: 0
        };
    }
    
    /**
     * Initializes the session storage cache and loads existing data
     */
    initializeSessionStorage() {
        try {
            const stored = sessionStorage.getItem(this.sessionStorageKey);
            if (stored) {
                const sessionCache = JSON.parse(stored);
                // Validate the stored cache structure
                if (sessionCache && typeof sessionCache === 'object') {
                    this.sessionCache = sessionCache;
                } else {
                    this.sessionCache = {};
                }
            } else {
                this.sessionCache = {};
            }
        } catch (error) {
            console.warn('Failed to initialize session storage cache:', error);
            this.sessionCache = {};
        }
    }
    
    /**
     * Gets cached lyrics for a specific release and language
     * @param {string} releaseId - The ID of the release
     * @param {string} language - The language code
     * @returns {string|null} The cached lyrics or null if not found
     */
    getLyrics(releaseId, language) {
        const cacheKey = `${releaseId}:${language}`;
        
        // Check memory cache first (fastest)
        if (this.memoryCache.has(cacheKey)) {
            this.updateAccessOrder(cacheKey);
            this.stats.memoryHits++;
            return this.memoryCache.get(cacheKey);
        }
        
        // Check session storage cache
        if (this.sessionCache[cacheKey]) {
            const lyrics = this.sessionCache[cacheKey];
            
            // Promote to memory cache if we have space
            if (this.memoryCache.size < this.maxMemoryCacheSize) {
                this.memoryCache.set(cacheKey, lyrics);
                this.updateAccessOrder(cacheKey);
            }
            
            this.stats.sessionHits++;
            return lyrics;
        }
        
        this.stats.misses++;
        return null;
    }
    
    /**
     * Caches lyrics for a specific release and language
     * @param {string} releaseId - The ID of the release
     * @param {string} language - The language code
     * @param {string} lyrics - The lyrics content to cache
     */
    setLyrics(releaseId, language, lyrics) {
        const cacheKey = `${releaseId}:${language}`;
        
        // Store in memory cache
        this.memoryCache.set(cacheKey, lyrics);
        this.updateAccessOrder(cacheKey);
        
        // Check if we need to clean up memory cache
        if (this.memoryCache.size > this.maxMemoryCacheSize * this.cleanupThreshold) {
            this.cleanupMemoryCache();
        }
        
        // Store in session storage
        this.sessionCache[cacheKey] = lyrics;
        
        // Check if we need to clean up session storage
        const sessionSize = Object.keys(this.sessionCache).length;
        if (sessionSize > this.maxSessionStorageSize * this.cleanupThreshold) {
            this.cleanupSessionStorage();
        }
        
        // Persist session storage
        this.persistSessionStorage();
    }
    
    /**
     * Preloads all available language versions for a release
     * @param {string} releaseId - The ID of the release
     * @param {string} contentId - The content ID for the lyrics
     * @param {Array<string>} availableLanguages - Array of available language codes
     * @param {Function} loadLyricsFunction - Function to load lyrics for a given language
     * @returns {Promise<Object>} - Object with all loaded lyrics by language
     */
    async preloadAllLanguages(releaseId, contentId, availableLanguages, loadLyricsFunction) {
        const preloadPromises = availableLanguages.map(async (language) => {
            const cacheKey = `${releaseId}:${language}`;
            
            // Check if already cached
            if (this.getLyrics(releaseId, language)) {
                return { language, lyrics: this.getLyrics(releaseId, language) };
            }
            
            // Load and cache
            try {
                const lyrics = await loadLyricsFunction(contentId, language);
                this.setLyrics(releaseId, language, lyrics);
                this.stats.preloads++;
                return { language, lyrics };
            } catch (error) {
                console.warn(`Failed to preload lyrics for ${releaseId} in ${language}:`, error);
                return { language, lyrics: null };
            }
        });
        
        const results = await Promise.all(preloadPromises);
        
        // Convert results to object
        const allLyrics = {};
        results.forEach(({ language, lyrics }) => {
            if (lyrics) {
                allLyrics[language] = lyrics;
            }
        });
        
        return allLyrics;
    }
    
    /**
     * Updates the access order for LRU tracking
     * @param {string} cacheKey - The cache key
     */
    updateAccessOrder(cacheKey) {
        this.accessOrder.set(cacheKey, Date.now());
    }
    
    /**
     * Cleans up the memory cache using LRU eviction
     */
    cleanupMemoryCache() {
        // Sort by access time (oldest first)
        const sortedKeys = Array.from(this.accessOrder.entries())
            .sort((a, b) => a[1] - b[1])
            .map(entry => entry[0]);
        
        // Remove oldest entries until we're under the limit
        const toRemove = sortedKeys.slice(0, this.memoryCache.size - this.maxMemoryCacheSize);
        toRemove.forEach(key => {
            this.memoryCache.delete(key);
            this.accessOrder.delete(key);
        });
    }
    
    /**
     * Cleans up the session storage cache
     */
    cleanupSessionStorage() {
        const keys = Object.keys(this.sessionCache);
        const toRemove = keys.slice(0, keys.length - this.maxSessionStorageSize);
        
        toRemove.forEach(key => {
            delete this.sessionCache[key];
        });
    }
    
    /**
     * Persists the session storage cache to actual session storage
     */
    persistSessionStorage() {
        try {
            sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(this.sessionCache));
        } catch (error) {
            console.warn('Failed to persist session storage cache:', error);
            
            // If session storage is full, clear it and try again
            if (error.name === 'QuotaExceededError') {
                this.sessionCache = {};
                try {
                    sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(this.sessionCache));
                } catch (retryError) {
                    console.error('Failed to persist session storage even after cleanup:', retryError);
                }
            }
        }
    }
    
    /**
     * Invalidates cache entries for a specific release
     * @param {string} releaseId - The ID of the release to invalidate
     */
    invalidateRelease(releaseId) {
        // Remove from memory cache
        const keysToDelete = [];
        for (const key of this.memoryCache.keys()) {
            if (key.startsWith(`${releaseId}:`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => {
            this.memoryCache.delete(key);
            this.accessOrder.delete(key);
        });
        
        // Remove from session storage
        const sessionKeys = Object.keys(this.sessionCache);
        sessionKeys.forEach(key => {
            if (key.startsWith(`${releaseId}:`)) {
                delete this.sessionCache[key];
            }
        });
        
        // Persist changes
        this.persistSessionStorage();
    }
    
    /**
     * Invalidates all cache entries
     */
    invalidateAll() {
        this.memoryCache.clear();
        this.accessOrder.clear();
        this.sessionCache = {};
        this.persistSessionStorage();
    }
    
    /**
     * Gets cache statistics
     * @returns {Object} - Cache statistics
     */
    getStats() {
        return {
            ...this.stats,
            memoryCacheSize: this.memoryCache.size,
            sessionStorageSize: Object.keys(this.sessionCache).length,
            memoryCacheLimit: this.maxMemoryCacheSize,
            sessionStorageLimit: this.maxSessionStorageSize
        };
    }
    
    /**
     * Checks if lyrics are cached for a specific release and language
     * @param {string} releaseId - The ID of the release
     * @param {string} language - The language code
     * @returns {boolean} - True if cached, false otherwise
     */
    hasLyrics(releaseId, language) {
        const cacheKey = `${releaseId}:${language}`;
        return this.memoryCache.has(cacheKey) || !!this.sessionCache[cacheKey];
    }
    
    /**
     * Gets all cached languages for a release
     * @param {string} releaseId - The ID of the release
     * @returns {Array<string>} - Array of cached language codes
     */
    getCachedLanguages(releaseId) {
        const languages = new Set();
        const prefix = `${releaseId}:`;
        
        // Check memory cache
        for (const key of this.memoryCache.keys()) {
            if (key.startsWith(prefix)) {
                languages.add(key.substring(prefix.length));
            }
        }
        
        // Check session storage
        for (const key of Object.keys(this.sessionCache)) {
            if (key.startsWith(prefix)) {
                languages.add(key.substring(prefix.length));
            }
        }
        
        return Array.from(languages);
    }
}

// ==================== GLOBAL UTILITY FUNCTIONS ====================

/**
 * Global function to get lyrics cache statistics
 * @returns {Object} Cache statistics
 */
window.getLyricsCacheStats = () => {
    if (window.lyricsCacheManager) {
        return window.lyricsCacheManager.getStats();
    }
    return null;
};

/**
 * Global function to clear lyrics cache
 */
window.clearLyricsCache = () => {
    if (window.lyricsCacheManager) {
        window.lyricsCacheManager.invalidateAll();
    }
};