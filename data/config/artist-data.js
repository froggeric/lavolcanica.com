/**
 * @fileoverview Artist data configuration for La Sonora Volcánica website.
 * Contains artist profile links and contact information for the main page footer.
 * @module config/artist-data
 */

/**
 * @typedef {Object} ArtistLink
 * @property {string} platform - The platform name (e.g., "spotify", "apple", "youtube")
 * @property {string} url - The URL to the artist's profile on the platform
 * @property {string} icon - The SVG icon ID to use for the platform button
 * @property {string} tooltip - The tooltip text to display on hover
 * @property {string} ariaLabel - The accessibility label for screen readers
 */

/**
 * Artist profile links and contact information for the footer.
 * @type {ArtistLink[]}
 */
export const artistLinks = [
  {
    platform: "spotify",
    url: "https://open.spotify.com/artist/4MSLm3BvxYJ6ClfOSAUsZf?si=mOHj9wIdSq6GqZWkkhX3eA",
    icon: "icon-spotify",
    tooltip: "Spotify",
    ariaLabel: "Listen on Spotify"
  },
  {
    platform: "apple",
    url: "https://music.apple.com/us/artist/la-sonora-volc%C3%A1nica/1752696622",
    icon: "icon-apple-music",
    tooltip: "Apple Music",
    ariaLabel: "Listen on Apple Music"
  },
  {
    platform: "youtube",
    url: "https://www.youtube.com/@lasonoravolcanica",
    icon: "icon-youtube",
    tooltip: "YouTube",
    ariaLabel: "Watch on YouTube"
  },
  {
    platform: "bandcamp",
    url: "https://lasonoravolcanica.bandcamp.com",
    icon: "icon-cart",
    tooltip: "Download / Buy",
    ariaLabel: "Download or Buy on Bandcamp"
  },
  {
    platform: "email",
    url: "mailto:frederic@guigand.com",
    icon: "icon-envelope",
    tooltip: "Contact",
    ariaLabel: "Send an email"
  }
];
