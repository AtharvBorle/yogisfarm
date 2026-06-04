const fs = require('fs');
const path = require('path');

// Simple script to read PNG/JPG dimensions
function getPngDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // PNG signature is 8 bytes
    // IHDR chunk starts at byte 12
    // Width is at 16-19, Height at 20-23
    const width = buffer.readInt32BE(16);
    const height = buffer.readInt32BE(20);
    return { width, height };
  } catch (e) {
    return null;
  }
}

const figmaDir = 'C:/Users/Admin/Downloads/yogisfarm_migration/yogisfarm/frontend/src/assets/figma';
const userImgsDir = 'C:/Users/Admin/Downloads/yogisfarm_migration/yogisfarm/yogis_user_imgs';

console.log('--- USER IMAGES ---');
fs.readdirSync(userImgsDir).forEach(file => {
  if (file.endsWith('.png')) {
    const p = path.join(userImgsDir, file);
    const dims = getPngDimensions(p);
    console.log(`${file}: size=${fs.statSync(p).size}, dims=${dims ? `${dims.width}x${dims.height}` : 'unknown'}`);
  }
});

console.log('--- FIGMA IMAGES ---');
fs.readdirSync(figmaDir).forEach(file => {
  if (file.endsWith('.png')) {
    const p = path.join(figmaDir, file);
    const dims = getPngDimensions(p);
    if (dims && dims.width > 300) {
      console.log(`${file}: size=${fs.statSync(p).size}, dims=${dims.width}x${dims.height}`);
    }
  }
});
