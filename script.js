/**
 * @fileoverview Main application script for La Sonora Volcánica website.
 * @version 1.1.7
 * @description This script handles the entire frontend logic for the La Sonora Volcánica website,
 * AGGRESSIVE REFACTOR: Completely restructured Discography and Collaborator Info panels to match the working Release Info panel structure.
 * including dynamic content loading, UI interactions, audio playback, and internationalization.
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
 * @since 2024
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

    // ==================== INITIALIZATION ====================

    /**
     * Initializes the application when the DOM is fully loaded.
     * Sets up the data loader and starts the application.
     */
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize scrollbar width calculation for scroll lock
        document.documentElement.classList.add('scroll-lock-init');

        // Import the data loader module which handles all content loading
        import('./scripts/data-loader.js').then(({ dataLoader }) => {
            initializeApp(dataLoader);
        }).catch(error => {
            console.error('Failed to load data modules:', error);
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

        // ==================== DOM ELEMENT CACHING ====================
        // Cache frequently used DOM elements for better performance
        const body = document.body;
        const musicGrid = document.querySelector('.music-grid');
        const collabsGrid = document.querySelector('.collabs-grid');
        const mainNav = document.querySelector('.main-nav');

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
                // For discography list - restore original compact layout
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
                
                card.appendChild(img);
                card.appendChild(infoDiv);
                card.appendChild(linksDiv);
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
             * Opens the side panel with optional direction and sets up focus trapping.
             * @param {boolean} [fromLeft=false] - Whether the panel should slide in from the left.
             */
            const openPanel = (fromLeft = false) => {
                scrollLock.enable();
                
                // Set panel direction
                if (fromLeft) {
                    sidePanel.classList.add('from-left');
                } else {
                    sidePanel.classList.remove('from-left');
                }
                
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
             * Populates the side panel with the full discography.
             * Sets the panel title and content, then opens the panel.
             */
            const showDiscography = () => {
                panelTitle.dataset.key = 'fullDiscographyTitle';
                panelTitle.textContent = translations.ui.fullDiscographyTitle;
                
                // Create content with the same structure as Release Info panel
                const contentFragment = document.createDocumentFragment();
                
                // Create discography list wrapper
                const discographyList = document.createElement('div');
                discographyList.className = 'discography-list';
                populateDiscographyList(discographyList);
                contentFragment.appendChild(discographyList);
                
                // Clear and populate panel content
                panelContent.innerHTML = '';
                panelContent.appendChild(contentFragment);
                openPanel(false); // Open from right
            };

            /**
             * Populates the side panel with a specific collaborator's details.
             * @param {Object} collab - The collaborator data object.
             */
            const showCollaborator = (collab) => {
                panelTitle.removeAttribute('data-key');
                panelTitle.textContent = collab.name;
                
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
                
                // Create discography list wrapper - CRITICAL: This must be a direct child of contentFragment
                const discographyList = document.createElement('div');
                discographyList.className = 'discography-list';
                
                // Get all songs for this collaborator and create music cards for each
                let hasSongs = false;
                collab.songIds.forEach(songId => {
                    const song = dataLoader.getCollaboratorSong(songId);
                    if (song) {
                        hasSongs = true;
                        const songCard = createMusicCard(song, false);
                        discographyList.appendChild(songCard);
                    }
                });
                
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
                
                // Clear and populate panel content
                panelContent.innerHTML = '';
                panelContent.appendChild(contentFragment);
                openPanel(true); // Open from left
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
            const showReleaseInfo = (release) => {
                panelTitle.textContent = release.title;
                
                // Create content safely
                const contentFragment = document.createDocumentFragment();
                
                // --- Optimized Header: Use the small release card component ---
                const headerWrapper = document.createElement('div');
                headerWrapper.className = 'discography-list';
                const headerCard = createMusicCard(release, false, true); // Pass true to disable title action
                headerWrapper.appendChild(headerCard);
                contentFragment.appendChild(headerWrapper);

                // Text content container
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
                    const lyricsP = document.createElement('p');
                    lyricsP.className = 'collab-details-bio';
                    lyricsP.style.whiteSpace = 'pre-wrap';
                    lyricsP.textContent = dataLoader.resolveContent(release.contentIds.lyrics, 'lyrics', currentLang);
                    lyricsPane.appendChild(lyricsP);
                    textContent.appendChild(lyricsPane);
                    panes.push(lyricsPane);
                }

                if (hasGallery) {
                    const galleryTab = document.createElement('button');
                    galleryTab.className = 'song-info-tab';
                    if (!hasStory && !hasLyrics) galleryTab.classList.add('active'); // Make first tab active
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
                        tabs.forEach(t => t.classList.remove('active'));
                        panes.forEach(p => p.classList.remove('active'));
                        tab.classList.add('active');
                        panes[index].classList.add('active');
                    });
                });

                contentFragment.appendChild(textContent);
                
                panelContent.innerHTML = '';
                panelContent.appendChild(contentFragment);
                openPanel(false); // Open from right
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
            
            // Flag to track if we're intentionally closing the player
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
            
            const loadTrack = (track) => {
                // Clean up previous track
                if (playerElements.audio.src) {
                    playerElements.audio.pause();
                    playerElements.audio.currentTime = 0;
                }
                
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
                    // Check if the clicked song belongs to a release or a collaborator
                    const release = dataLoader.releases.find(r => r.coverArt === imgSrc);
                    
                    if(release && window.loadTrack) {
                        window.loadTrack(release);
                    } else {
                        // Check collaborator songs
                        for (const collab of dataLoader.collaborators) {
                            for (const songId of collab.songIds) {
                                const song = dataLoader.getCollaboratorSong(songId);
                                if (song && song.coverArt === imgSrc && window.loadTrack) {
                                    window.loadTrack(song);
                                    return;
                                }
                            }
                        }
                    }
                }
            } else if (action === 'open-collab-panel') {
                const collabId = actionTarget.dataset.collabId;
                const collabData = dataLoader.collaborators.find(c => c.id === collabId);
                if (collabData && window.showCollaborator) window.showCollaborator(collabData);
            } else if (action === 'open-release-panel') {
                const releaseTitle = actionTarget.dataset.releaseTitle;
                const releaseData = dataLoader.releases.find(r => r.title === releaseTitle);
                if (releaseData && window.showReleaseInfo) window.showReleaseInfo(releaseData);
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

        // ==================== INITIAL SETUP ====================
        // Run all population functions and set the initial language.
        populateFeaturedGrid();
        populateCollabsGrid();
        updateContent(currentLang);
        
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
            
            // Auto-run test in development mode
            setTimeout(() => {
                if (window.testPanels) window.testPanels();
            }, 2000);
        }
    };

})();