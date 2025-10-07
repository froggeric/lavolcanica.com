# Code Modification Locations for Data Architecture Migration

## 1. Data Files Requiring Changes

### 1.1 Primary Data Structure Changes

#### `data/releases/release-data.js`
**Lines 168-189**: Modify "tendido-cero-sentido" entry
```javascript
// CURRENT:
{
  id: "tendido-cero-sentido",
  title: "Tendido Cero Sentido",
  // ... existing fields ...
  tags: ["single", "2025", "collaboration"]
}

// NEW:
{
  id: "tendido-cero-sentido",
  title: "Tendido Cero Sentido",
  // ... existing fields ...
  collaboratorIds: ["cututo", "piero"], // ADD
  collaborationType: "featured", // ADD
  tags: ["single", "2025", "collaboration", "bolero", "queer"] // ENHANCE
}
```

**Lines 35-189**: Add collaboratorIds to ALL releases
```javascript
// For non-collaboration releases, add empty array:
{
  id: "cumbia-del-barrio",
  // ... existing fields ...
  collaboratorIds: [], // ADD
  // ... rest of fields ...
}
```

#### `data/collaborators/collaborator-data.js`
**Lines 26-47**: Update collaborator entries
```javascript
// CURRENT (cututo):
{
  id: "cututo",
  name: "Cututo",
  // ... existing fields ...
  songIds: ["tendido-cero-sentido"],
  tags: ["peru", "bolero", "queer", "featured"]
}

// NEW (cututo):
{
  id: "cututo",
  name: "Cututo",
  // ... existing fields ...
  releaseIds: ["tendido-cero-sentido"], // CHANGE from songIds
  songIds: ["tendido-cero-sentido"], // KEEP for backward compatibility
  role: { // ADD
    primary: "featured-artist",
    secondary: ["songwriter", "vocalist"]
  },
  tags: ["peru", "bolero", "queer", "featured"]
}
```

### 1.2 Files to be Deprecated

#### `data/collaborators/collaborator-songs.js`
**Entire file**: Mark for deprecation and eventual removal
- This file's functionality will be merged into `release-data.js`
- Content will be migrated during Phase 2 of migration

## 2. Data Loader Modifications

### 2.1 `scripts/data-loader.js`

**Lines 6-10**: Update imports
```javascript
// CURRENT:
import { releaseData } from '../data/releases/release-data.js';
import { featuredReleases } from '../data/releases/featured-releases.js';
import { collaboratorData } from '../data/collaborators/collaborator-data.js';
import { collaboratorSongs } from '../data/collaborators/collaborator-songs.js'; // REMOVE

// NEW:
import { releaseData } from '../data/releases/release-data.js';
import { featuredReleases } from '../data/releases/featured-releases.js';
import { collaboratorData } from '../data/collaborators/collaborator-data.js';
// import { collaboratorSongs } from '../data/collaborators/collaborator-songs.js'; // REMOVE
```

**Lines 90-92**: Update getCollaboratorSong function
```javascript
// CURRENT:
const getCollaboratorSong = (songId) => {
  return collaboratorSongs[songId] || null;
};

// NEW (with deprecation warning):
const getCollaboratorSong = (songId) => {
  console.warn('getCollaboratorSong is deprecated. Use getRelease instead.');
  return releaseData.find(release => release.id === songId) || null;
};
```

**Lines 92-114**: Add new functions
```javascript
// ADD after getCollaboratorSong:
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
```

**Lines 117-137**: Update exports
```javascript
// CURRENT:
export const dataLoader = {
  releases: releaseData,
  featuredReleases,
  collaborators: collaboratorData,
  collaboratorSongs, // REMOVE
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
  getCollaboratorSong, // KEEP with deprecation warning
  getReleasesByTag,
  getCollaboratorsByTag
};

// NEW:
export const dataLoader = {
  releases: releaseData,
  featuredReleases,
  collaborators: collaboratorData,
  // collaboratorSongs, // REMOVED
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
  getCollaboratorSong, // KEEP with deprecation warning
  getReleasesByTag,
  getCollaboratorsByTag,
  // NEW functions:
  getReleasesByCollaborator,
  getCollaboratorsByRelease,
  getCollaborationReleases,
  getRelease
};
```

## 3. Application Logic Modifications

### 3.1 `script.js`

**Lines 602-607**: Update collaborator song display logic
```javascript
// CURRENT:
collab.songIds.forEach(songId => {
    const song = dataLoader.getCollaboratorSong(songId);
    if (song) {
        hasSongs = true;
        const songCard = createMusicCard(song, false);
        discographyList.appendChild(songCard);
    }
});

// NEW:
collab.releaseIds.forEach(releaseId => {
    const release = dataLoader.getRelease(releaseId);
    if (release) {
        hasSongs = true;
        const songCard = createMusicCard(release, false);
        discographyList.appendChild(songCard);
    }
});
```

