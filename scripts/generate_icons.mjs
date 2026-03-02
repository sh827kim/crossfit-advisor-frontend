import sharp from 'sharp';
import fs from 'fs';

const input = 'AppIcon.png';

async function generate() {
    console.log('Generating PWA icons...');
    await sharp(input).resize(192, 192).png().toFile('public/icon-192x192.png');
    await sharp(input).resize(512, 512).png().toFile('public/icon-512x512.png');
    await sharp(input).resize(64, 64).png().toFile('public/favicon.ico');

    console.log('Generating Capacitor assets source...');
    if (!fs.existsSync('assets')) {
        fs.mkdirSync('assets');
    }
    fs.copyFileSync(input, 'assets/icon.png');
    // Create a proper splash screen if needed, or just copy the icon.
    // Splash usually requires 2732x2732. Let's create a black background with the icon in the center.
    await sharp({
        create: {
            width: 2732,
            height: 2732,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
    })
        .composite([{
            input: await sharp(input).resize(1024, 1024).toBuffer(),
            gravity: 'center'
        }])
        .png()
        .toFile('assets/splash.png');

    console.log('Assets ready.');
}

generate().catch(console.error);
