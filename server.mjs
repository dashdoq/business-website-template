import http from 'node:http';
import {PAGE_CATALOG,languagePath} from './app/seo-data.ts';
import {readFile,stat,realpath} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist',import.meta.url));
const port=Number(process.env.PORT||3000);
const pagePaths=new Set(Object.values(PAGE_CATALOG).flatMap(page=>['nl','fr'].map(language=>languagePath(page.path,language))));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.json':'application/json','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const page=pathname.replace(/\/+$/, '')||'/';const target=resolve(root,'.'+(pagePaths.has(page)?(page==='/'?'/index.html':page+'/index.html'):pathname));
 if(!target.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
 const actual=await realpath(target);if(!actual.startsWith(root+sep))throw new Error('Outside public assets');
 const info=await stat(actual);if(!info.isFile())throw new Error('Not a file');
 const data=await readFile(actual);res.writeHead(200,{'Content-Type':mime[extname(actual)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`INGBELG is running on port ${port}`));
