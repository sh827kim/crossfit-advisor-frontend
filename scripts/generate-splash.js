
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../public/logo-splash.svg');
const outputPath = path.join(__dirname, '../assets/splash.png');

async function generateSplash() {
    try {
        console.log(`Reading SVG from ${inputPath}...`);

        // Create a white background canvas (2732x2732 for iPad Pro retina splash)
        const targetSize = 2732;
        // Logo size: 40% of target size
        const logoSize = Math.floor(targetSize * 0.4);

        // Resize the SVG first. 
        // Sharp's SVG rendering is powerful. We can resize it directly.
        const resizedLogoBuffer = await sharp(inputPath)
            .resize({
                width: logoSize,
                height: logoSize,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer();

        // Composite onto white background
        await sharp({
            create: {
                width: targetSize,
                height: targetSize,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            }
        })
            .composite([{ input: resizedLogoBuffer, gravity: 'center' }])
            .png()
            .toFile(outputPath);

        console.log(`Splash screen generated at ${outputPath}`);
    } catch (err) {
        console.error('Error generating splash screen:', err);
        process.exit(1);
    }
}

generateSplash();
