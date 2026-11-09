import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {PAGE_CATALOG,languagePath} from '../app/seo-data.ts';
test('all public pages serve pre-rendered content, unique metadata and correct languages',async()=>{
 const port=31987,child=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
 try{
  await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error('Server stopped')})]);
  for(const id of Object.keys(PAGE_CATALOG))for(const language of ['nl','fr']){
   const path=languagePath(PAGE_CATALOG[id].path,language),response=await fetch(`http://127.0.0.1:${port}${path}`),html=await response.text();
   assert.equal(response.status,200,path);assert.match(response.headers.get('content-type'),/text\/html/);
   assert.ok(html.includes(`<html lang="${language}-BE">`),path);assert.ok(html.includes('rel="canonical"'),path);assert.ok(html.includes('application/ld+json'),path);
   assert.equal((html.match(/<title>/g)||[]).length,1,path);assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,path);
   assert.ok(html.includes('rel="alternate" hreflang="fr-BE"'),path);assert.ok(html.includes('id="root"><'),path);
   assert.ok(html.includes('aria-label='),path);assert.ok(html.includes('alt="INGBELG"'),path);
   assert.ok(!html.includes('maximum-scale'),path);assert.ok(!html.includes('user-scalable=no'),path);
   const onDisk=await readFile(new URL('../dist'+(path==='/'?'/index.html':path+'/index.html'),import.meta.url),'utf8');assert.equal(html,onDisk);
  }
  for(const path of ['/fr/zottetools/premculator/','/fr/cookies?source=footer'])assert.equal((await fetch(`http://127.0.0.1:${port}${path}`)).status,200);
  for(const [path,type] of [['/sitemap.xml','application/xml'],['/robots.txt','text/plain'],['/site.webmanifest','application/manifest+json']]){const r=await fetch(`http://127.0.0.1:${port}${path}`);assert.equal(r.status,200);assert.ok(r.headers.get('content-type').includes(type))}
  for(const path of ['/zottetools/unknown','/fr/unknown','/assets/missing.js','/package.json','/server.mjs','/__rail-check.html'])assert.equal((await fetch(`http://127.0.0.1:${port}${path}`)).status,404,path);
  const head=await fetch(`http://127.0.0.1:${port}/fr`,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await fetch(`http://127.0.0.1:${port}/`,{method:'POST'})).status,405);
 } finally {child.kill();await once(child,'exit')}
});
