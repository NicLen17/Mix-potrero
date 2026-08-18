import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/favicon.svg');
const out192 = path.resolve('public/icon-192.png');
const out512 = path.resolve('public/icon-512.png');

async function generate() {
  try {
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(out192);
    console.log('Generated icon-192.png');

    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(out512);
    console.log('Generated icon-512.png');
  } catch (err) {
    console.error(err);
  }
}

generate();
