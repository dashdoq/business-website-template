import type {SiteLanguage} from '../site-language.ts';
import type {Faq} from './services.ts';

export const COMPANY = {
  name: 'INGBELG',
  phone: '+32 488 87 60 61',
  phoneHref: 'tel:+32488876061',
  phoneE164: '+32488876061',
  email: 'info@ingbelg.be',
  whatsapp: 'https://wa.me/32488876061',
  street: 'Hoogstraat 59',
  postalCode: '9620',
  town: 'Zottegem',
  address: 'Hoogstraat 59, 9620 Zottegem',
  maps: 'https://maps.app.goo.gl/cxndFzpCFZBJqECCA',
  source: 'https://ingbelg.be/',
  /** Sourced snapshot shown on ingbelg.be. Not a live feed; refresh manually. */
  rating: {value: '5,0', count: 54},
} as const;

export const HOME = {
  nl: {
    lead: 'We leggen, herstellen en isoleren daken in Zottegem en omgeving: hellende en platte daken, renovatie en asbestverwijdering. Je hebt één aanspreekpunt, van het plaatsbezoek tot de oplevering.',
    heroCaption: 'Een nieuw pannendak, met onze ploeg en bestelwagen voor de deur.',
    servicesTitle: 'Wat we doen',
    servicesText: 'Vijf soorten werk, door één ploeg. De doorsnede toont welke laag van het dak elk werk raakt.',
    processTitle: 'Hoe we werken',
    processText: 'Je hebt één aanspreekpunt, van het eerste gesprek tot de oplevering.',
    workTitle: 'Realisaties',
    workLink: 'Alle realisaties bekijken',
    reviewTitle: 'Wat klanten zeggen',
    toolsTitle: 'ZotteTools',
    toolsText: 'Drie rekenhulpen om je project voor te bereiden. Een offerte maken we pas na een plaatsbezoek.',
    faqTitle: 'Veelgestelde vragen',
  },
  fr: {
    lead: 'Nous posons, réparons et isolons des toitures à Zottegem et dans les environs : toitures inclinées et plates, rénovation et désamiantage. Un seul interlocuteur, de la visite à la réception des travaux.',
    heroCaption: 'Une nouvelle toiture en tuiles, avec notre équipe et notre camionnette devant la maison.',
    servicesTitle: 'Ce que nous faisons',
    servicesText: 'Cinq types de travaux, une seule équipe. La coupe montre quelle couche du toit chaque travail concerne.',
    processTitle: 'Notre façon de travailler',
    processText: 'Un seul interlocuteur, du premier échange à la réception des travaux.',
    workTitle: 'Réalisations',
    workLink: 'Voir toutes les réalisations',
    reviewTitle: 'Ce que disent nos clients',
    toolsTitle: 'ZotteTools',
    toolsText: 'Trois outils de calcul pour préparer votre projet. Nous établissons un devis uniquement après une visite.',
    faqTitle: 'Questions fréquentes',
  },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export const PROCESS: Record<SiteLanguage, {title: string; text: string}[]> = {
  nl: [
    {title: 'Plaatsbezoek', text: 'We komen langs en bekijken je woning, je wensen en het werk dat nodig is.'},
    {title: 'Werkomschrijving en planning', text: 'Je krijgt een duidelijke omschrijving van de werken, de materialen en de planning.'},
    {title: 'Uitvoering', text: 'We werken in een vaste volgorde en beschermen je woning tijdens de werken.'},
  ],
  fr: [
    {title: 'Visite sur place', text: 'Nous passons voir votre maison, vos souhaits et les travaux nécessaires.'},
    {title: 'Descriptif et planning', text: 'Vous recevez un descriptif clair des travaux, des matériaux et du planning.'},
    {title: 'Exécution', text: 'Nous travaillons dans un ordre précis et protégeons votre maison pendant les travaux.'},
  ],
};

export const REVIEW = {
  author: 'Jorun & Yves',
  quote: 'Zaakvoerder Magomed is iemand die zijn woord houdt.',
  quoteLang: 'nl',
  translation: {nl: '', fr: '« Le gérant Magomed est quelqu’un qui tient parole. »'},
  source: {nl: 'Gedeeld op ingbelg.be', fr: 'Partagé sur ingbelg.be'},
} as const;

export const HOME_FAQ: Record<SiteLanguage, Faq[]> = {
  nl: [
    {q: 'Welke werken voert INGBELG uit?', a: 'Hellende en platte daken, dakisolatie, renovatie (dakherstellingen, timmerwerk en gevelbekleding) en asbestverwijdering in combinatie met de vervanging van je dak.'},
    {q: 'In welke regio werkt INGBELG?', a: 'INGBELG is gevestigd in de Hoogstraat 59 in Zottegem en werkt in Zottegem en omgeving.'},
    {q: 'Is een berekening een offerte?', a: 'Nee. Renculator en Wijculator gebruiken instelbare planningsaannames. Een nauwkeurige offerte vraagt een beoordeling van de woning, materialen, bereikbaarheid en werkomvang.'},
    {q: 'Welke premies berekent Premculator?', a: 'De calculator raamt bepaalde Vlaamse Mijn VerbouwPremies voor eigenaar-bewoners, voor aanvragen van maart tot december 2026. De voorwaarden en beperkingen staan in de tool. De overheid beslist over de aanvraag.'},
    {q: 'Hoe start ik mijn project?', a: 'Beschrijf de gewenste werken, de gemeente en je timing via het contactformulier. Je e-mailapp opent met een concept dat je zelf controleert en verstuurt. Bellen en WhatsApp kan ook.'},
  ],
  fr: [
    {q: 'Quels travaux INGBELG réalise-t-il ?', a: 'Toitures inclinées et plates, isolation de toiture, rénovation (réparations de toiture, menuiserie et bardage) et désamiantage combiné au remplacement de votre toiture.'},
    {q: 'Dans quelle région INGBELG travaille-t-il ?', a: 'INGBELG est établi Hoogstraat 59 à Zottegem et travaille à Zottegem et dans les environs.'},
    {q: 'Un calcul est-il un devis ?', a: 'Non. Renculator et Wijculator utilisent des hypothèses de planification ajustables. Un devis précis nécessite une évaluation du logement, des matériaux, de l’accès et de l’étendue des travaux.'},
    {q: 'Quelles primes calcule Premculator ?', a: 'Le calculateur estime certaines primes flamandes Mijn VerbouwPremie pour propriétaires occupants, pour les demandes de mars à décembre 2026. Les conditions et limites sont détaillées dans l’outil. L’administration décide de l’octroi.'},
    {q: 'Comment démarrer mon projet ?', a: 'Décrivez les travaux, la commune et votre calendrier dans le formulaire. Votre messagerie ouvre un brouillon que vous vérifiez puis envoyez. Vous pouvez aussi téléphoner ou utiliser WhatsApp.'},
  ],
};
