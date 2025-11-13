/**
 * @fileoverview Release data for La Sonora Volcánica website.
 * Contains metadata for all music releases including singles and albums.
 * @module data/releases/release-data
 */

/**
 * @typedef {Object} Release
 * @property {string} id - Unique identifier for the release (used in URLs and data references).
 * @property {string} title - Title of the release.
 * @property {string} year - Release year (4-digit string).
 * @property {string} type - Type of release ("single" or "album").
 * @property {string} coverArt - Path to cover art image relative to root.
 * @property {string} audioSrc - Path to audio file relative to root.
 * @property {boolean} featured - Whether this release is featured on the homepage.
 * @property {Object} links - Platform-specific links for streaming/purchasing.
 * @property {string} links.spotify - Spotify link URL.
 * @property {string} links.apple - Apple Music link URL.
 * @property {string} links.youtube - YouTube link URL.
 * @property {string} links.bandcamp - Bandcamp link URL.
 * @property {string[]} collaboratorIds - Array of collaborator IDs who contributed to this release.
 * @property {string} collaborationType - Type of collaboration (featured, co-written, produced, etc.).
 * @property {Object} contentIds - IDs for related content in other data modules.
 * @property {string} contentIds.story - ID for the story content in release-stories.js.
 * @property {string} contentIds.lyrics - ID for the lyrics content in release-lyrics.js.
 * @property {string} contentIds.gallery - ID for the gallery content (placeholder for future use).
 * @property {string[]} visibleSections - Which sections should be visible in the release details panel.
 * @property {string[]} tags - Tags for filtering and searching (e.g., genre, year, location).
 */

/**
 * Array of all music releases.
 * To add a new release, create a new object following the Release type definition
 * and add it to this array.
 * @type {Release[]}
 */
export const releaseData = [
  {
    id: "tendido-cero-sentido",
    title: "Tendido Cero Sentido",
    year: "2025",
    type: "single",
    coverArt: "images/art-tendido-cero-sentido.webp",
    audioSrc: "audio/single-tendido-cero-sentido.m4a",
    featured: true,
    links: {
      spotify: "https://open.spotify.com/track/4AyUCKaXTkVNEKAmkbBFvj?si=c3dbb2b180ed46a1",
      apple: "https://music.apple.com/us/album/tendido-cero-sentido-feat-cututo/1845935592?i=1845935593",
      youtube: "https://youtu.be/HiZQ_rU-EvM?si=W-hc_Wa01hWuL5GX",
      bandcamp: "#"
    },
    collaboratorIds: ["cututo", "piero"],
    collaborationType: "featured",
    contentIds: {
      story: "tendido-cero-sentido-story",
      lyrics: "tendido-cero-sentido-lyrics",
      gallery: "tendido-cero-sentido-gallery"
    },
    visibleSections: ["story", "lyrics","gallery"],
    tags: ["single", "2025", "collaboration", "bolero", "queer"]
  },
  {
    id: "cumbia-del-barrio",
    title: "Cumbia del Barrio",
    year: "2025",
    type: "single",
    coverArt: "images/art-cumbia-del-barrio.webp",
    audioSrc: "audio/single-cumbia-del-barrio.m4a",
    featured: true,
    links: {
      spotify: "https://open.spotify.com/track/1XDDddnVl5hxsWixxtpz5l?si=e6d0e5cd4c99428a",
      apple: "https://music.apple.com/us/album/cumbia-del-barrio/1841267674?i=1841267675",
      youtube: "https://youtu.be/wHHzlY3O7cc",
      bandcamp: "https://lasonoravolcanica.bandcamp.com/track/cumbia-del-barrio"
    },
    collaboratorIds: [],
    contentIds: {
      story: "cumbia-del-barrio-story",
      lyrics: "cumbia-del-barrio-lyrics",
      gallery: "cumbia-del-barrio-gallery"
    },
    visibleSections: ["story", "lyrics"],
    tags: ["cumbia", "featured", "2025"]
  },
  {
    id: "sol-sol",
    title: "Sol Sol",
    year: "2024",
    type: "single",
    coverArt: "images/art-sol-sol.webp",
    audioSrc: "audio/single-sol-sol.m4a",
    featured: true,
    links: {
      spotify: "https://open.spotify.com/track/7sZ4YZulX0C2PsF9Z2RX7J?si=7444364b275d4196",
      apple: "https://music.apple.com/us/album/sol-sol/1784468155?i=1784468156",
      youtube: "https://youtu.be/0qwddtff0iQ?si=BdvSkA0Hr7ACD8n_",
      bandcamp: "https://lasonoravolcanica.bandcamp.com/track/sol-sol"
    },
    collaboratorIds: [],
    contentIds: {
      story: "sol-sol-story",
      lyrics: "sol-sol-lyrics",
      gallery: "sol-sol-gallery"
    },
    visibleSections: ["story", "lyrics", "gallery"],
    tags: ["electrocumbia", "featured", "2024"]
  },
  {
    id: "tindaya",
    title: "Tindaya",
    year: "2026",
    type: "album",
    coverArt: "images/art-tindaya.webp",
    audioSrc: "audio/album-tindaya.m4a",
    featured: false,
    links: {
      spotify: "#",
      apple: "#",
      youtube: "#",
      bandcamp: "#"
    },
    collaboratorIds: [],
    contentIds: {
      story: "tindaya-story",
      lyrics: "tindaya-lyrics",
      gallery: "tindaya-gallery"
    },
    visibleSections: ["story", "lyrics", "gallery"],
    tags: ["album", "2026", "fuerteventura"]
  },
  {
    id: "secreto-del-sur",
    title: "Secreto del Sur",
    year: "2025",
    type: "album",
    coverArt: "images/art-secreto-del-sur.webp",
    audioSrc: "audio/album-secreto-del-sur.m4a",
    featured: false,
    links: {
      spotify: "#",
      apple: "#",
      youtube: "#",
      bandcamp: "#"
    },
    collaboratorIds: [],
    contentIds: {
      story: "secreto-del-sur-story",
      lyrics: "secreto-del-sur-lyrics",
      gallery: "secreto-del-sur-gallery"
    },
    visibleSections: ["story", "lyrics", "gallery"],
    tags: ["album", "2025"]
  },
  {
    id: "costa-del-norte",
    title: "Costa del Norte",
    year: "2024",
    type: "album",
    coverArt: "images/art-costa-del-norte.webp",
    audioSrc: "audio/album-costa-del-norte.m4a",
    featured: false,
    links: {
      spotify: "#",
      apple: "#",
      youtube: "#",
      bandcamp: "#"
    },
    collaboratorIds: [],
    contentIds: {
      story: "costa-del-norte-story",
      lyrics: "costa-del-norte-lyrics",
      gallery: "costa-del-norte-gallery"
    },
    visibleSections: ["story", "lyrics", "gallery"],
    tags: ["album", "2024", "surf"]
  },
  {
    id: "surf-fuerteventura",
    title: "Surf Fuerteventura",
    year: "2024",
    type: "album",
    coverArt: "images/art-surf-fuerteventura.webp",
    audioSrc: "audio/album-surf-fuerteventura.m4a",
    featured: false,
    links: {
      spotify: "#",
      apple: "#",
      youtube: "#",
      bandcamp: "#"
    },
    collaboratorIds: [],
    contentIds: {
      story: "surf-fuerteventura-story",
      lyrics: "surf-fuerteventura-lyrics",
      gallery: "surf-fuerteventura-gallery"
    },
    visibleSections: ["story", "lyrics", "gallery"],
    tags: ["album", "2024", "surf", "fuerteventura"]
  }
];