// IIFE (Immediately Invoked Function Expression) to create a private scope
// and prevent polluting the global namespace.
(function() {
    'use strict'; // Enforces stricter parsing and error handling in JavaScript.

    // Wait for the HTML document to be fully loaded and parsed.
    document.addEventListener('DOMContentLoaded', () => {

        // --- 1. DATA: SINGLE SOURCE OF TRUTH ---
        // All dynamic content is managed from these arrays.
        // To update the site, only this section needs to be edited.

        const releases = [
            {
                title: 'Cumbia del Barrio', year: '2025',
                coverArt: 'images/album-cumbia-del-barrio.jpg',
                audioSrc: 'audio/La Sonora Volcánica - Cumbia del Barrio.mp3',
                featured: true,
                links: { spotify: '#',
                         apple: '#',
                         youtube: '#',
                         bandcamp: 'https://lasonoravolcanica.bandcamp.com/track/cumbia-del-barrio' }
            },
            {
                title: 'Sol Sol', year: '2024',
                coverArt: 'images/album-sol-sol.jpg',
                audioSrc: 'audio/La Sonora Volcánica - Sol Sol.mp3',
                featured: true,
                links: { spotify: 'https://open.spotify.com/track/7sZ4YZulX0C2PsF9Z2RX7J?si=7444364b275d4196',
                         apple: 'https://music.apple.com/us/album/sol-sol/1784468155?i=1784468156',
                         youtube: 'https://youtu.be/0qwddtff0iQ?si=BdvSkA0Hr7ACD8n_',
                         bandcamp: 'https://lasonoravolcanica.bandcamp.com/track/sol-sol' }
            },
            {
                title: 'Fuerteventura Vol. 2', year: '2024',
                coverArt: 'images/album-fuerte-vol-2.jpg',
                audioSrc: 'audio/fuerte-vol-2.mp3',
                featured: false,
                links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
            },
            {
                title: 'Fuerteventura Vol. 1', year: '2024',
                coverArt: 'images/album-fuerte-vol-1.jpg',
                audioSrc: 'audio/fuerte-vol-1.mp3',
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
                    coverArt: 'images/collab-cututo-cover.jpg',
                    audioSrc: 'audio/collab-cututo-song.mp3',
                    links: { spotify: '#', apple: '#', youtube: '#', bandcamp: '#' }
                },
                bio: {
                    en: `Some say the world will end in fire, some say in ice. But in the sonic universe of Cututo, the cataclysm is a far more intimate affair—a "Big Bang" of bolero-fueled emotion exploding from the depths of a tormented heart. This is the world of Hernán Alonso Gonzales Valdivia, a troubadour from Trujillo, Peru, who wields tradition like a sharpened blade, carving out a space for the beautifully broken and the defiantly queer.\n\nForged in the crucible of reality television's La Voz Perú, he now wages a far more personal war. His weapons are the ghosts of bolero, the pulse of cumbia, and the sorrowful grace of vals criollo. But this is no history lesson. Cututo drags these classic forms into the heart of modern life, giving voice to the agony of being ghosted online, the righteous fury of political protest, and the defiant struggle of queer identity in a world that demands conformity. From his current base in Buenos Aires, Cututo continues a sacred mission: to prove that the old gods of Latin American music are not dead, but merely waiting for a soul brave enough to make them roar again.`,
                    es: `Algunos dicen que el mundo acabará en fuego, otros que en hielo. Pero en el universo sónico de Cututo, el cataclismo es un asunto mucho más íntimo: un "Big Bang" de emoción alimentada por boleros que explota desde las profundidades de un corazón atormentado. Este es el mundo de Hernán Alonso Gonzales Valdivia, un trovador de Trujillo, Perú, que empuña la tradición como una cuchilla afilada, abriendo un espacio para lo hermosamente roto y lo desafiantemente queer.\n\nForjado en el crisol del reality show La Voz Perú, ahora libra una guerra mucho más personal. Sus armas son los fantasmas del bolero, el pulso de la cumbia y la dolorosa gracia del vals criollo. Pero esto no es una lección de historia. Cututo arrastra estas formas clásicas al corazón de la vida moderna, dando voz a la agonía de ser ignorado en línea, a la furia justa de la protesta política y a la lucha desafiante de la identidad queer en un mundo que exige conformidad. Desde su base actual en Buenos Aires, Cututo continúa una misión sagrada: demostrar que los viejos dioses de la música latinoamericana no están muertos, sino simplemente esperando un alma lo suficientemente valiente como para hacerlos rugir de nuevo.`,
                    fr: `Certains disent que le monde finira dans le feu, d'autres dans la glace. Mais dans l'univers sonore de Cututo, le cataclysme est une affaire bien plus intime : un « Big Bang » d'émotion nourrie au boléro, explosant des profondeurs d'un cœur tourmenté. C'est le monde d'Hernán Alonso Gonzales Valdivia, un troubadour de Trujillo, au Pérou, qui manie la tradition comme une lame aiguisée, créant un espace pour les magnifiquement brisés et les fièrement queer.\n\nForgé dans le creuset de la télé-réalité La Voz Perú, il mène désormais une guerre bien plus personnelle. Ses armes sont les fantômes du boléro, le pouls de la cumbia et la grâce douloureuse du vals criollo. Mais ce n'est pas une leçon d'histoire. Cututo transpose ces formes classiques au cœur de la vie moderne, donnant une voix à l'agonie d'être « ghosté » en ligne, à la fureur juste de la protestation politique et à la lutte provocante de l'identité queer dans un monde qui exige la conformité. Depuis sa base actuelle à Buenos Aires, Cututo poursuit une mission sacrée : prouver que les anciens dieux de la musique latino-américaine ne sont pas morts, mais attendent simplement une âme assez courageuse pour les faire rugir à nouveau.`
                }
            }
        ];
        
        let currentLang = 'en';

        // --- 2. Element Selectors (Cached for performance) ---
        const body = document.body;
        const musicGrid = document.querySelector('.music-grid');
        const collabsGrid = document.querySelector('.collabs-grid');

        // --- 3. Dynamic Content Population Functions ---
        // Populates the featured releases on the main page.
        function populateFeaturedGrid() {
            if (!musicGrid) return;
            musicGrid.innerHTML = '';
            const featuredReleases = releases.filter(r => r.featured);
            featuredReleases.forEach(release => {
                musicGrid.innerHTML += `
                    <div class="music-card">
                        <img src="${release.coverArt}" alt="Cover art for ${release.title}" data-action="play-track">
                        <div class="music-card-overlay">
                            <div class="music-card-info">
                                <h3 class="music-card-title">${release.title}</h3>
                                <p class="music-card-year">${release.year}</p>
                            </div>
                            <div class="streaming-links">
                                <a href="${release.links.spotify}" target="_blank" class="tooltip" data-tooltip="Spotify" aria-label="Listen to ${release.title} on Spotify"><svg class="icon"><use href="#icon-spotify"></use></svg></a>
                                <a href="${release.links.apple}" target="_blank" class="tooltip" data-tooltip="Apple Music" aria-label="Listen to ${release.title} on Apple Music"><svg class="icon"><use href="#icon-apple-music"></use></svg></a>
                                <a href="${release.links.youtube}" target="_blank" class="tooltip" data-tooltip="YouTube" aria-label="Watch ${release.title} on YouTube"><svg class="icon"><use href="#icon-youtube"></use></svg></a>
                                <a href="${release.links.bandcamp}" target="_blank" class="tooltip" data-tooltip="Download / Buy" aria-label="Download or Buy ${release.title} on Bandcamp"><svg class="icon"><use href="#icon-cart"></use></svg></a>
                            </div>
                        </div>
                    </div>`;
            });
        }

        // Populates the full list of releases inside the side panel.
        function populateDiscographyList(listContainer) {
            if (!listContainer) return;
            listContainer.innerHTML = '';
            releases.forEach(release => {
                listContainer.innerHTML += `
                    <div class="music-card">
                        <img src="${release.coverArt}" alt="Cover art for ${release.title}" data-action="play-track">
                        <div class="card-content">
                            <div class="music-card-info">
                                <h3 class="music-card-title">${release.title}</h3>
                                <p class="music-card-year">${release.year}</p>
                            </div>
                            <div class="streaming-links">
                                <a href="${release.links.spotify}" target="_blank" class="tooltip" data-tooltip="Spotify" aria-label="Listen to ${release.title} on Spotify"><svg class="icon"><use href="#icon-spotify"></use></svg></a>
                                <a href="${release.links.apple}" target="_blank" class="tooltip" data-tooltip="Apple Music" aria-label="Listen to ${release.title} on Apple Music"><svg class="icon"><use href="#icon-apple-music"></use></svg></a>
                                <a href="${release.links.bandcamp}" target="_blank" class="tooltip" data-tooltip="Download / Buy" aria-label="Download or Buy ${release.title} on Bandcamp"><svg class="icon"><use href="#icon-cart"></use></svg></a>
                            </div>
                        </div>
                    </div>`;
            });
        }

        // Populates the grid of collaborators on the main page.
        function populateCollabsGrid() {
            if (!collabsGrid) return;
            collabsGrid.innerHTML = '';
            collaborators.forEach(collab => {
                collabsGrid.innerHTML += `
                    <div class="collab-card" data-action="open-collab-panel" data-collab-id="${collab.id}">
                        <img src="${collab.photoSrc}" alt="Photo of ${collab.name}" class="collab-card-photo">
                        <h3 class="collab-card-name">${collab.name}</h3>
                    </div>
                `;
            });
        }

        // --- 4. Side Panel Logic ---
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('side-panel-overlay');
        const openDiscographyBtn = document.querySelector('.discography-btn');
        
        // Null-check ensures this block only runs if the panel elements exist.
        if (sidePanel && panelOverlay) {
            const panelTitle = sidePanel.querySelector('.side-panel-title');
            const panelContent = sidePanel.querySelector('.side-panel-content');
            const closePanelBtn = sidePanel.querySelector('.close-panel-btn');

            const openPanel = () => {
                sidePanel.classList.add('active');
                panelOverlay.classList.add('active');
            };
            const closePanel = () => {
                sidePanel.classList.remove('active');
                panelOverlay.classList.remove('active');
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

                panelContent.innerHTML = `
                    <img src="${collab.photoSrc}" alt="Photo of ${collab.name}" class="side-panel-hero-image">
                    <div class="side-panel-text-content">
                        <div class="discography-list">
                             <div class="music-card">
                                <img src="${collab.song.coverArt}" alt="Cover art for ${collab.song.title}" data-action="play-track">
                                <div class="card-content">
                                    <div class="music-card-info">
                                        <h3 class="music-card-title">${collab.song.title}</h3>
                                        <p class="music-card-year">${collab.song.year}</p>
                                    </div>
                                    <div class="streaming-links">
                                        <a href="${collab.song.links.spotify}" target="_blank" class="tooltip" data-tooltip="Spotify"><svg class="icon"><use href="#icon-spotify"></use></svg></a>
                                        <a href="${collab.song.links.apple}" target="_blank" class="tooltip" data-tooltip="Apple Music"><svg class="icon"><use href="#icon-apple-music"></use></svg></a>
                                        <a href="${collab.song.links.youtube}" target="_blank" class="tooltip" data-tooltip="YouTube"><svg class="icon"><use href="#icon-youtube"></use></svg></a>
                                        <a href="${collab.song.links.bandcamp}" target="_blank" class="tooltip" data-tooltip="Download / Buy"><svg class="icon"><use href="#icon-cart"></use></svg></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="collab-details-bio">${collab.bio[currentLang].replace(/\n\n/g, '</p><p>')}</p>
                        <div class="collab-details-visit-btn-container">
                            <a href="${collab.link}" target="_blank" class="cta-button">${visitBtnText}</a>
                        </div>
                    </div>
                `;
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
                closePlayerBtn: miniPlayer.querySelector('.close-player-btn')
            };
            const formatTime = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
            const togglePlay = () => playerElements.audio.src && (playerElements.audio.paused ? playerElements.audio.play() : playerElements.audio.pause());
            const updatePlayButton = () => {
                if(!playerElements.iconPlay || !playerElements.iconPause) return;
                playerElements.iconPlay.classList.toggle('hidden', !playerElements.audio.paused);
                playerElements.iconPause.classList.toggle('hidden', playerElements.audio.paused);
            };
            const loadTrack = (track) => {
                playerElements.coverArt.src = track.coverArt;
                playerElements.title.textContent = track.title;
                playerElements.audio.src = track.audioSrc;
                miniPlayer.classList.add('active');
                body.classList.add('player-active');
                playerElements.audio.play();
            };
            const closePlayer = () => {
                playerElements.audio.pause();
                playerElements.audio.src = '';
                miniPlayer.classList.remove('active');
                body.classList.remove('player-active');
            };
            
            playerElements.playPauseBtn.addEventListener('click', togglePlay);
            playerElements.audio.addEventListener('play', updatePlayButton);
            playerElements.audio.addEventListener('pause', updatePlayButton);
            playerElements.audio.addEventListener('loadedmetadata', () => {
                playerElements.totalTimeEl.textContent = formatTime(playerElements.audio.duration);
                playerElements.seekSlider.max = playerElements.audio.duration;
            });
            playerElements.audio.addEventListener('timeupdate', () => {
                playerElements.currentTimeEl.textContent = formatTime(playerElements.audio.currentTime);
                playerElements.seekSlider.value = playerElements.audio.currentTime;
            });
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
            translatableElements.forEach(element => {
                const key = element.getAttribute('data-key');
                if (translations[lang] && translations[lang][key]) {
                    if (key === 'aboutBio') {
                        element.innerHTML = translations[lang][key].replace(/\n\n/g, '</p><p>');
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

        // --- 9. Initial Setup ---
        // Run all population functions and set the initial language.
        populateFeaturedGrid();
        populateCollabsGrid();
        updateContent('en');
    });

})();
