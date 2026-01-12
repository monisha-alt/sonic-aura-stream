/**
 * Upload all music files to Cloudinary
 * 
 * Prerequisites:
 * 1. npm install cloudinary
 * 2. Set environment variables:
 *    - CLOUDINARY_CLOUD_NAME
 *    - CLOUDINARY_API_KEY
 *    - CLOUDINARY_API_SECRET
 * 
 * Usage:
 * node scripts/upload-to-cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET'
});

const MUSIC_DIR = path.join(__dirname, '..', 'public', 'music-dataset');

// Folders to upload
const folders = [
  'main-tracks',
  'background-tracks',
  'emotion-tracks/happy',
  'emotion-tracks/sad',
  'emotion-tracks/calm',
  'emotion-tracks/energetic',
  'emotion-tracks/romantic',
  'emotion-tracks/angry'
];

// Store uploaded URLs
const uploadedFiles = {};

/**
 * Upload a single file to Cloudinary
 */
async function uploadFile(filePath, publicId) {
  try {
    console.log(`Uploading: ${path.basename(filePath)}...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Use 'video' for audio files
      public_id: publicId,
      folder: 'aura-music',
      overwrite: false,
      use_filename: true,
      unique_filename: false
    });
    
    console.log(`✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Upload all MP3 files from a folder
 */
async function uploadFolder(folderPath) {
  const fullPath = path.join(MUSIC_DIR, folderPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Folder not found: ${fullPath}`);
    return;
  }
  
  console.log(`\n📁 Uploading folder: ${folderPath}`);
  
  const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.mp3'));
  
  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const publicId = `music-dataset/${folderPath}/${file.replace('.mp3', '')}`;
    
    const url = await uploadFile(filePath, publicId);
    
    if (url) {
      const relativePath = `${folderPath}/${file}`;
      uploadedFiles[relativePath] = url;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 Starting Cloudinary Upload...\n');
  console.log('Cloud Name:', cloudinary.config().cloud_name);
  
  if (cloudinary.config().cloud_name === 'YOUR_CLOUD_NAME') {
    console.error('\n❌ ERROR: Please configure Cloudinary credentials!');
    console.error('Set environment variables:');
    console.error('  - CLOUDINARY_CLOUD_NAME');
    console.error('  - CLOUDINARY_API_KEY');
    console.error('  - CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  
  // Upload all folders
  for (const folder of folders) {
    await uploadFolder(folder);
  }
  
  // Save mapping to file
  const mappingPath = path.join(__dirname, 'cloudinary-urls.json');
  fs.writeFileSync(mappingPath, JSON.stringify(uploadedFiles, null, 2));
  
  console.log('\n✅ Upload complete!');
  console.log(`📄 URL mapping saved to: ${mappingPath}`);
  console.log(`📊 Total files uploaded: ${Object.keys(uploadedFiles).length}`);
  console.log('\n🎯 Next step: Run update-metadata-with-cloudinary.js');
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

