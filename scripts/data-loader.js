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
 * @deprecated Use getRelease instead for unified data access
 */
const getCollaboratorSong = (songId) => {
  console.warn('getCollaboratorSong is deprecated. Use getRelease instead.');
  return releaseData.find(release => release.id === songId) || null;
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
  collaboratorSongs, // DEPRECATED: Keep for backward compatibility
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
  getCollaboratorSong, // DEPRECATED: Keep for backward compatibility
  getReleasesByTag,
  getCollaboratorsByTag,
  // NEW functions
  getReleasesByCollaborator,
  getCollaboratorsByRelease,
  getCollaborationReleases,
  getRelease
};