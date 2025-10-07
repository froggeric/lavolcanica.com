# Data Architecture Migration Plan

## Overview
This plan outlines the step-by-step process to consolidate the data architecture, eliminate redundancy between `collaborator-songs.js` and `release-data.js`, and implement the new unified data model.

## Migration Strategy

### Phase 1: Preparation and Backup (Day 1)
**Objective**: Ensure system stability and create rollback capability

#### 1.1 Create Backup Branch
```bash
git checkout -b data-architecture-backup
git add .
git commit -m "Backup before data architecture migration"
git checkout main
git checkout -b data-architecture-migration
```

#### 1.2 Create Migration Scripts
Create `scripts/migration/` directory with the following files:
- `data-validator.js` - Validate data integrity before/after migration
- `migration-runner.js` - Execute migration steps
- `rollback-script.js` - Automated rollback capability

#### 1.3 Data Audit
Run comprehensive audit to identify:
- All releases with collaborators
- All collaborators with releases
- Content dependencies
- Broken references

### Phase 2: Data Structure Enhancement (Day 2)
**Objective**: Add new fields to existing structures without breaking functionality

#### 2.1 Enhance release-data.js
```javascript
// Add collaboratorIds to existing releases
// For tendido-cero-sentido, add:
{
  id: "tendido-cero-sentido",
  // ... existing fields ...
  collaboratorIds: ["cututo", "piero"], // NEW
  collaborationType: "featured", // NEW
  // ... rest of existing fields ...
}

// For other releases, add empty array if no collaborators
{
  id: "cumbia-del-barrio",
  // ... existing fields ...
  collaboratorIds: [], // NEW - empty for non-collaborations
  // ... rest of existing fields ...
}
```

#### 2.2 Enhance collaborator-data.js
```javascript
// Add releaseIds and role to existing collaborators
{
  id: "cututo",
  // ... existing fields ...
  releaseIds: ["tendido-cero-sentido"], // NEW - changed from songIds
  role: { // NEW
    primary: "featured-artist",
    secondary: ["songwriter", "vocalist"]
  },
  // Keep songIds for backward compatibility
  songIds: ["tendido-cero-sentido"] // DEPRECATED - keep for now
}
```

#### 2.3 Update Data Loader
Add new functions to `scripts/data-loader.js`:
```javascript
// Add new functions
const getReleasesByCollaborator = (collaboratorId) => { /* ... */ };
const getCollaboratorsByRelease = (releaseId) => { /* ... */ };
const getCollaborationReleases = () => { /* ... */ };
const getRelease = (releaseId) => { /* ... */ };

// Keep existing functions for backward compatibility
const getCollaboratorSong = (songId) => {
  console.warn('getCollaboratorSong is deprecated. Use getRelease instead.');
  return getRelease(songId);
};
```

### Phase 3: Application Logic Updates (Day 3)
**Objective**: Update application code to use new data structure

#### 3.1 Update script.js - Collaborator Display
```javascript
// OLD CODE (lines 602-607):
collab.songIds.forEach(songId => {
    const song = dataLoader.getCollaboratorSong(songId);
    if (song) {
        hasSongs = true;
        const songCard = createMusicCard(song, false);
        discographyList.appendChild(songCard);
    }
});

// NEW CODE:
collab.releaseIds.forEach(releaseId => {
    const release = dataLoader.getRelease(releaseId);
    if (release) {
        hasSongs = true;
        const songCard = createMusicCard(release, false);
        discographyList.appendChild(songCard);
    }
});
```

#### 3.2 Update script.js - Music Card Creation
```javascript
// OLD CODE (lines 937-946):
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

// NEW CODE:
const release = dataLoader.getReleaseByCoverArt(imgSrc);
if(release && window.loadTrack) {
    window.loadTrack(release);
}
```

#### 3.3 Add New Helper Functions
```javascript
// Add to script.js:
const getReleaseByCoverArt = (coverArt) => {
    return dataLoader.releases.find(r => r.coverArt === coverArt) || null;
};
```

### Phase 4: Testing and Validation (Day 4)
**Objective**: Ensure all functionality works correctly with new structure

#### 4.1 Automated Testing
Create `tests/migration-test.js`:
```javascript
// Test cases:
// 1. All releases load correctly
// 2. Collaborator releases display properly
// 3. Music cards render for both types
// 4. Audio playback works for all releases
// 5. Content (stories, lyrics) loads correctly
// 6. Featured releases still work
// 7. Search/filter functionality works
```

#### 4.2 Manual Testing Checklist
- [ ] Homepage loads with featured releases
- [ ] Full discography shows all releases
- [ ] Collaborator pages show correct releases
- [ ] Audio player works for all tracks
- [ ] Stories and lyrics display correctly
- [ ] Language switching works
- [ ] Mobile responsive design intact
- [ ] No console errors

