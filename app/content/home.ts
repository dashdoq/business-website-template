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
    eyebrow: 'Dakwerken · Renovatie · Zottegem',
    tagline: 'Vakmanschap in elke laag.',
    lead: 'Hellende en platte daken, dakisolatie, renovatie en asbestverwijdering. Eén team en één aanspreekpunt, van het eerste plaatsbezoek tot de oplevering.',
    servicesEyebrow: '01 — Diensten',
    servicesTitle: 'Elke laag. Eén team.',
    servicesText: 'Van de eerste balk tot de laatste dakpan. Scroll door de diensten en zie welke laag we aanpakken.',
    processEyebrow: '02 — Werkwijze',
    processTitle: 'Zo pakken we je project aan.',
    processText: 'Eén team. Eén aanspreekpunt. Van het eerste gesprek tot de oplevering blijft je project in ervaren handen.',
    workEyebrow: '03 — Realisaties',
    workTitle: 'Echte daken, van dichtbij.',
    workLink: 'Alle realisaties',
    reviewEyebrow: 'Wat klanten zeggen',
    toolsEyebrow: '04 — ZotteTools',
    toolsTitle: 'Plan je project vooraf.',
    toolsText: 'Start met een eerste raming van budget, premie of planning. Bespreek daarna je woning en de technische keuzes tijdens een plaatsbezoek.',
    faqEyebrow: '05 — Vragen',
    faqTitle: 'Goed om vooraf te weten.',
  },
  fr: {
    eyebrow: 'Toiture · Rénovation · Zottegem',
    tagline: 'Le savoir-faire à chaque couche.',
    lead: 'Toitures inclinées et plates, isolation, rénovation et désamiantage. Une équipe et un interlocuteur, de la première visite à la réception des travaux.',
    servicesEyebrow: '01 — Services',
    servicesTitle: 'Chaque couche. Une équipe.',
    servicesText: 'De la première poutre à la dernière tuile. Faites défiler les services et voyez quelle couche nous traitons.',
    processEyebrow: '02 — Méthode',
    processTitle: 'Notre façon de travailler.',
    processText: 'Une équipe. Un interlocuteur. Du premier échange à la réception, votre projet reste entre des mains expérimentées.',
    workEyebrow: '03 — Réalisations',
    workTitle: 'De vrais toits, de près.',
    workLink: 'Toutes les réalisations',
    reviewEyebrow: 'Ce que disent nos clients',
    toolsEyebrow: '04 — ZotteTools',
    toolsTitle: 'Préparez votre projet.',
    toolsText: 'Commencez par une première estimation du budget, de la prime ou du planning. Étudiez ensuite votre logement et les choix techniques lors d’une visite.',
    faqEyebrow: '05 — Questions',
    faqTitle: 'À savoir avant de commencer.',
  },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export const PROCESS: Record<SiteLanguage, {title: string; text: string}[]> = {
  nl: [
    {title: 'We luisteren eerst.', text: 'Een plaatsbezoek om je woning, je prioriteiten en de geplande werken te begrijpen.'},
    {title: 'We maken het duidelijk.', text: 'Een duidelijke werkomschrijving, materiaalkeuze en een plan dat je begrijpt.'},
    {title: 'We bouwen met zorg.', text: 'Een doordachte volgorde van werken, met zorg voor bescherming en afwerking.'},
  ],
  fr: [
    {title: 'Nous commençons par écouter.', text: 'Une visite pour comprendre votre maison, vos priorités et les travaux à prévoir.'},
    {title: 'Nous clarifions chaque étape.', text: 'Un descriptif détaillé, des choix de matériaux et un planning clair.'},
    {title: 'Nous construisons avec soin.', text: 'Des travaux bien organisés, avec une attention à la protection et aux finitions.'},
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
