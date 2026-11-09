// Dependency-free production server for the pre-rendered build (Node.js 24+).
import http from 'node:http';
import {readFile, stat, realpath} from 'node:fs/promises';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {brotliCompressSync, gzipSync, constants} from 'node:zlib';
import {PAGE_IDS, pagePath, languageFromPath} from './app/seo-data.ts';

const root = fileURLToPath(new URL('./dist', import.meta.url));
const port = Number(process.env.PORT || 3000);
const pagePaths = new Set(PAGE_IDS.flatMap(id => ['nl', 'fr'].map(language => pagePath(id, language))));
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};
const compressible = new Set(['.html', '.js', '.css', '.svg', '.json', '.xml', '.txt', '.webmanifest']);
const security = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
};
const compressed = new Map();

function encode(file, data, accept) {
  const encoding = /\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null;
  if (!encoding || data.length < 1024 || !compressible.has(extname(file))) return {data};
  const key = encoding + ':' + file;
  if (!compressed.has(key)) compressed.set(key, encoding === 'br'
    ? brotliCompressSync(data, {params: {[constants.BROTLI_PARAM_QUALITY]: 9, [constants.BROTLI_PARAM_SIZE_HINT]: data.length}})
    : gzipSync(data, {level: 9}));
  return {data: compressed.get(key), encoding};
}

async function send(req, res, file, status = 200) {
  const raw = await readFile(file);
  const {data, encoding} = encode(file, raw, String(req.headers['accept-encoding'] || ''));
  const pathname = file.slice(root.length).split(sep).join('/');
  const cache = pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable'
    : /\.(webp|jpg|png|svg|woff2)$/.test(pathname) ? 'public, max-age=604800' : 'no-cache';
  res.writeHead(status, {
    ...security, 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': cache, 'Vary': 'Accept-Encoding',
    ...(encoding ? {'Content-Encoding': encoding} : {}),
  });
  res.end(req.method === 'HEAD' ? undefined : data);
}

async function notFound(req, res, pathname) {
  try {await send(req, res, resolve(root, languageFromPath(pathname) === 'fr' ? 'fr/404.html' : '404.html'), 404)}
  catch {res.writeHead(404, {...security, 'Content-Type': 'text/plain; charset=utf-8'}); res.end('Not found')}
}

http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405, {...security, Allow: 'GET, HEAD'}); res.end(); return}
  let url, pathname;
  try {url = new URL(req.url, 'http://localhost'); pathname = decodeURIComponent(url.pathname)}
  catch {res.writeHead(400, security); res.end('Bad request'); return}
  // One canonical URL per page: drop trailing slashes and /index.html (query strings are kept).
  const canonical = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
  if (canonical !== pathname && pagePaths.has(canonical)) {
    res.writeHead(301, {...security, Location: canonical + url.search, 'Cache-Control': 'public, max-age=3600'}); res.end(); return;
  }
  const page = pagePaths.has(pathname);
  const target = resolve(root, '.' + (page ? (pathname === '/' ? '/index.html' : pathname + '/index.html') : pathname));
  try {
    if (!target.startsWith(root + sep)) throw new Error('Outside public files');
    const actual = await realpath(target);
    if (!actual.startsWith(root + sep)) throw new Error('Outside public files');
    if (!(await stat(actual)).isFile()) throw new Error('Not a file');
    if (!page && extname(actual) === '.html') throw new Error('Only catalog pages are served as HTML');
    await send(req, res, actual);
  } catch {
    await notFound(req, res, pathname);
  }
}).listen(port, '0.0.0.0', () => console.log(`INGBELG is running on port ${port}`));
