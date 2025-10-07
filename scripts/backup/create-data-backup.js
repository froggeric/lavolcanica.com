/**
 * Creates a comprehensive backup of all data before migration
 */
import fs from 'fs';
import path from 'path';

const createBackup = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `../backups/migration-${timestamp}`;
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup critical data files
    const dataFiles = [
        'data/releases/release-data.js',
        'data/releases/featured-releases.js',
        'data/collaborators/collaborator-data.js',
        'data/collaborators/collaborator-songs.js',
        'data/content/release-stories.js',
        'data/content/release-lyrics.js',
        'data/content/collaborator-bios.js',
        'scripts/data-loader.js'
    ];
    
    dataFiles.forEach(file => {
        const source = path.join(process.cwd(), file);
        const dest = path.join(backupDir, file);
        
        // Create directory structure
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy file
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, dest);
            console.log(`Backed up: ${file}`);
        }
    });
    
    // Create backup metadata
    const metadata = {
        timestamp: new Date().toISOString(),
        files: dataFiles,
        migrationPhase: 'pre-migration',
        version: '1.2.1'
    };
    
    fs.writeFileSync(
        path.join(backupDir, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    console.log(`Backup created at: ${backupDir}`);
    return backupDir;
};

createBackup();