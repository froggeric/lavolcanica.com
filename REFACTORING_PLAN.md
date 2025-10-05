# La Sonora Volcánica - Data Decoupling Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring strategy to decouple all static data, textual content, and configuration from the monolithic `script.js` file. The goal is to create a modular, maintainable architecture that supports easy content updates and future language additions.

## Current State Analysis

The current `script.js` file contains approximately 1,085 lines of code with the following hardcoded data structures:

1. **Music Releases** (`releases` array, lines 67-133)
   - 6 release objects with metadata, streaming links, stories, and lyrics
   - Contains multilingual content (stories, lyrics)

2. **Collaborators** (`collaborators` array, lines 135-178)
   - 2 collaborator objects with bios, songs, and metadata
   - Contains multilingual content (bios in en, es, fr)

3. **Translations** (`translations` object, lines 961-989)
   - UI text translations for English, Spanish, and French
   - Navigation, buttons, labels, and other UI elements

4. **Configuration Data**
   - Platform definitions (lines 210-215)
   - Default language setting (line 180)
   - Various UI strings and labels

## 1. New Directory Structure

```
project-root/
├── data/
│   ├── releases/
│   │   ├── release-data.js
│   │   └── featured-releases.js
│   ├── collaborators/
│   │   ├── collaborator-data.js
│   │   └── collaborator-songs.js
│   ├── content/
│   │   ├── release-stories.js
│   │   ├── release-lyrics.js
│   │   └── collaborator-bios.js
│   ├── i18n/
│   │   ├── en/
│   │   │   ├── ui-translations.js
│   │   │   └── content-translations.js
│   │   ├── es/
│   │   │   ├── ui-translations.js
│   │   │   └── content-translations.js
│   │   └── fr/
│   │       ├── ui-translations.js
│   │       └── content-translations.js
│   └── config/
│       ├── app-config.js
│       ├── platform-config.js
│       └── constants.js
├── scripts/
│   └── data-loader.js
├── index.html
├── script.js (refactored)
└── style.css
```

## 2. Data Schemas

### 2.1 Release Schema

```javascript
// data/releases/release-data.js
export const releaseData = [
  {
    id: "cumbia-del-barrio", // Unique identifier
    title: "Cumbia del Barrio",
    year: "2025",
    type: "single", // "single" or "album"
    coverArt: "images/art-cumbia-del-barrio.jpg",
    audioSrc: "audio/single-cumbia-del-barrio.mp3",
    featured: true,
    links: {
      spotify: "#",
      apple: "#",
      youtube: "#",
      bandcamp: "https://lasonoravolcanica.bandcamp.com/track/cumbia-del-barrio"
    },
    contentIds: {
      story: "cumbia-del-barrio-story",
      lyrics: "cumbia-del-barrio-lyrics",
      gallery: "cumbia-del-barrio-gallery"
    },
    visibleSections: ["story", "lyrics"], // Controls which sections are visible
    tags: ["cumbia", "electro", "featured"] // For filtering/searching
  },
  // ... more releases
];
```

### 2.2 Collaborator Schema

```javascript
// data/collaborators/collaborator-data.js
export const collaboratorData = [
  {
    id: "cututo",
    name: "Cututo",
    photoSrc: "images/collab-cututo.jpg",
    link: "https://open.spotify.com/artist/3jehqC1A1uGwGwOOtUWBSl?si=kruSiF6LSQmWiWxOdmJ3-w",
    contentIds: {
      bio: "cututo-bio"
    },
    songIds: ["tendido-cero-sentido"], // Reference to song data
    tags: ["peru", "bolero", "queer", "featured"]
  },
  // ... more collaborators
];
```

### 2.3 Content Schema

```javascript
// data/content/release-stories.js
export const releaseStories = {
  "cumbia-del-barrio-story": {
    en: "Born from the late-night energy of a bustling neighborhood...",
    es: "Nacida de la energía nocturna de un barrio bullicioso...",
    fr: "Née de l'énergie nocturne d'un quartier animé..."
  },
  // ... more stories
};

// data/content/release-lyrics.js
export const releaseLyrics = {
  "cumbia-del-barrio-lyrics": {
    en: "(Coro)\nEn el barrio, la cumbia suena...",
    es: "(Coro)\nEn el barrio, la cumbia suena...",
    fr: "(Refrain)\nDans le quartier, la cumbia résonne..."
  },
  // ... more lyrics
};

// data/content/collaborator-bios.js
export const collaboratorBios = {
  "cututo-bio": {
    en: "Some say the world will end in fire, some say in ice...",
    es: "Algunos dicen que el mundo acabará en fuego, otros que en hielo...",
    fr: "Certains disent que le monde finira dans le feu, d'autres dans la glace..."
  },
  // ... more bios
};
```

