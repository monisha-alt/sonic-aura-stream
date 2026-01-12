/**
 * Update metadata JSON files with Cloudinary URLs
 * 
 * Prerequisites:
 * 1. Run upload-to-cloudinary.js first
 * 2. Ensure cloudinary-urls.json exists
 * 
 * Usage:
 * node scripts/update-metadata-with-cloudinary.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_DIR = path.join(__dirname, '..', 'public', 'music-dataset', 'metadata');
const URL_MAPPING_PATH = path.join(__dirname, 'cloudinary-urls.json');

// Load Cloudinary URL mapping
let urlMapping = {};

if (fs.existsSync(URL_MAPPING_PATH)) {
  urlMapping = JSON.parse(fs.readFileSync(URL_MAPPING_PATH, 'utf-8'));
  console.log(`✅ Loaded ${Object.keys(urlMapping).length} Cloudinary URLs`);
} else {
  console.error('❌ ERROR: cloudinary-urls.json not found!');
  console.error('Please run upload-to-cloudinary.js first.');
  process.exit(1);
}

/**
 * Update a single metadata file
 */
function updateMetadataFile(filename) {
  const filePath = path.join(METADATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  console.log(`\n📝 Updating: ${filename}`);
  
  // Read metadata
  const metadata = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let updatedCount = 0;
  
  // Update each track
  metadata.forEach(track => {
    const originalPath = track.file_path;
    
    // Extract relative path from absolute path
    // e.g., "C:\\aura\\music-dataset\\main-tracks\\amalgam-217007.mp3" 
    // becomes "main-tracks/amalgam-217007.mp3"
    let relativePath = originalPath;
    
    // Handle absolute paths
    if (relativePath.includes('music-dataset')) {
      const parts = relativePath.split('music-dataset');
      relativePath = parts[1].replace(/\\/g, '/').replace(/^\//, '');
    } else if (relativePath.includes('main-tracks') || relativePath.includes('background-tracks') || relativePath.includes('emotion-tracks')) {
      // Already relative, just normalize slashes
      relativePath = relativePath.replace(/\\/g, '/');
    }
    
    // Try to find matching Cloudinary URL
    if (urlMapping[relativePath]) {
      track.file_path = urlMapping[relativePath];
      track.original_file_path = originalPath; // Keep backup
      track.storage_type = 'cloudinary';
      updatedCount++;
      console.log(`  ✅ ${track.track_name} → Cloudinary`);
    } else {
      console.log(`  ⚠️  ${track.track_name} → No match (${relativePath})`);
    }
  });
  
  // Create backup
  const backupPath = filePath.replace('.json', '.backup.json');
  fs.copyFileSync(filePath, backupPath);
  console.log(`  💾 Backup saved: ${path.basename(backupPath)}`);
  
  // Save updated metadata
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  console.log(`  ✅ Updated ${updatedCount}/${metadata.length} tracks`);
  
  return updatedCount;
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Updating Metadata with Cloudinary URLs...\n');
  
  const metadataFiles = [
    'main_tracks.json',
    'background_tracks.json',
    'emotion_tracks.json'
  ];
  
  let totalUpdated = 0;
  
  metadataFiles.forEach(file => {
    const count = updateMetadataFile(file);
    if (count) totalUpdated += count;
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ METADATA UPDATE COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 Total tracks updated: ${totalUpdated}`);
  console.log(`💾 Backups saved with .backup.json extension`);
  console.log('\n🎯 Next steps:');
  console.log('  1. Test locally: npm run dev');
  console.log('  2. Verify music plays from Cloudinary');
  console.log('  3. Deploy to Vercel: vercel --prod');
  console.log('');
}

// Run
try {
  main();
} catch (error) {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}

