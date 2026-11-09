import {LANGUAGES, LOCALES, type SiteLanguage} from './site-language.ts';
import {SERVICE_IDS, type ServiceId} from './content/service-ids.ts';
import {SERVICES, type Faq} from './content/services.ts';
import {COMPANY, HOME_FAQ} from './content/home.ts';
import {PROJECTS, ogImage} from './content/projects.ts';

export type {SiteLanguage} from './site-language.ts';
export const SITE_URL = 'https://ingbelg.in';
export const UPDATED = '2026-11-09';

export type PageKind = 'home' | 'service' | 'gallery' | 'contact' | 'tool' | 'policy';
type PageCopy = {title: string; description: string; h1: string; crumb: string};
type PageDef = {kind: PageKind; paths: Record<SiteLanguage, string>; og: string; nl: PageCopy; fr: PageCopy};

const servicePage = (id: ServiceId, nlPath: string, frPath: string, og: string, nl: Omit<PageCopy, 'crumb'>, fr: Omit<PageCopy, 'crumb'>): PageDef => ({
  kind: 'service', paths: {nl: nlPath, fr: frPath}, og,
  nl: {...nl, crumb: SERVICES[id].copy.nl.name}, fr: {...fr, crumb: SERVICES[id].copy.fr.name},
});

export const PAGE_CATALOG = {
  home: {kind: 'home', paths: {nl: '/', fr: '/fr'}, og: 'work-02',
    nl: {title: 'Dakwerken & renovatie in Zottegem | INGBELG', description: 'INGBELG voor hellende en platte daken, dakisolatie, renovatie en asbestverwijdering in Zottegem en omgeving. Bekijk realisaties en vraag een plaatsbezoek.', h1: 'Dakwerken en renovatie in Zottegem', crumb: 'Home'},
    fr: {title: 'Toiture & rénovation à Zottegem | INGBELG', description: 'INGBELG pour toitures inclinées et plates, isolation, rénovation et désamiantage à Zottegem et environs. Découvrez nos réalisations et demandez une visite.', h1: 'Toiture et rénovation à Zottegem', crumb: 'Accueil'}},
  pitched: servicePage('pitched', '/diensten/hellende-daken', '/fr/services/toitures-inclinees', 'work-02',
    {title: 'Hellende daken in Zottegem | Dakpannen & leien | INGBELG', description: 'Nieuw dak of herstelling? INGBELG werkt aan hellende daken in Zottegem en omgeving: dakpannen, leien, houten dakconstructies, dakkapellen en dakramen.', h1: 'Hellende daken in Zottegem'},
    {title: 'Toitures inclinées à Zottegem | Tuiles & ardoises | INGBELG', description: 'INGBELG rénove et répare les toitures inclinées à Zottegem et environs : tuiles, ardoises, charpentes en bois, lucarnes et fenêtres de toit.', h1: 'Toitures inclinées à Zottegem'}),
  flat: servicePage('flat', '/diensten/platte-daken', '/fr/services/toitures-plates', 'work-03',
    {title: 'Platte daken in Zottegem | EPDM & bitumen | INGBELG', description: 'Een nieuw of hersteld plat dak in EPDM of bitumen, met zorg voor dakranden, afvoeren en opstanden. INGBELG werkt in Zottegem en omgeving.', h1: 'Platte daken in Zottegem'},
    {title: 'Toitures plates à Zottegem | EPDM & bitume | INGBELG', description: 'Une toiture plate neuve ou réparée en EPDM ou bitume, avec soin pour les rives, évacuations et relevés. INGBELG travaille à Zottegem et environs.', h1: 'Toitures plates à Zottegem'}),
  insulation: servicePage('insulation', '/diensten/dakisolatie', '/fr/services/isolation-toiture', 'work-04',
    {title: 'Dakisolatie in Zottegem | Hellend & plat dak | INGBELG', description: 'Dakisolatie voor hellende en platte daken, met aandacht voor vocht, luchtdichtheid en dampscherm. Raam je Mijn VerbouwPremie met Premculator.', h1: 'Dakisolatie in Zottegem'},
    {title: 'Isolation de toiture à Zottegem et environs | INGBELG', description: 'Isolation des toitures inclinées et plates, attentive à l’humidité, à l’étanchéité à l’air et au pare-vapeur. Estimez votre prime avec Premculator.', h1: 'Isolation de toiture à Zottegem'}),
  renovation: servicePage('renovation', '/diensten/renovatie', '/fr/services/renovation', 'work-13',
    {title: 'Renovatie & dakherstelling in Zottegem | INGBELG', description: 'Dakherstellingen, timmerwerk, dakkapellen en gevelbekleding door één team, van inspectie tot afwerking. INGBELG renoveert in Zottegem en omgeving.', h1: 'Renovatie en dakherstellingen in Zottegem'},
    {title: 'Rénovation & réparation de toiture à Zottegem | INGBELG', description: 'Réparations de toiture, menuiserie, lucarnes et bardage par une seule équipe, du diagnostic aux finitions. INGBELG rénove à Zottegem et environs.', h1: 'Rénovation et réparation de toiture à Zottegem'}),
  asbestos: servicePage('asbestos', '/diensten/asbestverwijdering', '/fr/services/desamiantage', 'work-04',
    {title: 'Asbestverwijdering dak in Zottegem | INGBELG', description: 'Asbesthoudende golfplaten of leien? INGBELG beoordeelt de situatie en stemt de verwijdering af op een nieuw dak. In Zottegem en omgeving.', h1: 'Asbestverwijdering in Zottegem'},
    {title: 'Désamiantage de toiture à Zottegem | INGBELG', description: 'Plaques ondulées ou ardoises amiantées ? INGBELG évalue la situation et coordonne le retrait avec une nouvelle toiture. À Zottegem et environs.', h1: 'Désamiantage de toiture à Zottegem'}),
  projects: {kind: 'gallery', paths: {nl: '/realisaties', fr: '/fr/realisations'}, og: 'work-03',
    nl: {title: 'Realisaties: dakwerken & renovaties | INGBELG', description: 'Bekijk daken en renovaties van INGBELG: hellende daken, platte daken en vakwerk in detail, in Zottegem en omgeving.', h1: 'Realisaties', crumb: 'Realisaties'},
    fr: {title: 'Réalisations : toitures & rénovations | INGBELG', description: 'Découvrez des toitures et rénovations INGBELG : toitures inclinées, toitures plates et savoir-faire en détail, à Zottegem et environs.', h1: 'Réalisations', crumb: 'Réalisations'}},
  contact: {kind: 'contact', paths: {nl: '/contact', fr: '/fr/contact'}, og: 'work-02',
    nl: {title: 'Contact & plaatsbezoek aanvragen | INGBELG Zottegem', description: 'Vraag een plaatsbezoek aan bij INGBELG, Hoogstraat 59, 9620 Zottegem. Bel +32 488 87 60 61, stuur een WhatsApp of mail info@ingbelg.be.', h1: 'Contact en plaatsbezoek', crumb: 'Contact'},
    fr: {title: 'Contact & demande de visite | INGBELG Zottegem', description: 'Demandez une visite à INGBELG, Hoogstraat 59, 9620 Zottegem. Appelez le +32 488 87 60 61, écrivez sur WhatsApp ou à info@ingbelg.be.', h1: 'Contact et demande de visite', crumb: 'Contact'}},
  renculator: {kind: 'tool', paths: {nl: '/zottetools/renculator', fr: '/fr/zottetools/renculator'}, og: 'work-01',
    nl: {title: 'Renculator bouwcalculator | Renovatiekosten | INGBELG', description: 'Raam je bouw- en renovatiebudget met Renculator. Vergelijk oppervlakte, afwerking en opties. Een indicatieve kostenraming, exclusief btw.', h1: 'Renculator: bouw- en renovatiebudget', crumb: 'Renculator'},
    fr: {title: 'Renculator | Estimation des travaux | INGBELG', description: 'Estimez votre budget de construction et de rénovation avec Renculator. Comparez surfaces, finitions et options. Une estimation indicative hors TVA.', h1: 'Renculator : budget des travaux', crumb: 'Renculator'}},
  premculator: {kind: 'tool', paths: {nl: '/zottetools/premculator', fr: '/fr/zottetools/premculator'}, og: 'work-04',
    nl: {title: 'Premculator | Renovatiepremies Vlaanderen | INGBELG', description: 'Bereken een indicatieve Mijn VerbouwPremie voor dak, muur, vloer en ramen in Vlaanderen, voor aanvragen van maart tot december 2026.', h1: 'Premculator: renovatiepremies in Vlaanderen', crumb: 'Premculator'},
    fr: {title: 'Premculator | Primes rénovation en Flandre | INGBELG', description: 'Estimez Mijn VerbouwPremie pour toiture, murs, sol et fenêtres en Flandre, pour les demandes de mars à décembre 2026, sous conditions.', h1: 'Premculator : primes à la rénovation en Flandre', crumb: 'Premculator'}},
  wijculator: {kind: 'tool', paths: {nl: '/zottetools/wijculator', fr: '/fr/zottetools/wijculator'}, og: 'work-06',
    nl: {title: 'Wijculator | Werkuren & team berekenen | INGBELG', description: 'Raam arbeidsuren en de minimale ploeg voor je renovatieplanning. Zie hoeveel tijd extra vakmensen besparen, met instelbare aannames.', h1: 'Wijculator: werkuren en team', crumb: 'Wijculator'},
    fr: {title: 'Wijculator | Heures & équipe de chantier | INGBELG', description: 'Estimez les heures de travail et l’équipe minimale pour votre planning. Comparez le gain de temps avec du renfort, selon des hypothèses ajustables.', h1: 'Wijculator : heures et équipe', crumb: 'Wijculator'}},
  privacy: {kind: 'policy', paths: {nl: '/privacy', fr: '/fr/privacy'}, og: 'work-02',
    nl: {title: 'Privacyverklaring | INGBELG', description: 'Lees hoe deze INGBELG-website omgaat met contactgegevens, berekeningen, browseropslag en externe diensten.', h1: 'Privacyverklaring', crumb: 'Privacy'},
    fr: {title: 'Confidentialité | INGBELG', description: 'Découvrez comment ce site INGBELG traite les coordonnées, les calculs, le stockage du navigateur et les services externes.', h1: 'Confidentialité', crumb: 'Confidentialité'}},
  cookies: {kind: 'policy', paths: {nl: '/cookies', fr: '/fr/cookies'}, og: 'work-02',
    nl: {title: 'Cookies & voorkeuren | INGBELG', description: 'Beheer je cookievoorkeuren. Lees welke noodzakelijke en optionele browseropslag deze INGBELG-website gebruikt.', h1: 'Cookies en voorkeuren', crumb: 'Cookies'},
    fr: {title: 'Cookies & préférences | INGBELG', description: 'Gérez vos préférences de cookies et découvrez le stockage nécessaire et facultatif utilisé par ce site INGBELG.', h1: 'Cookies et préférences', crumb: 'Cookies'}},
  accessibility: {kind: 'policy', paths: {nl: '/accessibility', fr: '/fr/accessibility'}, og: 'work-02',
    nl: {title: 'Toegankelijkheid | INGBELG', description: 'Informatie over toetsenbordbediening, verminderde beweging, contrast en toegankelijke alternatieven op de INGBELG-website.', h1: 'Toegankelijkheid', crumb: 'Toegankelijkheid'},
    fr: {title: 'Accessibilité | INGBELG', description: 'Informations sur le clavier, la réduction des animations, le contraste et les alternatives accessibles sur le site INGBELG.', h1: 'Accessibilité', crumb: 'Accessibilité'}},
} as const satisfies Record<string, PageDef>;

