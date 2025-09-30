// --- Version: 1.0.0 ---
// --- La Sonora Volcánica Website Script ---
// --- Updated with security, accessibility, and performance improvements ---

// IIFE (Immediately Invoked Function Expression) to create a private scope
// and prevent polluting the global namespace.
(function() {
    'use strict'; // Enforces stricter parsing and error handling in JavaScript.

    // Utility functions
    const sanitizeHTML = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Wait for the HTML document to be fully loaded and parsed.
    document.addEventListener('DOMContentLoaded', () => {

        // --- 1. DATA: SINGLE SOURCE OF TRUTH ---
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

        // --- 2. Element Selectors (Cached for performance) ---
        const body = document.body;
        const musicGrid = document.querySelector('.music-grid');
        const collabsGrid = document.querySelector('.collabs-grid');

        // --- 3. Dynamic Content Population Functions ---
        // Create music card element safely
        function createMusicCard(release, isFeatured = false) {
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
                img.src = 'images/placeholder-album.jpg';
                img.alt = 'Album artwork unavailable';
            };
            
            card.appendChild(img);
            
            if (isFeatured) {
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
                
                const linksDiv = document.createElement('div');
                linksDiv.className = 'streaming-links';
                
                // Create streaming links with security attributes
                const platforms = [
                    { key: 'spotify', icon: 'icon-spotify', tooltip: 'Spotify' },
                    { key: 'apple', icon: 'icon-apple-music', tooltip: 'Apple Music' },
                    { key: 'youtube', icon: 'icon-youtube', tooltip: 'YouTube' },
                    { key: 'bandcamp', icon: 'icon-cart', tooltip: 'Download / Buy' }
                ];
                
                platforms.forEach(platform => {
                    if (release.links[platform.key] && release.links[platform.key] !== '#') {
                        const link = document.createElement('a');
                        link.href = release.links[platform.key];
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.className = 'tooltip';
                        link.setAttribute('data-tooltip', platform.tooltip);
                        link.setAttribute('aria-label', `Listen to ${release.title} on ${platform.tooltip}`);
                        
                        const svg = document.createElement('svg');
                        svg.className = 'icon';
                        const use = document.createElement('use');
                        use.setAttribute('href', `#${platform.icon}`);
                        svg.appendChild(use);
                        
                        link.appendChild(svg);
                        linksDiv.appendChild(link);
                    }
                });
                
                overlay.appendChild(infoDiv);
                overlay.appendChild(linksDiv);
                card.appendChild(overlay);
            } else {
                // For discography list
                const contentDiv = document.createElement('div');
                contentDiv.className = 'card-content';
                
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
                
                const linksDiv = document.createElement('div');
                linksDiv.className = 'streaming-links';
                
                // Limited links for discography view
                const discographyPlatforms = [
                    { key: 'spotify', icon: 'icon-spotify', tooltip: 'Spotify' },
                    { key: 'apple', icon: 'icon-apple-music', tooltip: 'Apple Music' },
                    { key: 'bandcamp', icon: 'icon-cart', tooltip: 'Download / Buy' }
                ];
                
                discographyPlatforms.forEach(platform => {
                    if (release.links[platform.key] && release.links[platform.key] !== '#') {
                        const link = document.createElement('a');
                        link.href = release.links[platform.key];
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.className = 'tooltip';
                        link.setAttribute('data-tooltip', platform.tooltip);
                        
                        const svg = document.createElement('svg');
                        svg.className = 'icon';
                        const use = document.createElement('use');
                        use.setAttribute('href', `#${platform.icon}`);
                        svg.appendChild(use);
                        
                        link.appendChild(svg);
                        linksDiv.appendChild(link);
                    }
                });
                
                contentDiv.appendChild(infoDiv);
                contentDiv.appendChild(linksDiv);
                card.appendChild(contentDiv);
            }
            
            return card;
        }

        // Populates the featured releases on the main page.
        function populateFeaturedGrid() {
            if (!musicGrid) return;
            
            const fragment = document.createDocumentFragment();
            const featuredReleases = releases.filter(r => r.featured);
            
            featuredReleases.forEach(release => {
                const card = createMusicCard(release, true);
                fragment.appendChild(card);
            });
            
            musicGrid.innerHTML = '';
            musicGrid.appendChild(fragment);
        }

        // Populates the full list of releases inside the side panel.
        function populateDiscographyList(listContainer) {
            if (!listContainer) return;
            
            const fragment = document.createDocumentFragment();
            
            releases.forEach(release => {
                const card = createMusicCard(release, false);
                fragment.appendChild(card);
            });
            
            listContainer.innerHTML = '';
            listContainer.appendChild(fragment);
        }

        // Create collaborator card element
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
                img.src = 'images/placeholder-person.jpg';
                img.alt = 'Photo unavailable';
            };
            
            const name = document.createElement('h3');
            name.className = 'collab-card-name';
            name.textContent = collab.name;
            
            card.appendChild(img);
            card.appendChild(name);
            
            return card;
        }

        // Populates the grid of collaborators on the main page.
        function populateCollabsGrid() {
            if (!collabsGrid) return;
            
            const fragment = document.createDocumentFragment();
            
            collaborators.forEach(collab => {
                const card = createCollaboratorCard(collab);
                fragment.appendChild(card);
            });
            
            collabsGrid.innerHTML = '';
            collabsGrid.appendChild(fragment);
        }

        // --- 4. Side Panel Logic ---
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('side-panel-overlay');
        const openDiscographyBtn = document.querySelector('.discography-btn');
        
        // Focus trap variables
        let focusableElements;
        let firstFocusable;
        let lastFocusable;
        
        // Null-check ensures this block only runs if the panel elements exist.
        if (sidePanel && panelOverlay) {
            const panelTitle = sidePanel.querySelector('.side-panel-title');
            const panelContent = sidePanel.querySelector('.side-panel-content');
            const closePanelBtn = sidePanel.querySelector('.close-panel-btn');

            // Focus trap function
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

            const openPanel = () => {
                sidePanel.classList.add('active');
                panelOverlay.classList.add('active');
                body.classList.add('panel-open');
                
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
                sidePanel.classList.remove('active');
                panelOverlay.classList.remove('active');
                body.classList.remove('panel-open');
                
                // Remove focus trap
                sidePanel.removeEventListener('keydown', trapFocus);
                
                // Remove touch handlers
                if (sidePanel._touchHandlers) {
                    sidePanel.removeEventListener('touchstart', sidePanel._touchHandlers.handleTouchStart);
                    sidePanel.removeEventListener('touchend', sidePanel._touchHandlers.handleTouchEnd);
                    delete sidePanel._touchHandlers;
                }
            };

            // Helper function to create smarter text for the "Visit" button.
            const getLinkPlatform = (url) => {
                if (url.includes('spotify.com')) return 'Spotify';
                if (url.includes('music.apple.com')) return 'Apple Music';
                if (url.includes('youtube.com')) return 'YouTube';
                if (url.includes('instagram.com')) return 'Instagram';
                if (url.includes('tiktok.com')) return 'TikTok';
                return 'Website';
            };

            // Populates the panel with the full discography.
            const showDiscography = () => {
                panelTitle.dataset.key = 'fullDiscographyTitle';
                panelTitle.textContent = translations[currentLang].fullDiscographyTitle;
                panelContent.innerHTML = `<div class="side-panel-text-content"><div class="discography-list"></div></div>`;
                const listContainer = panelContent.querySelector('.discography-list');
                populateDiscographyList(listContainer);
                openPanel();
            };

            // Populates the panel with a specific collaborator's details.
            const showCollaborator = (collab) => {
                panelTitle.removeAttribute('data-key');
                panelTitle.textContent = collab.name;
                
                const platform = getLinkPlatform(collab.link);
                const visitBtnText = translations[currentLang].collabVisitBtn.replace('%s', `${collab.name} on ${platform}`);

                // Create content safely
                const contentFragment = document.createDocumentFragment();
                
                // Hero image
                const heroImg = document.createElement('img');
                heroImg.src = collab.photoSrc;
                heroImg.alt = `Photo of ${collab.name}`;
                heroImg.className = 'side-panel-hero-image';
                heroImg.loading = 'lazy';
                contentFragment.appendChild(heroImg);
                
                // Text content container
                const textContent = document.createElement('div');
                textContent.className = 'side-panel-text-content';
                
                // Song card
                const discographyList = document.createElement('div');
                discographyList.className = 'discography-list';
                
                const songCard = createMusicCard(collab.song, false);
                discographyList.appendChild(songCard);
                textContent.appendChild(discographyList);
                
                // Bio
                const bioParagraphs = collab.bio[currentLang].split('\n\n');
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
                
                panelContent.innerHTML = '';
                panelContent.appendChild(contentFragment);
                openPanel();
            };

            if (openDiscographyBtn) openDiscographyBtn.addEventListener('click', showDiscography);
            closePanelBtn.addEventListener('click', closePanel);
            panelOverlay.addEventListener('click', closePanel);

            // Make showCollaborator function available to the global event listener.
            window.showCollaborator = showCollaborator;
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
            
            const formatTime = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
            const togglePlay = () => playerElements.audio.src && (playerElements.audio.paused ? playerElements.audio.play() : playerElements.audio.pause());
            const updatePlayButton = () => {
                if(!playerElements.iconPlay || !playerElements.iconPause) return;
                playerElements.iconPlay.classList.toggle('hidden', !playerElements.audio.paused);
                playerElements.iconPause.classList.toggle('hidden', playerElements.audio.paused);
            };
            
            const showError = (message) => {
                playerElements.errorMessage.textContent = message;
                playerElements.errorMessage.classList.remove('hidden');
                setTimeout(() => {
                    playerElements.errorMessage.classList.add('hidden');
                }, 3000);
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
                playerElements.audio.pause();
                playerElements.audio.src = '';
                miniPlayer.classList.remove('active');
                miniPlayer.classList.remove('loading');
                body.classList.remove('player-active');
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
            }, 250));
            
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

        // --- 6. Event Delegation for Actions ---
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
                    
                    if(release && window.loadTrack) {
                        window.loadTrack(release);
                    } else if (collab && window.loadTrack) {
                        window.loadTrack(collab.song);
                    }
                }
            } else if (action === 'open-collab-panel') {
                const collabId = actionTarget.dataset.collabId;
                const collabData = collaborators.find(c => c.id === collabId);
                if (collabData && window.showCollaborator) window.showCollaborator(collabData);
            } else if (action === 'toggle-play') {
                // Handled by individual element listener
            } else if (action === 'close-player') {
                // Handled by individual element listener
            }
        });

        // --- 7. Mobile Navigation Toggle ---
        const hamburger = document.querySelector('.hamburger-menu');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                body.classList.toggle('nav-open');
                hamburger.setAttribute('aria-expanded', body.classList.contains('nav-open'));
            });
        }
        
        // --- 8. Multilingual Content Management ---
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
                aboutBio: `Olvida los comienzos tranquilos. Esto arranca en 1985, con un chaval de 14 años forzando datos crudos a través de chips de sonido primitivos, doblegando el silicio a su voluntad en la escena demo de ordenadores. Dos años después, Frédéric Guigand se colgó una guitarra y se inyectó en vena el voltaje puro del rock y el blues.\n\nLa señal lo llevó a Inglaterra, donde persiguió el fantasma del jazz, no solo para tocarlo, sino para descifrar su código, decodificando su geometría sagrada a través de la teoría. Luego, un giro brusco: de vuelta a Francia para un servicio civil que fue de todo menos civilizado. Se escapó para unirse al circo —literalmente— cambiando el escenario por la carpa, disparando notas con la orquesta del circo.\n\nPero el verdadero recableado neuronal estaba por llegar. Como DJ y más tarde como curador musical para ZipDJ, se convirtió en un chamán sónico para DJs de todo el mundo. No solo escuchaba música latina; se la metió en vena: un río de salsa, bachata y merengue, y decenas de miles de cumbias que alteraron permanentemente su ADN musical. Aprendió qué hace que un tema incendie una pista de baile, qué hace que un ritmo te posea.\n\nEn 2024, ese conocimiento explotó. Nació La Sonora Volcánica. El primer proyecto: una serie de álbumes instrumentales en tributo a los spots de surf de Fuerteventura, fusionando el calor psicodélico de la chicha peruana de los 60 con la frescura salada de la guitarra surf.\n\nAhora, las historias andan sueltas, empezando con el sueño febril de electrocumbia "Sol Sol". Se están encendiendo colaboraciones con los forajidos de la cumbia de México, Los Mexaterrestres, y el trovador peruano con alma de bolero, Cututo. Como dice Frédéric: "Cada ritmo, cada letra es una historia esperando ser contada".\n\nEsto no es música de fondo. Es un evento sísmico. La única pregunta es: ¿estás listo para la onda expansiva?`,
                collabsTitle: "Colaboraciones",
                collabVisitBtn: "Visitar a %s",
            },
            fr: {
                logoText: "La Sonora Volcánica", navMusic: "Musique", navMap: "Carte de Surf", navAbout: "À Propos", navCollabs: "Collaborations",
                heroTagline: "La Sonora Volcánica—la cumbia à la limite, des histoires en liberté et sans freins en vue.", heroButton: "Explorer La Musique",
                musicTitle: "Musique", discographyBtn: "Voir la Discographie", fullDiscographyTitle: "Discographie",
                aboutTitle: "L'Histoire",
                aboutBio: `Oubliez les débuts tranquilles. Ça commence en 1985, avec un gamin de 14 ans qui pousse des données brutes à travers des puces sonores primitives, pliant le silicium à sa volonté sur la scène démo informatique. Deux ans plus tard, Frédéric Guigand s'empare d'une guitare et s'injecte la tension brute du rock et du blues.\n\nLe signal l'a mené en Angleterre, où il a chassé le fantôme du jazz, non pas juste pour le jouer, mais pour en percer le code, décodant sa géométrie sacrée par la théorie. Puis, un virage serré : retour en France pour un service civil tout sauf civilisé. Il a fugué pour rejoindre le circo — littéralement — troquant la scène pour le chapiteau, balançant des notes avec l'orchestre du circo.\n\nMais le vrai recâblage était à venir. En tant que DJ, puis curateur musical pour ZipDJ, il est devenu un chaman sonique pour les DJ du monde entier. Il n'a pas seulement écouté la musique latine ; il se l'est injectée en intraveineuse — un fleuve de salsa, de bachata et de merengue, et des dizaines de milliers de morceaux de cumbia qui ont altéré à jamais son ADN musical. Il a appris ce qui enflamme un dancefloor, ce qui fait qu'un rythme vous possède.\n\nEn 2024, cette connaissance a explosé. La Sonora Volcánica est née. Le premier projet : une série d'albums instrumentaux en hommage aux spots de surf de Fuerteventura, fusionnant la chaleur psychédélique de la chicha péruvienne des années 60 avec la fraîcheur salée de la guitare surf.\n\nMaintenant, les histoires sont lâchées, à commencer par le rêve fiévreux d'électrocumbia "Sol Sol". Des collaborations s'embrasent avec les hors-la-loi de la cumbia du Mexique, Los Mexaterrestres, et le troubadour péruvien à l'âme de boléro, Cututo. Comme le dit Frédéric : « Chaque rythme, chaque parole est une histoire qui attend d'être racontée. »\n\nCe n'est pas de la musique de fond. C'est un événement sismique. La seule question est : êtes-vous prêt pour l'onde de choc ?`,
                collabsTitle: "Collaborations",
                collabVisitBtn: "Visiter %s",
            }
        };
        const langButtons = document.querySelectorAll('.lang-btn');
        const translatableElements = document.querySelectorAll('[data-key]');
        const updateContent = (lang) => {
            currentLang = lang;
            document.documentElement.lang = lang; // Update HTML lang attribute
            
            translatableElements.forEach(element => {
                const key = element.getAttribute('data-key');
                if (translations[lang] && translations[lang][key]) {
                    if (key === 'aboutBio') {
                        // Handle bio text with paragraph breaks
                        const paragraphs = translations[lang][key].split('\n\n');
                        element.innerHTML = paragraphs.map(p => `<p>${sanitizeHTML(p)}</p>`).join('');
                    } else {
                        element.textContent = translations[lang][key];
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

        // --- 9. Keyboard Controls ---
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

        // --- 10. Performance Optimization: Pause Hero Animation When Not Visible ---
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

        // --- 11. Initial Setup ---
        // Run all population functions and set the initial language.
        populateFeaturedGrid();
        populateCollabsGrid();
        updateContent('en');
    });

})();