import type {ShouldRevalidateFunction} from 'react-router';import type {Route} from './+types/collectie';import {seo} from '@/lib/seo';import {getProducts,EcommerceApiError} from '@/api/ecommerce-api';import {Catalog} from '@/components/catalog';import {HERO_IMAGE} from '@/components/home/hero';
export async function loader(){try{return await getProducts({limit:2000,exclude_types:'subscription'});}catch(e){if(e instanceof EcommerceApiError&&e.status===404)throw new Response('Niet gevonden',{status:404});throw e;}}
export function meta({matches,location}:Route.MetaArgs){return seo({matches,location},{title:'Gelimiteerde wollen sokken — Woolup collectie',description:'Bekijk de eigen ontwerpen van Woolup: premium sokken van 100% wol, bewust geproduceerd in kleine oplages. Vind de editie die bij u past.',image:HERO_IMAGE,jsonLd:{'@context':'https://schema.org','@type':'CollectionPage',name:'Woolup collectie'}})}
export default function Collection({loaderData}:Route.ComponentProps){return <Catalog products={loaderData.products}/>}
// Filters live in the URL (?q=, ?sort=, ?maat=…) and are applied in the browser,
// so changing them must not refetch the whole catalogue on every keystroke.
export const shouldRevalidate:ShouldRevalidateFunction=({currentUrl,nextUrl,defaultShouldRevalidate})=>{if(currentUrl.pathname===nextUrl.pathname)return false;return defaultShouldRevalidate}