#### 4.3 Performance Testing
- [ ] Load time measurements
- [ ] Memory usage comparison
- [ ] Search/filter performance

### Phase 5: Cleanup and Documentation (Day 5)
**Objective**: Remove deprecated code and update documentation

#### 5.1 Remove Deprecated Files
```bash
# Remove collaborator-songs.js after validation
git rm data/collaborators/collaborator-songs.js
```

#### 5.2 Clean Up Code
```javascript
// Remove deprecated imports from data-loader.js
// import { collaboratorSongs } from '../data/collaborators/collaborator-songs.js'; // REMOVE

// Remove deprecated exports
export const dataLoader = {
    // collaboratorSongs, // REMOVE
    // getCollaboratorSong, // REMOVE (or keep with deprecation warning)
    // ... rest of exports
};
```

#### 5.3 Update Documentation
- Update `DEVELOPER_GUIDE.md` with new data structure
- Update `TECHNICAL_DOCUMENTATION.md` with new architecture
- Create migration summary document

#### 5.4 Final Validation
- Run full test suite
- Manual testing of all features
- Performance benchmarking

## Detailed Implementation Steps

### Step 1: Data Migration Script
```javascript
// scripts/migration/data-migrator.js
export const migrateReleaseData = (releaseData, collaboratorSongs, collaboratorData) => {
    return releaseData.map(release => {
        // Check if this release exists in collaborator songs
        const collaboratorSong = collaboratorSongs[release.id];
        
        if (collaboratorSong) {
            // This is a collaboration - merge data
            return {
                ...release,
                collaboratorIds: collaboratorSong.collaboratorIds || [],
                collaborationType: collaboratorSong.collaborationType || 'featured'
            };
        } else {
            // Regular release - add empty collaborator array
            return {
                ...release,
                collaboratorIds: []
            };
        }
    });
};

export const migrateCollaboratorData = (collaboratorData, collaboratorSongs) => {
    return collaboratorData.map(collaborator => {
        // Find all songs this collaborator contributed to
        const releaseIds = Object.entries(collaboratorSongs)
            .filter(([songId, song]) => 
                song.collaboratorIds && song.collaboratorIds.includes(collaborator.id)
            )
            .map(([songId]) => songId);
        
        return {
            ...collaborator,
            releaseIds,
            // Keep songIds for backward compatibility during transition
            songIds: releaseIds,
            role: {
                primary: 'featured-artist', // Default, can be customized
                secondary: []
            }
        };
    });
};
```

### Step 2: Validation Script
```javascript
// scripts/migration/data-validator.js
export const validateMigration = (oldData, newData) => {
    const issues = [];
    
    // Check data integrity
    oldData.releases.forEach(oldRelease => {
        const newRelease = newData.releases.find(r => r.id === oldRelease.id);
        if (!newRelease) {
            issues.push(`Missing release: ${oldRelease.id}`);
        }
        
        // Compare critical fields
        if (newRelease && newRelease.title !== oldRelease.title) {
            issues.push(`Title mismatch for ${oldRelease.id}`);
        }
    });
    
    // Check collaborator references
    newData.releases.forEach(release => {
        if (release.collaboratorIds) {
            release.collaboratorIds.forEach(collabId => {
                const collaborator = newData.collaborators.find(c => c.id === collabId);
                if (!collaborator) {
                    issues.push(`Missing collaborator ${collabId} for release ${release.id}`);
                }
            });
        }
    });
    
    return issues;
};
```

### Step 3: Rollback Script
```javascript
// scripts/migration/rollback.js
export const rollbackMigration = () => {
    // Restore original files from backup
    // Reset git to backup commit
    // Revert any database changes
    console.log('Migration rolled back successfully');
};
```

## Risk Mitigation

### High-Risk Areas
1. **Breaking existing functionality** - Mitigated by backward compatibility
2. **Data loss during migration** - Mitigated by comprehensive backups
3. **Performance regression** - Mitigated by performance testing

### Monitoring During Migration
- Console error monitoring
- User experience testing
- Performance metrics tracking
- Data integrity checks

### Success Criteria
- All existing functionality preserved
- No data loss or corruption
- Improved maintainability
- Reduced redundancy
- Better performance

## Timeline Summary

| Day | Phase | Key Activities |
|-----|-------|----------------|
| 1 | Preparation | Backup, audit, migration scripts |
| 2 | Data Enhancement | Add new fields, update data loader |
| 3 | Application Updates | Update script.js, add new functions |
| 4 | Testing | Automated tests, manual validation |
| 5 | Cleanup | Remove deprecated code, update docs |

Total estimated time: 5 business days