const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

// Tamaños requeridos para PWA
const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
  try {
    // Verificar que el logo existe
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Error: No se encontró logo.png en la carpeta public/');
      process.exit(1);
    }
    
    console.log('🎨 Generando íconos PWA desde logo.png...');
    
    // Generar cada tamaño
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: ${name}`);
    }
    
    console.log('✨ ¡Íconos generados exitosamente!');
  } catch (error) {
    console.error('❌ Error generando íconos:', error);
    process.exit(1);
  }
}

generateIcons();