export type PageId = keyof typeof PAGE_CATALOG;
export const PAGE_IDS = Object.keys(PAGE_CATALOG) as PageId[];
export const SERVICE_PAGE: Record<ServiceId, PageId> = {pitched: 'pitched', flat: 'flat', insulation: 'insulation', renovation: 'renovation', asbestos: 'asbestos'};
const page = (id: PageId): PageDef => PAGE_CATALOG[id];

export function languageFromPath(path: string): SiteLanguage {return /^\/fr(?:\/|$)/.test(path) ? 'fr' : 'nl'}
export function stripLanguage(path: string) {return (path.replace(/^\/fr(?=\/|$)/, '').replace(/\/+$/, '') || '/')}
const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';
export function pageFromPath(path: string): PageId | null {
  const target = normalizePath(path);
  return PAGE_IDS.find(id => page(id).paths.nl === target || page(id).paths.fr === target) ?? null;
}
/** Public path of a page in a language. */
export const pagePath = (id: PageId, language: SiteLanguage) => page(id).paths[language];
/** Maps any known page path to its equivalent in another language; unknown paths fall back to the /fr prefix rule. */
export function languagePath(path: string, language: SiteLanguage) {
  const id = pageFromPath(path);
  if (id) return pagePath(id, language);
  const base = stripLanguage(path);
  return language === 'fr' ? '/fr' + (base === '/' ? '' : base) : base;
}
export const pageKind = (id: PageId): PageKind => page(id).kind;
export const pageCopy = (id: PageId, language: SiteLanguage): PageCopy => page(id)[language];