### 2.4 UI Translations Schema

```javascript
// data/i18n/en/ui-translations.js
export const uiTranslations = {
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
  collabsTitle: "Collaborations",
  collabVisitBtn: "Visit %s",
  // ... more UI translations
};
```

### 2.5 Configuration Schema

```javascript
// data/config/app-config.js
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

// data/config/platform-config.js
export const platformConfig = [
  { key: "spotify", icon: "icon-spotify", tooltip: "Spotify" },
  { key: "apple", icon: "icon-apple-music", tooltip: "Apple Music" },
  { key: "youtube", icon: "icon-youtube", tooltip: "YouTube" },
  { key: "bandcamp", icon: "icon-cart", tooltip: "Download / Buy" }
];
```

## 3. Module System Implementation

### 3.1 ES6 Module Structure

All data files will use ES6 module syntax with consistent export patterns:

```javascript
// Each file exports a single object or array
export const releaseData = [...];
export const collaboratorData = [...];
export const uiTranslations = {...};
```

### 3.2 Data Loader Module

Create a centralized data loader (`scripts/data-loader.js`) to handle all imports:

```javascript
// scripts/data-loader.js
import { releaseData } from '../data/releases/release-data.js';
import { featuredReleases } from '../data/releases/featured-releases.js';
import { collaboratorData } from '../data/collaborators/collaborator-data.js';
import { collaboratorSongs } from '../data/collaborators/collaborator-songs.js';
import { releaseStories } from '../data/content/release-stories.js';
import { releaseLyrics } from '../data/content/release-lyrics.js';
import { collaboratorBios } from '../data/content/collaborator-bios.js';
import { uiTranslations } from '../data/i18n/en/ui-translations.js';
import { appConfig } from '../data/config/app-config.js';
import { platformConfig } from '../data/config/platform-config.js';

// Dynamic imports for multilingual content
const loadTranslations = async (lang) => {
  const uiModule = await import(`../data/i18n/${lang}/ui-translations.js`);
  const contentModule = await import(`../data/i18n/${lang}/content-translations.js`);
  return {
    ui: uiModule.uiTranslations,
    content: contentModule.contentTranslations
  };
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
  loadTranslations
};
```

## 4. Integration Strategy

### 4.1 Static vs Dynamic Imports

**Static Imports (Critical Path Data):**
- Release metadata
- Collaborator information
- App configuration
- Platform configuration
- Default language UI translations

**Dynamic Imports (On-Demand Data):**
- Non-default language translations
- Detailed content (stories, lyrics, bios)
- Gallery images
- Extended metadata

### 4.2 Modified script.js Structure

```javascript
// script.js (refactored structure)
import { dataLoader } from './scripts/data-loader.js';

(function() {
  'use strict';
  
  // Initialize with critical data
  let currentLang = dataLoader.config.app.defaultLanguage;
  let translations = {};
  
  // Initialize application
  document.addEventListener('DOMContentLoaded', async () => {
    // Load default translations
    translations = await dataLoader.loadTranslations(currentLang);
    
    // Initialize UI with data
    populateFeaturedGrid();
    populateCollabsGrid();
    updateContent(currentLang);
  });
  
  // Rest of the application logic remains similar
  // but uses data from dataLoader instead of hardcoded arrays
})();
```

### 4.3 Content Resolution Strategy

Create helper functions to resolve content references:

```javascript
// Helper to resolve content by ID and language
const resolveContent = (contentId, contentType, language = currentLang) => {
  const content = dataLoader.content[contentType][contentId];
  return content ? content[language] || content[currentLang] || '' : '';
};

// Example usage in populate functions
const populateReleaseInfo = (release) => {
  const story = resolveContent(release.contentIds.story, 'stories');
  const lyrics = resolveContent(release.contentIds.lyrics, 'lyrics');
  // ... render content
};
```

## 5. Naming Conventions

### 5.1 File Naming (kebab-case)

```
release-data.js          ✅
collaborator-data.js     ✅
ui-translations.js       ✅
app-config.js            ✅
platform-config.js       ✅
```

### 5.2 Object Key Naming (camelCase)

```javascript
{
  releaseId: "cumbia-del-barrio",     ✅
  coverArt: "images/art-...",         ✅
  audioSrc: "audio/...",              ✅
  contentIds: {...},                  ✅
  visibleSections: [...],             ✅
}
```

### 5.3 Content ID Naming (kebab-case with suffixes)

```javascript
{
  "cumbia-del-barrio-story": "...",
  "cumbia-del-barrio-lyrics": "...",
  "cututo-bio": "...",
  "tendido-cero-sentido-song": "..."
}
```

