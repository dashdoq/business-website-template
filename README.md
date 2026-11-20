# woolup.shop

De webshop van woolup: sokken van 100% wol, eigen ontwerpen, kleine oplages. Dit is de Hostinger Horizons-build die gekoppeld is aan de echte Hostinger-winkel (producten, winkelwagen en checkout), met de vormgeving uit `docs/design.md`. Die is vlak en modern, met zachte hoeken, lichte randen, kleine hoofdletters en het woolup-logo.

![woolup homepage](docs/preview.png)

## Opbouw
Een monorepo zoals Horizons hem exporteert:

| Map | Wat |
| --- | --- |
| `apps/web` | De site: React Router (SSR), Vite, Tailwind CSS, Express (`server.ts`) |
| `apps/pocketbase` | Database voor accounts (inloggen, account aanmaken) |
| `docs/` | Brief en designkeuzes |

## Lokaal draaien
Je hebt [Bun](https://bun.sh) en Node.js 22 nodig.

```bash
bun install
cd apps/web
bun run dev          # ontwikkelserver op http://localhost:3000
bun run typecheck
bun run lint
bun run build        # productiebuild naar dist/apps/web
bun run start        # draait de build
```

Accounts werken alleen als PocketBase meedraait: `bun run dev` in de root start beide.

## Waar staat wat
| Wat | Waar |
| --- | --- |
| Kleuren, fonts, knoppen, velden | `apps/web/src/index.css`, `apps/web/tailwind.config.js` |
| Header, footer, logo | `apps/web/src/components/site-header.tsx`, `site-footer.tsx`, `logo.tsx` |
| Homepagina | `apps/web/src/components/home/` |
| Productkaart en carrousel | `apps/web/src/components/product-card.tsx`, `product-carousel.tsx` |
| Collectie met filters | `apps/web/src/components/catalog.tsx` |
| Productpagina | `apps/web/src/components/product-detail.tsx` |
| Winkelwagen-lade en -pagina | `apps/web/src/components/cart-drawer.tsx`, `cart-parts.tsx`, `cart-view.tsx` |
| Verhaalpagina's (verhaal, wol, productie, contact) | `apps/web/src/data/pages.ts` |
| Koppeling met de winkel | `apps/web/src/api/ecommerce-api.ts`; **niet aanpassen**, Horizons beheert dit bestand |

## Producten beheren
Producten, prijzen en foto's komen rechtstreeks uit de Hostinger-winkel, niet uit de code. Wat je in de winkel-admin invult, verschijnt vanzelf op de site:

- **Maten:** geef een product de optie **"Maat"** met waarden (bijvoorbeeld 35–38, 39–42, 43–46). Dan verschijnen het maatfilter in de collectie, de maatknoppen op de productpagina en de maatkeuze onder "In de winkelwagen" op de kaarten.
- **Sale-prijs:** dan tonen de kaart en de productpagina de doorgestreepte oude prijs en een "-x%"-badge.
- **Ribbon-tekst** (bijvoorbeeld "Nieuw" of "Bestseller"): een groen label op de kaart, in plaats van het standaardlabel "Gelimiteerde editie".
- **Voorraad bijhouden:** dan toont de productpagina "X paar beschikbaar". Bij een uitverkochte uitvoering worden de knoppen uitgeschakeld.
- **Meerdere foto's:** dan verschijnen op de productpagina miniaturen.
- **Beoordelingen:** die staan in de winkel nu uit. Zet je ze aan in de winkel-admin, dan verschijnt "Ervaringen" op de productpagina.

## Live zetten
Deze code is de Horizons-export met een nieuwe vormgeving. De mapindeling, `bun.lock`, `server.ts` en de checkout-koppeling zijn ongewijzigd, zodat Hostinger hem op dezelfde manier kan draaien. Zet hem terug in Horizons of op Hostinger Node.js-hosting. Let op: dat overschrijft wat er nu live op woolup.shop staat.

## Claude Code: Alpaca MCP-server
`.mcp.json` registreert de [Alpaca MCP-server](https://github.com/alpacahq/alpaca-mcp-server) voor dit project (vereist [`uv`](https://docs.astral.sh/uv/)). De sleutels komen uit je omgeving en worden nooit gecommit:

```bash
export ALPACA_API_KEY=your_alpaca_api_key
export ALPACA_SECRET_KEY=your_alpaca_secret_key
# Paper trading is the default. Set ALPACA_PAPER_TRADE=false only with live keys.
```
