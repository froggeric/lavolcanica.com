/**
 * @fileoverview Application configuration for La Sonora Volcánica website.
 * Contains global settings and preferences that control the behavior and appearance of the application.
 * @module config/app-config
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
 */
export const appConfig = {
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
  }
};