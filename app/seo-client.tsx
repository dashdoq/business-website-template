'use client';
import {useEffect} from 'react';
import {pageFromPath,pageSEO,safeJSON,structuredData,type SiteLanguage} from './seo-data';
export function usePageSEO(language:SiteLanguage,activePath:string){
 useEffect(()=>{
  const id=pageFromPath(location.pathname);if(!id)return;
  const canonical=document.querySelector<HTMLLinkElement>('link[rel=canonical]');
  const origin=canonical?new URL(canonical.href).origin:location.origin;
  const s=pageSEO(id,language,origin);document.title=s.title;document.documentElement.lang=s.locale;
  const meta=(attribute:string,key:string,value:string)=>{let el=document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attribute,key);document.head.appendChild(el)}el.content=value};
  meta('name','description',s.description);meta('name','keywords',s.keywords.join(', '));
  for(const [key,value] of Object.entries({'og:title':s.title,'og:description':s.description,'og:url':s.url,'og:locale':s.locale.replace('-','_'),'og:locale:alternate':language==='nl'?'fr_BE':'nl_BE'}))meta('property',key,value);
  meta('name','twitter:title',s.title);meta('name','twitter:description',s.description);
  if(canonical)canonical.href=s.url;
  for(const [lang,href] of Object.entries(s.alternates)){const el=document.head.querySelector<HTMLLinkElement>(`link[hreflang="${lang}"]`);if(el)el.href=href}
  let data=document.querySelector<HTMLScriptElement>('#site-structured-data');if(!data){data=document.createElement('script');data.id='site-structured-data';data.type='application/ld+json';document.head.appendChild(data)}data.textContent=safeJSON(structuredData(id,language,origin));
 },[language,activePath]);
}
