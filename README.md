# INGBELG — website (NL/FR)

Version 2.0.0 · 9 November 2026. A redesign of the INGBELG roofing and renovation web app (export 1.0.9):

- **SEO.** One page per service, inline calculator pages and full metadata per URL.
- **Design.** A calmer, light architectural design.
- **3D.** A roof cutaway that is built and explained layer by layer.

## Deploy on Hostinger (unchanged)

In Websites, create a Web App and upload the ZIP (source + prebuilt `dist`), or connect this repository.

| Setting | Value |
| --- | --- |
| Framework | Vite / React |
| Node.js | 24.x |
| Root directory | `.` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

For a running Node.js process, choose **Other**, entry file `server.mjs`, start command `npm start`. The server listens on `0.0.0.0` and `PORT` (default 3000).

**Domain.** Canonical links, hreflang, structured data and the sitemap default to `https://ingbelg.in`. To publish elsewhere, set the build variable `SITE_URL` to the HTTPS origin (no path) and rebuild.

```sh
npm ci
npm run check   # TypeScript
npm run build   # client + server render + 28 pre-rendered pages, 404s, sitemap, robots
npm test        # SEO, consent, server routes, calculator boundaries
npm start       # http://localhost:3000
```

`npm run dev` starts the Vite dev server.

## Pages (28 pre-rendered URLs)

| Page | NL | FR |
| --- | --- | --- |
| Home | `/` | `/fr` |
| Pitched roofs | `/diensten/hellende-daken` | `/fr/services/toitures-inclinees` |
| Flat roofs | `/diensten/platte-daken` | `/fr/services/toitures-plates` |
| Roof insulation | `/diensten/dakisolatie` | `/fr/services/isolation-toiture` |
| Renovation | `/diensten/renovatie` | `/fr/services/renovation` |
| Asbestos removal | `/diensten/asbestverwijdering` | `/fr/services/desamiantage` |
| Projects | `/realisaties` | `/fr/realisations` |
| Contact | `/contact` | `/fr/contact` |
| Renculator / Premculator / Wijculator | `/zottetools/<tool>` | `/fr/zottetools/<tool>` |
| Privacy / Cookies / Accessibility | `/privacy` … | `/fr/privacy` … |

All 1.0.9 URLs still work. `server.mjs` handles routing:

- **Redirects.** Trailing slashes and `/index.html` get a 301 to the canonical URL; query strings are kept.
- **Unknown URLs.** These get a branded, `noindex` 404 page with a real 404 status.
- **Compression.** Text files are served with brotli or gzip.
- **Headers.** Responses carry a Content-Security-Policy and other security headers.

On a static host, map each path above to `<path>/index.html` and serve `404.html` (or `fr/404.html`) for everything else.

## SEO

- **On-page.**
  - Every URL has its own title (≤60 characters), description (≤155), H1, canonical, `nl-BE`/`fr-BE`/`x-default` alternates, Open Graph/Twitter tags and a 1200×630 JPEG share image.
  - The H1s carry the search intent ("Dakwerken en renovatie in Zottegem", "Platte daken in Zottegem", …).
- **Service pages.** Each has a lead, scope, a layer-by-layer explanation, warning signs, process, related projects, a tip, an FAQ, related services and calculator links.
- **Calculator pages.** These are now server-rendered content (intro, the calculator itself, "how it works", official sources), not a popup over the homepage.
- **JSON-LD.** Each page gets the schema types that fit it:
  - `RoofingContractor` with address, map link and an offer catalogue of the five services.
  - `WebSite`, plus `WebPage` / `ContactPage` / `CollectionPage`.
  - `BreadcrumbList`, `Service`, `FAQPage` (visible FAQs only), `ImageGallery` and `WebApplication`.
  - No ratings markup: self-served review stars aren't eligible, and a test guards this.
- **Sitemap and links.** The sitemap includes hreflang links and image entries. The header, footer, service pages and 404 page all cross-link.
- **Content sources.** Copy uses only facts already in 1.0.9: services and their details, contact details, the review snapshot, building tips and the Premculator rules. It adds no prices, guarantees, certifications, years in business or town lists.

After launch: verify the domain in Google Search Console, submit `/sitemap.xml`, inspect one URL per language and run the Rich Results Test.

## Design

The look comes from the company's own material, not from a template: the white van with red lettering, the logo red, anthracite roof tiles and zinc gutters.

