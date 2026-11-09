// One-off image pipeline. Run manually when project photos change:
//   npm i --no-save sharp && node scripts/optimize-images.mjs
// Outputs are committed to public/images, so the production build does not depend on sharp.
import {readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const sharp = (await import('sharp')).default;
const dir = fileURLToPath(new URL('../public/images/', import.meta.url));
const widths = [640, 1024];
const photos = (await readdir(dir)).filter(name => /^work-\d+\.webp$/.test(name));

for (const name of photos) {
  const base = name.replace(/\.webp$/, '');
  for (const width of widths) {
    await sharp(dir + name).resize({width}).webp({quality: 74, effort: 6}).toFile(`${dir}${base}-${width}.webp`);
  }
  // Social cards: 1200×630 JPEG, which every sharing platform renders.
  await sharp(dir + name).resize(1200, 630, {fit: 'cover', position: 'attention'}).jpeg({quality: 80, mozjpeg: true}).toFile(`${dir}og-${base}.jpg`);
}
console.log(`Optimised ${photos.length} photos`);