**Lines 936-946**: Update music card click handler
```javascript
// CURRENT:
// Check if the clicked song belongs to a release or a collaborator
const release = dataLoader.releases.find(r => r.coverArt === imgSrc);

if(release && window.loadTrack) {
    window.loadTrack(release);
} else {
    // Check collaborator songs
    for (const collab of dataLoader.collaborators) {
        for (const songId of collab.songIds) {
            const song = dataLoader.getCollaboratorSong(songId);
            if (song && song.coverArt === imgSrc && window.loadTrack) {
                window.loadTrack(song);
                return;
            }
        }
    }
}

// NEW:
// Check if the clicked song belongs to a release (unified approach)
const release = dataLoader.releases.find(r => r.coverArt === imgSrc);

if(release && window.loadTrack) {
    window.loadTrack(release);
}
```

**Lines 273-295**: Update discography population (if needed)
```javascript
// CURRENT:
dataLoader.releases.forEach(release => {
    const card = createMusicCard(release, false);
    fragment.appendChild(card);
});

// NEW: No change needed, but verify it works with new structure
```

**Add new helper function** (after line 300):
```javascript
// ADD:
/**
 * Get release by cover art path
 * @param {string} coverArt - Path to cover art
 * @returns {Object|null} - Release object or null
 */
const getReleaseByCoverArt = (coverArt) => {
    return dataLoader.releases.find(r => r.coverArt === coverArt) || null;
};
```

## 4. Documentation Updates

### 4.1 `DEVELOPER_GUIDE.md`

**Lines 45-104**: Update release schema documentation
```javascript
// ADD to release schema table:
| collaboratorIds | string[] | Array of collaborator IDs who contributed to this release. | ["cututo", "piero"] |
| collaborationType | string | Type of collaboration (featured, co-written, produced, etc.). | "featured" |
```

**Lines 95-104**: Update collaborator schema documentation
```javascript
// UPDATE collaborator schema table:
| releaseIds | string[] | Array of release IDs contributed by this collaborator. | ["tendido-cero-sentido"] |
| role | Object | Structured role information with primary and secondary roles. | { primary: "featured-artist", secondary: ["songwriter"] } |
```

**Add new section**: "Adding Collaborations"
```markdown
### Adding a New Collaboration

To add a new collaboration between existing releases and collaborators:

1. **Update the Release**: In `data/releases/release-data.js`, add the `collaboratorIds` array to the release:
   ```javascript
   {
     id: "existing-release",
     // ... existing fields ...
     collaboratorIds: ["collaborator-id-1", "collaborator-id-2"],
     collaborationType: "featured"
   }
   ```

2. **Update Collaborators**: In `data/collaborators/collaborator-data.js`, add the release ID to each collaborator:
   ```javascript
   {
     id: "collaborator-id-1",
     // ... existing fields ...
     releaseIds: ["existing-release"]
   }
   ```
```

### 4.2 `TECHNICAL_DOCUMENTATION.md`

**Update architecture section** to reflect new data relationships and removal of collaborator-songs.js

## 5. Test Files to Create

### 5.1 `tests/migration-test.js` (New File)
Create comprehensive test suite for migration validation

### 5.2 `tests/data-integration-test.js` (New File)
Test data relationships and API functionality

## 6. Migration Scripts to Create

### 6.1 `scripts/migration/data-migrator.js` (New File)
Automated data migration script

### 6.2 `scripts/migration/data-validator.js` (New File)
Data integrity validation script

### 6.3 `scripts/migration/rollback-script.js` (New File)
Automated rollback functionality

## 7. Summary of Modification Impact

### High Impact Changes
1. **script.js lines 602-607**: Core collaborator display logic
2. **script.js lines 936-946**: Music card interaction handling
3. **data-loader.js**: Major API changes and new functions

### Medium Impact Changes
1. **release-data.js**: Structure enhancement for all releases
2. **collaborator-data.js**: Field additions and changes
3. **Documentation updates**: Developer guides and technical docs

### Low Impact Changes
1. **New test files**: No impact on production code
2. **Migration scripts**: Development-time only
3. **Deprecated file removal**: Final cleanup phase

## 8. Modification Priority Order

### Phase 1 (Critical Path)
1. data-loader.js - Add new functions while keeping old ones
2. release-data.js - Add collaboratorIds to all releases
3. collaborator-data.js - Add releaseIds and role fields

### Phase 2 (Application Updates)
1. script.js - Update collaborator display logic
2. script.js - Update music card handling
3. Add new helper functions

### Phase 3 (Cleanup)
1. Remove collaborator-songs.js imports
2. Update documentation
3. Create comprehensive tests

This systematic approach ensures minimal disruption to existing functionality while enabling the new architecture.