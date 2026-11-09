import type {SiteLanguage} from '../site-language.ts';
import type {ServiceId} from './service-ids.ts';
import type {ToolId} from '../tool-routing.ts';

export type Faq = {q: string; a: string};
export type ServiceCopy = {
  /** Short service name, used in navigation and cards. */
  name: string;
  /** One-line promise, used as the scene caption. */
  short: string;
  /** Card description on the home page. */
  summary: string;
  lead: string;
  intro: string[];
  scope: {title: string; text: string}[];
  layersTitle: string;
  layers: {name: string; text: string}[];
  signsTitle: string;
  signs: string[];
  faq: Faq[];
  tip: {title: string; text: string};
  /** schema.org serviceType */
  serviceType: string;
};
export type Service = {
  id: ServiceId;
  projects: string[];
  tools: ToolId[];
  copy: Record<SiteLanguage, ServiceCopy>;
};

/*
 * Copy is written from facts already present in the INGBELG build (service list, details, process,
 * tips and the Premculator rules). It describes general building practice; it adds no prices,
 * certifications, years in business or guarantees.
 */
export const SERVICES: Record<ServiceId, Service> = {
  pitched: {
    id: 'pitched', projects: ['work-02', 'work-01', 'work-06'], tools: ['renculator', 'premculator'],
    copy: {
      nl: {
        name: 'Hellende daken', short: 'Dakpannen, leien en dakramen',
        summary: 'Dakpannen, leien, houten dakconstructies, dakkapellen en dakramen, met de details die je woning weerbestendig houden.',
        lead: 'Dakpannen, leien, houtconstructies en dakramen: INGBELG vernieuwt en herstelt hellende daken in Zottegem en omgeving, met aandacht voor elke laag onder de pannen.',
        intro: [
          'Een hellend dak is meer dan wat je van op straat ziet. Onder de dakpannen of leien zorgen panlatten, tengellatten, een onderdak, isolatie en de houten dakstructuur samen voor een droge en comfortabele woning.',
          'Daarom bekijken we tijdens het plaatsbezoek het volledige dakpakket: de staat van het hout, de aansluitingen rond dakramen en schouw, de afwatering en de isolatie. Zo weet je of een herstelling volstaat of een dakvernieuwing zinvol is.',
        ],
        scope: [
          {title: 'Dakpannen en leien', text: 'Nieuwe dakbedekking of herstelling van verschoven en gebroken pannen of leien, zorgvuldig afgewerkt aan nok en dakranden.'},
          {title: 'Houten dakconstructies', text: 'Spanten, kepers en panlatten: we beoordelen het bestaande hout en herstellen of vervangen waar nodig.'},
          {title: 'Dakkapellen en dakramen', text: 'Meer licht en ruimte onder het dak, met waterdichte aansluitingen rond elk raam en elke dakkapel.'},
        ],
        layersTitle: 'Een hellend dak, laag per laag',
        layers: [
          {name: 'Dakpannen of leien', text: 'De zichtbare buitenlaag die regen en wind tegenhoudt.'},
          {name: 'Panlatten en tengellatten', text: 'Dragen de dakbedekking en laten ruimte voor verluchting en afwatering.'},
          {name: 'Onderdak', text: 'Een dampopen laag die verwaaide regen en stof opvangt.'},
          {name: 'Isolatie en dampscherm', text: 'Houden de warmte binnen en vocht uit de constructie.'},
          {name: 'Dakstructuur', text: 'Kepers en spanten die het volledige dakpakket dragen.'},
        ],
        signsTitle: 'Wanneer laat je je dak nakijken?',
        signs: ['Vochtplekken op zolder of aan het plafond', 'Verschoven, gebarsten of ontbrekende pannen', 'Lekken rond dakramen, schouw of dakkapel', 'Een dak zonder of met weinig isolatie'],
        faq: [
          {q: 'Kan ik mijn dak isoleren tijdens een dakrenovatie?', a: 'Ja. Wanneer de dakbedekking vernieuwd wordt, is het een logisch moment om ook isolatie, onderdak en dampscherm te bekijken. Met Premculator ga je na of je mogelijk in aanmerking komt voor Mijn VerbouwPremie voor het dak.'},
          {q: 'Moet het hele dak vervangen worden bij een lek?', a: 'Niet altijd. Een goede herstelling begint bij de oorzaak van het vocht. Tijdens het plaatsbezoek bekijken we of een gerichte herstelling volstaat of dat een vernieuwing van het dakpakket beter is.'},
          {q: 'Hoe krijg ik een prijs voor mijn hellend dak?', a: 'Een precieze offerte vraagt een beoordeling van je woning, de materialen, de bereikbaarheid en de werkomvang. Met Renculator maak je vooraf een indicatieve budgetraming; vraag daarna een plaatsbezoek aan.'},
        ],
        tip: {title: 'Een dak is meer dan dakpannen.', text: 'Het zichtbare oppervlak werkt samen met constructie, isolatie, membranen, verluchting en afwatering.'},
        serviceType: 'Hellende daken: dakpannen, leien en houten dakconstructies',
      },
      fr: {
        name: 'Toitures inclinées', short: 'Tuiles, ardoises et fenêtres de toit',
        summary: 'Tuiles, ardoises, charpentes en bois, lucarnes et fenêtres de toit, avec les finitions qui protègent votre maison des intempéries.',
        lead: 'Tuiles, ardoises, charpentes et fenêtres de toit : INGBELG rénove et répare les toitures inclinées à Zottegem et dans les environs, avec une attention à chaque couche sous les tuiles.',
        intro: [
          'Une toiture inclinée ne se limite pas à ce que l’on voit depuis la rue. Sous les tuiles ou les ardoises, les liteaux, les contre-liteaux, la sous-toiture, l’isolation et la charpente assurent ensemble un logement sec et confortable.',
          'Lors de la visite, nous examinons donc l’ensemble de la toiture : l’état du bois, les raccords autour des fenêtres de toit et de la cheminée, l’évacuation des eaux et l’isolation. Vous savez ainsi si une réparation suffit ou si une rénovation est pertinente.',
        ],
        scope: [
          {title: 'Tuiles et ardoises', text: 'Nouvelle couverture ou réparation de tuiles et d’ardoises déplacées ou cassées, avec des finitions soignées au faîtage et aux rives.'},
          {title: 'Charpentes en bois', text: 'Fermes, chevrons et liteaux : nous évaluons le bois existant, puis réparons ou remplaçons si nécessaire.'},
          {title: 'Lucarnes et fenêtres de toit', text: 'Plus de lumière et d’espace sous le toit, avec des raccords étanches autour de chaque fenêtre et lucarne.'},
        ],
        layersTitle: 'Une toiture inclinée, couche par couche',
        layers: [
          {name: 'Tuiles ou ardoises', text: 'La couche extérieure visible, qui arrête la pluie et le vent.'},
          {name: 'Liteaux et contre-liteaux', text: 'Ils portent la couverture et laissent de l’espace pour la ventilation et l’écoulement.'},
          {name: 'Sous-toiture', text: 'Un écran respirant qui recueille la pluie chassée et la poussière.'},
          {name: 'Isolation et pare-vapeur', text: 'Ils gardent la chaleur à l’intérieur et l’humidité hors de la structure.'},
          {name: 'Charpente', text: 'Les chevrons et les fermes qui portent l’ensemble de la toiture.'},
        ],
        signsTitle: 'Quand faire inspecter votre toiture ?',
        signs: ['Des taches d’humidité dans les combles ou au plafond', 'Des tuiles déplacées, fissurées ou manquantes', 'Des infiltrations autour des fenêtres de toit, de la cheminée ou de la lucarne', 'Une toiture peu ou pas isolée'],
        faq: [
          {q: 'Puis-je isoler ma toiture lors d’une rénovation ?', a: 'Oui. Le renouvellement de la couverture est le moment logique pour examiner aussi l’isolation, la sous-toiture et le pare-vapeur. Avec Premculator, vérifiez si vous pouvez prétendre à Mijn VerbouwPremie pour la toiture.'},
          {q: 'Faut-il remplacer toute la toiture en cas de fuite ?', a: 'Pas toujours. Une bonne réparation commence par la cause de l’humidité. Lors de la visite, nous évaluons si une réparation ciblée suffit ou si une rénovation de la toiture est préférable.'},
          {q: 'Comment obtenir un prix pour ma toiture inclinée ?', a: 'Un devis précis nécessite une évaluation du logement, des matériaux, de l’accès et de l’étendue des travaux. Avec Renculator, faites d’abord une estimation indicative, puis demandez une visite.'},
        ],
        tip: {title: 'Un toit est plus que ses tuiles.', text: 'La surface visible fonctionne avec la structure, l’isolation, les membranes, la ventilation et les évacuations.'},
        serviceType: 'Toitures inclinées : tuiles, ardoises et charpentes en bois',
      },
    },
  },
  flat: {
    id: 'flat', projects: ['work-03', 'work-01'], tools: ['renculator', 'premculator'],
    copy: {
      nl: {
        name: 'Platte daken', short: 'EPDM en bitumen',
        summary: 'EPDM- en bitumineuze daksystemen, zorgvuldig afgewerkt aan dakranden, afvoeren en opstanden.',
        lead: 'EPDM of bitumen, nieuw of hersteld: INGBELG legt en vernieuwt platte daken in Zottegem en omgeving, met bijzondere zorg voor dakranden, afvoeren en opstanden.',
        intro: [
          'Een plat dak lijkt eenvoudig, maar water blijft er langer liggen dan op een hellend dak. De dakbedekking, de afwerking aan de randen en een goede afvoer bepalen samen hoe lang het dak droog blijft.',
          'Bij een plat dak op een aanbouw, garage of bijgebouw bekijken we ook de ondergrond en de isolatie. Een nieuw dak is het moment om warmteverlies mee aan te pakken.',
        ],
        scope: [
          {title: 'EPDM en bitumen', text: 'Twee veelgebruikte daksystemen. We bespreken welke dakbedekking past bij je dak, de ondergrond en de details.'},
          {title: 'Afwatering en dakranden', text: 'Afvoeren, opstanden en dakranden zijn de kritieke punten van een plat dak. Daar zit het vakmanschap.'},
          {title: 'Dakherstellingen', text: 'Een lek, blaasvorming of een beschadigde aansluiting? Een gerichte herstelling begint bij de oorzaak.'},
        ],
        layersTitle: 'Een plat dak, laag per laag',
        layers: [
          {name: 'Dakbedekking', text: 'EPDM of bitumen: de waterdichte laag van het dak.'},
          {name: 'Dakrand en opstanden', text: 'Hier wordt de dakbedekking opgetrokken en waterdicht afgewerkt.'},
          {name: 'Afvoer', text: 'Leidt het regenwater van het dak naar de regenwaterafvoer.'},
          {name: 'Isolatie', text: 'Isolatieplaten onder de dakbedekking beperken het warmteverlies.'},
          {name: 'Draagvloer', text: 'De houten of betonnen ondergrond van het dak.'},
        ],
        signsTitle: 'Wanneer laat je je plat dak nakijken?',
        signs: ['Plassen die na een regenbui blijven staan', 'Blazen, scheuren of loskomende naden', 'Vochtplekken onder het platte dak', 'Een verstopte of beschadigde afvoer'],
        faq: [
          {q: 'EPDM of bitumen: wat kies ik?', a: 'Dat hangt af van je dak: de ondergrond, de vorm, de details en de aansluitingen. Beide systemen worden veel gebruikt. Tijdens het plaatsbezoek bespreken we welke dakbedekking het best past.'},
          {q: 'Kan ik mijn plat dak isoleren bij de vernieuwing?', a: 'Een vernieuwing is een goed moment om ook de isolatie te bekijken. Wat mogelijk is, hangt af van de bestaande opbouw en de hoogte van de dakranden en aansluitingen.'},
          {q: 'Wat kost een nieuw plat dak?', a: 'Dat hangt af van de oppervlakte, de bestaande toestand, de afwerking en de bereikbaarheid. Renculator geeft een indicatieve raming exclusief btw; een offerte volgt na een plaatsbezoek.'},
        ],
        tip: {title: 'Water heeft altijd een uitweg nodig.', text: 'Schone goten en afvoeren horen bij dakonderhoud. Laat moeilijk bereikbare plaatsen veilig door een vakman inspecteren.'},
        serviceType: 'Platte daken: EPDM en bitumen',
      },
      fr: {
        name: 'Toitures plates', short: 'EPDM et bitume',
        summary: 'Systèmes EPDM et bitumineux, avec des finitions soignées aux rives, aux évacuations et aux relevés.',
        lead: 'EPDM ou bitume, neuve ou réparée : INGBELG pose et rénove les toitures plates à Zottegem et dans les environs, avec un soin particulier pour les rives, les évacuations et les relevés.',
        intro: [
          'Une toiture plate paraît simple, mais l’eau y stagne plus longtemps que sur une toiture inclinée. La couverture, la finition des rives et une bonne évacuation déterminent ensemble combien de temps le toit reste sec.',
          'Pour une toiture plate sur une extension, un garage ou une annexe, nous examinons aussi le support et l’isolation. Une nouvelle toiture est le moment idéal pour réduire les pertes de chaleur.',
        ],
        scope: [
          {title: 'EPDM et bitume', text: 'Deux systèmes de toiture très répandus. Nous choisissons ensemble la couverture adaptée à votre toit, au support et aux détails.'},
          {title: 'Évacuations et rives', text: 'Les évacuations, relevés et rives sont les points critiques d’une toiture plate. C’est là que se joue le savoir-faire.'},
          {title: 'Réparations de toiture', text: 'Une fuite, des cloques ou un raccord endommagé ? Une réparation ciblée commence par la cause.'},
        ],
        layersTitle: 'Une toiture plate, couche par couche',
        layers: [
          {name: 'Couverture', text: 'EPDM ou bitume : la couche étanche de la toiture.'},
          {name: 'Rive et relevés', text: 'La couverture y est relevée et terminée de façon étanche.'},
          {name: 'Évacuation', text: 'Elle conduit l’eau de pluie du toit vers la descente.'},
          {name: 'Isolation', text: 'Des panneaux isolants sous la couverture limitent les pertes de chaleur.'},
          {name: 'Support', text: 'Le plancher en bois ou en béton qui porte la toiture.'},
        ],
        signsTitle: 'Quand faire inspecter votre toiture plate ?',
        signs: ['Des flaques qui subsistent après la pluie', 'Des cloques, fissures ou joints qui se décollent', 'Des taches d’humidité sous la toiture plate', 'Une évacuation bouchée ou endommagée'],
        faq: [
          {q: 'EPDM ou bitume : que choisir ?', a: 'Cela dépend de votre toit : le support, la forme, les détails et les raccords. Les deux systèmes sont très utilisés. Lors de la visite, nous déterminons la couverture la mieux adaptée.'},
          {q: 'Puis-je isoler ma toiture plate lors de sa rénovation ?', a: 'Une rénovation est le bon moment pour examiner aussi l’isolation. Les possibilités dépendent de la composition existante et de la hauteur des rives et des raccords.'},
          {q: 'Combien coûte une nouvelle toiture plate ?', a: 'Cela dépend de la surface, de l’état existant, de la finition et de l’accès. Renculator donne une estimation indicative hors TVA ; un devis suit après une visite.'},
        ],
        tip: {title: 'L’eau doit toujours pouvoir s’évacuer.', text: 'Des gouttières et évacuations dégagées font partie de l’entretien. Faites inspecter par un professionnel les zones difficiles d’accès.'},
        serviceType: 'Toitures plates : EPDM et bitume',
      },
    },
  },
  insulation: {
    id: 'insulation', projects: ['work-04', 'work-06', 'work-03'], tools: ['premculator', 'renculator'],
    copy: {
      nl: {
        name: 'Dakisolatie', short: 'Isolatie, dampscherm en luchtdichting',
        summary: 'Dakisolatie laag voor laag, met aandacht voor vocht, luchtdichtheid en de bestaande constructie.',
        lead: 'Een goed geïsoleerd dak houdt warmte binnen en vocht buiten. INGBELG isoleert hellende en platte daken in Zottegem en omgeving, met aandacht voor luchtdichtheid en de bestaande constructie.',
        intro: [
          'Via een slecht geïsoleerd dak gaat veel warmte verloren. Isolatie werkt pas goed als de details kloppen: een doorlopende isolatielaag, een luchtdichte afwerking en een dampscherm aan de warme kant.',
          'Bij renovatie bekijken we eerst de bestaande opbouw: is er vocht, is het hout gezond, hoe wordt het dak verlucht? Zo kies je een isolatie die past bij je woning, niet alleen bij een rekenwaarde.',
        ],
        scope: [
          {title: 'Dakisolatie', text: 'Isolatie tussen of op de dakstructuur van hellende daken, en onder de dakbedekking van platte daken.'},
          {title: 'Luchtdichte details', text: 'Een dampscherm en luchtdichte aansluitingen rond ramen, doorvoeren en muren, zodat de isolatie blijft presteren.'},
          {title: 'Renovatieadvies', text: 'Advies over de volgorde van werken en hoe isolatie samengaat met een dakvernieuwing of herstelling.'},
        ],
        layersTitle: 'Isolatie, laag per laag',
        layers: [
          {name: 'Isolatie', text: 'Minerale wol of isolatieplaten, aaneensluitend geplaatst zonder kieren.'},
          {name: 'Dampscherm', text: 'Aan de warme kant: houdt vochtige binnenlucht uit de constructie.'},
          {name: 'Onderdak', text: 'Aan de buitenkant: dampopen, zodat de constructie kan drogen.'},
          {name: 'Dakstructuur', text: 'De kepers bepalen de beschikbare ruimte voor isolatie.'},
        ],
        signsTitle: 'Is je dak aan isolatie toe?',
        signs: ['Een koude of tochtige zolder of dakverdieping', 'Oververhitte kamers onder het dak in de zomer', 'Condensatie of schimmel aan het dakbeschot', 'Geen of dunne, oude isolatie'],
        faq: [
          {q: 'Kom ik in aanmerking voor een premie voor dakisolatie?', a: 'Mijn VerbouwPremie voor het dak kan gelden voor eigenaar-bewoners in Vlaanderen, onder voorwaarden zoals nieuwe isolatie met Rd ≥ 4,5 m²K/W en, bij een hellend dak, een dampscherm. Premculator raamt dit voor aanvragen van maart tot december 2026. De overheid beslist over de aanvraag.'},
          {q: 'Isoleer ik van binnenuit of bij het vernieuwen van de dakbedekking?', a: 'Beide kan, afhankelijk van de staat van de dakbedekking en van de afwerking binnen. Als de pannen toch vernieuwd worden, kan isoleren van buitenaf de afwerking binnen sparen. We bespreken de opties tijdens het plaatsbezoek.'},
          {q: 'Waarom is een dampscherm belangrijk?', a: 'Een dampscherm aan de warme kant beperkt dat vochtige binnenlucht in de isolatie en het hout terechtkomt. Zo blijft de isolatie droog en presteert ze zoals bedoeld.'},
        ],
        tip: {title: 'Goed herstellen begint bij de oorzaak.', text: 'Zoek eerst waar het vocht binnenkomt voordat je een vochtplek afwerkt. Een nieuwe afwerking verhelpt de oorzaak niet.'},
        serviceType: 'Dakisolatie',
      },
      fr: {
        name: 'Isolation de toiture', short: 'Isolation, pare-vapeur et étanchéité à l’air',
        summary: 'Une isolation par couches, attentive à l’humidité, à l’étanchéité à l’air et à la structure existante.',
        lead: 'Une toiture bien isolée garde la chaleur à l’intérieur et l’humidité dehors. INGBELG isole les toitures inclinées et plates à Zottegem et dans les environs, avec une attention à l’étanchéité à l’air et à la structure existante.',
        intro: [
          'Une toiture mal isolée laisse s’échapper beaucoup de chaleur. L’isolation n’est efficace que si les détails sont justes : une couche isolante continue, une finition étanche à l’air et un pare-vapeur du côté chaud.',
          'En rénovation, nous examinons d’abord la composition existante : y a-t-il de l’humidité, le bois est-il sain, comment la toiture est-elle ventilée ? Vous choisissez ainsi une isolation adaptée à votre logement, pas seulement à une valeur de calcul.',
        ],
        scope: [
          {title: 'Isolation de toiture', text: 'Isolation entre ou sur la charpente des toitures inclinées, et sous la couverture des toitures plates.'},
          {title: 'Détails d’étanchéité à l’air', text: 'Un pare-vapeur et des raccords étanches à l’air autour des fenêtres, des traversées et des murs, pour une isolation durablement efficace.'},
          {title: 'Conseils en rénovation', text: 'Des conseils sur l’ordre des travaux et sur la combinaison de l’isolation avec une rénovation ou une réparation de toiture.'},
        ],
        layersTitle: 'L’isolation, couche par couche',
        layers: [
          {name: 'Isolation', text: 'Laine minérale ou panneaux isolants, posés de façon jointive, sans interstices.'},
          {name: 'Pare-vapeur', text: 'Côté chaud : il empêche l’air intérieur humide d’entrer dans la structure.'},
          {name: 'Sous-toiture', text: 'Côté extérieur : respirante, pour que la structure puisse sécher.'},
          {name: 'Charpente', text: 'Les chevrons déterminent l’espace disponible pour l’isolation.'},
        ],
        signsTitle: 'Votre toiture a-t-elle besoin d’isolation ?',
        signs: ['Des combles ou un étage sous toit froids ou pleins de courants d’air', 'Des pièces sous le toit surchauffées en été', 'De la condensation ou des moisissures sous la toiture', 'Une isolation absente, fine ou ancienne'],
        faq: [
          {q: 'Puis-je obtenir une prime pour l’isolation de toiture ?', a: 'Mijn VerbouwPremie pour la toiture peut s’appliquer aux propriétaires occupants en Flandre, sous conditions, notamment une nouvelle isolation Rd ≥ 4,5 m²K/W et, pour une toiture inclinée, un pare-vapeur. Premculator l’estime pour les demandes de mars à décembre 2026. L’administration décide de l’octroi.'},
          {q: 'Isoler par l’intérieur ou lors du renouvellement de la couverture ?', a: 'Les deux sont possibles, selon l’état de la couverture et des finitions intérieures. Si les tuiles sont de toute façon remplacées, isoler par l’extérieur peut préserver les finitions intérieures. Nous discutons des options lors de la visite.'},
          {q: 'Pourquoi le pare-vapeur est-il important ?', a: 'Un pare-vapeur du côté chaud limite la pénétration de l’air intérieur humide dans l’isolation et le bois. L’isolation reste ainsi sèche et performante.'},
        ],
        tip: {title: 'Une bonne réparation commence par la cause.', text: 'Avant de recouvrir une trace d’humidité, cherchez son origine. Une nouvelle finition ne résout pas la cause.'},
        serviceType: 'Isolation de toiture',
      },
    },
  },
  renovation: {
    id: 'renovation', projects: ['work-13', 'work-06', 'work-02'], tools: ['renculator', 'wijculator'],
    copy: {
      nl: {
        name: 'Renovatie', short: 'Herstellingen, timmerwerk en gevelbekleding',
        summary: 'Dakherstellingen, timmerwerk en gevelbekleding, door één team van inspectie tot afwerking.',
        lead: 'Dakherstellingen, timmerwerk, dakkapellen en gevelbekleding: INGBELG renoveert woningen in Zottegem en omgeving met één team, van de eerste inspectie tot de afwerking.',
        intro: [
          'Renoveren begint met kijken wat er al is. Gezond hout, een goede structuur en karaktervolle details zijn het waard om te bewaren; wat versleten is, wordt vervangen.',
          'Omdat dak, gevel en timmerwerk op elkaar aansluiten, coördineert één team de werken. Zo heb je één aanspreekpunt en sluiten de details op elkaar aan.',
        ],
        scope: [
          {title: 'Dakherstellingen', text: 'Lekken, verschoven pannen, beschadigde nokken of aansluitingen: gericht hersteld, nadat de oorzaak gevonden is.'},
          {title: 'Gevelbekleding', text: 'Een nieuwe gevelafwerking die de woning beschermt en aansluit op dak en ramen.'},
          {title: 'Timmerwerk en dakkapellen', text: 'Kroonlijsten, houten details en dakkapellen, hersteld of nieuw gemaakt.'},
        ],
        layersTitle: 'Renovatie, laag per laag',
        layers: [
          {name: 'Dakbedekking', text: 'Waar nodig gericht vervangen, waar mogelijk hersteld.'},
          {name: 'Kroonlijst en dakrand', text: 'Houten details aan de dakrand, vaak het eerste wat slijt.'},
          {name: 'Dakstructuur', text: 'Eerst geïnspecteerd, daarna hersteld of versterkt.'},
          {name: 'Gevel', text: 'De gevelbekleding sluit aan op het dak en de ramen.'},
        ],
        signsTitle: 'Wanneer is renovatie zinvol?',
        signs: ['Terugkerende lekken op dezelfde plek', 'Rot of schade aan kroonlijsten en houten details', 'Een verouderde gevel of slechte aansluitingen', 'Plannen voor meer ruimte, zoals een dakkapel'],
        faq: [
          {q: 'Kunnen oude details zoals een kroonlijst bewaard blijven?', a: 'Waar het hout nog gezond is, kan herstellen het karakter van een woning bewaren. Bestaand hout wordt eerst geïnspecteerd voordat vervanging voorgesteld wordt.'},
          {q: 'Wie coördineert de verschillende werken?', a: 'INGBELG werkt met één team en één aanspreekpunt, van het eerste gesprek tot de oplevering.'},
          {q: 'Hoe lang duurt een renovatie?', a: 'Dat hangt af van de werkomvang, het weer, leveringen en de bereikbaarheid. Met Wijculator maak je een indicatieve planning van werkuren en teamgrootte; de echte planning volgt na het plaatsbezoek.'},
        ],
        tip: {title: 'Behoud wat nog goed is.', text: 'Laat bestaand hout inspecteren vóór vervanging. Afzonderlijke elementen herstellen kan het karakter van een dak bewaren.'},
        serviceType: 'Renovatie: dakherstellingen, timmerwerk en gevelbekleding',
      },
      fr: {
        name: 'Rénovation', short: 'Réparations, menuiserie et bardage',
        summary: 'Réparations, menuiserie et bardage, coordonnés par une seule équipe du diagnostic aux finitions.',
        lead: 'Réparations de toiture, menuiserie, lucarnes et bardage : INGBELG rénove les habitations à Zottegem et dans les environs avec une seule équipe, du premier diagnostic aux finitions.',
        intro: [
          'Rénover commence par regarder ce qui existe. Un bois sain, une bonne structure et des détails de caractère méritent d’être conservés ; ce qui est usé est remplacé.',
          'Comme toiture, façade et menuiserie se rejoignent, une seule équipe coordonne les travaux. Vous avez un seul interlocuteur et les détails se raccordent correctement.',
        ],
        scope: [
          {title: 'Réparations de toiture', text: 'Fuites, tuiles déplacées, faîtages ou raccords endommagés : une réparation ciblée, après avoir trouvé la cause.'},
          {title: 'Bardage de façade', text: 'Une nouvelle finition de façade qui protège la maison et se raccorde au toit et aux fenêtres.'},
          {title: 'Menuiserie et lucarnes', text: 'Corniches, détails en bois et lucarnes, réparés ou réalisés à neuf.'},
        ],
        layersTitle: 'La rénovation, couche par couche',
        layers: [
          {name: 'Couverture', text: 'Remplacée de façon ciblée si nécessaire, réparée si possible.'},
          {name: 'Corniche et rive', text: 'Les détails en bois du bord de toit, souvent les premiers à s’user.'},
          {name: 'Charpente', text: 'D’abord inspectée, puis réparée ou renforcée.'},
          {name: 'Façade', text: 'Le bardage se raccorde à la toiture et aux fenêtres.'},
        ],
        signsTitle: 'Quand une rénovation est-elle utile ?',
        signs: ['Des fuites qui reviennent au même endroit', 'De la pourriture ou des dégâts aux corniches et détails en bois', 'Une façade vieillissante ou des raccords défaillants', 'Un projet d’espace supplémentaire, comme une lucarne'],
        faq: [
          {q: 'Peut-on conserver des détails anciens comme une corniche ?', a: 'Lorsque le bois est encore sain, la réparation peut préserver le caractère d’une maison. Le bois existant est d’abord inspecté avant de proposer un remplacement.'},
          {q: 'Qui coordonne les différents travaux ?', a: 'INGBELG travaille avec une seule équipe et un seul interlocuteur, du premier échange à la réception.'},
          {q: 'Combien de temps dure une rénovation ?', a: 'Cela dépend de l’étendue des travaux, de la météo, des livraisons et de l’accès. Avec Wijculator, établissez un planning indicatif des heures et de l’équipe ; le planning réel suit la visite.'},
        ],
        tip: {title: 'Conservez ce qui fonctionne encore.', text: 'Inspectez le bois existant avant de le remplacer. Réparer certains éléments peut préserver le caractère du toit.'},
        serviceType: 'Rénovation : réparations de toiture, menuiserie et bardage',
      },
    },
  },
  asbestos: {
    id: 'asbestos', projects: ['work-04', 'work-03'], tools: ['premculator', 'renculator'],
    copy: {
      nl: {
        name: 'Asbestverwijdering', short: 'Golfplaten en leien, met een nieuw dak',
        summary: 'Beoordeling en aangepaste asbestverwijdering, afgestemd op de vervanging van je dak.',
        lead: 'Asbesthoudende golfplaten of leien op je dak of bijgebouw? INGBELG beoordeelt de situatie en stemt de verwijdering af op de vervanging van je dak, in Zottegem en omgeving.',
        intro: [
          'Asbest werd lang gebruikt in bouwmaterialen zoals golfplaten, leien en schouwkanalen. Zolang het materiaal intact is, is het risico beperkt. Bij breken, boren of sterke verwering kunnen vezels vrijkomen.',
          'Daarom begint een asbestproject met een beoordeling ter plaatse. Daarna worden de verwijdering en de nieuwe dakbedekking als één project gepland, zodat beide op elkaar aansluiten.',
        ],
        scope: [
          {title: 'Plaatsbeoordeling', text: 'We bekijken om welke materialen het gaat, in welke staat ze zijn en hoe bereikbaar het dak is.'},
          {title: 'Gecontroleerde verwijdering', text: 'Verwijdering volgens de geldende regels, met aandacht voor bescherming en een correcte afvoer van het materiaal.'},
          {title: 'Dakvervanging', text: 'Aansluitend een nieuwe dakbedekking en, waar zinvol, nieuwe isolatie.'},
        ],
        layersTitle: 'Van oud dak naar nieuw dak',
        layers: [
          {name: 'Oude golfplaten', text: 'Worden zoveel mogelijk heel verwijderd en correct afgevoerd.'},
          {name: 'Ondergrond', text: 'Wordt nagekeken en waar nodig hersteld of vernieuwd.'},
          {name: 'Isolatie', text: 'Het moment om warmteverlies mee aan te pakken.'},
          {name: 'Nieuwe dakbedekking', text: 'Een nieuw, waterdicht dak dat aansluit op de bestaande details.'},
        ],
        signsTitle: 'Waar kan asbest zitten?',
        signs: ['Golfplaten op garages, schuren en bijgebouwen', 'Oudere vezelcementleien op daken en gevels', 'Schouwkanalen en onderplaten', 'Vooral in gebouwen van vóór 2001'],
        faq: [
          {q: 'Wat doe ik als ik asbest vermoed?', a: 'Laat het materiaal intact: niet breken, boren of schuren. Vraag een beoordeling aan, zodat duidelijk wordt welke aanpak nodig is.'},
          {q: 'Bestaat er een premie bij asbestverwijdering op het dak?', a: 'Bij Mijn VerbouwPremie voor het dak kan, onder voorwaarden, een asbestbonus van € 8/m² gelden wanneer asbesthoudende dakbedekking verwijderd wordt en het dak nieuw geïsoleerd wordt. Het totaal is begrensd tot 50% van de subsidiabele dakfactuur. Premculator raamt dit voor aanvragen van maart tot december 2026.'},
          {q: 'Kunnen de verwijdering en het nieuwe dak samen gebeuren?', a: 'Ja. De verwijdering wordt afgestemd op de vervanging van je dak, met één team en één aanspreekpunt.'},
        ],
        tip: {title: 'Eerst beoordelen, dan verwijderen.', text: 'Breek, boor of schuur niet in materiaal waarvan je vermoedt dat het asbest bevat. Laat het eerst beoordelen.'},
        serviceType: 'Asbestverwijdering en dakvervanging',
      },
      fr: {
        name: 'Désamiantage', short: 'Plaques et ardoises, avec une nouvelle toiture',
        summary: 'Diagnostic et retrait adapté de l’amiante, coordonnés avec le remplacement de votre toiture.',
        lead: 'Des plaques ondulées ou des ardoises contenant de l’amiante sur votre toit ou votre annexe ? INGBELG évalue la situation et coordonne le retrait avec le remplacement de votre toiture, à Zottegem et dans les environs.',
        intro: [
          'L’amiante a longtemps été utilisé dans des matériaux comme les plaques ondulées, les ardoises et les conduits de cheminée. Tant que le matériau est intact, le risque reste limité. En cas de casse, de perçage ou de forte dégradation, des fibres peuvent se libérer.',
          'C’est pourquoi un projet de désamiantage commence par une évaluation sur place. Le retrait et la nouvelle couverture sont ensuite planifiés comme un seul projet, pour qu’ils s’enchaînent correctement.',
        ],
        scope: [
          {title: 'Diagnostic du chantier', text: 'Nous identifions les matériaux concernés, leur état et l’accessibilité de la toiture.'},
          {title: 'Retrait contrôlé', text: 'Un retrait conforme aux règles en vigueur, avec une attention à la protection et à l’évacuation correcte des matériaux.'},
          {title: 'Remplacement de toiture', text: 'Ensuite, une nouvelle couverture et, si pertinent, une nouvelle isolation.'},
        ],
        layersTitle: 'De l’ancienne à la nouvelle toiture',
        layers: [
          {name: 'Anciennes plaques ondulées', text: 'Retirées autant que possible entières et évacuées correctement.'},
          {name: 'Support', text: 'Contrôlé, puis réparé ou renouvelé si nécessaire.'},
          {name: 'Isolation', text: 'Le bon moment pour réduire aussi les pertes de chaleur.'},
          {name: 'Nouvelle couverture', text: 'Une toiture neuve et étanche, raccordée aux détails existants.'},
        ],
        signsTitle: 'Où peut se trouver l’amiante ?',
        signs: ['Plaques ondulées sur garages, abris et annexes', 'Anciennes ardoises en fibrociment sur toitures et façades', 'Conduits de cheminée et sous-toitures', 'Surtout dans les bâtiments antérieurs à 2001'],
        faq: [
          {q: 'Que faire si je soupçonne la présence d’amiante ?', a: 'Laissez le matériau intact : ne le cassez pas, ne le percez pas et ne le poncez pas. Demandez une évaluation pour savoir quelle approche est nécessaire.'},
          {q: 'Existe-t-il une prime pour le désamiantage de la toiture ?', a: 'Avec Mijn VerbouwPremie pour la toiture, un bonus amiante de 8 €/m² peut s’appliquer, sous conditions, lorsque la couverture amiantée est retirée et la toiture nouvellement isolée. Le total est plafonné à 50 % de la facture toiture admissible. Premculator l’estime pour les demandes de mars à décembre 2026.'},
          {q: 'Le retrait et la nouvelle toiture peuvent-ils être combinés ?', a: 'Oui. Le retrait est coordonné avec le remplacement de votre toiture, avec une seule équipe et un seul interlocuteur.'},
        ],
        tip: {title: 'Évaluer d’abord, retirer ensuite.', text: 'Ne cassez, ne percez et ne poncez jamais un matériau susceptible de contenir de l’amiante. Faites-le d’abord évaluer.'},
        serviceType: 'Désamiantage et remplacement de toiture',
      },
    },
  },
};
