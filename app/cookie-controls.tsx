'use client';
import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {CONSENT_EVENT,CONSENT_KEY,clearExpiredStorage,readConsent,refreshConsent,saveConsent,type Consent} from './consent-storage';
import {languagePath,type SiteLanguage} from './seo-data';
export function CookieControls({language}:{language:SiteLanguage}){
 const l=(nl:string,fr:string)=>language==='nl'?nl:fr;
 const [ready,setReady]=useState(false),[consent,setConsent]=useState<Consent|null>(null),[open,setOpen]=useState(false),[preferences,setPreferences]=useState(false),[sessionOnly,setSessionOnly]=useState(false);
 const banner=useRef<HTMLElement>(null),trigger=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  clearExpiredStorage();setConsent(readConsent());setReady(true);
  const changed=(event:Event)=>setConsent((event as CustomEvent<Consent>).detail);
  const storage=(event:StorageEvent)=>{if(event.key===CONSENT_KEY||event.key===null)setConsent(refreshConsent())};
  const show=()=>{trigger.current=document.activeElement as HTMLElement;setPreferences(readConsent()?.preferences??false);setOpen(true)};
  window.addEventListener(CONSENT_EVENT,changed);window.addEventListener('storage',storage);window.addEventListener('ingbelg-open-cookies',show);
  return()=>{window.removeEventListener(CONSENT_EVENT,changed);window.removeEventListener('storage',storage);window.removeEventListener('ingbelg-open-cookies',show)};
 },[]);
 useEffect(()=>{if(!sessionOnly)return;const timer=setTimeout(()=>setSessionOnly(false),6000);return()=>clearTimeout(timer)},[sessionOnly]);
 const visible=ready&&!consent;
 useEffect(()=>{
  const set=()=>document.documentElement.style.setProperty('--consent-height',visible&&banner.current?`${banner.current.getBoundingClientRect().height+16}px`:'0px');
  set();const observer=new ResizeObserver(set);if(banner.current)observer.observe(banner.current);
  return()=>{observer.disconnect();document.documentElement.style.removeProperty('--consent-height')};
 },[visible,language]);
 const choose=(allow:boolean)=>{const result=saveConsent(allow);setConsent(result.consent);setSessionOnly(!result.persisted);setOpen(false)};
 return <>
  {visible&&<section className="cookie-banner" ref={banner} aria-labelledby="cookie-notice-title"><div><h2 id="cookie-notice-title">{l('Jouw privacy, jouw keuze','Votre vie privée, votre choix')}</h2><p>{l('We bewaren je cookiekeuze. Alleen met je toestemming onthouden we comfortinstellingen. Deze app gebruikt geen advertentie- of analysetrackers.','Nous conservons votre choix de cookies. Avec votre accord, nous mémorisons les réglages de confort. Cette application n’utilise aucun traceur publicitaire ou analytique.')} <a href={languagePath('/cookies',language)}>{l('Cookies en opslag','Cookies et stockage')}</a></p></div><div className="cookie-actions"><button onClick={()=>choose(false)}>{l('Optionele weigeren','Refuser les facultatifs')}</button><button onClick={()=>choose(true)}>{l('Alles accepteren','Tout accepter')}</button><button onClick={()=>{trigger.current=document.activeElement as HTMLElement;setPreferences(false);setOpen(true)}}>{l('Voorkeuren','Préférences')}</button></div></section>}
  {sessionOnly&&<p className="cookie-status" role="status">{l('Je keuze geldt voor dit bezoek. Je browser bewaart momenteel geen voorkeuren.','Votre choix s’applique à cette visite. Votre navigateur ne conserve pas les préférences actuellement.')}</p>}
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="cookie-dialog" onCloseAutoFocus={e=>{e.preventDefault();trigger.current?.focus({preventScroll:true})}}><DialogTitle>{l('Cookievoorkeuren','Préférences de cookies')}</DialogTitle><DialogDescription>{l('Optionele opslag staat standaard uit. Wijzig je keuze op elk moment via “Cookievoorkeuren” in de voettekst.','Le stockage facultatif est désactivé par défaut. Modifiez votre choix à tout moment via « Préférences de cookies » en bas de page.')}</DialogDescription>
    <div className="cookie-category"><h3>{l('Noodzakelijk','Nécessaire')} <span>{l('Altijd actief','Toujours actif')}</span></h3><p>{l('Je toestemmingskeuze wordt maximaal 180 dagen op dit toestel bewaard. De hosting- of aanmeldservice kan eigen noodzakelijke beveiligingsopslag gebruiken.','Votre choix de consentement est conservé au maximum 180 jours sur cet appareil. L’hébergement ou le service de connexion peut utiliser son propre stockage de sécurité nécessaire.')}</p></div>
    <div className="cookie-category"><label className="cookie-preference"><span>{l('Comfortvoorkeuren onthouden','Mémoriser les préférences de confort')}</span><input type="checkbox" checked={preferences} onChange={e=>setPreferences(e.target.checked)}/></label><p>{l('Onthoud verminderde beweging, animatiepauze en hoog contrast tot je toestemming verloopt. Afwijzen verwijdert eerder bewaarde comfortinstellingen.','Mémorisez la réduction des mouvements, la pause des animations et le contraste élevé jusqu’à l’expiration du consentement. Refuser supprime les réglages de confort enregistrés.')}</p></div>
    <div className="cookie-category"><h3>{l('Statistieken en marketing','Statistiques et marketing')} <span>{l('Niet gebruikt','Non utilisés')}</span></h3><p>{l('Er zijn geen analytics-, advertentie- of socialemediapixels geïnstalleerd. Externe diensten openen pas wanneer je hun link volgt.','Aucun outil analytique, publicitaire ou pixel de réseau social n’est installé. Les services externes s’ouvrent uniquement lorsque vous suivez leur lien.')}</p></div>
    <div className="cookie-actions"><button onClick={()=>choose(false)}>{l('Optionele weigeren','Refuser les facultatifs')}</button><button onClick={()=>choose(true)}>{l('Alles accepteren','Tout accepter')}</button><button onClick={()=>choose(preferences)}>{l('Keuze opslaan','Enregistrer le choix')}</button></div><a className="policy-link" href={languagePath('/cookies',language)}>{l('Lees het cookiebeleid','Lire la politique de cookies')}</a>
  </DialogContent></Dialog>
 </>;
}
