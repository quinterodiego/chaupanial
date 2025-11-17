const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/logo.png');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../app');

// Tamaños requeridos para PWA
const sizes = [
  { size: 192, name: 'icon-192x192.png', dir: publicDir },
  { size: 512, name: 'icon-512x512.png', dir: publicDir },
  { size: 32, name: 'favicon.ico', dir: publicDir }, // Para public/
  { size: 32, name: 'icon.png', dir: appDir }, // Para app/ (Next.js 14 detecta automáticamente)
];

async function generateIcons() {
  try {
    // Verificar que el logo existe
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Error: No se encontró logo.png en la carpeta public/');
      process.exit(1);
    }
    
    console.log('🎨 Generando íconos PWA y favicon desde logo.png...');
    
    // Generar cada tamaño
    for (const { size, name, dir } of sizes) {
      const outputPath = path.join(dir, name);
      
      // Para .ico, generar PNG de 32x32 (los navegadores modernos aceptan PNG como favicon)
      // Para icon.png, generar PNG de 32x32 para Next.js 14
      if (name.endsWith('.ico') || name === 'icon.png') {
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      } else {
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      }
      
      console.log(`✅ Generado: ${path.relative(process.cwd(), outputPath)}`);
    }
    
    console.log('✨ ¡Íconos y favicon generados exitosamente!');
  } catch (error) {
    console.error('❌ Error generando íconos:', error);
    process.exit(1);
  }
}

generateIcons();

