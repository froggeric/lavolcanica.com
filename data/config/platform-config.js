/**
 * @fileoverview Platform configuration for La Sonora Volcánica website.
 * Contains platform-specific settings and metadata for streaming and download platforms.
 * @module config/platform-config
 * @version 1.8.5
 */

/**
 * @typedef {Object} Platform
 * @property {string} key - The unique identifier for the platform (used in release data).
 * @property {string} icon - The SVG icon ID to use for the platform button.
 * @property {string} tooltip - The tooltip text to display on hover.
 */

/**
 * Array of supported streaming and download platforms.
 * Each platform object defines how it should be displayed and linked in the UI.
 * @type {Platform[]}
 */
export const platformConfig = [
  { key: "spotify", icon: "icon-spotify", tooltip: "Spotify" },
  { key: "apple", icon: "icon-apple-music", tooltip: "Apple Music" },
  { key: "youtube", icon: "icon-youtube", tooltip: "YouTube" },
  { key: "bandcamp", icon: "icon-cart", tooltip: "Download / Buy" }
];