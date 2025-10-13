/**
 * @fileoverview Application configuration for La Sonora Volcánica website.
 * Contains global settings and preferences that control the behavior and appearance of the application.
 * @module config/app-config
 *
 * VERSION MANAGEMENT:
 * This file contains the authoritative version number for the entire application.
 * When updating the version number here, ensure the following files are also updated
 * to maintain version consistency across the project:
 * - index.html (version comment in head)
 * - script.js (version comment in header)
 * - style.css (version comment in header)
 *
 * The version number follows semantic versioning (MAJOR.MINOR.PATCH).
 * Increment MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes.
 */

/**
 * Application configuration object.
 * @type {Object}
 * @property {string} defaultLanguage - The default language code for the application (e.g., "en" for English).
 * @property {string[]} supportedLanguages - Array of supported language codes.
 * @property {number} featuredReleaseCount - Number of featured releases to display on the homepage.
 * @property {number} skeletonLoaderDelay - Delay in milliseconds before showing actual content (for skeleton loaders).
 * @property {Object} audioPlayer - Configuration for the embedded audio player.
 * @property {boolean} audioPlayer.autoPlay - Whether audio should autoplay when loaded.
 * @property {number} audioPlayer.volume - Default volume level (0.0 to 1.0).
 * @property {number} audioPlayer.errorDisplayDuration - Duration in milliseconds to show error messages.
 * @property {Object} performance - Performance-related settings.
 * @property {number} performance.debounceDelay - Delay in milliseconds for debounced functions (e.g., time updates).
 * @property {string} performance.imageLoadingStrategy - Image loading strategy ("lazy" or "eager").
 * @property {boolean} surfMapEnabled - Controls whether the surf map feature is accessible through the navigation menu.
 */
export const appConfig = {
  version: "1.6.1",
  defaultLanguage: "en",
  supportedLanguages: ["en", "es", "fr"],
  featuredReleaseCount: 2,
  skeletonLoaderDelay: 500,
  audioPlayer: {
    autoPlay: false,
    volume: 0.8,
    errorDisplayDuration: 3000
  },
  performance: {
    debounceDelay: 250,
    imageLoadingStrategy: "lazy"
  },
  lyricsCache: {
    maxMemoryCacheSize: 50,
    maxSessionStorageSize: 100,
    sessionStorageKey: "lyricsCache",
    cleanupThreshold: 0.8
  },
  // Feature flag to control surf map accessibility through navigation
  // Set to false until the surf map feature is fully ready for production
  surfMapEnabled: true
};