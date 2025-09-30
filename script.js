// IIFE (Immediately Invoked Function Expression) to create a private scope
// and prevent polluting the global namespace.
(function() {
    'use strict'; // Enforces stricter parsing and error handling in JavaScript.

    // --- CONFIGURATION AND CONSTANTS ---
    const CONFIG = {
        PLAYER_HEIGHT: 80,
        MOBILE_BREAKPOINT: 768,
        ANIMATION_DURATION: 400,
        SWIPE_THRESHOLD: 100,
        SEEK_MAX: 100,
        SUPPORTED_LANGUAGES: ['en', 'es', 'fr']
    };

    // Environment detection
    const IS_DEVELOPMENT = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

    // --- DATA: SINGLE SOURCE OF TRUTH ---
    // All dynamic content is managed from these arrays.
    // To update the site, only this section needs to be edited.

    const releases = [
        {
            title: 'Cumbia del Barrio', year: '2025',
            coverArt: 'images/art-cumbia-del-barrio.jpg',
            audioSrc: 'audio/single-cumbia-del-barrio.mp3',
            featured: true,
            links: { spotify: '#',
                     apple: '#',
                     youtube: '#',
                     bandcamp: 'https://lasonoravolcanica.bandcamp.com/track/cumbia-del-barrio' }
        },
        {
            title: 'Sol Sol', year: '2024',
            coverArt: 'images/art-sol-sol.jpg',
            audioSrc: 'audio/single-sol-sol.mp3',
            featured: true,
            links: { spotify: 'https://open.spotify.com/track/7sZ4YZulX0C2PsF9Z2RX7J?si=7444364b275d4196',
                     apple: 'https://music.apple.com/us/album/sol-sol/1784468155?i=1784468156',
                     youtube: 'https://youtu.be/0qwddtff0iQ?si=BdvSkA0Hr7ACD8n_',
                     bandcamp: 'https://lasonoravolcanica.bandcamp.com/track/sol-sol' }
        },
        {
            title: 'Tindaya', year: '2026',
            coverArt: 'images/art-tindaya.jpg',
            audioSrc: 'audio/album-tindaya.mp3',
            featured: false,
            links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
        },
        {
            title: 'Secreto del Sur', year: '2025',
            coverArt: 'images/art-secreto-del-sur.jpg',
            audioSrc: 'audio/album-secreto-del-sur.mp3',
            featured: false,
            links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
        },
        {
            title: 'Costa del Norte', year: '2024',
            coverArt: 'images/art-costa-del-norte.jpg',
            audioSrc: 'audio/album-costa-del-norte.mp3',
            featured: false,
            links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
        },
        {
            title: 'Surf Fuerteventura', year: '2024',
            coverArt: 'images/art-surf-fuerteventura.jpg',
            audioSrc: 'audio/album-surf-fuerteventura.mp3',
            featured: false,
            links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
        }
    ];

    const collaborators = [
        {
            id: 'cututo',
            name: 'Cututo',
            photoSrc: 'images/collab-cututo.jpg',
            link: 'https://open.spotify.com/artist/3jehqC1A1uGwGwOOtUWBSl?si=kruSiF6LSQmWiWxOdmJ3-w',
            song: {
                title: 'Tendido Cero Sentido',
                year: '2025',
                coverArt: 'images/art-tendido-cero-sentido.jpg',
                audioSrc: 'audio/single-tendido-cero-sentido.mp3',
                links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
            },
            bio: {
                en: `Some say the world will end in fire, some say in ice. But in the sonic universe of Cututo, the cataclysm is a far more intimate affair—a "Big Bang" of bolero-fueled emotion exploding from the depths of a tormented heart. This is the world of Hernán Alonso Gonzales Valdivia, a troubadour from Trujillo, Peru, who wields tradition like a sharpened blade, carving out a space for the beautifully broken and the defiantly queer.\n\nForged in the crucible of reality television's La Voz Perú, he now wages a far more personal war. His weapons are the ghosts of bolero, the pulse of cumbia, and the sorrowful grace of vals criollo. But this is no history lesson. Cututo drags these classic forms into the heart of modern life, giving voice to the agony of being ghosted online, the righteous fury of political protest, and the defiant struggle of queer identity in a world that demands conformity. From his current base in Buenos Aires, Cututo continues a sacred mission: to prove that the old gods of Latin American music are not dead, but merely waiting for a soul brave enough to make them roar again.`,
                es: `Algunos dicen que el mundo acabará en fuego, otros que en hielo. Pero en el universo sónico de Cututo, el cataclismo es un asunto mucho más íntimo: un "Big Bang" de emoción alimentada por boleros que explota desde las profundidades de un corazón atormentado. Este es el mundo de Hernán Alonso Gonzales Valdivia, un trovador de Trujillo, Perú, que empuña la tradición como una cuchilla afilada, abriendo un espacio para lo hermosamente roto y lo desafiantemente queer.\n\nForjado en el crisol del reality show La Voz Perú, ahora libra una guerra mucho más personal. Sus armas son los fantasmas del bolero, el pulso de la cumbia y la dolorosa gracia del vals criollo. Pero esto no es una lección de historia. Cututo arrastra estas formas clásicas al corazón de la vida moderna, dando voz a la agonía de ser ignorado en línea, a la furia justa de la protesta política y a la lucha desafiante de la identidad queer en un mundo que exige conformidad. Desde su base actual en Buenos Aires, Cututo continúa una misión sagrada: demostrar que los viejos dioses de la música latinoamericana no están muertos, sino simplemente esperando un alma lo suficientemente valiente como para hacerlos rugir de nuevo.`,
                fr: `Certains disent que le monde finira dans le feu, d'autres dans la glace. Mais dans l'univers sonore de Cututo, le cataclysme est une affaire bien plus intime : un « Big Bang » d'émotion nourrie au boléro, explosant des profondeurs d'un cœur tourmenté. C'est le monde d'Hernán Alonso Gonzales Valdivia, un troubadour de Trujillo, au Pérou, qui manie la tradition comme une lame aiguisée, créant un espace pour les magnifiquement brisés et les fièrement queer.\n\nForgé dans le creuset de la télé-réalité La Voz Perú, il mène désormais une guerre bien plus personnelle. Ses armes sont les fantômes du boléro, le pouls de la cumbia et la grâce douloureuse du vals criollo. Mais ce n'est pas une leçon d'histoire. Cututo transpose ces formes classiques au cœur de la vie moderne, donnant une voix à l'agonie d'être « ghosté » en ligne, à la fureur juste de la protestation politique et à la lutte provocante de l'identité queer dans un monde qui exige la conformité. Depuis sa base actuelle à Buenos Aires, Cututo poursuit une mission sacrée : prouver que les anciens dieux de la musique latino-américaine ne sont pas morts, mais attendent simplement une âme assez courageuse pour les faire rugir à nouveau.`
            }
        },
        {
            id: 'piero',
            name: 'Piero Fava',
            photoSrc: 'images/collab-piero.jpg',
            link: '#',
            song: {
                title: 'Tendido Cero Sentido',
                year: '2025',
                coverArt: 'images/art-tendido-cero-sentido.jpg',
                audioSrc: 'audio/single-tendido-cero-sentido.mp3',
                links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
            },
            bio: {
                en: `Covid came. The world went dark. And in that suffocating silence, Piero—a painter, a warrior of ink who marks skin for a living—looked up at the stars and saw not escape, but a reflection. He saw Taurus, the bull, burning in the cosmos, pure and eternal. And down on a blood-soaked Earth, he saw its sacred form defiled in the ring.\n\nThis isn't just a poem. It's a midnight confession, a primal scream against the "art" of the slaughterhouse. It's a hymn to the noble beast he revered as a child, channeled into lyrics so raw they could only have been born in confinement. He handed this shard of his soul to La Sonora Volcánica, who forged it into sonic fire. The message is simple, brutal, and true: life is sacred. Suffering will never be art.`,
                es: `En plena oscuridad, cuando el mundo se encerró, Piero encontró su grito en las estrellas. Tatuador de profesión, pintor de alma, miró al cielo y vio en la constelación de Tauro el reflejo de una nobleza ancestral, una fuerza pura que recordaba desde niño. Y en la tierra, vio a esa misma bestia sagrada profanada en el ruedo.\n\nEstas letras no nacieron de la tinta, sino de las entrañas. Son una confesión a oscuras, una rabia destilada contra la carnicería disfrazada de arte. Es un manifiesto forjado en el silencio de la pandemia, un arma lírica que La Sonora Volcánica transformó en incendio sonoro. Su mensaje es brutalmente simple, un juramento de corazón: la vida es sagrada. El sufrimiento jamás será arte.`,
                fr: `Quand le monde s'est arrêté, Piero a trouvé ses armes dans l'obscurité. Artiste-tatoueur, habitué à marquer les corps, il a tourné son encre vers le ciel. Contemplant la constellation du Taureau, il a vu un symbole cosmique de noblesse trahie sur Terre, dans l'arène sanglante.\n\nCe n'est pas qu'un poème ; c'est une déclaration de guerre née du confinement, une rage pure contre le spectacle de la mort. C'est l'écho de son enfance, un hommage à la force tranquille de la nature, transformé en un réquisitoire féroce. Mis en musique par La Sonora Volcánica, son message résonne comme une vérité première, une évidence du cœur : la souffrance ne sera jamais un art.`
            }
        }
    ];
    
    let currentLang = 'en';

    // --- ELEMENT SELECTORS (Cached for performance) ---
    const elements = {
        body: document.body,
        musicGrid: document.querySelector('.music-grid'),
        collabsGrid: document.querySelector('.collabs-grid'),
        sidePanel: document.getElementById('side-panel'),
        panelOverlay: document.getElementById('side-panel-overlay'),
        openDiscographyBtn: document.querySelector('.discography-btn'),
        miniPlayer: document.getElementById('mini-player'),
        hamburger: document.querySelector('.hamburger-menu'),
        langButtons: document.querySelectorAll('.lang-btn'),
        translatableElements: document.querySelectorAll('[data-key]')
    };

    // --- INITIALIZATION ---
    // Wait for the HTML document to be fully loaded and parsed.
    document.addEventListener('DOMContentLoaded', () => {
        try {
            initializeApp();
            if (IS_DEVELOPMENT) {
                runSmokeTests();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            showErrorToUser('Failed to load website content. Please refresh the page.');
        }
    });

    /**
     * Initializes the entire application
     * @throws {Error} When critical components fail to initialize
     */
    function initializeApp() {
        // Initialize all components
        initializeSidePanel();
        initializeMiniPlayer();
        initializeNavigation();
        initializeLanguageSystem();
        
        // Populate content
        populateFeaturedGrid();
        populateCollabsGrid();
        updateContent('en');
        
        // Initialize touch gestures
        initializeTouchGestures();
        
        // Initialize performance optimizations
        initializePerformanceOptimizations();
        
        // Track initialization for analytics
        trackEvent('app', 'initialized', 'success');
    }

    /**
     * Runs basic smoke tests to ensure critical functionality works
     */
    function runSmokeTests() {
        const tests = {
            releasesData: () => releases.every(r => r.title && r.year && r.coverArt),
            collaboratorsData: () => collaborators.every(c => c.id && c.name && c.photoSrc),
            domElements: () => Object.values(elements).every(el => el !== null),
            translations: () => Object.keys(translations).every(lang => translations[lang].logoText)
        };
        
        Object.entries(tests).forEach(([name, test]) => {
            try {
                if (!test()) {
                    throw new Error(`Smoke test failed: ${name}`);
                }
            } catch (error) {
                console.warn('Development warning:', error.message);
            }
        });
    }

    // --- PERFORMANCE OPTIMIZATIONS ---
    
    /**
     * Initializes performance optimizations
     */
    function initializePerformanceOptimizations() {
        // Optimize hero animation with Intersection Observer
        if ('IntersectionObserver' in window) {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        entry.target.style.animationPlayState = 
                            entry.isIntersecting ? 'running' : 'paused';
                    });
                });
                observer.observe(heroSection);
            }
        }
        
        // Implement image loading optimization
        optimizeImageLoading();
    }

    /**
     * Optimizes image loading with lazy loading and error handling
     */
    function optimizeImageLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        images.forEach(img => {
            // Add loading state
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn('Failed to load image:', img.src);
                img.alt = 'Image failed to load';
                img.classList.add('loaded'); // Still show as loaded to avoid broken layout
            });
        });
    }

    // --- DYNAMIC CONTENT POPULATION FUNCTIONS ---
    
    /**
     * Populates the featured releases on the main page.
     * @throws {Error} When music grid is not found or data is invalid
     */
    function populateFeaturedGrid() {
        if (!elements.musicGrid) {
            throw new Error('Music grid element not found');
        }
        
        try {
            const featuredReleases = releases.filter(r => r.featured);
            const fragment = document.createDocumentFragment();
            
            featuredReleases.forEach(release => {
                const card = createMusicCard(release, true);
                if (card) {
                    fragment.appendChild(card);
                }
            });
            
            elements.musicGrid.innerHTML = '';
            elements.musicGrid.appendChild(fragment);
            
            trackEvent('content', 'featured_grid_populated', `cards: ${featuredReleases.length}`);
        } catch (error) {
            console.error('Failed to populate featured grid:', error);
            elements.musicGrid.innerHTML = '<p class="error-message">Error loading music content</p>';
            throw error;
        }
    }

    /**
     * Creates a music card element
     * @param {Object} release - The release data object
     * @param {boolean} isFeatured - Whether this is for the featured grid
     * @returns {HTMLElement} The created music card element
     */
    function createMusicCard(release, isFeatured = false) {
        const card = document.createElement('div');
        card.className = 'music-card';
        
        const img = document.createElement('img');
        img.src = release.coverArt;
        img.alt = `Cover art for ${release.title}`;
        img.loading = 'lazy';
        img.setAttribute('data-action', 'play-track');
        
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
            console.warn('Failed to load cover art:', release.coverArt);
            img.alt = 'Cover art failed to load';
            img.classList.add('loaded');
        });
        
        if (isFeatured) {
            const overlay = createMusicCardOverlay(release);
            card.appendChild(img);
            card.appendChild(overlay);
        } else {
            const cardContent = createDiscographyCardContent(release);
            card.appendChild(img);
            card.appendChild(cardContent);
        }
        
        return card;
    }

    /**
     * Creates the overlay content for featured music cards
     * @param {Object} release - The release data object
     * @returns {HTMLElement} The overlay element
     */
    function createMusicCardOverlay(release) {
        const overlay = document.createElement('div');
        overlay.className = 'music-card-overlay';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'music-card-info';
        
        const title = document.createElement('h3');
        title.className = 'music-card-title';
        title.textContent = release.title;
        
        const year = document.createElement('p');
        year.className = 'music-card-year';
        year.textContent = release.year;
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(year);
        
        const linksDiv = createStreamingLinks(release.links, release.title, true);
        
        overlay.appendChild(infoDiv);
        overlay.appendChild(linksDiv);
        
        return overlay;
    }

    /**
     * Creates the content for discography list cards
     * @param {Object} release - The release data object
     * @returns {HTMLElement} The card content element
     */
    function createDiscographyCardContent(release) {
        const content = document.createElement('div');
        content.className = 'card-content';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'music-card-info';
        
        const title = document.createElement('h3');
        title.className = 'music-card-title';
        title.textContent = release.title;
        
        const year = document.createElement('p');
        year.className = 'music-card-year';
        year.textContent = release.year;
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(year);
        
        // FIX: Include YouTube for discography cards too
        const linksDiv = createStreamingLinks(release.links, release.title, true);
        
        content.appendChild(infoDiv);
        content.appendChild(linksDiv);
        
        return content;
    }

    /**
     * Creates streaming links element
     * @param {Object} links - The links object
     * @param {string} title - The track title for ARIA labels
     * @param {boolean} includeYouTube - Whether to include YouTube link
     * @returns {HTMLElement} The streaming links element
     */
    function createStreamingLinks(links, title, includeYouTube = true) {
        const linksDiv = document.createElement('div');
        linksDiv.className = 'streaming-links';
        
        const platforms = [
            { key: 'spotify', icon: 'spotify', label: `Listen to ${title} on Spotify` },
            { key: 'apple', icon: 'apple-music', label: `Listen to ${title} on Apple Music` },
            ...(includeYouTube ? [{ key: 'youtube', icon: 'youtube', label: `Watch ${title} on YouTube` }] : []),
            { key: 'bandcamp', icon: 'cart', label: `Download or Buy ${title} on Bandcamp` }
        ];
        
        // FIX: Use innerHTML to properly create the SVG structure
        let linksHTML = '';
        platforms.forEach(platform => {
            if (links[platform.key] && links[platform.key] !== '#') {
                const tooltipText = platform.label.split(' on ')[1];
                linksHTML += `
                    <a href="${links[platform.key]}" target="_blank" rel="noopener noreferrer" class="tooltip" data-tooltip="${tooltipText}" aria-label="${platform.label}">
                        <svg class="icon"><use href="#icon-${platform.icon}"></use></svg>
                    </a>
                `;
            }
        });
        
        linksDiv.innerHTML = linksHTML;
        return linksDiv;
    }

    /**
     * Populates the full list of releases inside the side panel.
     * @param {HTMLElement} listContainer - The container element for the list
     */
    function populateDiscographyList(listContainer) {
        if (!listContainer) {
            console.error('Discography list container not found');
            return;
        }
        
        try {
            const fragment = document.createDocumentFragment();
            
            releases.forEach(release => {
                const card = createMusicCard(release, false);
                if (card) {
                    fragment.appendChild(card);
                }
            });
            
            listContainer.innerHTML = '';
            listContainer.appendChild(fragment);
        } catch (error) {
            console.error('Failed to populate discography list:', error);
            listContainer.innerHTML = '<p class="error-message">Error loading discography</p>';
        }
    }

    /**
     * Populates the grid of collaborators on the main page.
     */
    function populateCollabsGrid() {
        if (!elements.collabsGrid) {
            console.warn('Collaborations grid element not found');
            return;
        }
        
        try {
            const fragment = document.createDocumentFragment();
            
            collaborators.forEach(collab => {
                const card = document.createElement('div');
                card.className = 'collab-card';
                card.setAttribute('data-action', 'open-collab-panel');
                card.setAttribute('data-collab-id', collab.id);
                card.tabIndex = 0; // Make focusable for keyboard navigation
                card.setAttribute('role', 'button');
                card.setAttribute('aria-label', `View details for ${collab.name}`);
                
                const img = document.createElement('img');
                img.src = collab.photoSrc;
                img.alt = `Photo of ${collab.name}`;
                img.className = 'collab-card-photo';
                img.loading = 'lazy';
                
                img.addEventListener('load', () => img.classList.add('loaded'));
                img.addEventListener('error', () => {
                    console.warn('Failed to load collaborator photo:', collab.photoSrc);
                    img.alt = 'Photo failed to load';
                    img.classList.add('loaded');
                });
                
                const name = document.createElement('h3');
                name.className = 'collab-card-name';
                name.textContent = collab.name;
                
                card.appendChild(img);
                card.appendChild(name);
                fragment.appendChild(card);
            });
            
            elements.collabsGrid.innerHTML = '';
            elements.collabsGrid.appendChild(fragment);
        } catch (error) {
            console.error('Failed to populate collaborations grid:', error);
            elements.collabsGrid.innerHTML = '<p class="error-message">Error loading collaborations</p>';
        }
    }

    // --- SIDE PANEL LOGIC ---
    
    /**
     * Initializes the side panel functionality
     */
    function initializeSidePanel() {
        const { sidePanel, panelOverlay } = elements;
        
        if (!sidePanel || !panelOverlay) {
            console.warn('Side panel elements not found');
            return;
        }

        const panelTitle = sidePanel.querySelector('.side-panel-title');
        const panelContent = sidePanel.querySelector('.side-panel-content');
        const closePanelBtn = sidePanel.querySelector('.close-panel-btn');

        if (!panelTitle || !panelContent || !closePanelBtn) {
            console.error('Side panel sub-elements not found');
            return;
        }

        const openPanel = () => {
            sidePanel.classList.add('active');
            panelOverlay.classList.add('active');
            document.addEventListener('keydown', handlePanelEscapeKey);
        };

        const closePanel = () => {
            sidePanel.classList.remove('active');
            panelOverlay.classList.remove('active');
            document.removeEventListener('keydown', handlePanelEscapeKey);
            // FIX: Remove focus restoration to prevent scrolling to top
        };

        /**
         * Handles escape key to close panel
         * @param {KeyboardEvent} e - The keyboard event
         */
        function handlePanelEscapeKey(e) {
            if (e.key === 'Escape') {
                closePanel();
            }
        }

        /**
         * Helper function to create smarter text for the "Visit" button.
         * @param {string} url - The URL to analyze
         * @returns {string} The platform name
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
         * Populates the panel with the full discography.
         */
        const showDiscography = () => {
            try {
                panelTitle.setAttribute('data-key', 'fullDiscographyTitle');
                panelTitle.textContent = translations[currentLang].fullDiscographyTitle;
                panelTitle.id = 'side-panel-title';
                
                // Use safe DOM methods instead of innerHTML
                panelContent.innerHTML = ''; // Clear safely
                
                const textContent = document.createElement('div');
                textContent.className = 'side-panel-text-content';
                
                const listContainer = document.createElement('div');
                listContainer.className = 'discography-list';
                
                textContent.appendChild(listContainer);
                panelContent.appendChild(textContent);
                
                populateDiscographyList(listContainer);
                openPanel();
                
                trackEvent('navigation', 'discography_opened');
            } catch (error) {
                console.error('Failed to show discography:', error);
                showErrorToUser('Failed to load discography');
            }
        };

        /**
         * Populates the panel with a specific collaborator's details.
         * @param {Object} collab - The collaborator data object
         */
        const showCollaborator = (collab) => {
            try {
                panelTitle.removeAttribute('data-key');
                panelTitle.textContent = collab.name;
                panelTitle.id = 'side-panel-title';
                
                const platform = getLinkPlatform(collab.link);
                const visitBtnText = translations[currentLang].collabVisitBtn.replace('%s', `${collab.name} on ${platform}`);

                // Use safe DOM methods instead of innerHTML
                panelContent.innerHTML = ''; // Clear safely
                
                // Create hero image
                const heroImg = document.createElement('img');
                heroImg.src = collab.photoSrc;
                heroImg.alt = `Photo of ${collab.name}`;
                heroImg.className = 'side-panel-hero-image';
                heroImg.loading = 'lazy';
                
                heroImg.addEventListener('error', () => {
                    console.warn('Failed to load collaborator hero image:', collab.photoSrc);
                    heroImg.alt = 'Photo failed to load';
                });
                
                panelContent.appendChild(heroImg);
                
                // Create text content
                const textContent = document.createElement('div');
                textContent.className = 'side-panel-text-content';
                
                // Create song card
                const listContainer = document.createElement('div');
                listContainer.className = 'discography-list';
                
                const songCard = createMusicCard({
                    ...collab.song,
                    featured: false
                }, false);
                
                if (songCard) {
                    listContainer.appendChild(songCard);
                }
                
                textContent.appendChild(listContainer);
                
                // Create bio paragraphs safely
                const bioParagraphs = collab.bio[currentLang].split('\n\n');
                bioParagraphs.forEach(paragraph => {
                    if (paragraph.trim()) {
                        const p = document.createElement('p');
                        p.className = 'collab-details-bio';
                        p.textContent = paragraph;
                        textContent.appendChild(p);
                    }
                });
                
                // Create visit button
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
                
                panelContent.appendChild(textContent);
                openPanel();
                
                trackEvent('navigation', 'collaborator_opened', collab.id);
            } catch (error) {
                console.error('Failed to show collaborator:', error);
                showErrorToUser('Failed to load collaborator details');
            }
        };

        // Event listeners
        if (elements.openDiscographyBtn) {
            elements.openDiscographyBtn.addEventListener('click', showDiscography);
        }
        
        closePanelBtn.addEventListener('click', closePanel);
        panelOverlay.addEventListener('click', closePanel);

        // Use custom events instead of global functions
        document.addEventListener('collaboratorSelected', (e) => {
            if (e.detail && e.detail.collab) {
                showCollaborator(e.detail.collab);
            }
        });
    }

    // --- MINI-PLAYER LOGIC ---
    
    /**
     * Initializes the mini-player functionality
     */
    function initializeMiniPlayer() {
        const { miniPlayer } = elements;
        
        if (!miniPlayer) {
            console.warn('Mini player element not found');
            return;
        }

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
            closePlayerBtn: miniPlayer.querySelector('.close-player-btn')
        };

        // Validate all player elements exist
        if (Object.values(playerElements).some(el => !el)) {
            console.error('Some mini-player elements are missing');
            return;
        }

        /**
         * Formats time in seconds to MM:SS format
         * @param {number} seconds - Time in seconds
         * @returns {string} Formatted time string
         */
        const formatTime = (seconds) => {
            if (isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${String(secs).padStart(2, '0')}`;
        };

        /**
         * Toggles play/pause state
         */
        const togglePlay = () => {
            if (!playerElements.audio.src) return;
            
            if (playerElements.audio.paused) {
                playerElements.audio.play().catch(error => {
                    console.error('Playback failed:', error);
                    showErrorToUser('Failed to play audio');
                });
            } else {
                playerElements.audio.pause();
            }
        };

        /**
         * Updates the play/pause button state
         */
        const updatePlayButton = () => {
            if (!playerElements.iconPlay || !playerElements.iconPause) return;
            
            const isPlaying = !playerElements.audio.paused;
            playerElements.iconPlay.classList.toggle('hidden', isPlaying);
            playerElements.iconPause.classList.toggle('hidden', !isPlaying);
            
            // Update ARIA label for accessibility
            playerElements.playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
        };

        /**
         * Loads a track into the player
         * @param {Object} track - The track data object
         */
        const loadTrack = async (track) => {
            try {
                if (!track.audioSrc) {
                    throw new Error('No audio source provided');
                }
                
                playerElements.coverArt.src = track.coverArt;
                playerElements.coverArt.alt = `Cover art for ${track.title}`;
                playerElements.title.textContent = track.title;
                playerElements.audio.src = track.audioSrc;
                
                // Reset UI
                playerElements.seekSlider.value = 0;
                playerElements.currentTimeEl.textContent = '0:00';
                playerElements.totalTimeEl.textContent = '0:00';
                
                miniPlayer.classList.add('active');
                elements.body.classList.add('player-active');
                
                // Wait for audio to be ready
                await playerElements.audio.play();
                
                trackEvent('audio', 'track_loaded', track.title);
            } catch (error) {
                console.error('Failed to load track:', error);
                showErrorToUser('Failed to load audio track');
                
                // Ensure player is visible even if audio fails
                miniPlayer.classList.add('active');
                elements.body.classList.add('player-active');
            }
        };

        /**
         * Closes the player and cleans up
         */
        const closePlayer = () => {
            playerElements.audio.pause();
            playerElements.audio.src = '';
            miniPlayer.classList.remove('active');
            elements.body.classList.remove('player-active');
            
            trackEvent('audio', 'player_closed');
        };

        // FIX: Use direct event listeners without AbortController for close button
        playerElements.playPauseBtn.addEventListener('click', togglePlay);
        playerElements.audio.addEventListener('play', updatePlayButton);
        playerElements.audio.addEventListener('pause', updatePlayButton);
        playerElements.audio.addEventListener('loadedmetadata', () => {
            playerElements.totalTimeEl.textContent = formatTime(playerElements.audio.duration);
            playerElements.seekSlider.max = Math.floor(playerElements.audio.duration);
        });
        
        playerElements.audio.addEventListener('timeupdate', () => {
            playerElements.currentTimeEl.textContent = formatTime(playerElements.audio.currentTime);
            playerElements.seekSlider.value = Math.floor(playerElements.audio.currentTime);
        });
        
        playerElements.audio.addEventListener('error', (e) => {
            console.error('Audio element error:', e);
            showErrorToUser('Audio playback error');
        });
        
        playerElements.seekSlider.addEventListener('input', () => {
            playerElements.audio.currentTime = playerElements.seekSlider.value;
        });
        
        // FIX: Ensure close player button works properly
        playerElements.closePlayerBtn.addEventListener('click', closePlayer);

        // Use custom events instead of global functions
        document.addEventListener('trackSelected', (e) => {
            if (e.detail && e.detail.track) {
                loadTrack(e.detail.track);
            }
        });
    }

    // --- NAVIGATION AND TOUCH GESTURES ---
    
    /**
     * Initializes navigation functionality
     */
    function initializeNavigation() {
        const { hamburger, body } = elements;
        
        if (!hamburger) return;

        hamburger.addEventListener('click', () => {
            const isOpening = !body.classList.contains('nav-open');
            body.classList.toggle('nav-open');
            hamburger.setAttribute('aria-expanded', body.classList.contains('nav-open'));
        });
    }

    /**
     * Initializes touch gestures for mobile
     */
    function initializeTouchGestures() {
        const { sidePanel } = elements;
        if (!sidePanel) return;

        let touchStartX = 0;
        let touchStartY = 0;

        sidePanel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        sidePanel.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Only handle horizontal swipes with minimal vertical movement
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffY) < 30) {
                if (diffX > CONFIG.SWIPE_THRESHOLD) {
                    // Swipe right to close
                    const closePanelBtn = sidePanel.querySelector('.close-panel-btn');
                    if (closePanelBtn) closePanelBtn.click();
                }
            }
        }, { passive: true });
    }

    // --- MULTILINGUAL CONTENT MANAGEMENT ---
    
    const translations = {
        en: {
            logoText: "La Sonora Volcánica", navMusic: "Music", navMap: "Surf Map", navAbout: "About", navCollabs: "Collaborations",
            heroTagline: "La Sonora Volcánica—cumbia on the edge, stories on the loose, and no brakes in sight.", heroButton: "Explore The Music",
            musicTitle: "Music", discographyBtn: "View Full Discography", fullDiscographyTitle: "Discography",
            aboutTitle: "The Story",
            aboutBio: `Forget the quiet start. This begins in 1985, with a 14-year-old pushing raw data through primitive sound chips, bending silicon to his will on the computer demo scene. Two years later, Frédéric Guigand strapped on a guitar and mainlined the raw voltage of rock and blues.\n\nThe signal led him to England, where he chased the ghost of jazz, not just to play it, but to crack its code, decoding its sacred geometry through theory. Then, a hard left turn: back to France for a civil service stint that was anything but civil. He ran away and joined the circus—literally—trading the stage for the big top, blasting notes with the circus orchestra.\n\nBut the real rewiring was yet to come. As a DJ and later as the music curator for ZipDJ, he became a sonic shaman for DJs worldwide. He didn't just listen to Latin music; he mainlined it—a river of salsa, bachata, and merengue, and tens of thousands of cumbia tracks that permanently altered his musical DNA. He learned what makes a track ignite a dance floor, what makes a rhythm possess you.\n\nIn 2024, that knowledge exploded. La Sonora Volcánica was born. The first project: a series of instrumental albums paying tribute to the surf spots of Fuerteventura, fusing the psychedelic heat of '60s Peruvian chicha with the salt-sprayed cool of surf guitar.\n\nNow, the stories are being set loose, starting with the electrocumbia fever dream "Sol Sol." Collaborations are igniting with Mexico's cumbia outlaws, Los Mexaterrestres, and the soul-drenched Peruvian troubadour, Cututo. As Frédéric says, "Every rhythm, every lyric is a story waiting to be told."\n\nThis isn't background music. It's a seismic event. The only question is: are you ready for the shockwave?`,
            collabsTitle: "Collaborations",
            collabVisitBtn: "Visit %s",
        },
        es: {
            logoText: "La Sonora Volcánica", navMusic: "Música", navMap: "Mapa de Surf", navAbout: "Bio", navCollabs: "Colaboraciones",
            heroTagline: "La Sonora Volcánica—cumbia al límite, historias sueltas y sin frenos a la vista.", heroButton: "Explorar La Música",
            musicTitle: "Música", discographyBtn: "Ver Discografía Completa", fullDiscographyTitle: "Discografía",
            aboutTitle: "La Historia",
            aboutBio: `Olvida los comienzos tranquilos. Esto arranca en 1985, con un chaval de 14 años forzando datos crudos a través de chips de sonido primitivos, doblegando el silicio a su voluntad en la escena demo de ordenadores. Dos años después, Frédéric Guigand se colgó una guitarra y se inyectó en vena el voltaje puro del rock y del blues.\n\nLa señal lo llevó a Inglaterra, donde persiguió el fantasma del jazz, no solo para tocarlo, sino para descifrar su código, decodificando su geometría sagrada a través de la teoría. Luego, un giro brusco: de vuelta a Francia para un servicio civil que fue de todo menos civilizado. Se escapó para unirse al circo —literalmente— cambiando el escenario por la carpa, disparando notas con la orquesta del circo.\n\nPero el verdadero recableado neuronal estaba por llegar. Como DJ y más tarde como curador musical para ZipDJ, se convirtió en un chamán sónico para DJs de todo el mundo. No solo escuchaba música latina; se la metió en vena: un río de salsa, bachata y merengue, y decenas de miles de cumbias que alteraron permanentemente su ADN musical. Aprendió qué hace que un tema incendie una pista de baile, qué hace que un ritmo te posea.\n\nEn 2024, ese conocimiento explotó. Nació La Sonora Volcánica. El primer proyecto: una serie de álbumes instrumentales en tributo a los spots de surf de Fuerteventura, fusionando el calor psicodélico de la chicha peruana de los 60 con la frescura salada de la guitarra surf.\n\nAhora, las historias andan sueltas, empezando con el sueño febril de electrocumbia "Sol Sol". Se están encendiendo colaboraciones con los forajidos de la cumbia de México, Los Mexaterrestres, y el trovador peruano con alma de bolero, Cututo. Como dice Frédéric: "Cada ritmo, cada letra es una historia esperando ser contada".\n\nEsto no es música de fondo. Es un evento sísmico. La única pregunta es: ¿estás listo para la onda expansiva?`,
            collabsTitle: "Colaboraciones",
            collabVisitBtn: "Visitar a %s",
        },
        fr: {
            logoText: "La Sonora Volcánica", navMusic: "Musique", navMap: "Carte de Surf", navAbout: "À Propos", navCollabs: "Collaborations",
            heroTagline: "La Sonora Volcánica—la cumbia à la limite, des histoires en liberté et sans freins en vue.", heroButton: "Explorer La Musique",
            musicTitle: "Musique", discographyBtn: "Voir la Discographie", fullDiscographyTitle: "Discographie",
            aboutTitle: "L'Histoire",
            aboutBio: `Oubliez les débuts tranquilles. Ça commence en 1985, avec un gamin de 14 ans qui pousse des données brutes à travers des puces sonores primitives, pliant le silicium à sa volonté sur la scène démo informatique. Deux ans plus tard, Frédéric Guigand s'empare d'une guitare et s'injecte la tension brute du rock et du blues.\n\nLe signal l'a mené en Angleterre, où il a chassé le fantasma du jazz, non pas juste pour le jouer, mais pour en percer le code, décodant sa géométrie sacrée par la théorie. Puis, un virage serré : retour en France pour un service civil tout sauf civilisé. Il a fugué pour rejoindre le circo — littéralement — troquant la scène pour le chapiteau, balançant des notes avec l'orchestre du circo.\n\nMais le vrai recâblage était à venir. En tant que DJ, puis curateur musical pour ZipDJ, il est devenu un chaman sonique pour les DJ du monde entier. Il n'a pas seulement écouté la musique latine ; il se l'est injectée en intraveineuse — un fleuve de salsa, de bachata et de merengue, et des dizaines de milliers de morceaux de cumbia qui ont altéré à jamais son ADN musical. Il a appris ce qui enflamme un dancefloor, ce qui fait qu'un rythme vous possède.\n\nEn 2024, cette connaissance a explosé. La Sonora Volcánica est née. Le premier projet : une série d'albums instrumentaux en hommage aux spots de surf de Fuerteventura, fusionnant la chaleur psychédélique de la chicha péruvienne des années 60 avec la fraîcheur salée de la guitare surf.\n\nMaintenant, les histoires sont lâchées, à commencer par le rêve fiévreux d'électrocumbia "Sol Sol". Des collaborations s'embrasent avec les hors-la-loi de la cumbia du Mexique, Los Mexaterrestres, et le troubadour péruvien à l'âme de boléro, Cututo. Comme le dit Frédéric : « Chaque rythme, chaque parole est une histoire qui attend d'être racontée. »\n\nCe n'est pas de la musique de fond. C'est un événement sismique. La seule question est : êtes-vous prêt pour l'onde de choc ?`,
            collabsTitle: "Collaborations",
            collabVisitBtn: "Visiter %s",
        }
    };

    /**
     * Initializes the language switching system
     */
    function initializeLanguageSystem() {
        elements.langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedLang = button.getAttribute('data-lang');
                if (selectedLang && CONFIG.SUPPORTED_LANGUAGES.includes(selectedLang)) {
                    elements.langButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    updateContent(selectedLang);
                    
                    trackEvent('language', 'switched', selectedLang);
                }
            });
        });
    }

    /**
     * Updates all content to the specified language
     * @param {string} lang - The language code to switch to
     */
    function updateContent(lang) {
        currentLang = lang;
        document.documentElement.lang = lang; // Update HTML lang attribute
        
        elements.translatableElements.forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                if (key === 'aboutBio') {
                    // Use safe method for bio content
                    element.innerHTML = ''; // Clear first
                    const paragraphs = translations[lang][key].split('\n\n');
                    paragraphs.forEach(paragraph => {
                        if (paragraph.trim()) {
                            const p = document.createElement('p');
                            p.textContent = paragraph;
                            element.appendChild(p);
                        }
                    });
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
    }

    // --- EVENT DELEGATION AND ERROR HANDLING ---
    
    /**
     * Shows error message to user
     * @param {string} message - The error message to display
     */
    function showErrorToUser(message) {
        // In a real implementation, this would show a user-friendly error message
        console.error('User error:', message);
    }

    /**
     * Tracks events for analytics
     * @param {string} category - The event category
     * @param {string} action - The event action
     * @param {string} label - The event label
     */
    function trackEvent(category, action, label = '') {
        if (IS_DEVELOPMENT) {
            console.log('Event tracked:', { category, action, label });
        }
    }

    // A single event listener on the body handles clicks for multiple actions.
    document.body.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        const action = actionTarget.dataset.action;

        if (action === 'play-track') {
            const musicCard = actionTarget.closest('.music-card');
            if (musicCard) {
                const imgSrc = musicCard.querySelector('img').getAttribute('src');
                // Check if the clicked song belongs to a release or a collaborator
                const release = releases.find(r => r.coverArt === imgSrc);
                const collab = collaborators.find(c => c.song.coverArt === imgSrc);
                
                if (release) {
                    document.dispatchEvent(new CustomEvent('trackSelected', {
                        detail: { track: release }
                    }));
                } else if (collab) {
                    document.dispatchEvent(new CustomEvent('trackSelected', {
                        detail: { track: collab.song }
                    }));
                }
            }
        } else if (action === 'open-collab-panel') {
            const collabId = actionTarget.dataset.collabId;
            const collabData = collaborators.find(c => c.id === collabId);
            if (collabData) {
                document.dispatchEvent(new CustomEvent('collaboratorSelected', {
                    detail: { collab: collabData }
                }));
            }
        }
    });

    // Handle unhandled errors
    window.addEventListener('error', (e) => {
        console.error('Unhandled error:', e.error);
        trackEvent('error', 'unhandled', e.message);
    });

    // Handle promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        trackEvent('error', 'unhandled_promise', e.reason?.message || 'Unknown');
    });

})();