export function normalizeOrigin(input: string) {
  const u = new URL(input);
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.search || u.hash || u.pathname !== '/') throw new Error('SITE_URL must be an http(s) origin without a path.');
  return u.origin;
}

export function pageSEO(id: PageId, language: SiteLanguage, origin = SITE_URL) {
  const site = normalizeOrigin(origin), def = page(id), copy = def[language];
  return {
    ...copy, kind: def.kind, url: site + def.paths[language], language, locale: LOCALES[language],
    alternates: {'nl-BE': site + def.paths.nl, 'fr-BE': site + def.paths.fr, 'x-default': site + def.paths.nl},
    image: site + ogImage(def.og),
  };
}

/** Visible FAQ per page; the same list feeds FAQPage structured data. */
export function pageFaq(id: PageId, language: SiteLanguage): Faq[] {
  if (id === 'home') return HOME_FAQ[language];
  if (page(id).kind === 'service') return SERVICES[id as ServiceId].copy[language].faq;
  return [];
}

export function structuredData(id: PageId, language: SiteLanguage, origin = SITE_URL) {
  const s = pageSEO(id, language, origin), site = normalizeOrigin(origin), business = site + '/#business';
  const area = {'@type': 'Place', name: language === 'nl' ? 'Zottegem en omgeving' : 'Zottegem et environs'};
  const graph: Record<string, unknown>[] = [
    {'@type': 'RoofingContractor', '@id': business, name: COMPANY.name, url: site + '/', image: site + ogImage('work-02'), logo: site + '/images/logo.png',
      telephone: COMPANY.phoneE164, email: COMPANY.email, hasMap: COMPANY.maps,
      address: {'@type': 'PostalAddress', streetAddress: COMPANY.street, postalCode: COMPANY.postalCode, addressLocality: COMPANY.town, addressCountry: 'BE'},
      areaServed: area, sameAs: [COMPANY.source],
      hasOfferCatalog: {'@type': 'OfferCatalog', name: language === 'nl' ? 'Diensten' : 'Services',
        itemListElement: SERVICE_IDS.map(service => ({'@type': 'Offer', itemOffered: {'@id': site + pagePath(SERVICE_PAGE[service], language) + '#service'}}))}},
    {'@type': 'WebSite', '@id': site + '/#website', name: COMPANY.name, url: site + '/', inLanguage: ['nl-BE', 'fr-BE'], publisher: {'@id': business}},
    {'@type': s.kind === 'contact' ? 'ContactPage' : s.kind === 'gallery' ? 'CollectionPage' : 'WebPage', '@id': s.url + '#webpage', url: s.url, name: s.title, description: s.description,
      inLanguage: s.locale, isPartOf: {'@id': site + '/#website'}, about: {'@id': business}, primaryImageOfPage: s.image, dateModified: UPDATED},
  ];
  if (id !== 'home') graph.push({'@type': 'BreadcrumbList', '@id': s.url + '#breadcrumb', itemListElement: [
    {'@type': 'ListItem', position: 1, name: COMPANY.name, item: site + pagePath('home', language)},
    {'@type': 'ListItem', position: 2, name: s.crumb, item: s.url},
  ]});
  if (s.kind === 'service') {
    const service = SERVICES[id as ServiceId].copy[language];
    graph.push({'@type': 'Service', '@id': s.url + '#service', name: service.name, serviceType: service.serviceType, description: s.description, url: s.url,
      provider: {'@id': business}, areaServed: area, availableLanguage: ['nl', 'fr']});
  }
  if (s.kind === 'tool') graph.push({'@type': 'WebApplication', '@id': s.url + '#tool', name: s.h1, url: s.url, description: s.description, applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web browser', inLanguage: s.locale, isAccessibleForFree: true, offers: {'@type': 'Offer', price: '0', priceCurrency: 'EUR'}, publisher: {'@id': business}});
  if (s.kind === 'gallery') graph.push({'@type': 'ImageGallery', '@id': s.url + '#gallery', name: s.h1, url: s.url, image: PROJECTS.map(project => ({
    '@type': 'ImageObject', contentUrl: site + project.image, width: project.width, height: project.height, caption: project.copy[language].alt}))});
  const faq = pageFaq(id, language);
  if (faq.length) graph.push({'@type': 'FAQPage', '@id': s.url + '#faq', mainEntity: faq.map(item => ({'@type': 'Question', name: item.q, acceptedAnswer: {'@type': 'Answer', text: item.a}}))});
  return {'@context': 'https://schema.org', '@graph': graph};
}

export const safeJSON = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const xmlEscape = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
/** Images listed per page in the sitemap, to help image search find project photos. */
function sitemapImages(id: PageId) {
  const kind = page(id).kind;
  if (kind === 'gallery') return PROJECTS.map(project => project.image);
  if (kind === 'service') return SERVICES[id as ServiceId].projects.map(projectId => PROJECTS.find(project => project.id === projectId)!.image);
  if (id === 'home') return PROJECTS.slice(0, 4).map(project => project.image);
  return [];
}
export function sitemapXML(origin = SITE_URL) {
  const site = normalizeOrigin(origin);
  const entries = PAGE_IDS.flatMap(id => LANGUAGES.map(language => {
    const s = pageSEO(id, language, site);
    const links = Object.entries(s.alternates).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(href)}"/>`).join('');
    const images = sitemapImages(id).map(image => `<image:image><image:loc>${xmlEscape(site + image)}</image:loc></image:image>`).join('');
    return `<url><loc>${xmlEscape(s.url)}</loc><lastmod>${UPDATED}</lastmod>${links}${images}</url>`;
  }));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + entries.join('\n') + '\n</urlset>\n';
}
export const robotsTXT = (origin = SITE_URL) => 'User-agent: *\nAllow: /\n\nSitemap: ' + normalizeOrigin(origin) + '/sitemap.xml\n';