## 6. Multilingual Content Organization

### 6.1 Directory Structure by Language

```
data/i18n/
├── en/
│   ├── ui-translations.js
│   └── content-translations.js
├── es/
│   ├── ui-translations.js
│   └── content-translations.js
└── fr/
    ├── ui-translations.js
    └── content-translations.js
```

### 6.2 Content Translation Strategy

**Option A: Language-Specific Content Files**
Each language has its own content files with all translations:

```javascript
// data/i18n/en/content-translations.js
export const contentTranslations = {
  stories: {
    "cumbia-del-barrio-story": "Born from the late-night energy...",
    // ... more stories
  },
  lyrics: {
    "cumbia-del-barrio-lyrics": "(Coro)\nEn el barrio...",
    // ... more lyrics
  },
  bios: {
    "cututo-bio": "Some say the world will end...",
    // ... more bios
  }
};
```

**Option B: Content ID-Based Translation Files**
Each content type has its own translation file with language variants:

```javascript
// data/content/release-stories.js (recommended)
export const releaseStories = {
  "cumbia-del-barrio-story": {
    en: "Born from the late-night energy...",
    es: "Nacida de la energía nocturna...",
    fr: "Née de l'énergie nocturne..."
  },
  // ... more stories
};
```

**Recommended Approach:** Option B is recommended as it:
- Keeps all language variants of a content piece together
- Makes it easier to ensure translation completeness
- Simplifies content management and updates
- Reduces file duplication

### 6.3 Language Loading Strategy

```javascript
// Dynamic language switching
const switchLanguage = async (lang) => {
  if (!dataLoader.config.app.supportedLanguages.includes(lang)) {
    console.warn(`Language ${lang} is not supported`);
    return;
  }
  
  try {
    translations = await dataLoader.loadTranslations(lang);
    currentLang = lang;
    updateContent(lang);
    document.documentElement.lang = lang;
    
    // Update language button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fall back to default language
    if (lang !== dataLoader.config.app.defaultLanguage) {
      switchLanguage(dataLoader.config.app.defaultLanguage);
    }
  }
};
```

## 7. Risk Mitigation

### 7.1 Identified Risks

1. **Breaking Changes During Migration**
   - Risk: Existing functionality may break during the refactoring process
   - Impact: High - Could render the site unusable

2. **Performance Impact of Multiple Imports**
   - Risk: Multiple HTTP requests for data files may slow initial load
   - Impact: Medium - Could affect user experience

3. **Content Reference Inconsistencies**
   - Risk: Content IDs may not match between data files
   - Impact: High - Could result in missing content

4. **Browser Compatibility with ES6 Modules**
   - Risk: Older browsers may not support ES6 modules
   - Impact: Medium - Could affect some users

5. **Translation Completeness**
   - Risk: New content may not be translated across all languages
   - Impact: Medium - Could affect user experience for non-English users

### 7.2 Mitigation Strategies

#### 7.2.1 Breaking Changes Mitigation

**Phase 1: Data Extraction and Module Creation**
1. Create all data files without modifying script.js
2. Verify data integrity with a validation script
3. Test data loading in isolation

**Phase 2: Gradual Integration**
1. First migrate configuration data (lowest risk)
2. Then migrate UI translations (medium risk)
3. Finally migrate content data (highest risk)
4. Test after each migration phase

**Phase 3: Validation and Testing**
1. Implement comprehensive testing for each data type
2. Create fallback mechanisms for missing data
3. Maintain backward compatibility during transition

#### 7.2.2 Performance Optimization

1. **Bundle Critical Data**
   ```javascript
   // Create a critical-data-bundle.js for essential data
   import { releaseData } from '../data/releases/release-data.js';
   import { collaboratorData } from '../data/collaborators/collaborator-data.js';
   import { appConfig } from '../data/config/app-config.js';
   
   export const criticalData = {
     releases: releaseData,
     collaborators: collaboratorData,
     config: appConfig
   };
   ```

2. **Implement Lazy Loading for Non-Critical Data**
   ```javascript
   // Load detailed content only when needed
   const loadReleaseDetails = async (releaseId) => {
     const story = await import(`../data/content/release-stories.js`);
     const lyrics = await import(`../data/content/release-lyrics.js`);
     return {
       story: story.releaseStories[`${releaseId}-story`],
       lyrics: lyrics.releaseLyrics[`${releaseId}-lyrics`]
     };
   };
   ```

3. **Add Loading States and Skeletons**
   - Maintain existing skeleton loader patterns
   - Add loading states for language switching

#### 7.2.3 Content Reference Validation

