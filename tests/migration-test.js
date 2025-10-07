/**
 * Basic migration validation script
 * Tests that the new data architecture works correctly
 */

import { dataLoader } from '../scripts/data-loader.js';

/**
 * Test data integrity after migration
 */
const testDataIntegrity = () => {
    console.log('Testing data integrity...');
    
    let issues = [];
    
    // Test 1: All releases have collaboratorIds field
    dataLoader.releases.forEach((release, index) => {
        if (!release.collaboratorIds) {
            issues.push(`Release ${release.id} missing collaboratorIds field`);
        }
    });
    
    // Test 2: Collaborator with releases has correct data
    const cututo = dataLoader.collaborators.find(c => c.id === 'cututo');
    if (cututo) {
        if (!cututo.releaseIds || cututo.releaseIds.length === 0) {
            issues.push('Collaborator cututo missing releaseIds');
        }
        
        if (!cututo.role || !cututo.role.primary) {
            issues.push('Collaborator cututo missing role information');
        }
    }
    
    // Test 3: New functions work correctly
    const collabReleases = dataLoader.getReleasesByCollaborator('cututo');
    if (!collabReleases || collabReleases.length === 0) {
        issues.push('getReleasesByCollaborator not working');
    }
    
    const tendidoRelease = dataLoader.getRelease('tendido-cero-sentido');
    if (!tendidoRelease) {
        issues.push('getRelease not working');
    }
    
    if (!tendidoRelease || !tendidoRelease.collaboratorIds || tendidoRelease.collaboratorIds.length === 0) {
        issues.push('tendido-cero-sentido missing collaboratorIds');
    }
    
    // Test 4: Backward compatibility
    const oldSong = dataLoader.getCollaboratorSong('tendido-cero-sentido');
    if (!oldSong) {
        issues.push('Backward compatibility broken for getCollaboratorSong');
    }
    
    if (issues.length > 0) {
        console.error('Data integrity issues found:');
        issues.forEach(issue => console.error(`- ${issue}`));
        return false;
    } else {
        console.log('✓ Data integrity test passed');
        return true;
    }
};

/**
 * Test data relationships
 */
const testDataRelationships = () => {
    console.log('Testing data relationships...');
    
    let issues = [];
    
    // Test bidirectional relationships
    const cututo = dataLoader.collaborators.find(c => c.id === 'cututo');
    if (cututo && cututo.releaseIds) {
        cututo.releaseIds.forEach(releaseId => {
            const release = dataLoader.getRelease(releaseId);
            if (!release) {
                issues.push(`Release ${releaseId} referenced by cututo not found`);
            } else if (!release.collaboratorIds.includes('cututo')) {
                issues.push(`Release ${releaseId} doesn't reference cututo`);
            }
        });
    }
    
    // Test collaboration releases
    const collabReleases = dataLoader.getCollaborationReleases();
    if (!collabReleases || collabReleases.length === 0) {
        issues.push('No collaboration releases found');
    }
    
    if (issues.length > 0) {
        console.error('Data relationship issues found:');
        issues.forEach(issue => console.error(`- ${issue}`));
        return false;
    } else {
        console.log('✓ Data relationships test passed');
        return true;
    }
};

/**
 * Run all tests
 */
const runAllTests = () => {
    console.log('Running migration validation tests...\n');
    
    const results = {
        dataIntegrity: testDataIntegrity(),
        dataRelationships: testDataRelationships()
    };
    
    const allPassed = Object.values(results).every(result => result === true);
    
    console.log('\n=== TEST RESULTS ===');
    console.log(`Data Integrity: ${results.dataIntegrity ? 'PASSED' : 'FAILED'}`);
    console.log(`Data Relationships: ${results.dataRelationships ? 'PASSED' : 'FAILED'}`);
    console.log(`Overall: ${allPassed ? 'PASSED' : 'FAILED'}`);
    
    if (allPassed) {
        console.log('\n✅ Migration validation successful!');
    } else {
        console.log('\n❌ Migration validation failed. Check issues above.');
    }
    
    return allPassed;
};

// Export for use in other modules
export { runAllTests };

// Auto-run if this script is executed directly
if (typeof window !== 'undefined') {
    window.runMigrationTests = runAllTests;
}