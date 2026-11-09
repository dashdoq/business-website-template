export const CONSENT_KEY='ingbelg-consent-v1';
export const COMFORT_KEY='ingbelg-comfort-v1';
export const CONSENT_EVENT='ingbelg-consent-change';
export const CONSENT_LIFETIME=180*24*60*60*1000;
export type Consent={version:1;preferences:boolean;updatedAt:number;expiresAt:number};
export type Comfort={reduced:boolean;paused:boolean;contrast:boolean};
export function makeConsent(preferences:boolean,now=Date.now()):Consent{return {version:1,preferences,updatedAt:now,expiresAt:now+CONSENT_LIFETIME}}
export function parseConsent(raw:string|null,now=Date.now()):Consent|null{
 try{const c=JSON.parse(raw||'null');return c&&c.version===1&&typeof c.preferences==='boolean'&&Number.isFinite(c.updatedAt)&&Number.isFinite(c.expiresAt)&&c.updatedAt<=now&&c.expiresAt>now&&c.expiresAt-c.updatedAt<=CONSENT_LIFETIME&&c.expiresAt>c.updatedAt?c:null}catch{return null}
}
let sessionDecision:Consent|undefined;
export function readConsent(){if(sessionDecision&&sessionDecision.expiresAt>Date.now())return sessionDecision;try{return parseConsent(localStorage.getItem(CONSENT_KEY))}catch{return null}}
export function refreshConsent(){sessionDecision=undefined;return readConsent()}
export function saveConsent(preferences:boolean){
 const c=makeConsent(preferences);sessionDecision=c;let persisted=true;
 try{localStorage.removeItem('ingbelg-language');if(!preferences)localStorage.removeItem(COMFORT_KEY)}catch{}
 try{localStorage.setItem(CONSENT_KEY,JSON.stringify(c))}catch{persisted=false}
 window.dispatchEvent(new CustomEvent(CONSENT_EVENT,{detail:c}));return {consent:c,persisted};
}
export function readComfort():Comfort|null{
 if(!readConsent()?.preferences)return null;
 try{const p=JSON.parse(localStorage.getItem(COMFORT_KEY)||'null');return p&&['reduced','paused','contrast'].every(k=>typeof p[k]==='boolean')?p:null}catch{return null}
}
export function saveComfort(value:Comfort){if(!readConsent()?.preferences)return;try{localStorage.setItem(COMFORT_KEY,JSON.stringify(value))}catch{}}
export function clearExpiredStorage(){try{localStorage.removeItem('ingbelg-language');if(!readConsent()){localStorage.removeItem(CONSENT_KEY);localStorage.removeItem(COMFORT_KEY)}}catch{}}
export function openCookieSettings(){window.dispatchEvent(new Event('ingbelg-open-cookies'))}
