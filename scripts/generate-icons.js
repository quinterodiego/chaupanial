const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const faviconPath = path.join(__dirname, '../public/favicon.ico');
const outputDir = path.join(__dirname, '../public');

// Tamaños requeridos para PWA y favicon
const sizes = [
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
  try {
    // Leer el favicon.ico
    const faviconBuffer = fs.readFileSync(faviconPath);
    
    console.log('🎨 Generando íconos PWA desde favicon.ico...');
    
    // Generar cada tamaño
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(faviconBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: ${name}`);
    }
    
    // Generar favicon-16x16.png para compatibilidad
    const favicon16Path = path.join(outputDir, 'favicon-16x16.png');
    await sharp(faviconBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(favicon16Path);
    
    console.log('✅ Generado: favicon-16x16.png');
    
    console.log('✨ ¡Íconos generados exitosamente!');
  } catch (error) {
    console.error('❌ Error generando íconos:', error);
    process.exit(1);
  }
}

generateIcons();

