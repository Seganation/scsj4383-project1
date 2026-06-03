const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/realicon.png');
  const publicDir = path.join(__dirname, '../public');
  
  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error('Error: realicon.png not found in public directory');
    process.exit(1);
  }

  try {
    // Generate 192x192 icon
    await sharp(inputPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192x192.png'));
    
    console.log('✅ Generated icon-192x192.png');

    // Generate 512x512 icon
    await sharp(inputPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512x512.png'));
    
    console.log('✅ Generated icon-512x512.png');

    // Generate favicon.ico (32x32)
    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    console.log('✅ Generated favicon-32x32.png');

    // Generate 16x16 favicon
    await sharp(inputPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
    console.log('✅ Generated favicon-16x16.png');

    // Generate Apple touch icon (180x180)
    await sharp(inputPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('✅ Generated apple-touch-icon.png');

    console.log('🎉 All icons generated successfully!');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();