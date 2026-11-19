# woolup.shop

De webshop van woolup: sokken en kousen van wol, in eigen productie en in kleine oplage. Gebouwd met Next.js, React en Tailwind CSS. Hij is bedoeld om als headless frontend op Hostinger te draaien.

![woolup homepage](docs/preview.png)

**Status:** de visuele frontend staat. Producten, prijzen en voorraad zijn voorbeelden. Afrekenen, de nieuwsbrief en het contactformulier zijn nog niet aangesloten; dat gebeurt samen met de backend en de betalingen.

## Lokaal draaien
Je hebt Node.js 20.9 of nieuwer nodig.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # productiebuild, met typecontrole
npm run start      # draait de build (zo draait hij ook op Hostinger)
```

## Waar staat wat
| Wat | Waar |
| --- | --- |
| Teksten, menu, USP's, FAQ en maattabel | `src/content/site.ts` |
| Producten, categorieën en kleuren | `src/content/products.ts` |
| Productlogica (filteren, sorteren, voorraad) | `src/lib/catalog.ts` |
| Kleuren, fonts en knoppen | `src/app/globals.css` |
| Pagina's | `src/app/` |
| Logo (zwart, wit en sok-icoon) | `public/brand/`, als component in `src/components/Logo.tsx` |
| Brief en designkeuzes | `docs/brief.md`, `docs/design.md` |

## Productfoto's toevoegen
1. Zet de foto's in `public/images/products/<slug>/`, bijvoorbeeld `public/images/products/bergpad/1.jpg`. De slug staat bij elk product in `src/content/products.ts`.
2. Vul bij dat product de lijst `images` in: `images: ["/images/products/bergpad/1.jpg", "/images/products/bergpad/2.jpg"]`. De eerste foto is de hoofdfoto. Bij meer dan één foto verschijnen op de productpagina miniaturen.

Tips voor een rustig geheel, zoals in de referentie-webshop:
- vierkante foto's (1:1), minstens 1600 × 1600 px
- het product op een lichte, effen achtergrond
- overal hetzelfde licht en dezelfde uitsnede

Zolang er geen foto is, toont de site de woolup-sok in de kleur van het product, met "Foto volgt".

## Nog aan te vullen
- Echte producten, prijzen, oplages en materiaalsamenstelling (`src/content/products.ts`; nu staat er overal "Wol, samenstelling volgt")
- Het bedrag voor gratis verzending (`freeShippingFrom` in `src/content/site.ts`, nu €50) en het e-mailadres
- De conceptpagina's Verzending en retour, Privacy en Algemene voorwaarden, met bedrijfsgegevens (KvK, btw)
- Productfoto's (zie hierboven)

## Vervolg op Hostinger
De bouw volgt de Hostinger Headless-handleiding (`hostinger.com/headless/skill.md`). Deze stappen zijn gedaan:
- de brief (`docs/brief.md`)
- het design (`docs/design.md`)
- de frontend

De rest vraagt om de Hostinger-connector in Claude:
1. **Connect:** de Hostinger-connector koppelen via claude.ai, onder Customize → Connectors, en een nieuwe sessie starten.
2. **Provision:** een `headless_ecommerce`-backend op woolup.shop, met het CMS op `woolup.shop/cms`.
3. **Content model:** producten, varianten (kleur × maat), voorraad per drop.
4. **Koppelen:** de functies in `src/lib/catalog.ts` laten lezen uit de backend. De pagina's hoeven daarvoor niet te veranderen.
5. **Betalingen** en afrekenen aanzetten in de winkelmand (`src/components/cart/`).
6. **Deploy** als Node.js-app (`type: "nodejs"`, niet `static`). Let op: deployen overschrijft wat er nu live op woolup.shop staat.

## Claude Code: Alpaca MCP-server
`.mcp.json` registreert de [Alpaca MCP-server](https://github.com/alpacahq/alpaca-mcp-server) voor dit project (vereist [`uv`](https://docs.astral.sh/uv/)). De sleutels komen uit je omgeving en worden nooit gecommit:

```bash
export ALPACA_API_KEY=your_alpaca_api_key
export ALPACA_SECRET_KEY=your_alpaca_secret_key
# Paper trading is the default. Set ALPACA_PAPER_TRADE=false only with live keys.
```
