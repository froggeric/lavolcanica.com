/**
 * Data loader module for La Sonora Volcánica
 * Centralizes all data imports and provides a unified interface
 */

// Static imports for critical path data
import { releaseData } from '../data/releases/release-data.js';
import { featuredReleases } from '../data/releases/featured-releases.js';
import { collaboratorData } from '../data/collaborators/collaborator-data.js';
import { collaboratorSongs } from '../data/collaborators/collaborator-songs.js';
import { releaseStories } from '../data/content/release-stories.js';
import { releaseLyrics } from '../data/content/release-lyrics.js';
import { collaboratorBios } from '../data/content/collaborator-bios.js';
import { appConfig } from '../data/config/app-config.js';
import { platformConfig } from '../data/config/platform-config.js';

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
 * Get featured releases with full data
 * @returns {Array} - Array of featured release objects
 */
const getFeaturedReleases = () => {
  return featuredReleases.map(id => 
    releaseData.find(release => release.id === id)
  ).filter(Boolean);
};

/**
 * Get collaborator song with full data
 * @param {string} songId - ID of the song
 * @returns {Object|null} - Song object or null if not found
 */
const getCollaboratorSong = (songId) => {
  return collaboratorSongs[songId] || null;
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
  collaboratorSongs,
  content: {
    stories: releaseStories,
    lyrics: releaseLyrics,
    bios: collaboratorBios
  },
  config: {
    app: appConfig,
    platforms: platformConfig
  },
  loadTranslations,
  resolveContent,
  getFeaturedReleases,
  getCollaboratorSong,
  getReleasesByTag,
  getCollaboratorsByTag
};