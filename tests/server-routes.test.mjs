import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {PAGE_IDS, pagePath, pageSEO} from '../app/seo-data.ts';

test('all public pages serve pre-rendered content, unique metadata and correct languages', async () => {
  const port = 31987, child = spawn(process.execPath, ['server.mjs'], {cwd: new URL('../', import.meta.url), env: {...process.env, PORT: String(port)}, stdio: ['ignore', 'pipe', 'pipe']});
  const base = `http://127.0.0.1:${port}`;
  try {
    await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => {throw new Error('Server stopped')})]);
    for (const id of PAGE_IDS) for (const language of ['nl', 'fr']) {
      const path = pagePath(id, language), response = await fetch(base + path), html = await response.text();
      assert.equal(response.status, 200, path);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.ok(response.headers.get('content-security-policy'), path);
      assert.ok(html.includes(`<html lang="${language}-BE">`), path);
      assert.ok(html.includes('rel="canonical"'), path);
      assert.ok(html.includes('application/ld+json'), path);
      assert.equal((html.match(/<title>/g) || []).length, 1, path);
      assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
      assert.ok(html.includes(pageSEO(id, language).h1.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')), `${path} renders its H1 server-side`);
      assert.ok(html.includes('rel="alternate" hreflang="fr-BE"'), path);
      assert.ok(html.includes('id="root"><'), path);
      assert.ok(html.includes('alt="INGBELG"'), path);
      assert.ok(html.includes('<main id="main"'), path);
      assert.ok(!html.includes('maximum-scale') && !html.includes('user-scalable=no'), path);
      const onDisk = await readFile(new URL('../dist' + (path === '/' ? '/index.html' : path + '/index.html'), import.meta.url), 'utf8');
      assert.equal(html, onDisk);
    }
    // Calculators are server-rendered content, not a client-only popup.
    const tool = await (await fetch(base + '/fr/zottetools/premculator')).text();
    assert.ok(tool.includes('Mijn VerbouwPremie') && tool.includes('<select'), 'Premculator form is pre-rendered');

    // Non-canonical variants redirect permanently; query strings survive.
    for (const [path, location] of [['/fr/zottetools/premculator/', '/fr/zottetools/premculator'], ['/diensten/platte-daken/?utm_source=x', '/diensten/platte-daken?utm_source=x'], ['/index.html', '/'], ['/fr/', '/fr']]) {
      const response = await fetch(base + path, {redirect: 'manual'});
      assert.equal(response.status, 301, path); assert.equal(response.headers.get('location'), location, path);
    }
    assert.equal((await fetch(base + '/fr/cookies?source=footer')).status, 200);
    for (const [path, type] of [['/sitemap.xml', 'application/xml'], ['/robots.txt', 'text/plain'], ['/site.webmanifest', 'application/manifest+json'], ['/images/scene/roof-hero.webp', 'image/webp'], ['/images/og-work-02.jpg', 'image/jpeg']]) {
      const response = await fetch(base + path); assert.equal(response.status, 200, path); assert.ok(response.headers.get('content-type').includes(type), path);
    }
    // Unknown URLs get the branded 404 page with a real 404 status.
    for (const path of ['/zottetools/unknown', '/fr/unknown', '/assets/missing.js', '/package.json', '/server.mjs', '/404.html', '/../server.mjs']) {
      const response = await fetch(base + path); assert.equal(response.status, 404, path);
    }
    const missing = await (await fetch(base + '/fr/inconnu')).text();
    assert.ok(missing.includes('noindex') && missing.includes('lang="fr-BE"'));
    // Text responses are compressed when the client allows it.
    const compressed = await fetch(base + '/', {headers: {'accept-encoding': 'br'}});
    assert.equal(compressed.headers.get('content-encoding'), 'br');
    const head = await fetch(base + '/fr', {method: 'HEAD'}); assert.equal(head.status, 200); assert.equal(await head.text(), '');
    assert.equal((await fetch(base + '/', {method: 'POST'})).status, 405);
  } finally {child.kill(); await once(child, 'exit')}
});