- Colours: white, zinc grey `#F0F2F3` for bands, anthracite `#2A2E32` for text and the footer, slate `#5C646A` for secondary text, and the exact logo red `#D83030` for buttons, the current page and the highlighted roof layer. All text pairs meet 4.5:1 or better; there is a high-contrast mode.
- Type: Barlow Condensed for headings and the large phone number, Barlow for text. Self-hosted, no CDN. Sentence case everywhere, no capitals labels, no monospace.
- Structure only where it carries information: numbers for the three work steps, a stacked list for the roof layers. No section labels above headings, no icon cards, no decorative grids.
- The homepage opens with the team's own photo. The 3D cutaway sits next to "Wat we doen" and changes as you scroll through the services.
- One bottom bar on phones: Bel, WhatsApp, Offerte.

## 3D roof cutaway (`app/scene/`)

- **`roof-model.ts`.** Builds a Flemish house procedurally. The left gable is cut open and the front slope steps back layer by layer:
  - rafters → insulation → underlay → counter-battens and battens → anthracite tiles → ridge, fascia and zinc gutter;
  - plus an EPDM flat-roof annex and a shed with old corrugated sheets.

  Repeated parts use `InstancedMesh`. The brick texture is drawn on a canvas, so there are no texture downloads.
- **`roof-scene.ts`.** A framework-free three.js renderer:
  - **Intro.** Tile rows lift and settle from eaves to ridge, the way a roofer lays them.
  - **Idle.** A slow ±6° turntable with damped pointer parallax, rendered at about 30 fps once settled.
  - **Service focus.** An exploded view of the relevant layer, tinted red with the other layers ghosted. The EPDM sheet unrolls, a renovation patch of tiles is swapped, and the asbestos sheets are lifted whole and stacked on a pallet.
  - Everything runs on frame delta time and `dispose()` frees all GPU resources.
- **`RoofStage.tsx`.** The React wrapper:
  - Shows a poster image first, then lazy-loads three.js when the stage is visible and the browser is idle.
  - Stops rendering offscreen or in hidden tabs, and follows `prefers-reduced-motion` and the pause control.
  - Projects HTML labels from 3D anchors.
  - Software-only WebGL (SwiftShader/llvmpipe) keeps the poster. For testing, run `localStorage.setItem('ingbelg-force-3d', '1')`.
- **Home behaviour.** The stage sits beside "Wat we doen". On desktop it stays sticky and its focus follows the service you scroll to. On phones each service shows its own poster.

### Regenerating images

Outputs are committed, so production builds need neither sharp nor a browser.

```sh
npm i --no-save sharp
node scripts/render-posters.mjs    # scene posters via Vite + Playwright Chromium
node scripts/optimize-images.mjs   # photo sizes (640/1024/1600), JPEG share cards, 690 px posters, logo
```

## Files

- `app/seo-data.ts`: page catalogue (paths, titles, descriptions, H1s), structured data, sitemap, robots.
- `app/content/`: NL/FR copy for services, home, calculators, projects and UI strings.
- `app/pages/`, `app/sections/`, `app/layout/`: page components, shared sections, header/footer/shell.
- `app/zotte-tools.tsx`, `app/tools/Renculator.tsx`: calculator UIs.
- `app/premium-calculation.ts`, `app/workforce-calculation.ts`, `app/project-data.ts`: calculation logic, unchanged from 1.0.9.
- `app/consent-storage.ts`, `app/cookie-controls.tsx`: consent and optional comfort preferences.
- `app/styles/`: design tokens, base, components, sections, calculators.
- `scripts/build-seo.mjs`: writes the pre-rendered pages, 404s, sitemap and robots.
- `server.mjs`: dependency-free production server.

## Behaviour carried over from 1.0.9

- **Contact form.** Still prepares an email draft in the visitor's mail app; nothing is sent to a server.
- **Calculator hand-off.** A calculator summary can be carried into the form on request. It is held in `sessionStorage` until the tab closes and never includes income.
- **Consent.** Cookie consent lasts 180 days. Optional storage only remembers display preferences (reduced motion, pause, contrast).
- **Premculator scope.** The model covers Mijn VerbouwPremie for owner-occupiers, for applications from 1 March to 31 December 2026; the official sources are linked on the page. Re-verify the rules and update `premium-calculation.ts` and its tests before extending the date window.

## To confirm before launch

- That `https://ingbelg.in` is the final domain. `sameAs` still points to `https://ingbelg.be/`.
- The service copy and the service-area wording ("Zottegem en omgeving").
- The review snapshot (5,0 · 54 reviews) shown on the site.
- A test on real phones and with a screen reader. Automated checks so far: TypeScript, unit and route tests, Playwright at 375/1440 px, and Lighthouse mobile (Accessibility 100, SEO 100, Best Practices 100, Performance 90–96 depending on the page).
