import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises';
import {PAGE_IDS, SITE_URL, pagePath, pageSEO, structuredData, safeJSON, sitemapXML, robotsTXT, normalizeOrigin} from '../app/seo-data.ts';
import {render, renderNotFound} from '../.prerender/render.mjs';

const origin = normalizeOrigin(process.env.SITE_URL || SITE_URL);
const dist = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', dist), 'utf8');
const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const assets = [...template.matchAll(/<(?:script\b[^>]*>[\s\S]*?<\/script>|link\b[^>]*(?:stylesheet|modulepreload)[^>]*>)/g)].map(m => m[0]).join('');

// Preload the two Latin font files used above the fold (heading + body).
const files = await readdir(new URL('assets/', dist));
const fontPreloads = [/^archivo-latin-wdth-normal.*\.woff2$/, /^source-sans-3-latin-wght-normal.*\.woff2$/]
  .map(pattern => files.find(file => pattern.test(file)))
  .filter(Boolean)
  .map(file => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin>`).join('');

const shared = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f3f0ea"><meta name="color-scheme" content="light"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/images/icon-180.png"><link rel="manifest" href="/site.webmanifest">${fontPreloads}`;
const noscript = language => `<noscript><p style="margin:0;padding:16px;background:#1d2125;color:#eeeae3;font:16px/1.5 system-ui,sans-serif">${language === 'nl' ? 'De calculators en fotoweergave hebben JavaScript nodig. Contacteer ons via' : 'Les calculateurs et l’affichage des photos nécessitent JavaScript. Contactez-nous via'} <a style="color:inherit" href="mailto:info@ingbelg.be">info@ingbelg.be</a> · <a style="color:inherit" href="tel:+32488876061">+32 488 87 60 61</a>.</p></noscript>`;

let count = 0;
for (const id of PAGE_IDS) for (const language of ['nl', 'fr']) {
  const path = pagePath(id, language), s = pageSEO(id, language, origin);
  const title = escape(s.title), description = escape(s.description);
  const head = [
    shared,
    `<title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index, follow, max-image-preview:large">`,
    `<link rel="canonical" href="${s.url}">`,
    Object.entries(s.alternates).map(([lang, url]) => `<link rel="alternate" hreflang="${lang}" href="${url}">`).join(''),
    `<meta property="og:type" content="website"><meta property="og:site_name" content="INGBELG"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${s.url}"><meta property="og:locale" content="${s.locale.replace('-', '_')}"><meta property="og:locale:alternate" content="${language === 'nl' ? 'fr_BE' : 'nl_BE'}">`,
    `<meta property="og:image" content="${s.image}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(s.h1)} · INGBELG">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${s.image}">`,
    `<script id="site-structured-data" type="application/ld+json">${safeJSON(structuredData(id, language, origin))}</script>`,
    assets,
  ].join('');
  const html = `<!doctype html><html lang="${s.locale}"><head>${head}</head><body><div id="root">${render(path)}</div>${noscript(language)}</body></html>`;
  const directory = new URL(path === '/' ? './' : path.slice(1) + '/', dist);
  await mkdir(directory, {recursive: true});
  await writeFile(new URL('index.html', directory), html);
  count++;
}

// Branded 404 pages (served with status 404 by server.mjs); never indexed.
for (const language of ['nl', 'fr']) {
  const title = language === 'nl' ? 'Pagina niet gevonden | INGBELG' : 'Page introuvable | INGBELG';
  const html = `<!doctype html><html lang="${language}-BE"><head>${shared}<title>${title}</title><meta name="robots" content="noindex">${assets}</head><body><div id="root" data-page="404">${renderNotFound(language)}</div>${noscript(language)}</body></html>`;
  await mkdir(new URL(language === 'nl' ? './' : 'fr/', dist), {recursive: true});
  await writeFile(new URL(language === 'nl' ? '404.html' : 'fr/404.html', dist), html);
}

await writeFile(new URL('sitemap.xml', dist), sitemapXML(origin));
await writeFile(new URL('robots.txt', dist), robotsTXT(origin));
console.log(`${count} pre-rendered NL/FR pages, 404 pages, sitemap and metadata built for ${origin}`);
