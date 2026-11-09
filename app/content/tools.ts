import type {SiteLanguage} from '../site-language.ts';
import type {ToolId} from '../tool-routing.ts';

export type ToolCopy = {name: string; kicker: string; card: string; intro: string; howTitle: string; how: string[]};

export const TOOLS: Record<ToolId, Record<SiteLanguage, ToolCopy>> = {
  renculator: {
    nl: {
      name: 'Renculator', kicker: 'Bouwcalculator',
      card: 'Raam een indicatief budget voor je dak- of renovatieproject, exclusief btw.',
      intro: 'Kies het type werk, de oppervlakte, de huidige staat en het afwerkingsniveau. Renculator toont meteen een indicatieve budgetvork, exclusief btw. Handig om je project voor te bereiden vóór het plaatsbezoek.',
      howTitle: 'Hoe werkt Renculator?',
      how: [
        'Renculator vermenigvuldigt een illustratief bedrag per m² voor het gekozen type werk met de oppervlakte, en past dat aan voor de huidige staat (goed × 0,9, gemiddeld × 1, grondige renovatie × 1,3) en het afwerkingsniveau (basis × 0,85, standaard × 1, premium × 1,35).',
        'Gekozen opties zoals stelling, afbraak, afvalafvoer of dakramen worden als vaste of per-m²-posten opgeteld. Dakramen en schoorsteenwerken rekenen met één stuk. De vork loopt van 82% tot 122% van dat middenbedrag, afgerond op € 100.',
        'Dit zijn illustratieve planningsbedragen, niet de prijslijst van INGBELG. De echte prijs hangt af van inspectie, materialen, bereikbaarheid en technische omstandigheden. Premies en btw worden niet berekend.',
      ],
    },
    fr: {
      name: 'Renculator', kicker: 'Calculateur de travaux',
      card: 'Estimez un budget indicatif pour votre projet de toiture ou de rénovation, hors TVA.',
      intro: 'Choisissez le type de travaux, la surface, l’état actuel et le niveau de finition. Renculator affiche immédiatement une fourchette budgétaire indicative, hors TVA. Utile pour préparer votre projet avant la visite.',
      howTitle: 'Comment fonctionne Renculator ?',
      how: [
        'Renculator multiplie un montant illustratif par m² pour le type de travaux choisi par la surface, puis l’ajuste selon l’état actuel (bon × 0,9, moyen × 1, rénovation importante × 1,3) et le niveau de finition (essentiel × 0,85, standard × 1, premium × 1,35).',
        'Les options choisies, comme l’échafaudage, la démolition, l’évacuation des déchets ou les fenêtres de toit, s’ajoutent comme postes fixes ou par m². Les fenêtres de toit et les travaux de cheminée comptent une pièce. La fourchette va de 82 % à 122 % de ce montant central, arrondie à 100 €.',
        'Il s’agit de montants de planification illustratifs, pas de la liste de prix d’INGBELG. Le prix réel dépend de l’inspection, des matériaux, de l’accès et des conditions techniques. Les primes et la TVA ne sont pas calculées.',
      ],
    },
  },
  premculator: {
    nl: {
      name: 'Premculator', kicker: 'Premies & subsidies',
      card: 'Raam Mijn VerbouwPremie voor dak, muur, vloer en ramen in Vlaanderen.',
      intro: 'Premculator raamt Mijn VerbouwPremie voor eigenaar-bewoners in Vlaanderen, voor aanvragen van 1 maart tot en met 31 december 2026. Het model omvat dakisolatie, buitenmuren, vloerisolatie en nieuwe ramen en buitendeuren.',
      howTitle: 'Hoe werkt Premculator?',
      how: [
        'Je vult de subsidiabele factuurbedragen exclusief btw in, je inkomen, je gezinssituatie en eventueel bijkomend vastgoed, en je bevestigt vijf voorwaarden. Elke werkcategorie heeft een minimumfactuur van € 1.000 exclusief btw.',
        'Inkomenscategorie 3 krijgt 35% en categorie 4 krijgt 50% van de begrensde kosten: dak € 11.500, muur € 10.000, vloer € 3.000, ramen en deuren € 10.500. Categorie 1 en 2 krijgen in deze periode geen premie voor deze vier categorieën. De optionele asbestbonus voor het dak bedraagt € 8/m², met een dakpremie van maximaal 50% van de subsidiabele dakfactuur.',
        'Gemeenschappelijke delen van appartementen, alleen glas vervangen, warmtepompen, andere of lokale premies en andere aanvragers vallen buiten dit model. Het resultaat is een voorwaardelijke raming, geen goedkeuring. Je inkomen wordt niet opgeslagen.',
      ],
    },
    fr: {
      name: 'Premculator', kicker: 'Primes & subsides',
      card: 'Estimez Mijn VerbouwPremie pour toiture, murs, sol et fenêtres en Flandre.',
      intro: 'Premculator estime Mijn VerbouwPremie pour les propriétaires occupants en Flandre, pour les demandes du 1er mars au 31 décembre 2026. Le modèle couvre l’isolation de toiture, les murs extérieurs, l’isolation du sol ainsi que les nouvelles fenêtres et portes extérieures.',
      howTitle: 'Comment fonctionne Premculator ?',
      how: [
        'Vous indiquez les montants de facture admissibles hors TVA, vos revenus, votre situation familiale et une éventuelle autre propriété, puis confirmez cinq conditions. Chaque catégorie de travaux exige une facture minimale de 1 000 € hors TVA.',
        'La catégorie de revenus 3 reçoit 35 % et la catégorie 4 reçoit 50 % des coûts plafonnés : toiture 11 500 €, murs 10 000 €, sol 3 000 €, fenêtres et portes 10 500 €. Les catégories 1 et 2 ne reçoivent pas de prime pour ces quatre catégories durant cette période. Le bonus amiante optionnel pour la toiture est de 8 €/m², avec une prime toiture plafonnée à 50 % de la facture toiture admissible.',
        'Les parties communes d’appartements, le remplacement du vitrage seul, les pompes à chaleur, les autres primes régionales ou locales et les autres demandeurs sortent de ce modèle. Le résultat est une estimation conditionnelle, pas une approbation. Vos revenus ne sont pas enregistrés.',
      ],
    },
  },
  wijculator: {
    nl: {
      name: 'Wijculator', kicker: 'Werkuren & teamplanning',
      card: 'Raam werkuren en de minimale ploeg om je doeltermijn te halen.',
      intro: 'Hoeveel werk vraagt je project, en hoeveel mensen zijn nodig om een doeltermijn te halen? Wijculator raamt de arbeidsuren en vergelijkt de doorlooptijd van je gekozen team met het basisteam.',
      howTitle: 'Hoe werkt Wijculator?',
      how: [
        'Arbeidsuren = (oppervlakte × uren per m² × moeilijkheid + voorbereiding) × (1 + marge). Werkdagen = arbeidsuren ÷ uren per dag × (opeenvolgend aandeel + parallel aandeel ÷ teamgrootte).',
        'Het minimumteam is de kleinste ploeg, vanaf het gekozen basisteam en met maximaal 20 personen, die de doeltermijn haalt. Extra mensen versnellen alleen het parallelle deel van het werk. Standaard is 10% van het werk opeenvolgend en de marge 15%; beide zijn aanpasbaar.',
        'De startwaarden zijn aanpasbare planningsaannames, geen offerte, gemeten productiviteit of wettelijke bezetting. Droogtijd, weer, toegang, leveringen en veiligheid vragen een afzonderlijke beoordeling.',
      ],
    },
    fr: {
      name: 'Wijculator', kicker: 'Heures & planification d’équipe',
      card: 'Estimez les heures de travail et l’équipe minimale pour tenir votre délai.',
      intro: 'Combien de travail demande votre projet, et combien de personnes faut-il pour tenir un délai ? Wijculator estime les heures de travail et compare la durée avec l’équipe choisie et l’équipe de base.',
      howTitle: 'Comment fonctionne Wijculator ?',
      how: [
        'Heures de travail = (surface × heures par m² × difficulté + préparation) × (1 + marge). Jours ouvrés = heures ÷ heures par jour × (part séquentielle + part parallèle ÷ effectif).',
        'L’équipe minimale est la plus petite équipe, à partir de l’équipe de base choisie et jusqu’à 20 personnes, qui respecte le délai. Ajouter des personnes accélère uniquement la part parallèle du travail. Par défaut, 10 % du travail est séquentiel et la marge est de 15 % ; les deux sont modifiables.',
        'Les valeurs initiales sont des hypothèses de planification modifiables, pas un devis, une productivité mesurée ni un effectif légal. Séchage, météo, accès, livraisons et sécurité nécessitent une évaluation distincte.',
      ],
    },
  },
};
