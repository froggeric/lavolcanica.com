/**
 * Data loader module for La Sonora Volcánica
 * Centralizes all data imports and provides a unified interface
 */

// Static imports for critical path data
import { releaseData } from '../data/releases/release-data.js';
import { featuredReleases } from '../data/releases/featured-releases.js';
import { collaboratorData } from '../data/collaborators/collaborator-data.js';
import { releaseStories } from '../data/content/release-stories.js';
import { releaseLyrics } from '../data/content/release-lyrics.js';
import { collaboratorBios } from '../data/content/collaborator-bios.js';
import { appConfig } from '../data/config/app-config.js';
import { platformConfig } from '../data/config/platform-config.js';
import { artistLinks } from '../data/config/artist-data.js';

/**
 * Dynamic imports for multilingual content
 * @param {string} lang - Language code (en, es, fr)
 * @returns {Promise<Object>} - Object containing UI translations for the specified language
 */
const loadTranslations = async (lang) => {
  try {
    const uiModule = await import(`../data/i18n/${lang}/ui-translations.js`);
    return {
      ui: uiModule.uiTranslations
    };
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fall back to English if translation loading fails
    const enModule = await import('../data/i18n/en/ui-translations.js');
    return {
      ui: enModule.uiTranslations
    };
  }
};

/**
 * Helper function to resolve content by ID and language
 * @param {string} contentId - ID of the content to resolve
 * @param {string} contentType - Type of content (stories, lyrics, bios)
 * @param {string} language - Language code
 * @returns {string} - Resolved content or empty string
 */
const resolveContent = (contentId, contentType, language = appConfig.defaultLanguage) => {
  let content;
  
  switch (contentType) {
    case 'stories':
      content = releaseStories[contentId];
      break;
    case 'lyrics':
      content = releaseLyrics[contentId];
      break;
    case 'bios':
      content = collaboratorBios[contentId];
      break;
    default:
      console.warn(`Unknown content type: ${contentType}`);
      return '';
  }
  
  if (!content) {
    console.warn(`Content not found: ${contentType}/${contentId}`);
    return '[Content not available]';
  }
  
  // Try requested language, then default language, then English
  return content[language] || 
         content[appConfig.defaultLanguage] || 
         content['en'] || 
         '[Translation not available]';
};

/**
 * Resolve lyrics content with language-specific handling
 * @param {string} contentId - ID of the lyrics content to resolve
 * @param {string} language - Language code
 * @returns {string} - Resolved lyrics content or empty string
 */
const resolveLyricsContent = (contentId, language = appConfig.defaultLanguage) => {
  const content = releaseLyrics[contentId];
  if (!content) {
    console.warn(`Lyrics content not found: ${contentId}`);
    return '[Lyrics not available]';
  }
  
  // Try requested language, then default language, then English
  return content[language] ||
         content[appConfig.defaultLanguage] ||
         content['en'] ||
         '[Translation not available]';
};

/**
 * Get available languages for lyrics content
 * @param {string} contentId - ID of the lyrics content
 * @returns {Array<string>} - Array of available language codes
 */
const getAvailableLyricsLanguages = (contentId) => {
  const content = releaseLyrics[contentId];
  return content ? Object.keys(content) : [];
};

/**
 * Get all lyrics content for a release (all languages)
 * @param {string} contentId - ID of the lyrics content
 * @returns {Object} - Object with all language versions
 */
const getAllLyricsLanguages = (contentId) => {
  return releaseLyrics[contentId] || {};
};

/**
 * Cache-aware lyrics content resolver
 * @param {string} contentId - ID of the lyrics content to resolve
 * @param {string} language - Language code
 * @param {LyricsCacheManager} cacheManager - Optional cache manager instance
 * @returns {string} - Resolved lyrics content or empty string
 */
const resolveLyricsContentWithCache = (contentId, language = appConfig.defaultLanguage, cacheManager = null) => {
  // Try to get from cache first if available
  if (cacheManager) {
    // We need a releaseId to use the cache, but this function doesn't have it
    // This function is kept for backward compatibility
    // The actual caching happens in the main application logic
  }
  
  // Fall back to regular resolver
  return resolveLyricsContent(contentId, language);
};

/**
 * Get featured releases with full data
 * @returns {Array} - Array of featured release objects
 */
const getFeaturedReleases = () => {
  return featuredReleases.map(id => 
    releaseData.find(release => release.id === id)
  ).filter(Boolean);
};


/**
 * Get releases by collaborator ID
 * @param {string} collaboratorId - ID of the collaborator
 * @returns {Array} - Array of releases featuring this collaborator
 */
const getReleasesByCollaborator = (collaboratorId) => {
  return releaseData.filter(release =>
    release.collaboratorIds && release.collaboratorIds.includes(collaboratorId)
  );
};

/**
 * Get collaborators by release ID
 * @param {string} releaseId - ID of the release
 * @returns {Array} - Array of collaborators who contributed to this release
 */
const getCollaboratorsByRelease = (releaseId) => {
  const release = releaseData.find(r => r.id === releaseId);
  if (!release || !release.collaboratorIds) return [];
  
  return release.collaboratorIds.map(collabId =>
    collaboratorData.find(collab => collab.id === collabId)
  ).filter(Boolean);
};

/**
 * Get collaboration releases (releases with collaborators)
 * @returns {Array} - Array of releases that have collaborators
 */
const getCollaborationReleases = () => {
  return releaseData.filter(release =>
    release.collaboratorIds && release.collaboratorIds.length > 0
  );
};

/**
 * Unified release getter
 * @param {string} releaseId - ID of the release
 * @returns {Object|null} - Release object or null if not found
 */
const getRelease = (releaseId) => {
  return releaseData.find(release => release.id === releaseId) || null;
};

/**
 * Get releases by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} - Array of releases with the specified tag
 */
const getReleasesByTag = (tag) => {
  return releaseData.filter(release => 
    release.tags && release.tags.includes(tag)
  );
};

/**
 * Get collaborators by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} - Array of collaborators with the specified tag
 */
const getCollaboratorsByTag = (tag) => {
  return collaboratorData.filter(collaborator => 
    collaborator.tags && collaborator.tags.includes(tag)
  );
};

// Centralized data export
export const dataLoader = {
  releases: releaseData,
  featuredReleases,
  collaborators: collaboratorData,
  content: {
    stories: releaseStories,
    lyrics: releaseLyrics,
    bios: collaboratorBios
  },
  config: {
    app: appConfig,
    platforms: platformConfig
  },
  artist: {
    links: artistLinks
  },
  loadTranslations,
  resolveContent,
  getFeaturedReleases,
  getReleasesByTag,
  getCollaboratorsByTag,
  // NEW functions
  getReleasesByCollaborator,
  getCollaboratorsByRelease,
  getCollaborationReleases,
  getRelease,
  // Multi-language lyrics support
  resolveLyricsContent,
  getAvailableLyricsLanguages,
  getAllLyricsLanguages,
  resolveLyricsContentWithCache
};