1. **Create a Validation Script**
   ```javascript
   // scripts/validate-data.js
   export const validateContentReferences = () => {
     const errors = [];
     
     // Check if all content IDs in releases exist in content files
     dataLoader.releases.forEach(release => {
       Object.entries(release.contentIds).forEach(([type, id]) => {
         if (!dataLoader.content[type][id]) {
           errors.push(`Missing ${type} content: ${id} for release ${release.id}`);
         }
       });
     });
     
     return errors;
   };
   ```

2. **Implement Fallback Mechanisms**
   ```javascript
   const resolveContent = (contentId, contentType, language = currentLang) => {
     const content = dataLoader.content[contentType][contentId];
     if (!content) {
       console.warn(`Content not found: ${contentType}/${contentId}`);
       return '[Content not available]';
     }
     return content[language] || content[currentLang] || content['en'] || '';
   };
   ```

#### 7.2.4 Browser Compatibility

1. **Add Module Polyfill Detection**
   ```javascript
   // Add to index.html before script.js
   <script type="module">
     // Check if modules are supported
     console.log('ES6 modules supported');
   </script>
   <script nomodule>
     // Fallback for older browsers
     console.warn('ES6 modules not supported, please update your browser');
     // Optionally redirect to a compatibility page
   </script>
   ```

2. **Consider Build Step for Production**
   - Use a bundler like Rollup or Webpack for production builds
   - Create a bundled version for older browsers if needed

#### 7.2.5 Translation Completeness

1. **Create Translation Validation**
   ```javascript
   const validateTranslations = () => {
     const languages = dataLoader.config.app.supportedLanguages;
     const baseLanguage = 'en';
     const missingTranslations = [];
     
     // Get all content IDs from English
     const englishContent = getAllContentIds('en');
     
     // Check each language for missing content
     languages.forEach(lang => {
       if (lang === baseLanguage) return;
       
       const langContent = getAllContentIds(lang);
       englishContent.forEach(id => {
         if (!langContent.includes(id)) {
           missingTranslations.push(`${lang}: ${id}`);
         }
       });
     });
     
     return missingTranslations;
   };
   ```

2. **Implement Translation Fallback Chain**
   ```javascript
   const getLocalizedContent = (contentId, contentType, language) => {
     const content = dataLoader.content[contentType][contentId];
     if (!content) return '[Content not available]';
     
     // Try requested language, then default language, then English
     return content[language] || 
            content[dataLoader.config.app.defaultLanguage] || 
            content['en'] || 
            '[Translation not available]';
   };
   ```

## 8. Implementation Roadmap

### Phase 1: Preparation (Days 1-2)
1. Create new directory structure
2. Extract all data from script.js to separate files
3. Create data-loader.js module
4. Implement validation scripts

### Phase 2: Critical Data Migration (Days 3-4)
1. Migrate configuration data
2. Migrate UI translations
3. Update script.js to use imported data
4. Test core functionality

### Phase 3: Content Data Migration (Days 5-6)
1. Migrate release and collaborator data
2. Implement content resolution functions
3. Update all populate functions
4. Test content display

### Phase 4: Multilingual Implementation (Days 7-8)
1. Implement dynamic language loading
2. Add translation validation
3. Implement fallback mechanisms
4. Test language switching

### Phase 5: Testing and Optimization (Days 9-10)
1. Comprehensive testing of all functionality
2. Performance optimization
3. Browser compatibility testing
4. Documentation updates

## 9. Success Criteria

1. **Functional Requirements**
   - All existing functionality works without regression
   - Language switching operates correctly
   - Content displays properly in all supported languages

2. **Performance Requirements**
   - Initial page load time does not increase significantly
   - Language switching is responsive (< 500ms)
   - Content loading feels instantaneous to users

3. **Maintainability Requirements**
   - Adding new releases requires only updating data files
   - Adding new languages requires only adding translation files
   - Content updates do not require code changes

4. **Code Quality Requirements**
   - All data follows defined schemas
   - No hardcoded content remains in script.js
   - Proper error handling and fallbacks are implemented

## 10. Conclusion

This refactoring plan establishes a robust, modular architecture that separates data from application logic. The new structure will:

1. **Improve Maintainability**: Content updates become simple data file edits
2. **Enhance Scalability**: New languages and content types can be added easily
3. **Increase Performance**: Optimized loading strategies reduce initial page weight
4. **Reduce Coupling**: Clear separation between data and application logic
5. **Improve Developer Experience**: Easier to understand and modify codebase

The phased approach minimizes risk while ensuring a smooth transition to the new architecture. With proper implementation, this refactoring will significantly improve the long-term maintainability and scalability of the La Sonora Volcánica website.