document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Music Data ---
    // EASY TO UPDATE: Just add new objects here. The newest release should be first.
    const releases = [
        {
            type: 'Single',
            title: 'Sol Sol',
            year: '2024',
            coverArt: 'images/album-sol-sol.jpg',
            featured: true, // This item will appear on the main page
            links: {
                spotify: '#', // Replace with your actual Spotify link
                apple: '#',   // Replace with your actual Apple Music link
                youtube: '#', // Replace with your actual YouTube link
                bandcamp: '#' // Replace with your actual Bandcamp link
            }
        },
        {
            type: 'Album',
            title: 'Fuerteventura Vol. 2',
            year: '2024',
            coverArt: 'images/album-fuerte-vol-2.jpg',
            featured: true,
            links: {
                spotify: '#',
                apple: '#',
                youtube: '#',
                bandcamp: '#'
            }
        },
        {
            type: 'Album',
            title: 'Fuerteventura Vol. 1',
            year: '2024',
            coverArt: 'images/album-fuerte-vol-1.jpg',
            featured: true,
            links: {
                spotify: '#',
                apple: '#',
                youtube: '#',
                bandcamp: '#'
            }
        }
    ];

    // --- 2. Dynamic Content Generation ---
    const musicGrid = document.querySelector('.music-grid');
    const discographyList = document.querySelector('.discography-list');

    function generateMusicCards() {
        if (!musicGrid || !discographyList) return;
        musicGrid.innerHTML = '';
        discographyList.innerHTML = '';

        releases.forEach(release => {
            const cardHTML = `
                <div class="music-card">
                    <img src="${release.coverArt}" alt="${release.title} cover art">
                    <div class="music-card-overlay">
                        <div class="music-card-info">
                            <h3 class="music-card-title">${release.title}</h3>
                            <p class="music-card-year">${release.year}</p>
                        </div>
                        <div class="streaming-links">
                            <a href="${release.links.spotify}" target="_blank" aria-label="Listen to ${release.title} on Spotify">
                                <svg class="icon"><use href="#icon-spotify"></use></svg>
                            </a>
                            <a href="${release.links.apple}" target="_blank" aria-label="Listen to ${release.title} on Apple Music">
                                <svg class="icon"><use href="#icon-apple-music"></use></svg>
                            </a>
                            <a href="${release.links.youtube}" target="_blank" aria-label="Listen to ${release.title} on YouTube">
                                <svg class="icon"><use href="#icon-youtube"></use></svg>
                            </a>
                            <a href="${release.links.bandcamp}" target="_blank" aria-label="Buy ${release.title} on Bandcamp">
                                <svg class="icon"><use href="#icon-bandcamp"></use></svg>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            if (release.featured) {
                musicGrid.innerHTML += cardHTML;
            }
            discographyList.innerHTML += cardHTML;
        });
    }

    // --- 3. Modal Logic ---
    const modal = document.getElementById('discography-modal');
    const openModalBtn = document.querySelector('.discography-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    const openModal = () => { if(modal) modal.classList.remove('hidden'); };
    const closeModal = () => { if(modal) modal.classList.add('hidden'); };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- 4. Mobile Navigation Toggle ---
    const hamburger = document.querySelector('.hamburger-menu');
    const body = document.body;
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            body.classList.toggle('nav-open');
            hamburger.setAttribute('aria-expanded', body.classList.contains('nav-open'));
        });
    }

    // --- 5. Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // --- 6. Multilingual Content Management ---
    const translations = {
        en: {
            logoText: "La Sonora Volcánica",
            navMusic: "Music",
            navMap: "Surf Map",
            navAbout: "About",
            navCollabs: "Collaborations",
            heroTagline: "La Sonora Volcánica—cumbia on the edge, stories on the loose, and no brakes in sight.",
            heroButton: "Explore The Music",
            musicTitle: "Music",
            discographyBtn: "View Full Discography",
            fullDiscographyTitle: "Discography",
            aboutTitle: "The Story",
            aboutBio: `Forget the quiet start. This begins in 1985, with a 14-year-old pushing raw data through primitive sound chips, bending silicon to his will on the computer demo scene. Two years later, Frédéric Guigand strapped on a guitar and mainlined the raw voltage of rock and blues.

The signal led him to England, where he chased the ghost of jazz, not just to play it, but to crack its code, decoding its sacred geometry through theory. Then, a hard left turn: back to France for a civil service stint that was anything but civil. He ran away and joined the circus—literally—trading the stage for the big top, blasting notes with the circus orchestra.

But the real rewiring was yet to come. As a DJ and later as the music curator for ZipDJ, he became a sonic shaman for DJs worldwide. He didn't just listen to Latin music; he mainlined it—a river of salsa, bachata, and merengue, and tens of thousands of cumbia tracks that permanently altered his musical DNA. He learned what makes a track ignite a dance floor, what makes a rhythm possess you.

In 2024, that knowledge exploded. La Sonora Volcánica was born. The first project: a series of instrumental albums paying tribute to the surf spots of Fuerteventura, fusing the psychedelic heat of '60s Peruvian chicha with the salt-sprayed cool of surf guitar.

Now, the stories are being set loose, starting with the electrocumbia fever dream "Sol Sol." Collaborations are igniting with Mexico's cumbia outlaws, Los Mexaterrestres, and the soul-drenched Peruvian troubadour, Cututo. As Frédéric says, "Every rhythm, every lyric is a story waiting to be told."

This isn't background music. It's a seismic event. The only question is: are you ready for the shockwave?`
        },
        es: {
            logoText: "La Sonora Volcánica",
            navMusic: "Música",
            navMap: "Mapa de Surf",
            navAbout: "Bio",
            navCollabs: "Colaboraciones",
            heroTagline: "La Sonora Volcánica—cumbia al límite, historias sueltas y sin frenos a la vista.",
            heroButton: "Explorar La Música",
            musicTitle: "Música",
            discographyBtn: "Ver Discografía Completa",
            fullDiscographyTitle: "Discografía",
            aboutTitle: "La Historia",
            aboutBio: `Olvida los comienzos tranquilos. Esto arranca en 1985, con un chaval de 14 años forzando datos crudos a través de chips de sonido primitivos, doblegando el silicio a su voluntad en la escena demo de ordenadores. Dos años después, Frédéric Guigand se colgó una guitarra y se inyectó en vena el voltaje puro del rock y el blues.

La señal lo llevó a Inglaterra, donde persiguió el fantasma del jazz, no solo para tocarlo, sino para descifrar su código, decodificando su geometría sagrada a través de la teoría. Luego, un giro brusco: de vuelta a Francia para un servicio civil que fue de todo menos civilizado. Se escapó para unirse al circo —literalmente— cambiando el escenario por la carpa, disparando notas con la orquesta del circo.

Pero el verdadero recableado neuronal estaba por llegar. Como DJ y más tarde como curador musical para ZipDJ, se convirtió en un chamán sónico para DJs de todo el mundo. No solo escuchaba música latina; se la metió en vena: un río de salsa, bachata y merengue, y decenas de miles de cumbias que alteraron permanentemente su ADN musical. Aprendió qué hace que un tema incendie una pista de baile, qué hace que un ritmo te posea.

En 2024, ese conocimiento explotó. Nació La Sonora Volcánica. El primer proyecto: una serie de álbumes instrumentales en tributo a los spots de surf de Fuerteventura, fusionando el calor psicodélico de la chicha peruana de los 60 con la frescura salada de la guitarra surf.

Ahora, las historias andan sueltas, empezando con el sueño febril de electrocumbia "Sol Sol". Se están encendiendo colaboraciones con los forajidos de la cumbia de México, Los Mexaterrestres, y el trovador peruano con alma de bolero, Cututo. Como dice Frédéric: "Cada ritmo, cada letra es una historia esperando ser contada".

Esto no es música de fondo. Es un evento sísmico. La única pregunta es: ¿estás listo para la onda expansiva?`
        },
        fr: {
            logoText: "La Sonora Volcánica",
            navMusic: "Musique",
            navMap: "Carte de Surf",
            navAbout: "À Propos",
            navCollabs: "Collaborations",
            heroTagline: "La Sonora Volcánica—la cumbia à la limite, des histoires en liberté et sans freins en vue.",
            heroButton: "Explorer La Musique",
            musicTitle: "Musique",
            discographyBtn: "Voir la Discographie",
            fullDiscographyTitle: "Discographie",
            aboutTitle: "L'Histoire",
            aboutBio: `Oubliez les débuts tranquilles. Ça commence en 1985, avec un gamin de 14 ans qui pousse des données brutes à travers des puces sonores primitives, pliant le silicium à sa volonté sur la scène démo informatique. Deux ans plus tard, Frédéric Guigand s'empare d'une guitare et s'injecte la tension brute du rock et du blues.

Le signal l'a mené en Angleterre, où il a chassé le fantôme du jazz, non pas juste pour le jouer, mais pour en percer le code, décodant sa géométrie sacrée par la théorie. Puis, un virage serré : retour en France pour un service civil tout sauf civilisé. Il a fugué pour rejoindre le cirque — littéralement — troquant la scène pour le chapiteau, balançant des notes avec l'orchestre du cirque.

Mais le vrai recâblage était à venir. En tant que DJ, puis curateur musical pour ZipDJ, il est devenu un chaman sonique pour les DJ du monde entier. Il n'a pas seulement écouté la musique latine ; il se l'est injectée en intraveineuse — un fleuve de salsa, de bachata et de merengue, et des dizaines de milliers de morceaux de cumbia qui ont altéré à jamais son ADN musical. Il a appris ce qui enflamme un dancefloor, ce qui fait qu'un rythme vous possède.

En 2024, cette connaissance a explosé. La Sonora Volcánica est née. Le premier projet : une série d'albums instrumentaux en hommage aux spots de surf de Fuerteventura, fusionnant la chaleur psychédélique de la chicha péruvienne des années 60 avec la fraîcheur salée de la guitare surf.

Maintenant, les histoires sont lâchées, à commencer par le rêve fiévreux d'électrocumbia "Sol Sol". Des collaborations s'embrasent avec les hors-la-loi de la cumbia du Mexique, Los Mexaterrestres, et le troubadour péruvien à l'âme de boléro, Cututo. Comme le dit Frédéric : « Chaque rythme, chaque parole est une histoire qui attend d'être racontée. »

Ce n'est pas de la musique de fond. C'est un événement sismique. La seule question est : êtes-vous prêt pour l'onde de choc ?`
        }
    };
    
    const langButtons = document.querySelectorAll('.lang-btn');
    const translatableElements = document.querySelectorAll('[data-key]');
    
    const updateContent = (lang) => {
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'P') {
                    element.innerText = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
        document.documentElement.lang = lang;
    };

    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLang = button.getAttribute('data-lang');
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateContent(selectedLang);
        });
    });

    // --- 7. Initial Setup ---
    generateMusicCards();
    updateContent('en');
});