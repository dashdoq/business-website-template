import test from 'node:test';
import assert from 'node:assert/strict';
import {PAGE_CATALOG,pageSEO,structuredData,safeJSON,sitemapXML,robotsTXT,languagePath,languageFromPath,pageFromPath,normalizeOrigin} from '../app/seo-data.ts';
import {makeConsent,parseConsent,CONSENT_LIFETIME,CONSENT_KEY,COMFORT_KEY,saveConsent,readConsent,refreshConsent,readComfort,saveComfort,clearExpiredStorage} from '../app/consent-storage.ts';
test('NL/FR pages have unique canonical URLs, titles, reciprocal alternates and valid schema',()=>{
 const origin='https://example.test',urls=new Set(),titles=new Set();
 for(const id of Object.keys(PAGE_CATALOG))for(const language of ['nl','fr']){
  const s=pageSEO(id,language,origin);urls.add(s.url);titles.add(s.title);
  assert.equal(pageFromPath(new URL(s.url).pathname),id);assert.equal(languageFromPath(new URL(s.url).pathname),language);
  assert.equal(s.alternates[language+'-BE'],s.url);
  assert.equal(pageSEO(id,language==='nl'?'fr':'nl',origin).alternates[language+'-BE'],s.url);
  const schema=JSON.parse(safeJSON(structuredData(id,language,origin)));
  assert.equal(schema['@graph'].find(x=>x['@type']==='WebPage').url,s.url);
  assert.ok(schema['@graph'].every(x=>!x.aggregateRating));
 }
 assert.equal(urls.size,14);assert.equal(titles.size,14);
 assert.equal(languagePath('/fr/zottetools/renculator','nl'),'/zottetools/renculator');
 assert.equal(languagePath('/','fr'),'/fr');assert.equal(languagePath('/fr','fr'),'/fr');assert.equal(pageFromPath('/unknown'),null);
});
test('sitemap, robots and structured data use the deployment origin safely',()=>{
 const xml=sitemapXML('https://example.test');assert.equal((xml.match(/<url>/g)||[]).length,14);assert.equal((xml.match(/hreflang=/g)||[]).length,42);
 assert.ok(!xml.includes('chatgpt.site'));assert.match(robotsTXT('https://example.test'),/Sitemap: https:\/\/example.test\/sitemap.xml/);
 assert.ok(!safeJSON({name:'</script><script>alert(1)</script>'}).includes('</script>'));
 for(const origin of ['javascript:alert(1)','https://a.test/subpath','https://a.test?x=1','https://user:pass@a.test'])assert.throws(()=>normalizeOrigin(origin));
});
test('consent expires, is versioned, and refuses malformed permission values',()=>{
 const now=1000000,c=makeConsent(false,now);
 assert.equal(c.expiresAt,now+CONSENT_LIFETIME);assert.equal(parseConsent(JSON.stringify(c),now).preferences,false);
 assert.equal(parseConsent(JSON.stringify(c),c.expiresAt),null);
 for(const patch of [{version:2},{preferences:'yes'},{updatedAt:now+1},{expiresAt:Infinity},{expiresAt:now+CONSENT_LIFETIME+1}])assert.equal(parseConsent(JSON.stringify({...c,...patch}),now),null);
 assert.equal(parseConsent('not JSON',now),null);
});
test('optional storage requires consent and is removed on rejection even if persistence fails',()=>{
 const data=new Map();let failWrite=false;
 globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(failWrite)throw new Error('Storage blocked');data.set(k,v)},removeItem:k=>data.delete(k)};
 globalThis.window=new EventTarget();refreshConsent();
 const comfort={reduced:true,paused:true,contrast:true};saveComfort(comfort);assert.equal(data.has(COMFORT_KEY),false);
 saveConsent(true);saveComfort(comfort);assert.deepEqual(readComfort(),comfort);
 saveConsent(false);assert.equal(data.has(COMFORT_KEY),false);saveComfort(comfort);assert.equal(data.has(COMFORT_KEY),false);
 saveConsent(true);saveComfort(comfort);failWrite=true;assert.equal(saveConsent(false).persisted,false);assert.equal(readConsent().preferences,false);assert.equal(data.has(COMFORT_KEY),false);saveComfort(comfort);assert.equal(data.has(COMFORT_KEY),false);
 failWrite=false;data.set(CONSENT_KEY,JSON.stringify(makeConsent(true,Date.now()-CONSENT_LIFETIME-1000)));data.set(COMFORT_KEY,JSON.stringify(comfort));refreshConsent();clearExpiredStorage();assert.equal(data.has(COMFORT_KEY),false);assert.equal(data.has(CONSENT_KEY),false);
 delete globalThis.localStorage;delete globalThis.window;
});
