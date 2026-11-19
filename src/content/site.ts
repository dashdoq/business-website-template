import { formatPrice } from "@/lib/format";

// All shop-wide copy in one place. Values marked "aanvullen" in the README
// (shipping threshold, contact details, company details) are placeholders.

export const site = {
  name: "woolup",
  domain: "woolup.shop",
  url: "https://woolup.shop",
  description:
    "Sokken en kousen van wol, in eigen productie en kleine oplage. Per model maken we een beperkt aantal paren. Op is op.",
  email: "hallo@woolup.shop",
  freeShippingFrom: 5000,
  currentDrop: 1,
} as const;

export const usps = [
  `Gratis verzending vanaf ${formatPrice(site.freeShippingFrom)}`,
  "Eigen productie, van wol",
  "Per model een beperkte oplage",
  "14 dagen bedenktijd",
] as const;

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Alle sokken" },
      { href: "/shop?categorie=dagelijks", label: "Dagelijks" },
      { href: "/shop?categorie=wandel-outdoor", label: "Wandel & outdoor" },
      { href: "/shop?categorie=huissokken", label: "Huissokken" },
      { href: "/shop?categorie=kniekousen", label: "Kniekousen" },
      { href: "/shop?categorie=cadeausets", label: "Cadeausets" },
    ],
  },
  {
    title: "Klantenservice",
    links: [
      { href: "/veelgestelde-vragen", label: "Veelgestelde vragen" },
      { href: "/veelgestelde-vragen#maattabel", label: "Maattabel" },
      { href: "/verzending-retour", label: "Verzending en retour" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "woolup",
    links: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
] as const;

export const values = [
  {
    title: "Wol",
    text: "Wol voert vocht af, houdt warmte vast en gaat niet snel ruiken. Daarom maken we alles van wol.",
  },
  {
    title: "Gezond",
    text: "Droge voeten zijn gezonde voeten. Wol ademt, ook in een dichte schoen.",
  },
  {
    title: "Ecologisch",
    text: "We maken alleen wat we verwachten te verkopen. Geen overschotten, geen uitverkoop van restpartijen.",
  },
  {
    title: "Gelimiteerd",
    text: "Elk model maken we in één oplage per drop. Is een sok op, dan komt hij pas terug in een volgende drop.",
  },
] as const;

export const sizeChart = [
  { size: "35–38", eu: "35 tot en met 38", foot: "22,5 tot 24,5 cm" },
  { size: "39–42", eu: "39 tot en met 42", foot: "25 tot 27 cm" },
  { size: "43–46", eu: "43 tot en met 46", foot: "27,5 tot 29,5 cm" },
] as const;

export const faq = [
  {
    q: "Wat betekent een drop?",
    a: "We maken onze sokken in series, die we drops noemen. Per drop maken we van elk model een vast aantal paren. Als die op zijn, is het model uitverkocht tot een volgende drop.",
  },
  {
    q: "Welke maat moet ik nemen?",
    a: "Kijk in de maattabel hieronder. Zit je precies tussen twee maten, kies dan de grootste: wol krimpt bij een verkeerde wasbeurt iets in.",
  },
  {
    q: "Hoe was ik mijn sokken?",
    a: "Op 30 °C met een wolwasmiddel, binnenstebuiten, en daarna liggend laten drogen. Huissokken was je het liefst met de hand. Op elke productpagina staat het precieze wasadvies.",
  },
  {
    q: "Prikt wol niet?",
    a: "Grove wol kan prikken. We kiezen garens die zacht aanvoelen op de huid. Heb je een gevoelige huid, begin dan met de Ribbel of de Fijnbrei.",
  },
  {
    q: "Wanneer kan ik bestellen?",
    a: "De webshop gaat binnenkort open. Schrijf je in voor de nieuwsbrief, dan hoor je het als eerste.",
  },
  {
    q: "Kan ik mijn bestelling terugsturen?",
    a: "Ja, je hebt 14 dagen bedenktijd. Ongedragen sokken in de originele verpakking kun je terugsturen. Lees meer bij verzending en retour.",
  },
] as const;
