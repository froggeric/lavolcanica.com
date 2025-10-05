/**
 * Collaborator songs data for La Sonora Volcánica
 * Contains information about songs contributed by collaborators
 * @typedef {Object} CollaboratorSong
 * @property {string} id - Unique identifier for the song
 * @property {string} title - Title of the song
 * @property {string} year - Release year
 * @property {string} coverArt - Path to cover art image
 * @property {string} audioSrc - Path to audio file
 * @property {Object} links - Platform-specific links
 * @property {string} contentIds - IDs for related content
 * @property {string[]} visibleSections - Which sections should be visible
 * @property {string[]} collaboratorIds - Array of collaborator IDs who contributed
 */

export const collaboratorSongs = {
  "tendido-cero-sentido": {
    id: "tendido-cero-sentido",
    title: "Tendido Cero Sentido",
    year: "2025",
    coverArt: "images/art-tendido-cero-sentido.jpg",
    audioSrc: "audio/single-tendido-cero-sentido.mp3",
    links: {
      spotify: "https://open.spotify.com/track/1234567890",
      apple: "https://music.apple.com/us/album/tendido-cero-sentido/1234567890?i=1234567890",
      youtube: "https://youtu.be/abcdefghijklmnop",
      bandcamp: "https://lasonoravolcanica.bandcamp.com/track/tendido-cero-sentido"
    },
    contentIds: {
      story: "tendido-cero-sentido-story",
      lyrics: "tendido-cero-sentido-lyrics",
      gallery: "tendido-cero-sentido-gallery"
    },
    visibleSections: ["story", "lyrics"],
    collaboratorIds: ["cututo", "piero"]
  }
};