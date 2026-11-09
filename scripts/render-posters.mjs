// One-off: renders the roof scene posters used for LCP, no-WebGL fallback and service pages.
//   npm i --no-save sharp && node scripts/render-posters.mjs
// Uses the Vite dev server and the preinstalled Playwright Chromium. Outputs go to public/images/scene.
import {mkdir} from 'node:fs/promises';
import {createServer} from 'vite';
import {chromium} from 'playwright';

const sharp = (await import('sharp')).default;
const out = new URL('../public/images/scene/', import.meta.url);
await mkdir(out, {recursive: true});
const server = await createServer({configFile: new URL('../vite.config.ts', import.meta.url).pathname, server: {port: 5199, host: '127.0.0.1'}, logLevel: 'error'});
await server.listen();
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport: {width: 1380, height: 1200}, deviceScaleFactor: 1});
page.on('pageerror', error => console.error(error));
const jobs = [{name: 'roof-hero', focus: -1, labels: false, lang: 'nl'}];
for (let focus = 0; focus <= 4; focus++) for (const lang of ['nl', 'fr']) jobs.push({name: `roof-focus-${focus}-${lang}`, focus, labels: true, lang});
for (const job of jobs) {
  await page.goto(`http://127.0.0.1:5199/scripts/poster.html?focus=${job.focus}&labels=${job.labels ? 1 : 0}&lang=${job.lang}`);
  await page.waitForSelector('body[data-ready="1"]', {timeout: 60000});
  const png = await page.locator('#stage').screenshot({omitBackground: true});
  await sharp(png).webp({quality: 84, alphaQuality: 90, effort: 6}).toFile(new URL(job.name + '.webp', out).pathname);
  console.log('rendered', job.name);
}
await browser.close();
await server.close();
